// Transaction model:
// Core financial record for MoneyMate.
// Supports income, expenses, transfers, AI category suggestions,
// receipt uploads, and multi-currency analytics.

import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    // The user who owns this transaction
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The account (Checking, Savings, Cash, etc.)
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    // Money direction
    type: {
      type: String,
      enum: ["income", "expense", "transfer"],
      required: true,
    },

    // Amount of money involved
    amount: {
      type: Number,
      required: true,
    },

    // Currency code (CAD by default)
    currency: {
      type: String,
      default: "CAD",
    },

    // Spending / income category
    category: {
      type: String,
      enum: [
        "Groceries",
        "Food & Drinks",
        "Coffee & Snacks",
        "Shopping",
        "Personal Care",
        "Health",
        "Pharmacy",
        "Rent",
        "Mortgage",
        "Home Maintenance",
        "Utilities",
        "Internet",
        "Phone Bill",
        "Fuel",
        "Public Transit",
        "Taxi / Ride-sharing",
        "Parking",
        "Vehicle Maintenance",
        "Movies",
        "Music",
        "Games",
        "Activities",
        "Nightlife",
        "Subscriptions",
        "Bank Fees",
        "Investments",
        "Insurance",
        "Loans",
        "Tax Payments",
        "Flights",
        "Hotels",
        "Travel Food",
        "Transportation",
        "Vacation Activities",
        "Salary",
        "Bonus",
        "Refund",
        "Investment Income",
        "Gift Income",
        "Other Income",
        "Transfer In",
        "Transfer Out",
      ],
    },

    // Merchant, store, source
    merchant: {
      type: String,
      trim: true,
    },

    // Date the money moved
    date: {
      type: Date,
      required: true,
    },

    // Notes written by the user
    notes: {
      type: String,
      trim: true,
    },

    // Receipt image location (local or S3)
    receiptUrl: {
      type: String,
    },

    // AI suggested category
    aiSuggestedCategory: {
      type: String,
    },

    // Data extracted from receipt using OCR
    aiExtractedData: {
      amount: Number,
      merchant: String,
      date: Date,
    },

    // Soft delete
    archived: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
