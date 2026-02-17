import OpenAI from "openai";
import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

function parseMonthRange(monthStr) {
  // Expected: YYYY-MM
  const match = typeof monthStr === "string" ? monthStr.match(/^(\d{4})-(\d{2})$/) : null;
  const now = new Date();
  const year = match ? Number(match[1]) : now.getFullYear();
  const monthIndex = match ? Number(match[2]) - 1 : now.getMonth(); // 0-based

  const start = new Date(year, monthIndex, 1);
  const endExclusive = new Date(year, monthIndex + 1, 1);

  const month = `${String(year).padStart(4, "0")}-${String(monthIndex + 1).padStart(2, "0")}`;
  return { month, start, endExclusive };
}

function safeNumber(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export const getMonthlyAiReport = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const { month: monthStr } = req.query;
    const { month, start, endExclusive } = parseMonthRange(monthStr);

    const [totalsAgg, expenseByCategory, expenseByMerchant] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: userObjectId,
            archived: false,
            date: { $gte: start, $lt: endExclusive },
          },
        },
        {
          $group: {
            _id: { type: "$type", currency: "$currency" },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: userObjectId,
            archived: false,
            type: "expense",
            date: { $gte: start, $lt: endExclusive },
            category: { $exists: true, $ne: null },
          },
        },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, category: "$_id", total: 1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: userObjectId,
            archived: false,
            type: "expense",
            date: { $gte: start, $lt: endExclusive },
            merchant: { $exists: true, $ne: "" },
          },
        },
        { $group: { _id: "$merchant", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, merchant: "$_id", total: 1, count: 1 } },
      ]),
    ]);

    const totalsByCurrency = {};
    for (const row of totalsAgg) {
      const currency = row?._id?.currency || "CAD";
      const type = row?._id?.type || "unknown";
      if (!totalsByCurrency[currency]) {
        totalsByCurrency[currency] = { income: 0, expense: 0, transfer: 0, count: 0 };
      }
      totalsByCurrency[currency][type] = safeNumber(row.total);
      totalsByCurrency[currency].count += safeNumber(row.count);
    }

    // Budgets overlapping this month
    const budgets = await Budget.find({
      userId: req.user.id,
      archived: false,
      startDate: { $lt: endExclusive },
      endDate: { $gte: start },
    }).lean();

    const budgetStatuses = [];
    for (const b of budgets) {
      const rangeStart = b.startDate > start ? b.startDate : start;
      const rangeEnd = b.endDate < endExclusive ? b.endDate : endExclusive;

      const spendAgg = await Transaction.aggregate([
        {
          $match: {
            userId: userObjectId,
            archived: false,
            type: "expense",
            category: b.category,
            date: { $gte: rangeStart, $lt: rangeEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const spent = safeNumber(spendAgg[0]?.total);
      const limit = safeNumber(b.limitAmount);
      const percentUsed = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 999) : 0;

      budgetStatuses.push({
        category: b.category,
        limitAmount: limit,
        spentAmount: spent,
        remainingAmount: limit - spent,
        percentUsed,
        isOverBudget: spent > limit,
        alertThreshold: safeNumber(b.alertThreshold ?? 80),
        alertTriggered: percentUsed >= safeNumber(b.alertThreshold ?? 80),
      });
    }

    const stats = {
      month,
      range: { start, endExclusive },
      totalsByCurrency,
      topExpenseCategories: expenseByCategory,
      topExpenseMerchants: expenseByMerchant,
      budgets: budgetStatuses,
    };

    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        aiEnabled: false,
        stats,
        reportMarkdown:
          "AI report is disabled because `OPENAI_API_KEY` is not set on the server.",
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = [
      "You are MoneyMate, a helpful financial assistant.",
      "Write a monthly financial report in Markdown based ONLY on the JSON data provided.",
      "Keep it concise but actionable.",
      "",
      "Include sections:",
      "## Summary",
      "## Highlights",
      "## Risks / Watchouts",
      "## Budget status (if budgets exist)",
      "## Recommendations (3-7 bullets)",
      "",
      "Rules:",
      "- Do not invent transactions.",
      "- If data is missing or empty, say so.",
      "- If multiple currencies exist, mention it and summarize per currency.",
      "",
      "DATA (JSON):",
      JSON.stringify(stats),
    ].join("\n");

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
    });

    return res.status(200).json({
      aiEnabled: true,
      stats,
      reportMarkdown: response.output_text || "",
    });
  } catch (error) {
    console.error("Monthly AI report error:", error);
    return res.status(500).json({ message: "Server error generating monthly report" });
  }
};

