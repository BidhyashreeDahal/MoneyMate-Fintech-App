// Handles business logic for user transactions:
// - Creating income, expense, and transfer transactions
// - Fetching transactions with filtering
// - Updating and soft-deleting transactions
// - Placeholder for receipt upload (AI + OCR coming later)

import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import mongoose from "mongoose";

// ===============================================================
// Create a new transaction (income, expense, transfer)
// ===============================================================
// CREATE (updates balance atomically)
export const createTransaction = async (req, res) => {
  const userId = req.user.id;
  const { accountId, type, amount, currency, category, merchant, date, notes } = req.body;

  if (!accountId || !type || amount == null || !date) {
    return res.status(400).json({
      message: "Missing required fields: accountId, type, amount, or date.",
    });
  }

  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ message: "Invalid transaction type. Use income or expense." });
  }

  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number." });
  }

  const session = await mongoose.startSession();
  try {
    let createdTx;

    await session.withTransaction(async () => {
      const account = await Account.findOne({ _id: accountId, userId, archived: false }).session(session);
      if (!account) {
        throw Object.assign(new Error("You are not authorized to use this account."), { statusCode: 403 });
      }

      if (currency && currency !== account.currency) {
        throw Object.assign(new Error("Currency must match the account currency."), { statusCode: 400 });
      }

      const delta = type === "income" ? amt : -amt;

      createdTx = await Transaction.create(
        [{
          userId,
          accountId,
          type,
          amount: amt,
          currency: account.currency,
          category,
          merchant,
          date: new Date(date),
          notes,
        }],
        { session }
      );

      await Account.updateOne(
        { _id: accountId, userId },
        { $inc: { balance: delta } }
      ).session(session);
    });

    return res.status(201).json({
      message: "Transaction created successfully.",
      transaction: createdTx[0],
    });
  } catch (error) {
    const status = error.statusCode || 500;
    console.error("Create Transaction Error:", error);
    return res.status(status).json({ message: error.message || "Server error creating transaction." });
  } finally {
    session.endSession();
  }
};

// GET ALL
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({ userId, archived: false }).sort({ date: -1 });
    return res.status(200).json({ transactions });
  } catch (error) {
    console.error("Get Transactions Error:", error);
    return res.status(500).json({ message: "Server error fetching transactions." });
  }
};

// GET ONE
export const getTransactionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const transaction = await Transaction.findOne({ _id: transactionId, userId, archived: false });
    if (!transaction) return res.status(404).json({ message: "Transaction not found." });

    return res.status(200).json({ transaction });
  } catch (error) {
    console.error("Get Transaction Error:", error);
    return res.status(500).json({ message: "Server error fetching transaction." });
  }
};

// UPDATE (NOTE: does NOT adjust balance yet — we fix next)
export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const allowedFields = ["amount", "currency", "category", "merchant", "date", "notes", "type"];
    const updates = {};
    allowedFields.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const transaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId, archived: false },
      updates,
      { new: true }
    );

    if (!transaction) return res.status(404).json({ message: "Transaction not found." });

    return res.status(200).json({ message: "Transaction updated successfully.", transaction });
  } catch (error) {
    console.error("Update Transaction Error:", error);
    return res.status(500).json({ message: "Server error updating transaction." });
  }
};

// DELETE (archive) (NOTE: does NOT adjust balance yet — we fix next)
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const transaction = await Transaction.findOne({ _id: transactionId, userId, archived: false });
    if (!transaction) return res.status(404).json({ message: "Transaction not found." });

    transaction.archived = true;
    await transaction.save();

    return res.status(200).json({ message: "Transaction archived successfully." });
  } catch (error) {
    console.error("Delete Transaction Error:", error);
    return res.status(500).json({ message: "Server error archiving transaction." });
  }
};

// RECEIPT placeholder
export const uploadReceipt = async (req, res) => {
  return res.status(200).json({
    message: "Receipt upload endpoint works! AI integration coming soon.",
  });
};
