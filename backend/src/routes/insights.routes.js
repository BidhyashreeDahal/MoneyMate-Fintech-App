// routes/insights.routes.js
// Defines analytics endpoints for dashboard (read-only)
// All routes require authentication

import express from "express";
import { getSummary } from "../controllers/insights.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js"
import { getCategoryBreakdown } from "../controllers/insights.controller.js";

const router = express.Router();

// Protect all insights routes with authentication
router.use(authMiddleware);
router.get("/summary", getSummary);
router.get("/category-breakdown", getCategoryBreakdown);
export default router;
