import { Router } from "express";
import { healthHandler } from "./controllers/health.controller.js";
import { insertLogsHandler } from "./controllers/logs.controller.js";

const router = Router();

router.get('/health', healthHandler);
router.post('/logs',insertLogsHandler);

export default router;