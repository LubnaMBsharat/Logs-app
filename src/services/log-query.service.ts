import { and, eq, gte, lt, ilike, lte, or, sql, SQL } from "drizzle-orm";
import { LogQueryParameters } from "../types/log-query.type.js";
import { logs } from "../db/schema.js";
import { decodeCursor } from "../utils/cursor.js";

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
    if(queryParams.service){
        conditions.push(eq(logs.service,queryParams.service));
    }
    if(queryParams.level)
        conditions.push(eq(logs.level,queryParams.level))
    if(queryParams.since)
        conditions.push(gte(logs.timestamp,new Date(queryParams.since)));
    if(queryParams.until)
        conditions.push(lte(logs.timestamp,new Date (queryParams.until)));
    if(queryParams.q)
        conditions.push(ilike(logs.message,`%${queryParams.q}%`));

    const attributes =queryAttributesParams (rawReqQuery);
    for(const [key,val] of Object.entries(attributes)){
        conditions.push(
            sql`${logs.attributes} ->> ${key}=${val}`
        );
    }
    const whereClause = conditions.length > 0 ? and(...conditions): undefined;
    return whereClause;

}
function queryAttributesParams(rawReqQuery: Record<string,unknown>){
    const  attributes: Record<string,string>={};
    for(const queryKey in rawReqQuery){
        if(queryKey.startsWith("attr.")){
            attributes[queryKey.slice(5)] = String(rawReqQuery[queryKey]);
        }
    }
    return attributes;
}
