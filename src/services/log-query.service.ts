import { and, eq, gte, lt, or, SQL } from "drizzle-orm";
import { LogQueryParameters } from "../types/log-query.type.js";
import { logs } from "../db/schema.js";
import { decodeCursor } from "../utils/cursor.js";
import { buildCommonConditions } from "./log-common.service.js";

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
