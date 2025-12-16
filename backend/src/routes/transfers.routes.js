// Define API routes for money transfers between accounts
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
       createTransfer
        } from '../controllers/transfer.controller.js'
const router = express.Router();
router.post("/", authMiddleware,  createTransfer);

export default router;



