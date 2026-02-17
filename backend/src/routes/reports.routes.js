// routes/reports.routes.js
// AI + analytics report endpoints (authenticated)

import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getMonthlyAiReport } from "../controllers/reports.controller.js";

const router = express.Router();

router.use(authMiddleware);

// GET /api/reports/monthly-ai?month=YYYY-MM
router.get("/monthly-ai", getMonthlyAiReport);

export default router;

