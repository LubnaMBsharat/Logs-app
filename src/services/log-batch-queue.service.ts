import { insertLogs } from "../db/queries/log-ingestion.js";
import { LogEntry } from "../types/log.type.js";

const MAX_BATCH_SIZE = 2000;
const MAX_WAIT_MS = 50;

interface QueuedRequest {
  entries: LogEntry[];
  resolve: () => void;
  reject: (err: unknown) => void;
}
// to store all the requests
let queue: QueuedRequest[] = [];
//lock the insert operation
let isFlushing = false;
// timer obj if it's running, and if it's off then null
let flushTimer: NodeJS.Timeout | null = null;

async function flush(){
    if (isFlushing) return;
    if (queue.length === 0) return;

    //if we reached the max batch size before the timer ends then first I have to clear the timer for next times
    if(flushTimer){
        clearTimeout(flushTimer);
        flushTimer = null;
    }
    isFlushing = true;
    // empty the original buffer to start collecting new data while we insert the collected one into the DB;
    const toProcess: QueuedRequest[] = [];
    let count = 0;
    while (queue.length > 0 && count + queue[0].entries.length <= MAX_BATCH_SIZE) {
        const req = queue.shift()!;
        toProcess.push(req);
        count += req.entries.length;
    }

    if (toProcess.length === 0 && queue.length > 0) {
        toProcess.push(queue.shift()!);
    }

    const entriesToInsert = toProcess.flatMap((r) => r.entries);
    try {
        const start = Date.now();
        await insertLogs(entriesToInsert);
        toProcess.forEach((r) => r.resolve());
    } catch (err) {
        toProcess.forEach((r) => r.reject(err));
    } finally {
        isFlushing = false;
        if (queue.length > 0) {
        void flush();
    }
  }   
}

export function queueLogsForInsert(entries: LogEntry[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    queue.push({ entries, resolve, reject });

    const totalQueued = queue.reduce((sum, r) => sum + r.entries.length, 0);

    if (totalQueued >= MAX_BATCH_SIZE) {
      void flush();
    } else if (!flushTimer) {
      flushTimer = setTimeout(() => void flush(), MAX_WAIT_MS);
    }
  });
}