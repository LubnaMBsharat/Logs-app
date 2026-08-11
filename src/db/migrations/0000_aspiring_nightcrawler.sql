CREATE TABLE "logs" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"level" varchar(10) NOT NULL,
	"service" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"attributes" jsonb,
	CONSTRAINT "logs_id_timestamp_pk" PRIMARY KEY("id","timestamp")
) PARTITION BY RANGE (timestamp);
