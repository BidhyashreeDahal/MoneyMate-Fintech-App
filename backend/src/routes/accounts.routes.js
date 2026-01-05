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
import { validateBody } from "../middlewares/validate.middleware.js";
import { createAccountSchema, updateAccountSchema } from "../validators/account.validators.js";

const router = express.Router();

// All routes protected
router.use(authMiddleware);

router.post("/", validateBody(createAccountSchema), createAccount);
router.get("/", getAccounts);
router.put("/:id", validateBody(updateAccountSchema), updateAccount);
router.delete("/:id", archiveAccount);

export default router;
