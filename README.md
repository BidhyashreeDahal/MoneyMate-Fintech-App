## MoneyMate — Full‑Stack Personal Finance App
Live : https://money-mate-fintech-app.vercel.app/

MoneyMate helps users track day‑to‑day finances in one place: manage accounts, record transactions and transfers, set budgets, and view dashboards/insights. It also supports receipt workflows and an AI-generated monthly financial report.

This repository includes:

- `backend/`: Express + MongoDB API (cookie-based auth)
- `moneymate-web/`: Next.js web app (React + TypeScript)

## Features

- **Auth**: email/password login + JWT stored in **HttpOnly cookies**
- **Accounts**: create/update/archive accounts and track balances + goals
- **Transactions**: income/expense tracking, statement-style UI, archive support
- **Transfers**: move money between accounts
- **Budgets**: category budgets with alerts and progress UI
- **Insights/Dashboard**: charts (cashflow trend + category breakdown) + KPI cards
- **Receipts**: upload a receipt to attach to a transaction (see deployment note below)
- **AI Monthly Financial Report**: generates a monthly narrative summary with provider fallbacks (Gemini/Groq/OpenAI based on env)
- **Password reset**: forgot/reset password flow with email providers (Resend or SMTP)

## Tech stack

- **Web**: Next.js (App Router), React, TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Zod validation
- **Email**: Resend (recommended) or SMTP (Nodemailer)
- **AI**: Gemini / Groq (OpenAI-compatible) / OpenAI (optional)
- **OCR**: `tesseract.js` for receipt text extraction

## Repository structure

- `backend/` — Express API server
- `moneymate-web/` — Next.js web app

## Local development

### Prerequisites

- Node.js (recommended: **18+ / 20+**)
- npm
- MongoDB (Atlas or local)

### 1) Backend setup

From the repo root:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:5000` by default.

### 2) Web app setup

In a second terminal:

```bash
cd moneymate-web
cp .env.example .env.local
```

Set `moneymate-web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Then:

```bash
npm install
npm run dev
```

Web runs on `http://localhost:3000`.

## Environment variables

### Backend (`backend/.env`)

See `backend/.env.example`. Common variables:

- **Required**
  - `MONGO_URI`
  - `JWT_SECRET`
  - `PORT` (default: `5000`)
  - `NODE_ENV` (`development` / `production`)
  - `FRONTEND_URL` (recommended) or `CLIENT_ORIGIN` (used for CORS)
- **Password reset**
  - `PASSWORD_RESET_URL_BASE` (e.g. `https://your-frontend/reset-password`)
- **Email**
  - Resend: `RESEND_API_KEY`, `RESEND_FROM`
  - SMTP fallback: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- **AI (optional)**
  - Gemini: `GEMINI_API_KEY`, `GEMINI_MODEL`
  - Groq: `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_MODEL_RECEIPT`
  - OpenAI: `OPENAI_API_KEY`
- **Uploads**
  - `ENABLE_UPLOADS=true` (only for servers with writable disk storage)
  - `DISABLE_UPLOADS=true` (force off)

### Web (`moneymate-web/.env.local`)

See `moneymate-web/.env.example`:

- `NEXT_PUBLIC_API_URL` (required)

## Deployment notes (important)

### Cookies + CORS

This project uses **cookie-based auth**. In production:

- Backend must enable `credentials: true` and set CORS `origin` to your frontend URL.
- Cookies must be set with:
  - `secure: true` (HTTPS)
  - `sameSite: "none"` (when frontend and backend are on different sites)
- If your backend is behind a proxy (most platforms), `trust proxy` must be enabled.

### Receipt uploads and serverless

Receipt upload storage on local disk **does not work on serverless** environments (e.g. Vercel). For safety:

- Uploads are **disabled by default in production** unless `ENABLE_UPLOADS=true`.
- If you need uploads in production, use a backend platform with writable storage or switch to object storage (S3/R2/etc).

## Scripts

### Backend

```bash
cd backend
npm run dev
npm start
```

### Web

```bash
cd moneymate-web
npm run dev
npm run build
npm start
```

## Security

- Never commit real secrets. Use `.env.example` files as templates.
- Keep `.env` / `.env.local` out of git.

## License

MIT (or update as needed).
