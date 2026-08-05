import { Router } from "express";
import { handlerHealth } from "./controllers/health.controller.js";

const router = Router();

router.get("/health", handlerHealth);

export default router;