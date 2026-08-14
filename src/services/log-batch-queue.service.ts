import { insertLogs } from "../db/queries/log-ingestion.js";
import { LogEntry } from "../types/log.type.js";

const MAX_BATCH_SIZE = 2000;
const MAX_WAIT_MS = 50;

interface PendingCallback {
    resolve : () => void,
    reject : (err:unknown) => void
}
// to store all the logs objects from the requests
let buffer: LogEntry[] = [];
let pendingCallBacks: PendingCallback[] =[];
// timer obj if it's running, and if it's off then null
let flushTimer: NodeJS.Timeout | null = null;

async function flush(){
    //if we reached the max batch size before the timer ends then first I have to clear the timer for next times
    if(flushTimer){
        clearTimeout(flushTimer);
        flushTimer = null;
    }
    // empty the original buffer to start collecting new data while we insert the collected one into the DB;
    if(buffer.length === 0) return;
    const entriesToInsert = buffer;
    const callbacks = pendingCallBacks;
    buffer= [];
    pendingCallBacks = [];
    try {
        await insertLogs(entriesToInsert);
        callbacks.forEach((cb) => cb.resolve());
    } catch (err) {
        callbacks.forEach((cb) => cb.reject(err));
    }    
}

export function queueLogsForInsert(entries: LogEntry[]): Promise<void> {
    return new Promise((resolve,reject)=>{
        buffer.push(...entries);
        pendingCallBacks.push({resolve,reject});

        if(buffer.length >= MAX_BATCH_SIZE){
            void flush();            
        }
        else if(!flushTimer){
            flushTimer = setTimeout(()=> void flush(), MAX_WAIT_MS);
        }

    })
}