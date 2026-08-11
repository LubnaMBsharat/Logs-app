import { primaryKey } from "drizzle-orm/pg-core";
import { jsonb, pgTable, text, uuid, varchar, timestamp} from "drizzle-orm/pg-core";

export const logs = pgTable("logs",{
    id : uuid("id").defaultRandom().notNull(),
    timestamp: timestamp("timestamp",{ withTimezone : true }).notNull(),
    level : varchar("level", {length: 10, enum: ["debug", "info", "warn", "error"]}).notNull(),
    service: varchar("service", { length: 255 }).notNull(),
    message: text("message").notNull(),
    attributes: jsonb("attributes")
},(table)=>({
    pk: primaryKey({columns:[table.id,table.timestamp]})
})

);