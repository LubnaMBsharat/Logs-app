import { copyClient, db } from "../../config/db.js";
import { LogEntry } from "../../types/log.type.js";
import { toDate } from "../../utils/date-utils.js";
import { escapeText } from "../../utils/string-utils.js";
import { logs } from "../schema.js";

export async function insertLogs(validLogs: LogEntry[]){
    await db.insert(logs).values(validLogs);
}

export async function copyInsertLogs(entries: LogEntry[]): Promise<void> {
  let writable: any = null;

  try {
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


      const rows = entries
        .map((e) => {
          const ts = toDate(e.timestamp);
          const attributesJson = JSON.stringify(e.attributes ?? {});
          return `${escapeText(ts.toISOString())}\t${escapeText(e.level)}\t${escapeText(e.service)}\t${escapeText(e.message)}\t${escapeText(attributesJson)}`;
        })
        .join("\n") + "\n";

      writable.write(rows, (err: unknown) => {
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
  } catch (err) {
    if (writable) {
      try {
        writable.destroy();
      } catch (_) {}
    }
    throw err;
  }
}