// Entry point of the backend application.
// Sets up Express server, connects to MongoDB, configures middleware (CORS, JSON parsing),
// mounts all API routes (auth, accounts, transactions, insights), and starts the server.
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config(); // Load environment variables
const app = express();
connectDB(); // Connect to MongoDB

// Simple test route`
app.get("/", (req, res) => {
  res.send("MoneyMate Backend is Running ");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));