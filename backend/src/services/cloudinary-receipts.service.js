import { v2 as cloudinary } from "cloudinary";

function hasCloudinaryConfig() {
  return (
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET
  );
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function isCloudinaryReceiptsEnabled() {
  return process.env.RECEIPT_STORAGE === "cloudinary" || hasCloudinaryConfig();
}

export async function uploadReceiptToCloudinary({ buffer, userId, transactionId }) {
  if (!hasCloudinaryConfig()) {
    throw new Error(
      "Cloudinary receipts not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
    );
  }
  if (!buffer) throw new Error("Missing receipt file buffer.");

  configureCloudinary();

  // Upload as "auto" to support images and PDFs
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `moneymate/receipts/${userId}/${transactionId}`,
        resource_type: "auto",
      },
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
    uploadStream.end(buffer);
  });

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}

