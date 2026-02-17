import OpenAI from "openai";
import { extractReceiptTextFromImage } from "../services/receipt-ocr.service.js";

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function buildReceiptPromptFromText(ocrText) {
  const trimmed = (ocrText || "").trim();
  const snippet = trimmed.length > 8000 ? trimmed.slice(0, 8000) : trimmed;
  return `
You are given OCR text from a receipt. Extract receipt fields and return JSON ONLY with:
merchant, total, date, category, currency.

Rules:
- If missing, use null.
- Date format: YYYY-MM-DD.
- total must be a number (no currency symbol).
- category should be a short spending category (e.g., Groceries, Food & Drinks, Utilities, Shopping).

OCR TEXT:
${snippet}
`;
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
      const parsed = safeParseJson(rawText);
      if (!parsed) {
        return res.status(422).json({ message: "AI could not parse receipt" });
      }

      return res.status(200).json({ receipt: parsed, provider: `groq:${model}` });
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

    const prompt = `
Extract receipt fields and return JSON ONLY with:
merchant, total, date, category, currency.
If missing, use null. Date format: YYYY-MM-DD.
`;

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
    const parsed = safeParseJson(rawText);

    if (!parsed) {
      return res.status(422).json({
        message: "AI could not parse receipt",
      });
    }

    return res.status(200).json({
      receipt: parsed,
      provider: "openai:gpt-4o-mini",
    });
  } catch (error) {
    console.error("Receipt parse error:", error);
    return res.status(500).json({
      message: "Failed to parse receipt",
    });
  }
};
