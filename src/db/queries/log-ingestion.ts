import { db } from "../../config/db.js";
import { LogEntry } from "../../types/log.type.js";
import { logs } from "../schema.js";

export async function insertLogs(validLogs: LogEntry[]){
    await db.insert(logs).values(validLogs);
}