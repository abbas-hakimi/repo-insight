# Client

React + Vite + Tailwind dashboard for repository analysis.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 — API requests proxy to `http://localhost:5000` via `/api`.

Ensure the backend is running in `../server` (`npm run dev`).

## Environment

Copy `.env.example` to `.env`. Default `VITE_API_BASE_URL=/api/v1` uses the Vite dev proxy.
