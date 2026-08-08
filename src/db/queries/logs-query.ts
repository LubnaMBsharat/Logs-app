import { desc, SQL } from "drizzle-orm";
import { db } from "../../config/db.js";
import { logs } from "../schema.js";

export async function getLogs(whereClause: SQL|undefined,limit: number){
    const result = await db.select()
        .from(logs)
        .where(whereClause)
        .orderBy(desc(logs.timestamp),desc(logs.id))
        .limit(limit+1);
    return result;
}