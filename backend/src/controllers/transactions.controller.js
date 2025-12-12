// Handles business logic for user transactions:
// - Creating income, expense, and transfer transactions
// - Fetching transactions with filtering
// - Updating and soft-deleting transactions
// - Placeholder for receipt upload (AI + OCR coming later)

import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";

// ===============================================================
// Create a new transaction (income, expense, transfer)
// ===============================================================
export const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      accountId,
      type,
      amount,
      currency,
      category,
      merchant,
      date,
      notes,
    } = req.body;

    // Validate required fields
    if (!accountId || !type || !amount || !date) {
      return res.status(400).json({
        message: "Missing required fields: accountId, type, amount, or date.",
      });
    }

    // Verify account belongs to the user
    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      return res.status(403).json({
        message: "You are not authorized to use this account.",
      });
    }

    // Handle transfers (we will expand later)
    if (type === "transfer") {
      return res.status(400).json({
        message: "Transfer logic will be implemented later.",
      });
    }

    // Create transaction
    const newTransaction = await Transaction.create({
      userId,
      accountId,
      type,
      amount,
      currency,
      category,
      merchant,
      date,
      notes,
    });

    return res.status(201).json({
      message: "Transaction created successfully.",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Create Transaction Error:", error);
    res.status(500).json({ message: "Server error creating transaction." });
  }
};

// ===============================================================
// Get all transactions for the authenticated user
// ===============================================================
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({
      userId,
      archived: false,
    }).sort({ date: -1 });

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Get Transactions Error:", error);
    res.status(500).json({ message: "Server error fetching transactions." });
  }
};

// ===============================================================
// Get single transaction by ID
// ===============================================================
export const getTransactionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
      archived: false,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    res.status(200).json({ transaction });
  } catch (error) {
    console.error("Get Transaction Error:", error);
    res.status(500).json({ message: "Server error fetching transaction." });
  }
};

// ===============================================================
// Update a transaction
// ===============================================================
export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const allowedFields = [
      "amount",
      "currency",
      "category",
      "merchant",
      "date",
      "notes",
      "type",
    ];

    const updates = {};
    allowedFields.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId, archived: false },
      updates,
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    res.status(200).json({
      message: "Transaction updated successfully.",
      transaction,
    });
  } catch (error) {
    console.error("Update Transaction Error:", error);
    res.status(500).json({ message: "Server error updating transaction." });
  }
};

// ===============================================================
// Soft delete (archive) a transaction
// ===============================================================
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    transaction.archived = true;
    await transaction.save();

    res.status(200).json({ message: "Transaction archived successfully." });
  } catch (error) {
    console.error("Delete Transaction Error:", error);
    res.status(500).json({ message: "Server error archiving transaction." });
  }
};

// ===============================================================
// Receipt upload (AI OCR + categorization placeholder)
// ===============================================================
export const uploadReceipt = async (req, res) => {
  try {
    // We will integrate multer + S3 + AI later
    res.status(200).json({
      message: "Receipt upload endpoint works! AI integration coming soon.",
    });
  } catch (error) {
    console.error("Receipt Upload Error:", error);
    res.status(500).json({ message: "Server error uploading receipt." });
  }
};
