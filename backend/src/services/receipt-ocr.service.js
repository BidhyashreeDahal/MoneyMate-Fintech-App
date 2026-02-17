import { createWorker } from "tesseract.js";

/**
 * OCR helper for receipt images.
 * Uses tesseract.js locally (no external API).
 */
export async function extractReceiptTextFromImage(imageBuffer) {
  // Newer tesseract.js versions ship with language preloaded/initialized.
  // Passing the language to createWorker avoids deprecated calls.
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(imageBuffer);
    return (text || "").trim();
  } finally {
    await worker.terminate();
  }
}

