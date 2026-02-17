// Defines API endpoints for transactions:
// - create transaction
// - get all transactions
// - get single transaction
// - update transaction
// - archive/delete transaction
// - upload receipt (future AI parsing)
// All routes require user authentication.

import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    attachReceiptToTransaction,
    getReceiptForTransaction,
} from '../controllers/transactions.controller.js';
import { uploadReceipt } from "../middlewares/uploadReceipt.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { createTransactionSchema } from "../validators/transaction.validators.js";



const router = express.Router();

//All routes are protected using auth middleware
router.use(authMiddleware);

router.post("/:id/receipt", uploadReceipt.single("receipt"), attachReceiptToTransaction);
router.get("/:id/receipt", getReceiptForTransaction);
// POST /api/transactions -> Create a new transaction
router.post("/", validateBody(createTransactionSchema), createTransaction);
// GET /api/transactions -> Get all transactions for logged-in user
router.get("/", getTransactions);

// GET /api/transactions/:id -> Get single transaction by ID
router.get("/:id", getTransactionById);

// PUT /api/transactions/:id -> Update transaction by ID
router.put("/:id", updateTransaction);

// DELETE /api/transactions/:id -> Soft delete (archive) transaction by ID
router.delete("/:id", deleteTransaction);

// POST /api/transactions/upload-receipt -> Upload receipt image for AI parsing (future feature)

export default router;