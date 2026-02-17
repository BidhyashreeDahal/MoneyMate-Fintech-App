import AWS from "aws-sdk";
import crypto from "crypto";
import path from "path";

function hasS3Config() {
  return (
    !!process.env.AWS_REGION &&
    !!process.env.AWS_ACCESS_KEY_ID &&
    !!process.env.AWS_SECRET_ACCESS_KEY &&
    !!process.env.S3_RECEIPTS_BUCKET
  );
}

function getS3Client() {
  return new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: "v4",
  });
}

function guessExtension({ mimetype, originalname }) {
  const extFromName = path.extname(originalname || "").toLowerCase();
  if (extFromName) return extFromName;
  if (mimetype === "image/png") return ".png";
  if (mimetype === "image/jpeg") return ".jpg";
  if (mimetype === "image/webp") return ".webp";
  if (mimetype === "application/pdf") return ".pdf";
  return "";
}

export function isS3ReceiptsEnabled() {
  return process.env.RECEIPT_STORAGE === "s3" || hasS3Config();
}

export async function uploadReceiptToS3({
  buffer,
  mimetype,
  originalname,
  userId,
  transactionId,
}) {
  if (!hasS3Config()) {
    throw new Error(
      "S3 receipts not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_RECEIPTS_BUCKET."
    );
  }
  if (!buffer) throw new Error("Missing receipt file buffer.");

  const bucket = process.env.S3_RECEIPTS_BUCKET;
  const ext = guessExtension({ mimetype, originalname });
  const rand = crypto.randomBytes(8).toString("hex");
  const key = `receipts/${userId}/${transactionId}/${Date.now()}-${rand}${ext}`;

  const s3 = getS3Client();
  await s3
    .putObject({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
    .promise();

  return { key };
}

export async function getSignedReceiptUrlFromS3({ key, expiresSeconds = 300 }) {
  if (!hasS3Config()) {
    throw new Error(
      "S3 receipts not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_RECEIPTS_BUCKET."
    );
  }
  const bucket = process.env.S3_RECEIPTS_BUCKET;
  const s3 = getS3Client();
  const url = await s3.getSignedUrlPromise("getObject", {
    Bucket: bucket,
    Key: key,
    Expires: expiresSeconds,
  });
  return url;
}

