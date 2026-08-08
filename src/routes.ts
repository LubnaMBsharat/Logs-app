import { Router } from "express";
import { healthHandler } from "./controllers/health.controller.js";
import { insertLogsHandler } from "./controllers/logs.controller.js";
import { queryLogsHandler } from "./controllers/logs-query.controller.js";

const router = Router();

router.get('/health', healthHandler);
router.post('/logs',insertLogsHandler);
router.get('/logs',queryLogsHandler);
export default router;