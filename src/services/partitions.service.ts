import { config } from "../config/env.js";
import { createDefaultPartitionTable, createPartitionTable, deleteExpiredFromDefaultPartition, dropPartition, getLogsTablePartitionTablesNames } from "../db/queries/partitions.js";
import { pruneRollupTable } from "../db/queries/rollup.js";
import { getDateSections } from "../utils/date-utils.js";

const PRE_CREATE_DAYS = 2;

export async function managePartitions() {
  console.log("Running Partition Management Service...");
  await buildFuturePartitionsTables();
  await buildDefaultPartitionTable()
  await dropExpiredPartitions();
  await cleanupDefaultPartition();
  await pruneRollupTable();
}

async function buildFuturePartitionsTables(){
    const currentDate = new Date();
    for(let i = -config.retentionDays; i <= PRE_CREATE_DAYS; i++){
        const targetDate = new Date (currentDate);
        targetDate.setUTCDate(currentDate.getUTCDate() + i);

        const targetDateParts = getDateSections(targetDate);
        const partitionTableName = `logs_y${targetDateParts.year}m${targetDateParts.month}d${targetDateParts.day}`;
        const partitionStartDate = `${targetDateParts.year}-${targetDateParts.month}-${targetDateParts.day} 00:00:00+00`;

        // the endDate it's the start of the next day, that's why we need the nextDate
        const nextDate = new Date(targetDate);
        nextDate.setUTCDate(targetDate.getUTCDate() + 1);
        const nextDateParts =  getDateSections(nextDate);

        const partitionEndDate= `${nextDateParts.year}-${nextDateParts.month}-${nextDateParts.day} 00:00:00+00`;
        await createPartitionTable(partitionTableName,partitionStartDate,partitionEndDate);
    }
}
async function buildDefaultPartitionTable() {
  await createDefaultPartitionTable();
}

async function dropExpiredPartitions(){
    const cutoffDate = new Date();
    cutoffDate.setUTCDate(cutoffDate.getUTCDate()-config.retentionDays);

    const result = await getLogsTablePartitionTablesNames();
    for(const row of result){
        //`logs_y${targetDateParts.year}m${targetDateParts.month}d${targetDateParts.day}`
        const match = row.table_name.match(/^logs_y(\d{4})m(\d{2})d(\d{2})$/);
        if(match){
            const [_, y, m, d] = match;
            const partitionDate = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))); 
            if(partitionDate < cutoffDate){
               console.log(`Dropping expired partition: ${row.table_name}`); 
               await dropPartition(row.table_name);
            }
        }
    }

}
async function cleanupDefaultPartition() {
  const cutoffDate = new Date();
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - config.retentionDays);

  const deletedCount = await deleteExpiredFromDefaultPartition(cutoffDate);
}
