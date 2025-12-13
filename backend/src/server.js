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

dotenv.config(); // Load environment variables
const app = express();
connectDB(); // Connect to MongoDB


// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.use("/api/accounts", accountRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/insights", insightsRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

