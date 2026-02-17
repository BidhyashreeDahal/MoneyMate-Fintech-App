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
  const userId = req.user.id;
  const transactionId = req.params.id;

  // Fields you allow to change
  const allowedFields = ["amount", "currency", "category", "merchant", "date", "notes", "type", "accountId"];
  const updates = {};
  allowedFields.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const session = await mongoose.startSession();

  try {
    let updatedTx;

    await session.withTransaction(async () => {
      // 1) Load current transaction
      const tx = await Transaction.findOne({ _id: transactionId, userId, archived: false }).session(session);
      if (!tx) throw Object.assign(new Error("Transaction not found."), { statusCode: 404 });

      // 2) Block editing transfer-generated transactions (simple rule for now)
      if (tx.category === "Transfer In" || tx.category === "Transfer Out" || tx.transferId) {
        throw Object.assign(new Error("Transfer transactions cannot be edited manually."), { statusCode: 400 });
      }

      // 3) Build the "next" values (fallback to old if not provided)
      const nextType = updates.type ?? tx.type;
      const nextAmount = updates.amount ?? tx.amount;
      const nextAccountId = updates.accountId ?? tx.accountId;

      // 4) Validate type/amount
      if (!["income", "expense"].includes(nextType)) {
        throw Object.assign(new Error("Invalid transaction type. Use income or expense."), { statusCode: 400 });
      }
      const amt = Number(nextAmount);
      if (!Number.isFinite(amt) || amt <= 0) {
        throw Object.assign(new Error("Amount must be a positive number."), { statusCode: 400 });
      }

      // Helper to compute balance impact
      const impact = (t, a) => (t === "income" ? a : -a);

      const oldDelta = impact(tx.type, Number(tx.amount));
      const newDelta = impact(nextType, amt);

      // 5) If account changes, verify new account ownership
      const oldAccountId = tx.accountId.toString();
      const newAccountIdStr = nextAccountId.toString();

      if (oldAccountId !== newAccountIdStr) {
        const newAcc = await Account.findOne({ _id: nextAccountId, userId, archived: false }).session(session);
        if (!newAcc) {
          throw Object.assign(new Error("You are not authorized to use the new account."), { statusCode: 403 });
        }

        // Remove old impact from old account
        await Account.updateOne(
          { _id: tx.accountId, userId },
          { $inc: { balance: -oldDelta } }
        ).session(session);

        // Apply new impact to new account
        await Account.updateOne(
          { _id: nextAccountId, userId },
          { $inc: { balance: newDelta } }
        ).session(session);
      } else {
        // Same account: apply only the difference
        const diff = newDelta - oldDelta;
        if (diff !== 0) {
          await Account.updateOne(
            { _id: tx.accountId, userId },
            { $inc: { balance: diff } }
          ).session(session);
        }
      }

      // 6) Apply updates to transaction doc
      Object.keys(updates).forEach((k) => {
        if (k === "amount") tx.amount = amt;
        else if (k === "date") tx.date = new Date(updates.date);
        else tx[k] = updates[k];
      });

      await tx.save({ session });
      updatedTx = tx;
    });

    return res.status(200).json({
      message: "Transaction updated successfully.",
      transaction: updatedTx,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    console.error("Update Transaction Error:", error);
    return res.status(status).json({ message: error.message || "Server error updating transaction." });
  } finally {
    session.endSession();
  }
};

export const deleteTransaction = async (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const tx = await Transaction.findOne({ _id: transactionId, userId, archived: false }).session(session);
      if (!tx) throw Object.assign(new Error("Transaction not found."), { statusCode: 404 });

      // Block deleting transfer-generated transactions (for now)
      if (tx.category === "Transfer In" || tx.category === "Transfer Out" || tx.transferId) {
        throw Object.assign(new Error("Transfer transactions cannot be archived manually."), { statusCode: 400 });
      }

      const amt = Number(tx.amount);
      const delta = tx.type === "income" ? amt : -amt;

      // Reverse the transaction effect
      await Account.updateOne(
        { _id: tx.accountId, userId },
        { $inc: { balance: -delta } }
      ).session(session);

      tx.archived = true;
      await tx.save({ session });
    });

    return res.status(200).json({ message: "Transaction archived successfully." });
  } catch (error) {
    const status = error.statusCode || 500;
    console.error("Delete Transaction Error:", error);
    return res.status(status).json({ message: error.message || "Server error archiving transaction." });
  } finally {
    session.endSession();
  }
};

export const attachReceiptToTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "No receipt file uploaded." });
    }

    // If uploads are disabled (e.g., production serverless), multer uses memoryStorage (no filename).
    if (!req.file.filename) {
      return res.status(503).json({
        message:
          "Receipt uploads are disabled in this environment. Set ENABLE_UPLOADS=true on a server with writable storage.",
      });
    }

    const receiptUrl = `/uploads/receipts/${req.file.filename}`;

    const tx = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId, archived: false },
      { receiptUrl },
      { new: true }
    );

    if (!tx) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    return res.status(200).json({
      message: "Receipt attached successfully.",
      transaction: tx,
    });
  } catch (error) {
    console.error("Attach Receipt Error:", error);
    return res.status(500).json({ message: "Server error attaching receipt." });
  }
};

