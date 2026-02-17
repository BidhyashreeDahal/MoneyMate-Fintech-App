import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildMonthlyReportPrompt(stats) {
  return [
    "You are MoneyMate, a helpful financial assistant.",
    "Write a monthly financial report in Markdown based ONLY on the JSON data provided.",
    "Keep it concise but actionable.",
    "",
    "IMPORTANT:",
    "- The reporting period is stats.range.startDate to stats.range.endDate (inclusive).",
    "- stats.range.endExclusive is for database querying; do NOT present it as the end date.",
    "- Do not claim the month is incomplete unless the data explicitly indicates it.",
    "",
    "Include sections:",
    "----------Summary----------",
    "Include: period, per-currency income/expense/net, number of transactions.",
    "----------Highlights----------",
    "Include: top 3 categories and top 3 merchants (if present).",
    "-----------Risks / Watchouts----------",
    "----------Budget status (if budgets exist)----------",
    "----------Recommendations (3-7 bullets)----------",
    "",
    "Rules:",
    "- Do not invent transactions.",
    "- If data is missing or empty, say so.",
    "- If multiple currencies exist, mention it and summarize per currency.",
    "- If budgets exist, mention any over-budget or near-threshold categories.",
    "",
    "DATA (JSON):",
    JSON.stringify(stats),
  ].join("\n");
}

export async function generateMonthlyReportMarkdown(stats) {
  const prompt = buildMonthlyReportPrompt(stats);

  // Prefer Gemini (free-tier friendly) if configured
  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const candidates = [
      process.env.GEMINI_MODEL,
      // Common model ids across accounts/regions (v1beta availability varies)
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash-001",
      "gemini-1.5-pro-latest",
      "gemini-1.5-pro-001",
    ].filter(Boolean);

    let lastErr;
    for (const modelName of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result?.response?.text?.() || "";
        return { provider: `gemini:${modelName}`, markdown: text };
      } catch (err) {
        lastErr = err;
        // If the model isn't found/supported, try the next candidate.
        const msg = String(err?.message || "");
        if (msg.includes("is not found") || msg.includes("not supported")) {
          continue;
        }
        // If Gemini is configured but has no quota, fall through to other providers.
        const status = Number(err?.status || err?.statusCode || 0);
        if (status === 429 || msg.toLowerCase().includes("quota")) {
          break;
        }
        // Other errors (auth, network) should bubble up
        throw err;
      }
    }

    // If we got here, Gemini couldn't be used (model mismatch or quota). Try other providers.
  }

  // Free-tier fallback: Groq (OpenAI-compatible API)
  // Requires: GROQ_API_KEY
  if (process.env.GROQ_API_KEY) {
    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
    const response = await groq.responses.create({
      model,
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
    });

    return { provider: `groq:${model}`, markdown: response.output_text || "" };
  }

  // Fallback: OpenAI
  if (process.env.OPENAI_API_KEY) {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
    });
    return { provider: "openai", markdown: response.output_text || "" };
  }

  return { provider: "none", markdown: "" };
}

