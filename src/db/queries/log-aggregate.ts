import { SQL } from "drizzle-orm";
import { db } from "../../config/db.js";

export async function getAggregatedLogs(query:SQL){
    const result = await db.execute(query);
    //so the returned datatype won't be any
    type AggregateRow = { start: Date; group: string | null; count: number };
    const buckets = result.map((row: unknown) => {
    const typedRow = row as AggregateRow;
    return {
        start: typedRow.start.toISOString(),
        group: typedRow.group,
        count: Number(typedRow.count)
    };
    });
    return buckets;
}