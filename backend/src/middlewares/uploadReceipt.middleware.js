import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsEnabled =
  process.env.DISABLE_UPLOADS === "true"
    ? false
    : process.env.ENABLE_UPLOADS === "true"
      ? true
      : process.env.NODE_ENV !== "production"; // default OFF in production (serverless-safe)

const uploadDir = path.join(process.cwd(), "uploads", "receipts");

let diskReady = false;
if (uploadsEnabled) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    diskReady = true;
  } catch (err) {
    // In serverless / read-only FS environments, this can fail.
    // We fall back to disabling uploads rather than crashing the app.
    diskReady = false;
    console.warn("[uploads] Receipt uploads disabled (cannot create uploads dir):", err?.message || err);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = [".png", ".jpg", ".jpeg", ".webp", ".pdf"].includes(ext) ? ext : "";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Upload PNG/JPG/WEBP/PDF only."));
  }
  cb(null, true);
};

export const uploadReceipt = multer({
  storage: diskReady ? storage : multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
