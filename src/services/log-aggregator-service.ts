import { gte, lt, SQL, and, sql } from "drizzle-orm";
import { LogAggregator, VALID_GROUPS } from "../types/log-aggregator.type.js";
import { buildCommonConditions } from "./log-common.service.js";
import { logs } from "../db/schema.js";
import { mapBucketToInterval } from "../utils/bucketMapper.js";
import { BadRequestError } from "../errors/app-errors.js";
import { isValidISODate } from "../utils/date-utils.js";
import { VALID_LEVELS } from "../types/log.type.js";

export function validateLogAggregator(query: Record<string, any>): LogAggregator {
    if (!query.since || typeof query.since !== 'string' || !isValidISODate(query.since)) {
        throw new BadRequestError("Invalid or missing 'since' ISO datetime format");
    }

    if (!query.until || typeof query.until !== 'string' || !isValidISODate(query.until)) {
        throw new BadRequestError("Invalid or missing 'until' ISO datetime format");
    }

    if (new Date(query.since) > new Date(query.until)) {
        throw new BadRequestError("'since' date cannot be after 'until' date");
    }
    let group_by: 'service' | 'level' | undefined = undefined;
    if (query.group_by !== undefined) {
        if (typeof query.group_by === 'string' && VALID_GROUPS.has(query.group_by)) {
            group_by = query.group_by as any;
        } else {
            throw new BadRequestError("Invalid 'group_by'. Must be 'service' or 'level'");
        }
    }
    //common 
    const service = typeof query.service === 'string' ? query.service : undefined;

    let level: 'debug' | 'info' | 'warn' | 'error' | undefined = undefined;
    if (typeof query.level === 'string' && VALID_LEVELS.has(query.level)) {
        level = query.level as any;
    }

    const q = typeof query.q === 'string' ? query.q : undefined;
    return {
        since: query.since,
        until: query.until,
        bucket: query.bucket as any,
        group_by,
        service,
        level,
        q
    };

}
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