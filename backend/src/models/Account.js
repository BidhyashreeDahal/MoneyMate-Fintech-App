// Defines the Account model for storing user financial accounts.
// Tracks checking, savings, wallets, and credit card accounts.
// Includes UI metadata (color, icon), goal tracking, soft-delete support, 
// and timestamps for financial history accuracy.

import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,         // Every account belongs to a user
    },

    name: {
      type: String,
      required: true,         // “Savings”, “Checking”, “Travel Fund”, etc.
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "checking",
        "savings",
        "cash",
        "credit_card",
        "investment",
        "wallet",
      ],
      default: "checking",    // Default account type 
    },

    balance: {
      type: Number,
      default: 0,             // Accounts always start at $0
    },

    currency: {
      type: String,
      default: "CAD",         // Default to Canadian Dollars
      uppercase: true,
    },

    color: {
      type: String,
      default: "#4F46E5",    
    },

    icon: {
      type: String,
      default: "wallet",      // Default icon for all new accounts
    },

    goalAmount: {
      type: Number,
      default: null,          // User sets a goal later 
    },

    archived: {
      type: Boolean,
      default: false,         // Soft delete — To not remove accounts permanently
    },
  },

  { timestamps: true }        // createdAt and updatedAt 
);

export default mongoose.model("Account", AccountSchema);
