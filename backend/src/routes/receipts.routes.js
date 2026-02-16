import express from "express";
import multer from "multer";
import authMiddleware from "../middlewares/auth.middleware.js";
import { parseReceipt } from "../controllers/receipt.controller.js";

const router = express.Router();
const upload = multer();

router.use(authMiddleware);
router.post("/parse", upload.single("receipt"), parseReceipt);

export default router;
