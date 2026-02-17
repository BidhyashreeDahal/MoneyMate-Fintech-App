// Entry point of the backend application.
// Sets up Express server, connects to MongoDB, configures middleware (CORS, JSON parsing),
// mounts all API routes (auth, accounts, transactions, insights), and starts the server.
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/accounts.routes.js';
import transactionRoutes from './routes/transactions.routes.js';
import insightsRoutes from './routes/insights.routes.js';
import transferRoutes from './routes/transfers.routes.js';
import budgetRoutes from "./routes/budgets.routes.js";
import receiptRoutes from "./routes/receipts.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import helmet from "helmet";
import cors from "cors";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";


dotenv.config(); // Load environment variables
const app = express();
// Required when behind proxies (Render/Vercel/NGINX) for secure cookies
app.set("trust proxy", 1);
connectDB(); // Connect to MongoDB
// Parse JSON bodies
app.use(express.json());

// Parse cookies (needed for cookie-based auth)
app.use(cookieParser());

/**
 * Security headers
 * - Helps prevent common attacks by setting safe HTTP headers.
 */
app.use(helmet());

/**
 * Rate limit all API routes
 * - Protects against abuse/spam.
 */
app.use("/api", apiLimiter);

/**
 * CORS (Cross-Origin Resource Sharing)
 * - Allows ONLY your frontend origin to call backend with cookies.
 * - credentials:true is REQUIRED for cookie auth with Axios.
 */
app.use(
  cors({
    origin:
      (process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    credentials: true,
  })
);

app.use("/uploads", express.static("uploads"));


app.use('/api/auth', authRoutes);

app.use("/api/accounts", accountRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/transfers", transferRoutes);

app.use("/api/insights", insightsRoutes);

app.use("/api/budgets", budgetRoutes);

app.use("/api/receipts", receiptRoutes);

app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);



// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

