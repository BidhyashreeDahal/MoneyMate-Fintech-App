/**
 * Budget Routes: API endpoints for spending limits
 */
import express from "express";
import authMiddleware  from "../middlewares/auth.middleware.js";
import {
    createBudget,
    getBudgets,
    deleteBudget,
    updateBudget,
} from "../controllers/budget.controller.js"

import { validateBody } from "../middlewares/validate.middleware.js";
import { createBudgetSchema, updateBudgetSchema } from "../validators/budget.validators.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", validateBody(createBudgetSchema), createBudget);

router.get("/", getBudgets);

router.put("/:id", validateBody(updateBudgetSchema), updateBudget);

router.delete("/:id", deleteBudget);
export default router;