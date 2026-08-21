import { gte, SQL, lt, sql ,and } from "drizzle-orm";
import { LogAggregator } from "../types/log-aggregator.type.js";
import { LogEntry } from "../types/log.type.js";
import { RollupDelta } from "../types/rollup.type.js";
import { toDate, truncateToMinute } from "../utils/date-utils.js";
import { logsRollup1m } from "../db/schema.js";
import { buildRow, mapBucketToInterval } from "../utils/string-utils.js";

const YIELD_EVERY_N_ROWS = 500;

export async function buildTsvAndDeltas( entries: LogEntry[]): Promise<{ tsv: string; deltas: RollupDelta[] }> {
  const rowChunks: string[] = [];
  const rollupMap = new Map<string, RollupDelta>();
 
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    rowChunks.push(buildRow(e));
 
    const bucketMs = truncateToMinute(toDate(e.timestamp));
    const key = `${bucketMs}|${e.service}|${e.level}`;
    const existing = rollupMap.get(key);
    if (existing) {
      existing.log_count++;
    } else {
      rollupMap.set(key, {
        bucket_start: new Date(bucketMs),
        service: e.service,
        level: e.level,
        log_count: 1,
      });
    }
 
    if ((i + 1) % YIELD_EVERY_N_ROWS === 0) {
      await yieldToEventLoop();
    }
  }
 
  return { tsv: rowChunks.join("\n") + "\n", deltas: Array.from(rollupMap.values()) };
}
 

export function sortDeltasForLocking(deltas: RollupDelta[]): RollupDelta[] {
  return [...deltas].sort((a, b) => {
    const t = a.bucket_start.getTime() - b.bucket_start.getTime();
    if (t !== 0) return t;
    const s = a.service.localeCompare(b.service);
    if (s !== 0) return s;
    return a.level.localeCompare(b.level);
  });
}
function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}
export function buildRollupAggregateQuery(queryParams: LogAggregator) {
  const conditions: SQL[] = [];
  conditions.push(gte(logsRollup1m.bucketStart, new Date(queryParams.since)));
  conditions.push(lt(logsRollup1m.bucketStart, new Date(queryParams.until)));

  if (queryParams.service) {
    conditions.push(sql`${logsRollup1m.service} = ${queryParams.service}`);
  }

  if (queryParams.level) {
    conditions.push(sql`${logsRollup1m.level} = ${queryParams.level}`);
  }

  const where = and(...conditions);

  const groupByColumn =
    queryParams.group_by === "service"
      ? logsRollup1m.service
      : queryParams.group_by === "level"
        ? logsRollup1m.level
        : null;

  const groupSelect = groupByColumn ? sql`${groupByColumn}` : sql`NULL`;
  const groupByClause = groupByColumn
    ? sql`GROUP BY start, ${groupByColumn}`
    : sql`GROUP BY start`;

  return sql`SELECT
      date_bin(${mapBucketToInterval(queryParams.bucket)}::interval, bucket_start, '2000-01-01 00:00:00'::timestamp) as start,
      ${groupSelect} as "group",
      sum(log_count)::int as count
    FROM logs_rollup_1m
    WHERE ${where}
    ${groupByClause}
    ORDER BY start ASC
  `;
}
