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

/** Call at startup to log whether password reset emails will be sent. */
export function logPasswordResetEmailStatus() {
  if (hasResendConfig()) {
    console.log("[password-reset] Configured: Resend");
  } else if (hasSmtpConfig()) {
    console.log("[password-reset] Configured: SMTP");
  } else {
    console.warn(
      "[password-reset] NOT CONFIGURED. Set RESEND_API_KEY+RESEND_FROM or SMTP_* so forgot-password emails are sent."
    );
  }
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

  // No provider configured: throw so logs show the cause; reset link is still logged for dev.
  if (!hasSmtpConfig()) {
    console.log(
      "[password-reset] Email provider not configured. Reset URL (for dev only):",
      resetUrl
    );
    throw new Error(
      "Password reset email not configured. Set RESEND_API_KEY+RESEND_FROM or SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM on the server."
    );
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465;
  // Strip surrounding quotes (e.g. from Render env "MoneyMate <x@gmail.com>")
  const from = String(process.env.SMTP_FROM || "").replace(/^["']|["']$/g, "").trim();
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();

  const transporter = nodemailer.createTransport({
    host: (process.env.SMTP_HOST || "").trim(),
    port,
    secure,
    requireTLS: !secure && port === 587, // Gmail 587 uses STARTTLS
    auth: { user, pass },
  });

  console.log("[password-reset] Sending via SMTP to:", to);
  await transporter.sendMail({
    from: from || user,
    to,
    subject,
    text,
    html,
  });
  console.log("[password-reset] SMTP send OK");
}

