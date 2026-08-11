import { SQL } from "drizzle-orm";
import { db } from "../../config/db.js";

export async function getAggregatedLogs(query: SQL) {
    const result = await db.execute(query);
    const buckets = result.map((row: any) => ({
        start: new Date(row.start).toISOString(),  
        group: row.group ?? null,
        count: Number(row.count)
    }));
    return buckets;
}