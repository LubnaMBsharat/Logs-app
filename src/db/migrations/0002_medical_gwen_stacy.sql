DROP INDEX "idx_logs_level_timestamp_id";--> statement-breakpoint
CREATE INDEX "idx_logs_timestamp_id" ON "logs" USING btree ("timestamp" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_logs_service_timestamp_id" ON "logs" USING btree ("service","timestamp" DESC NULLS LAST,"id" DESC NULLS LAST);