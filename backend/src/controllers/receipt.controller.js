import OpenAI from "openai";
import { extractReceiptTextFromImage } from "../services/receipt-ocr.service.js";

function extractJsonFromText(text) {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();

  // Try direct parse first
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {}

  // Try to extract from markdown code block: ```json ... ``` or ``` ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (parsed && typeof parsed === "object") return parsed;
    } catch {}
  }

  // Try to find a JSON object in the text
  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      const parsed = JSON.parse(objectMatch[0]);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {}
  }

  return null;
}

function normalizeReceipt(parsed) {
  if (!parsed || typeof parsed !== "object") return null;
  return {
    merchant: parsed.merchant != null ? String(parsed.merchant).trim() : null,
    total: typeof parsed.total === "number" ? parsed.total : Number(parsed.total) || null,
    date: parsed.date ? String(parsed.date).trim().slice(0, 10) : null,
    category: parsed.category != null ? String(parsed.category).trim() : null,
    currency: parsed.currency != null ? String(parsed.currency).trim() : null,
  };
}

function buildReceiptPromptFromText(ocrText) {
  const trimmed = (ocrText || "").trim();
  const snippet = trimmed.length > 8000 ? trimmed.slice(0, 8000) : trimmed;
  return `Extract receipt fields from this OCR text. Return ONLY a single JSON object with keys: merchant, total, date, category, currency. No other text, no markdown, no explanation. If a value is missing use null. Date must be YYYY-MM-DD. total must be a number. category: Groceries, Food & Drinks, Utilities, Shopping, etc.

OCR text:
${snippet}`;
}

export const parseReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No receipt file uploaded",
      });
    }

    // Prefer Groq (text-only) if configured: OCR -> Groq -> JSON
    if (process.env.GROQ_API_KEY) {
      const ocrText = await extractReceiptTextFromImage(req.file.buffer);
      if (!ocrText) {
        return res.status(422).json({ message: "OCR could not read receipt text" });
      }

      const groq = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      });

      const prompt = buildReceiptPromptFromText(ocrText);
      const model = process.env.GROQ_MODEL_RECEIPT || process.env.GROQ_MODEL || "llama-3.1-8b-instant";

      const response = await groq.responses.create({
        model,
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      });

      const rawText = response.output_text || "";
      const parsed = extractJsonFromText(rawText);
      const receipt = parsed ? normalizeReceipt(parsed) : null;
      if (!receipt) {
        return res.status(422).json({ message: "AI could not parse receipt. Try a clearer image or enter details manually." });
      }

      return res.status(200).json({ receipt, provider: `groq:${model}` });
    }

    // Fallback: OpenAI vision (image -> JSON)
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        message: "Missing OPENAI_API_KEY in server environment (and GROQ_API_KEY is not set)",
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const base64 = req.file.buffer.toString("base64");
    const mime = req.file.mimetype || "image/png";

    const prompt = `Extract receipt fields from this image. Return ONLY a single JSON object with keys: merchant, total, date, category, currency. No other text, no markdown. If missing use null. Date format YYYY-MM-DD. total must be a number.`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              image_url: `data:${mime};base64,${base64}`,
            },
          ],
        },
      ],
    });

    const rawText = response.output_text || "";
    const parsed = extractJsonFromText(rawText);
    const receipt = parsed ? normalizeReceipt(parsed) : null;

    if (!receipt) {
      return res.status(422).json({
        message: "AI could not parse receipt. Try a clearer image or enter details manually.",
      });
    }

    return res.status(200).json({
      receipt,
      provider: "openai:gpt-4o-mini",
    });
  } catch (error) {
    console.error("Receipt parse error:", error);
    return res.status(500).json({
      message: "Failed to parse receipt",
    });
  }
};
