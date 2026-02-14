/**
 * Budgets Controller
 *
 * Responsibilities:
 * - Create user budgets
 * - Prevent duplicate budgets for same category & period
 * - Calculate real spending from transactions
 * - Return enriched budget status (spent, remaining, percent, alerts)
 */

import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";

/**
 * Create Budget
 */
export const createBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, limitAmount, startDate, endDate, alertThreshold } = req.body;

    // Basic validation
    if (!category || !limitAmount || !startDate || !endDate) {
      return res.status(400).json({
        message: "Missing required budget fields",
      });
    }

    if (limitAmount <= 0) {
      return res.status(400).json({
        message: "Budget limit must be greater than 0",
      });
    }

    const budget = await Budget.create({
      userId,
      category,
      limitAmount,
      startDate,
      endDate,
      alertThreshold,
    });

    return res.status(201).json({
      message: "Budget created successfully",
      budget,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Budget already exists for this category and period",
      });
    }

    console.error("Create Budget Error:", error);
    res.status(500).json({
      message: "Server error creating budget",
    });
  }
};

/**
 * Get Budgets with Real Spending Calculation
 */
export const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const budgets = await Budget.find({
      userId,
      archived: false,
    });

    const results = [];

    for (const budget of budgets) {
      const spending = await Transaction.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: "expense",
            category: budget.category,
            archived: false,
            date: {
              $gte: budget.startDate,
              $lte: budget.endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSpend: { $sum: "$amount" },
          },
        },
      ]);

      const spendAmount = spending[0]?.totalSpend || 0;
      const remaining = budget.limitAmount - spendAmount;

      const percentUsed =
        budget.limitAmount > 0
          ? Math.min(
              Math.round((spendAmount / budget.limitAmount) * 100),
              100
            )
          : 0;

      results.push({
        ...budget.toObject(),
        spendAmount,
        remaining,
        percentUsed,
        remainingPercent: 100 - percentUsed,
        isOverBudget: spendAmount > budget.limitAmount,
        alertTriggered: percentUsed >= budget.alertThreshold,
      });
    }

    res.status(200).json({
      budgets: results,
    });
  } catch (error) {
    console.error("Get Budgets Error:", error);
    res.status(500).json({
      message: "Server error fetching budgets",
    });
  }
};

/**
 * Archive Budget (Soft Delete)
 */
export const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const budget = await Budget.findOne({
      _id: budgetId,
      userId,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    budget.archived = true;
    await budget.save();

    res.status(200).json({
      message: "Budget archived successfully",
    });
  } catch (error) {
    console.error("Delete Budget Error:", error);
    res.status(500).json({
      message: "Server error deleting budget",
    });
  }
};
