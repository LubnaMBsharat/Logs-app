import { LogEntry } from "../types/log.type.js";
import { ServiceUnavailable } from "../errors/app-errors.js";
import { copyInsertLogs } from "../db/queries/log-ingestion.js";

const MAX_BATCH_SIZE = 13000;
const MAX_WAIT_MS = 100;
const MAX_QUEUE_SIZE = 100000;
const MAX_CONCURRENT_FLUSHES = 5; 

interface QueuedRequest {
  entries: LogEntry[];
  resolve: () => void;
  reject: (err: unknown) => void;
}

let queue: QueuedRequest[] = [];
let currentQueueSize = 0;
let flushTimer: NodeJS.Timeout | null = null;
let activeFlushes = 0;

export function queueLogsForInsert(entries: LogEntry[]): Promise<void> {
  if (currentQueueSize + entries.length > MAX_QUEUE_SIZE) {
    throw new ServiceUnavailable("Server is overloaded, please retry shortly");
  }

  currentQueueSize += entries.length;

  return new Promise<void>((resolve, reject) => {
    queue.push({ entries, resolve, reject });

    if (currentQueueSize >= MAX_BATCH_SIZE) {
      void flush();
    } else if (!flushTimer) {
      flushTimer = setTimeout(() => void flush(), MAX_WAIT_MS);
    }
  });
}
async function flush() {
  if (activeFlushes >= MAX_CONCURRENT_FLUSHES) return;
  if (queue.length === 0) return;

  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  activeFlushes++;

  const { toProcess, count } = getBatchFromTheQueue();
  currentQueueSize -= count;

  if (currentQueueSize < 0) currentQueueSize = 0;

  const entriesToInsert = toProcess.flatMap((r) => r.entries);
  try {
    await copyInsertLogs(entriesToInsert);
    toProcess.forEach((r) => r.resolve());
  } catch (err) {
    toProcess.forEach((r) => r.reject(err));
  } finally {
    activeFlushes--;
    if (queue.length > 0) {
      void flush();
    }
  }
}
function getBatchFromTheQueue(): { toProcess: QueuedRequest[]; count: number } {
    const toProcess: QueuedRequest[] = [];
    let count = 0;
    while (queue.length > 0 && count + queue[0].entries.length <= MAX_BATCH_SIZE) {
      const req = queue.shift()!;
      toProcess.push(req);
      count += req.entries.length;
  }
  if (toProcess.length === 0 && queue.length > 0) {
    const req = queue.shift()!;
    toProcess.push(req);
    count += req.entries.length;
  }
  return { toProcess, count };
}