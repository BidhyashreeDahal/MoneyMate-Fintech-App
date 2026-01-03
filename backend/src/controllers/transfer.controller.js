/*
Handles secure account-to-account money transfers.
Uses Mongo db session to avoid partial transfers
 */
import mongoose from "mongoose";
import Transfer from "../models/Transfer.js";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";

export const createTransfer = async (req, res) => {
  const userId = req.user.id;
  const { fromAccountId, toAccountId, amount, note, date } = req.body;

  // Validate BEFORE starting transaction
  if (!fromAccountId || !toAccountId || amount == null) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (fromAccountId === toAccountId) {
    return res.status(400).json({ message: "Source and destination accounts must be different" });
  }
  if (Number(amount) <= 0) {
    return res.status(400).json({ message: "Transfer amount must be positive" });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const fromAccount = await Account.findOne({ _id: fromAccountId, userId }).session(session);
      const toAccount = await Account.findOne({ _id: toAccountId, userId }).session(session);

      if (!fromAccount || !toAccount) {
        throw Object.assign(new Error("One or both accounts not found"), { statusCode: 404 });
      }

      if (fromAccount.archived || toAccount.archived) {
        throw Object.assign(new Error("Archived accounts cannot send or receive transfers"), { statusCode: 400 });
      }

      if (fromAccount.currency !== toAccount.currency) {
        throw Object.assign(new Error("Currency mismatch between accounts"), { statusCode: 400 });
      }

      const amt = Number(amount);
      if (fromAccount.balance < amt) {
        throw Object.assign(new Error("Insufficient funds in source account"), { statusCode: 400 });
      }

      // 1) Create Transfer (pending)
      const transfer = await Transfer.create(
        [{
          userId,
          fromAccountId,
          toAccountId,
          amount: amt,
          currency: fromAccount.currency,
          note: note || "",
          status: "pending",
          date: date ? new Date(date) : new Date(),
        }],
        { session }
      );

      const transferDoc = transfer[0];

      // 2) Create ledger transactions (2 legs)
      await Transaction.create(
        [{
          userId,
          accountId: fromAccountId,
          type: "expense",
          amount: amt,
          currency: fromAccount.currency,
          category: "Transfer Out",
          date: transferDoc.date,
          notes: note || "",
          transferId: transferDoc._id,
        }],
        { session }
      );

      await Transaction.create(
        [{
          userId,
          accountId: toAccountId,
          type: "income",
          amount: amt,
          currency: fromAccount.currency,
          category: "Transfer In",
          date: transferDoc.date,
          notes: note || "",
          transferId: transferDoc._id,
        }],
        { session }
      );

      // 3) Update balances
      fromAccount.balance -= amt;
      toAccount.balance += amt;
      await fromAccount.save({ session });
      await toAccount.save({ session });

      // 4) Mark transfer completed
      transferDoc.status = "completed";
      await transferDoc.save({ session });

      // attach to req for response
      req._transferDoc = transferDoc;
    });

    return res.status(201).json({
      message: "Transfer completed successfully",
      transfer: req._transferDoc,
    });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ message: err.message || "Internal server error" });
  } finally {
    session.endSession();
  }
};
