import { gte, lt, SQL, and, sql } from "drizzle-orm";
import { LogAggregator } from "../types/log-aggregator.type.js";
import { buildCommonConditions } from "./log-common.service.js";
import { logs } from "../db/schema.js";
import { mapBucketToInterval } from "../utils/bucketMapper.js";

export function buildAggregateQuery(queryParams: LogAggregator, rawQuery: Record<string, unknown>) {
    const conditions: SQL[] = [];
    conditions.push(...buildCommonConditions(queryParams, rawQuery));
    conditions.push(gte(logs.timestamp, new Date(queryParams.since)));
    conditions.push(lt(logs.timestamp, new Date(queryParams.until)));

    const where = and(...conditions);
    const groupByColumn = queryParams.group_by === "service" 
    ? logs.service 
    : queryParams.group_by === "level" 
    ? logs.level 
    : null;

    const groupSelect = groupByColumn ? sql`${groupByColumn}` : sql`NULL`;
        
    const groupByClause = groupByColumn
        ? sql`GROUP BY start, ${groupByColumn}`
        : sql`GROUP BY start`;

    return sql`SELECT 
        date_bin(${mapBucketToInterval(queryParams.bucket)}::interval, timestamp, '2000-01-01 00:00:00'::timestamp) as start,
        ${groupSelect} as "group",
        count(*)::int as count
    from logs
    WHERE ${where}
    ${groupByClause}
    ORDER BY start ASC
    `;
}