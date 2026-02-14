// Define API routes for money transfers between accounts
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
       createTransfer,
       getTransfers,
        } from '../controllers/transfer.controller.js'
import { validateBody } from "../middlewares/validate.middleware.js";
import { createTransferSchema } from "../validators/transfer.validators.js";
const router = express.Router();
router.use(authMiddleware);
router.post("/", validateBody(createTransferSchema), createTransfer);
router.get("/", getTransfers);

export default router;



