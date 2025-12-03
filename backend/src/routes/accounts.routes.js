// Defines routes for creating, reading, updating, and deleting user accounts.
// All routes are protected using auth middleware.
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
    createAccount,
    getAccounts,
    updateAccount,
    archiveAccount,
} from "../controllers/accounts.controller.js";
const router = express.Router();
// Post /api/acounts -> Create a new accoun t
router.post("/", authMiddleware, createAccount);

// GET /api/accounts -> Get all accounts for logged-in user
router.get("/", authMiddleware, getAccounts);

// PUT /api/accounts/:id -> Update account
router.put("/:id", authMiddleware, updateAccount);

// DELETE /api/accounts/:id -> Soft delete (archive) account
router.delete("/:id", authMiddleware, archiveAccount);

export default router;