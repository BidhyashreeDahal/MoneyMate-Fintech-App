## Contributing

### Setup

- **Backend**

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

- **Web**

```bash
cd moneymate-web
cp .env.example .env.local
npm install
npm run dev
```

### Tests

- **Backend**

```bash
cd backend
npm test
```

- **Web**

```bash
cd moneymate-web
npm test
npm run build
```

### Pull requests

- Keep PRs small and focused.
- Include a short summary + test plan.
- Never commit real secrets (`.env`, API keys, credentials).

