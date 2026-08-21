import { copyClient, db } from "../../config/db.js";
import { buildTsvAndDeltas } from "../../services/rollup.service.js";
import { LogEntry } from "../../types/log.type.js";
import { logs } from "../schema.js";
import { upsertRollup } from "./rollup.js";

export async function insertLogs(validLogs: LogEntry[]){
    await db.insert(logs).values(validLogs);
}

export async function copyInsertLogs(entries: LogEntry[]): Promise<void> {
    let writable: any = null;

    try {
      const { tsv, deltas } = await buildTsvAndDeltas(entries);

      writable = await copyClient`
        COPY logs (timestamp, level, service, message, attributes)
        FROM STDIN
      `.writable();

      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          if (writable) {
            writable.removeAllListeners("error");
            writable.removeAllListeners("close");
          }
        };

        writable.once("error", (err: Error) => {
          cleanup();
          reject(err);
        });

        writable.write(tsv, (err: unknown) => {
          if (err) {
            cleanup();
            return reject(err);
          }
          writable.end((endErr: unknown) => {
            cleanup();
            if (endErr) reject(endErr);
            else resolve();
          });
        });
      });
      try {
        await upsertRollup(deltas);
      } 
      catch (rollupErr) {
        console.error("[ROLLUP] upsert failed (raw data already committed):", rollupErr);
      }
    } catch (err) {
    if (writable) {
      try {
        writable.destroy();
      } 
      catch (_) {}
    }
    throw err;
  }
   
}