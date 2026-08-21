import { lt, sql } from "drizzle-orm";
import { copyClient, db } from "../../config/db.js";
import { sortDeltasForLocking } from "../../services/rollup.service.js";
import { RollupDelta} from "../../types/rollup.type.js";
import { logsRollup1m } from "../schema.js";

export async function upsertRollup(deltas: RollupDelta[]): Promise<void> {
  if (deltas.length === 0) return;

  const sorted = sortDeltasForLocking(deltas);

  const bucketStarts = sorted.map((d) => d.bucket_start);
  const services = sorted.map((d) => d.service);
  const levels = sorted.map((d) => d.level);
  const counts = sorted.map((d) => d.log_count);

  await copyClient`
    INSERT INTO logs_rollup_1m (bucket_start, service, level, log_count)
    SELECT * FROM UNNEST(
      ${copyClient.array(bucketStarts)}::timestamptz[],
      ${copyClient.array(services)}::text[],
      ${copyClient.array(levels)}::text[],
      ${copyClient.array(counts)}::int[]
    )
    ON CONFLICT (bucket_start, service, level)
    DO UPDATE SET log_count = logs_rollup_1m.log_count + EXCLUDED.log_count
  `;
}

export async function pruneRollupTable(retentionDays: number) {
  await db
    .delete(logsRollup1m)
    .where(
      lt(
        logsRollup1m.bucketStart, 
        sql`now() - (${retentionDays} || ' days')::interval`
      )
    );
}
