<div align="center">

  <img src="moneymate-web/public/moneymate-logo.png" alt="MoneyMate" width="120" height="120" />

  # **MoneyMate**

  ### *Personal finance, simplified.*

  [![Live Demo](https://img.shields.io/badge/Live_Demo-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://money-mate-fintech-app.vercel.app/)

  **[View Live App](https://money-mate-fintech-app.vercel.app/)**

</div>

---

## Overview

**MoneyMate** is a full-stack personal finance platform that helps users manage accounts, track transactions, control budgets, and gain intelligent financial insights. Built with production-ready authentication, multi-provider AI, and modern tooling.

| | |
|:---|:---|
| **Frontend** | Next.js 16 (App Router), React, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express, MongoDB (Mongoose) |
| **Auth** | JWT in HttpOnly cookies, secure CORS, password reset via email |
| **AI** | Monthly reports (Gemini / Groq / OpenAI fallback), OCR receipt parsing |

---

## Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JWT-HttpOnly-000000?style=flat-square" alt="JWT" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Recharts-ff6384?style=flat-square" alt="Recharts" />
</p>

| Category | Technologies |
|----------|--------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Recharts, Radix UI (Dialog, Select), Lucide icons |
| **Backend** | Node.js, Express 5, Mongoose |
| **Database** | MongoDB (Atlas) |
| **Auth** | JWT, HttpOnly cookies, bcryptjs, cookie-parser, express-rate-limit |
| **Validation** | Zod (backend + shared schemas) |
| **AI** | Google Gemini, Groq (Llama), OpenAI — with fallback chain for monthly reports |
| **OCR** | Tesseract.js for receipt text extraction |
| **Email** | Nodemailer (SMTP), Resend (optional) — for password reset |
| **Storage** | Cloudinary (receipt images), Multer (upload handling) |
| **Deployment** | Vercel (frontend), Render (backend), MongoDB Atlas |
| **Dev / QA** | Vitest, Supertest, ESLint, Nodemon |

---

## What I built

- **Full-stack app** — 28 REST endpoints across 8 API modules, 6 main app screens, 5 Mongoose models
- **Secure auth** — JWT in HttpOnly cookies, rate limiting (auth + API), production CORS and `trust proxy`
- **Resilient AI** — Multi-provider fallback (Gemini → Groq → OpenAI) for monthly financial reports
- **Receipt flow** — OCR (Tesseract) + AI parsing, optional Cloudinary upload, 43 transaction categories
- **Financial logic** — MongoDB aggregation pipelines for insights, budgets with date ranges and alerts
- **Production-ready** — Env-based config, health checks, centralized error handling, CI (GitHub Actions)

---

## Features

- **Accounts** — Create and manage accounts with real-time balance tracking
- **Transactions** — Income, expense, and transfer tracking with 43+ categories
- **Budgets** — Category budgets with alerts and progress tracking
- **Insights** — Cashflow trends, category breakdowns, and KPI dashboard
- **AI report** — Monthly financial summary (Gemini / Groq / OpenAI)
- **Receipts** — OCR parsing (Tesseract.js) and optional Cloudinary storage
- **Password reset** — Email-based reset (SMTP / Resend)

---

## Project structure

```
MoneyMate-Fintech-App/
├── backend/           # Express API (auth, accounts, transactions, budgets, insights, receipts)
└── moneymate-web/     # Next.js frontend (App Router, TypeScript, Tailwind)
```

---

## Getting started

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or [Atlas](https://www.mongodb.com/cloud/atlas))
- **npm**

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with MONGO_URI, JWT_SECRET, FRONTEND_URL, etc.
npm install
npm run dev
```

Runs at `http://localhost:5000`.

### Frontend

```bash
cd moneymate-web
cp .env.example .env.local
```

In `.env.local` set:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Then:

```bash
npm install
npm run dev
```

Runs at `http://localhost:3000`.

---

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `MONGO_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Signing key for JWT |
| `FRONTEND_URL` | Backend | Allowed CORS origin (e.g. Vercel URL) |
| `PASSWORD_RESET_URL_BASE` | Backend | Frontend reset-password page URL |
| `SMTP_*` or `RESEND_*` | Backend | Forgot-password email delivery |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API base URL (e.g. Render URL) |

See `backend/.env.example` and `moneymate-web/.env.example` for full lists.

---

## Deployment

- **Frontend:** [Vercel](https://vercel.com) — connect repo, set `NEXT_PUBLIC_API_URL` to backend URL, deploy.
- **Backend:** [Render](https://render.com) — Web Service, root directory `backend`, set env vars, deploy.
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — allow `0.0.0.0/0` for Render.

Production cookie and CORS settings are documented in the backend (secure cookies, `trust proxy`, `sameSite: "none"`).

---

## Scripts

| Command | Location | Description |
|--------|----------|-------------|
| `npm run dev` | backend / moneymate-web | Start dev server |
| `npm start` | backend / moneymate-web | Start production server |
| `npm test` | backend / moneymate-web | Run tests |

---

## Security

- Secrets in environment variables; `.env` not committed
- JWT in HttpOnly cookies; production-safe CORS and cookie options
- Input validation with Zod; rate limiting on auth routes

---

## License

Proprietary. © 2025 MoneyMate. All rights reserved. This project is not open source.
