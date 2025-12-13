// Handles analytics and financial insights for dashboard
// Includes summary totals, category breakdowns,
// monthly trends, and account balances

import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

export const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = now;

    const allTx = await Transaction.find({
      userId,
      archived: false,
    });

    let totalIncome = 0;
    let totalExpense = 0;
    for (const tx of allTx) {
      if (tx.type === "income") totalIncome += tx.amount;
      else if (tx.type === "expense") totalExpense += tx.amount;
    }

    const netBalance = totalIncome - totalExpense;

    const monthlyTx = await Transaction.find({
      userId,
      archived: false,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    for (const tx of monthlyTx) {
      if (tx.type === "income") monthlyIncome += tx.amount;
      else if (tx.type === "expense") monthlyExpense += tx.amount;
    }

    const recentTransactions = await Transaction.find({
      userId,
      archived: false,
    })
      .sort({ date: -1 })
      .limit(5);

    return res.status(200).json({
      totals: {
        income: totalIncome,
        expense: totalExpense,
        netBalance,
      },
      monthly: {
        income: monthlyIncome,
        expense: monthlyExpense,
        range: {
          start: startOfMonth,
          end: endOfMonth,
        },
      },
      recentTransactions,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: "Server error fetching summary" });
  }
};
// Category Breakdown (Expenses Only)
export const getCategoryBreakdown = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    const categories = await Transaction.aggregate([
      {
        $match: {
          userId : userObjectId,
          archived: false,
          type: "expense",
          category: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          total: 1,
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching category breakdown:", error);
    res.status(500).json({ message: "Server error fetching category breakdown" });
  }
};

// Monthly Trends 
// Monthly income & expense trends
// Used for line charts in dashboard

export const getMonthlyTrends = async (req, res) => {
  try {
    // Convert userId string to ObjectId (CRITICAL for aggregation)
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const trends = await Transaction.aggregate([
      // Filter user transactions
      {
        $match: {
          userId,
          archived: false,
        },
      },

      // Group by year-month
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$date",
            },
          },

          // Sum income
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },

          // Sum expense
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },

      // Sort chronologically
      {
        $sort: { _id: 1 },
      },

      // Clean output for frontend
      {
        $project: {
          _id: 0,
          month: "$_id",
          income: 1,
          expense: 1,
          net: { $subtract: ["$income", "$expense"] },
        },
      },
    ]);

    res.status(200).json({ monthlyTrends: trends });
  } catch (error) {
    console.error("Monthly trends error:", error);
    res.status(500).json({
      message: "Server error fetching monthly trends",
    });
  }
};
