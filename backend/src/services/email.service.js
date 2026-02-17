import nodemailer from "nodemailer";
import { Resend } from "resend";

function hasResendConfig() {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM;
}

function hasSmtpConfig() {
  return (
    !!process.env.SMTP_HOST &&
    !!process.env.SMTP_PORT &&
    !!process.env.SMTP_USER &&
    !!process.env.SMTP_PASS &&
    !!process.env.SMTP_FROM
  );
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const subject = "MoneyMate password reset";
  const text = `Reset your password using this link:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = `
      <p>Reset your password using this link:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `;

  // Preferred: Resend (API)
  if (hasResendConfig()) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log("[password-reset] Sending via Resend to:", to);
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log("[password-reset] Resend result:", result?.data?.id ?? result);
    return;
  }

  // Safe dev fallback: if SMTP isn't configured, log the link.
  if (!hasSmtpConfig()) {
    console.log(
      "[password-reset] Email provider not configured (set RESEND_API_KEY+RESEND_FROM or SMTP_*). Reset URL:",
      resetUrl
    );
    return;
  }

  const port = Number(process.env.SMTP_PORT);
  const secure = port === 465; // common convention

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
}

