import { Router } from "express";
import { healthHandler } from "./controllers/health.controller.js";
import { insertLogsHandler } from "./controllers/logs-ingestion.controller.js";
import { queryLogsHandler } from "./controllers/logs-query.controller.js";
import { aggregateLogsHandler } from "./controllers/log-aggregator.controller.js";

const router = Router();

router.get('/health', healthHandler);
router.post('/logs',insertLogsHandler);
router.get('/logs',queryLogsHandler);
router.get('/logs/aggregate', aggregateLogsHandler);
export default router;