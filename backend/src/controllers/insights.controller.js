// Handles analytics and financial insights for dashboard
// Includes summary totals, category breakdowns,
// monthly trends, and account balances

import Transaction from "../models/Transaction.js";

export const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = now;

    // Fetch all non-archived transactions
    const allTx = await Transaction.find({
      userId,
      archived: false,
    });

    let totalIncome = 0;
    let totalExpense = 0;

    // Calculate all-time totals
    for (const tx of allTx) {
      if (tx.type === "income") {
        totalIncome += tx.amount;
      } else if (tx.type === "expense") {
        totalExpense += tx.amount;
      }
    }

    const netBalance = totalIncome - totalExpense;

    // Fetch this month's transactions
    const monthlyTx = await Transaction.find({
      userId,
      archived: false,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    for (const tx of monthlyTx) {
      if (tx.type === "income") {
        monthlyIncome += tx.amount;
      } else if (tx.type === "expense") {
        monthlyExpense += tx.amount;
      }
    }

    // Fetch recent transactions
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
