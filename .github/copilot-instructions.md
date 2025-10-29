## Purpose
Short, actionable guidance to help AI coding agents be productive in this repository.

## Big picture (what this repo implements)
- Frontend: React app at `frontend/src` (root component: `App.js`).
- Backend: Node/Express app scaffold at `backend/src` with `server.js` as the entrypoint and folders: `controllers/`, `models/`, `routes/`, `services/`.
- Data store: MongoDB (expected to use `MONGO_URI`).
- Integrations: cloud storage (S3 or local), AI services (OpenAI/Hugging Face) for categorization and optional OCR.

Note: many files are scaffolds/empty. The README documents the intended architecture — treat it as authoritative for high-level goals but verify file contents before editing.

## Where to start (quick checklist)
- Read `README.md` at repo root for the intended architecture and env var list.
- Open `backend/src/server.js` to find/wire Express app and middleware.
- Check `backend/src/routes/*.js` for route wiring and `controllers/` for handler logic.
- Frontend: open `frontend/src/App.js` and `frontend/src/services` for API clients.

## Local dev commands (as documented)
- Backend: `cd backend && npm install && cp .env.example .env && npm run dev` (server should run on the configured port).
- Frontend: `cd frontend && npm install && npm start`.

## Environment variables (present in README)
- MONGO_URI, JWT_SECRET
- S3_KEY, S3_SECRET, S3_BUCKET (or local storage for dev)
- OPENAI_API_KEY (for AI categorization)

Security: Never add secrets to the repo. Use `.env` files and `.env.example` placeholders.

## Project-specific patterns and conventions
- Backend layering: controllers handle HTTP requests, services encapsulate business logic / external APIs, models contain DB schemas. Keep controllers thin and push logic into `services/`.
- Routes should export an `express.Router()` and be mounted from `server.js` (e.g., `app.use('/api/auth', require('./routes/auth'))`).
- JWT is the chosen auth pattern (README). Expect API calls to use `Authorization: Bearer <token>` header.
- Frontend: `frontend/src/services` contains API wrappers. Pages under `pages/` are route-level views; `components/` are reusable UI pieces.

## Integration points & where to look
- MongoDB: search for `MONGO_URI` or `mongoose.connect` (likely in `backend/src/server.js`).
- File uploads: look in `backend/src/services` for any S3 client or local-storage helper.
- AI / OCR: look for code that references `OPENAI_API_KEY`, `openai`, `huggingface`, or `textract`.

## When you find empty scaffolds
- If a file is empty (many are currently), create a minimal, well-tested implementation: small, focused PRs are preferred.
- Example starter patterns (follow these exact locations):
  - `backend/src/routes/<name>.js` -> export `express.Router()` and define endpoints.
  - `backend/src/controllers/<name>Controller.js` -> export functions like `async function create(req,res)`.
  - `backend/src/services/<name>Service.js` -> implement DB or third-party calls and return plain objects.

## Examples (how to wire an endpoint)
- In `backend/src/routes/auth.js`:
  - `const router = require('express').Router()`
  - `router.post('/login', authController.login)`
- In `backend/src/controllers/authController.js` keep the controller thin and call `authService.authenticate(email, password)`.


## Developer workflow notes
- Use feature branches: `feature/<concise-name>` and open PRs to `dev` (per README guidance).
- Keep commits small and document the motivation in the commit message.

## What to avoid / guardrails for AI edits
- Do not write or commit secrets. If you need an API key in tests, use a placeholder and `.env.example`.
- Prefer adding tests or a simple smoke script when adding new endpoints.
- If you change public APIs, add or update README and a short note in PR description.

## Where to ask for clarification
- If intent is unclear (scaffold vs finished feature), open an issue describing the proposed change and reference the files you plan to edit.

If anything below is unclear or you want more examples (small starter PRs for empty routes/controllers), tell me which area to expand.
