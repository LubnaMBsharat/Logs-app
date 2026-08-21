CREATE TABLE "logs_rollup_1m" (
	"bucket_start" timestamp with time zone NOT NULL,
	"service" varchar(255) NOT NULL,
	"level" varchar(10) NOT NULL,
	"log_count" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "logs_rollup_1m_bucket_start_service_level_pk" PRIMARY KEY("bucket_start","service","level")
);
