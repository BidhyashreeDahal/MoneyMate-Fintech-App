/**
 * Budget Routes: API endpoints for spending limits
 */
import express from "express";
import authMiddleware  from "../middlewares/auth.middleware.js";
import {
    createBudget,
    getBudgets,
    deleteBudget,
} from "../controllers/budget.controller.js"

const router = express.Router();

router.use(authMiddleware);

router.post("/",  createBudget);

router.get("/", getBudgets);

router.delete("/:id", deleteBudget);
export default router;