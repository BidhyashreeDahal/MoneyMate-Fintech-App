import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const parseReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No receipt file uploaded",
      });
    }

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
    });
  } catch (error) {
    console.error("Receipt parse error:", error);
    return res.status(500).json({
      message: "Failed to parse receipt",
    });
  }
};
