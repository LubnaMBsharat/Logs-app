import { index, primaryKey } from "drizzle-orm/pg-core";
import {  bigint,jsonb, pgTable, text, uuid, varchar, timestamp} from "drizzle-orm/pg-core";

export const logs = pgTable("logs",{
    id : uuid("id").defaultRandom().notNull(),
    timestamp: timestamp("timestamp",{ withTimezone : true }).notNull(),
    level : varchar("level", {length: 10, enum: ["debug", "info", "warn", "error"]}).notNull(),
    service: varchar("service", { length: 255 }).notNull(),
    message: text("message").notNull(),
    attributes: jsonb("attributes")
},(table)=>({
    pk: primaryKey({columns:[table.id,table.timestamp]}),
    timeStampIdIdx: index("idx_logs_timestamp_id")
    .on(table.timestamp.desc(), table.id.desc()),
    serviceTimeStampIdIdx: index("idx_logs_service_timestamp_id")
    .on(table.service, table.timestamp.desc(), table.id.desc())
})
);
export const logsRollup1m = pgTable(
  "logs_rollup_1m",
  {
    bucketStart: timestamp("bucket_start", { withTimezone: true }).notNull(),
    service: varchar("service", { length: 255 }).notNull(),
    level: varchar("level", { length: 10, enum: ["debug", "info", "warn", "error"] }).notNull(),
    logCount: bigint("log_count", { mode: "number" }).notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bucketStart, table.service, table.level] }),
  })
);

