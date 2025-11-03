Core Features for the Developement
Initial Undertanding
--------------------------------------------------------------------------------------------
A personal fintech app that helps students track expenses, scan receipts, and get AI-driven spending insights. Built to showcase fullstack skills: React frontend, Node backend, MongoDB, cloud storage, and AI-powered categorization.

MVP Features
- User authentication (email/password, JWT)
- Multiple virtual accounts (checking, savings)
- Add/edit/delete transactions
- Transaction list with filters (date, category, account)
- Basic charts for spending and balance over time
- Upload receipts (store in cloud or local storage)
- AI-powered transaction categorization (auto-tagging)

Tech stack
- Frontend: React (or Next.js), Tailwind CSS, Chart.js
- Backend: Node.js + Express (or Fastify)
- Database: MongoDB Atlas (or PostgreSQL)
- Storage: AWS S3 (or local for dev)
- AI: OpenAI or Hugging Face for categorization / AWS Textract or Google Vision for OCR
- Dev tools: VS Code, Postman, GitHub Actions

Getting started (local)
1. Clone the repo:
   git clone git@github.com:YourUser/fintech-name.git
2. Backend:
   cd backend
   cp .env.example .env
   npm install
   npm run dev
3. Frontend:
   cd frontend
   npm install
   npm start

Environment variables (example)
- MONGO_URI=your-mongo-connection-string
- JWT_SECRET=your-jwt-secret
- S3_KEY, S3_SECRET, S3_BUCKET (if using AWS)
- OPENAI_API_KEY (if using OpenAI)

Project structure (suggested)
- /backend
  - /src
    - /controllers
    - /models
    - /routes
    - /services
    - server.js
- /frontend
  - /src
    - /components
    - /pages
    - /services (API calls)
    - App.js
