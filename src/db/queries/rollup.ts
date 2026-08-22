import { lt, sql } from "drizzle-orm";
import { rollupClient, dbRollup } from "../../config/db.js";
import { sortDeltasForLocking } from "../../services/rollup.service.js";
import { RollupDelta} from "../../types/rollup.type.js";
import { logsRollup1m } from "../schema.js";
import { config } from "../../config/env.js";

export async function upsertRollup(deltas: RollupDelta[]): Promise<void> {
  if (deltas.length === 0) return;

  const sorted = sortDeltasForLocking(deltas);

  const params: unknown[] = [];
  const valueGroups = sorted.map((d) => {
    const base = params.length;
    params.push(
      d.bucket_start.toISOString(),
      d.service,
      d.level,
      String(d.log_count)
    );
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
  });

  await rollupClient.unsafe(
    `
    INSERT INTO logs_rollup_1m (bucket_start, service, level, log_count)
    VALUES ${valueGroups.join(", ")}
    ON CONFLICT (bucket_start, service, level)
    DO UPDATE SET log_count = logs_rollup_1m.log_count + EXCLUDED.log_count
  `,
    params as any[]
  );
}

export async function pruneRollupTable() {
  await dbRollup
    .delete(logsRollup1m)
    .where(
      lt(
        logsRollup1m.bucketStart, 
        sql`now() - (${config.retentionDays} || ' days')::interval`
      )
    );
}