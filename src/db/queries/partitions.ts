import { sql } from "drizzle-orm";
import { db } from "../../config/db.js";

export async function createPartitionTable (partitionName:string,startDate:string,endDate:string){    
    await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS "${partitionName}" 
        PARTITION OF "logs" 
        FOR VALUES FROM ('${startDate}') TO ('${endDate}');
    `))
}
export async function getLogsTablePartitionTablesNames(){
    const result = await db.execute<{ table_name: string }>
    (sql`
        SELECT child.relname AS table_name
        FROM pg_class child
        Join pg_inherits i ON child.oid = i.inhrelid
        Join pg_class parent ON parent.oid = i.inhparent
        where parent.relname = 'logs';
    `);
    return result;
    
}

export async function dropPartition(partitionName:string){
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${partitionName}"`));
}