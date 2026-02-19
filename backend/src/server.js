import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/accounts.routes.js";
import transactionRoutes from "./routes/transactions.routes.js";
import insightsRoutes from "./routes/insights.routes.js";
import transferRoutes from "./routes/transfers.routes.js";
import budgetRoutes from "./routes/budgets.routes.js";
import receiptRoutes from "./routes/receipts.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import helmet from "helmet";
import cors from "cors";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";

dotenv.config();

const app = express();

// Required when behind proxies (Render/Vercel)
app.set("trust proxy", 1);

// Connect DB
connectDB();

// Body parsing
app.use(express.json());
app.use(cookieParser());

// Security headers
app.use(helmet());

// Rate limit API
app.use("/api", apiLimiter);

/**
 * CORS FIXED VERSION
 * - No throwing errors
 * - Stable across browsers
 * - Safe for credentials
 */

const allowedOrigins = (
  process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || ""
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser requests (like Postman)
      if (!origin) return cb(null, true);

      // Exact match
      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      // Allow Vercel preview deployments
      if (/^https:\/\/money-mate-fintech.*\.vercel\.app$/i.test(origin)) {
        return cb(null, true);
      }

      // IMPORTANT: do NOT throw error
      return cb(null, false);
    },
    credentials: true,
  })
);

// Health check
app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true });
});

// Static uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/reports", reportRoutes);

// 404 + Error handler
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
