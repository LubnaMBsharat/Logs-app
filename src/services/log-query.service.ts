import { and, eq, gte, lt, or, SQL } from "drizzle-orm";
import { LogQueryParameters } from "../types/log-query.type.js";
import { logs } from "../db/schema.js";
import { decodeCursor } from "../utils/cursor.js";
import { buildCommonConditions } from "./log-common.service.js";
import { BadRequestError } from "../errors/app-errors.js";
import { VALID_LEVELS } from "../types/log.type.js";
import { isValidISODate } from "../utils/date-utils.js";

export function validateQueryLogs(query: Record<string, any>): LogQueryParameters {
    // 1. service
    let service: string | undefined = undefined;
    if (query.service !== undefined) {
        if (typeof query.service !== 'string' || query.service.trim() === '') {
            throw new BadRequestError("Invalid 'service' parameter");
        }
        service = query.service;
    }

    // 2. level
    let level: 'debug' | 'info' | 'warn' | 'error' | undefined = undefined; ;
    if (query.level !== undefined) {
        if (typeof query.level !== 'string' || !VALID_LEVELS.has(query.level)) {
            throw new BadRequestError("Invalid 'level' parameter");
        }
        level = query.level as any;
    }

    // 3. since
    let since:string | undefined = undefined;
    if (query.since !== undefined) {
        if (typeof query.since !== 'string' || !isValidISODate(query.since)) {
            throw new BadRequestError("Invalid ISO timestamp format for 'since'");
        }
        since = query.since;
    }

    // 4. until
    let until: string | undefined = undefined;
    if (query.until !== undefined) {
        if (typeof query.until !== 'string' || !isValidISODate(query.until)) {
            throw new BadRequestError("Invalid ISO timestamp format for 'until'");
        }
        until = query.until;
    }
    // since must be before until
    if (since && until && new Date(since) > new Date(until)) {
        throw new BadRequestError("'since' date cannot be after 'until' date");
    }

    // 5. q
    let q: string | undefined = undefined;
    if (query.q !== undefined) {
        if (typeof query.q !== 'string') {
            throw new BadRequestError("Invalid 'q' parameter");
        }
        q = query.q;
    }
    // 6. limit 
    let limit = 100;
    if (query.limit !== undefined) {
        const rawLimit = String(query.limit);
        if (!/^\d+$/.test(rawLimit)) {
            throw new BadRequestError("Invalid 'limit' parameter - must be a positive integer");
        }
        const parsedLimit = parseInt(rawLimit, 10);
        if (isNaN(parsedLimit) || parsedLimit < 1) {
            throw new BadRequestError("Invalid 'limit' parameter - must be at least 1");
        }
        limit = Math.min(parsedLimit, 1000);
    }

    // 7. cursor
    let cursor: string | undefined = undefined;
    if (query.cursor !== undefined) {
        if (typeof query.cursor !== 'string') {
            throw new BadRequestError("Invalid 'cursor' parameter");
        }
        cursor = query.cursor;
    }
    return { service, level, since, until, q, limit, cursor };

}

export function queryWhereClauseBuilder(queryParams: LogQueryParameters,rawReqQuery: Record<string,unknown>){
    const conditions:SQL[]= [];

    if(queryParams.cursor){
        const cursor = decodeCursor(queryParams.cursor)
        const cursorCondition = or(
            lt(logs.timestamp,new Date(cursor.timestamp)),
            and(
                eq(logs.timestamp,new Date(cursor.timestamp)),
                lt(logs.id, cursor.id)
            )
        );
        if(cursorCondition){
            conditions.push(cursorCondition);
        }
    }
    conditions.push(...buildCommonConditions(queryParams,rawReqQuery));
    if(queryParams.since)
        conditions.push(gte(logs.timestamp,new Date(queryParams.since)));
    if(queryParams.until)
        conditions.push(lt(logs.timestamp,new Date (queryParams.until)));

    const whereClause = conditions.length > 0 ? and(...conditions): undefined;
    return whereClause;

}
