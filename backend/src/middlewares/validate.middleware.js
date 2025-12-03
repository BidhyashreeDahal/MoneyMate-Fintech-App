// Middleware for validating incoming requests using Joi or express-validator.
// Ensures all required fields are present and valid.
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import {
    createAccount,
    getAccounts,
    updateAccount,
    archiveAccount,
} from "../controllers/accounts.controller.js";

const router = express.Router();
// Post /api/acounts -> Create a n