// Handles business logic for user financial accounts.
// Includes creating accounts, retrieving all accounts for a user,
// updating account details, and soft-deleting (archiving) accounts.
// Ensures all operations are user-specific, validated, and secure.

import Account from "../models/Account.js";

// CREATE a new account
export const createAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, currency, balance, goalAmount, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Account name is required." });
    }

    const initialBalance = Number(balance);
    const safeBalance = Number.isFinite(initialBalance) && initialBalance >= 0 ? initialBalance : 0;

    const newAccount = await Account.create({
      userId,
      name,
      type,
      currency,
      balance: safeBalance,
      goalAmount,
      color,
      icon,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      account: newAccount,
    });
  } catch (error) {
    console.error("Create Account error:", error);
    return res.status(500).json({
      message: "Server error during account creation.",
    });
  }
};

// GET all accounts for the authenticated user
export const getAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const accounts = await Account.find({
      userId,
      archived: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json(accounts);
  } catch (error) {
    console.error("Get Accounts error:", error);
    return res.status(500).json({
      message: "Server error fetching accounts.",
    });
  }
};

// UPDATE an account
export const updateAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const accountId = req.params.id;

    const allowedUpdates = [
      "name",
      "type",
      "currency",
      "balance",
      "goalAmount",
      "color",
      "icon",
    ];

    const updates = {};
    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    if (updates.balance !== undefined) {
      const b = Number(updates.balance);
      updates.balance = Number.isFinite(b) && b >= 0 ? b : 0;
    }

    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      return res
        .status(404)
        .json({ message: "Account not found or unauthorized." });
    }

    Object.assign(account, updates);
    await account.save();

    return res.status(200).json({
      message: "Account updated successfully.",
      account,
    });
  } catch (error) {
    console.error("Update Account error:", error);
    return res.status(500).json({
      message: "Server error during account update.",
    });
  }
};

// ARCHIVE (soft delete) an account
export const archiveAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const accountId = req.params.id;

    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      return res
        .status(404)
        .json({ message: "Account not found or unauthorized." });
    }

    account.archived = true;
    await account.save();

    return res.status(200).json({
      message: "Account archived successfully.",
    });
  } catch (error) {
    console.error("Archive Account error:", error);
    return res.status(500).json({
      message: "Server error during account deletion.",
    });
  }
};
