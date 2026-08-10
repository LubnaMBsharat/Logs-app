import { logs } from "../db/schema.js";
import { CommonFilters } from "../types/log-common.type.js";
import {  eq, ilike, sql, SQL } from "drizzle-orm";

function queryAttributesParams(rawReqQuery: Record<string,unknown>){
    const  attributes: Record<string,string>={};
    for(const queryKey in rawReqQuery){
        if(queryKey.startsWith("attr.")){
            attributes[queryKey.slice(5)] = String(rawReqQuery[queryKey]);
        }
    }
    return attributes;
}
export function buildCommonConditions(commonFilters: CommonFilters,rawReqQuery: Record<string,unknown>){
    const commonConditions:SQL[]= [];
    if(commonFilters.level)
        commonConditions.push(eq(logs.level,commonFilters.level));
    if(commonFilters.service)
        commonConditions.push(eq(logs.service,commonFilters.service));
    if(commonFilters.q)
        commonConditions.push(ilike(logs.message,`%${commonFilters.q}%`));  
    const attributes =queryAttributesParams (rawReqQuery);
    for(const [key,val] of Object.entries(attributes)){
        commonConditions.push(
            sql`${logs.attributes} ->> ${key}=${val}`
        );
    }  
    return commonConditions; 
}