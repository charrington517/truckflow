# TruckFlow

TruckFlow is an AI-powered food truck intelligence platform that helps operators decide where to park, what to sell, which events to pursue, and how to turn local demand into action.

The product currently runs as a private/internal SaaS-style MVP with a Next.js frontend, TypeScript Express backend, local opportunity scoring, FlowEvents, lead capture, and optional external intelligence layers.

## Features

- **Opportunity Scoring**: rule-based local scoring by city, food type, daypart, demand profile, competition gap, menu gap, event potential, and revenue lift.
- **FlowEvents**: event, pop-up, vendor call, permit window, and catering opportunity finder for food truck operators.
- **Market Signals**: optional Firecrawl-powered local competitor/menu research when `FIRECRAWL_API_KEY` is configured.
- **AI Strategy Brief**: optional OpenAI-generated operator narrative when `OPENAI_API_KEY` is configured.
- **Waitlist Funnel**: public free report generator with early-access lead capture.
- **Admin Dashboard**: internal lead and report history view with protected API access.
- **Persistent Deployment**: PM2-managed frontend/backend behind Nginx and Cloudflare Tunnel.

## Stack

- Frontend: Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Lucide React, React Leaflet
- Backend: Node.js, Express, TypeScript, Zod
- Runtime: PM2, Nginx, Cloudflare Tunnel
- Optional intelligence: Firecrawl, OpenAI

## Screenshots

Screenshots are planned under `docs/screenshots/`.

## Project Structure

```text
/opt/truckflow
├── frontend
│   └── Next.js app
├── backend
│   └── Express TypeScript API
└── docs
    ├── architecture
    └── screenshots
```

## Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Default backend port: `4000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Default frontend port: `3000`.

## Environment Variables

Backend:

```bash
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ADMIN_API_KEY=
FIRECRAWL_API_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
GOOGLE_MAPS_API_KEY=
```

Frontend:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Never commit real `.env` files, API keys, Cloudflare credentials, lead data, report data, PM2 logs, or runtime secrets.

## Production Notes

The current internal deployment serves the frontend through Nginx and proxies backend routes under `/api`. PM2 keeps both services running. Cloudflare Tunnel exposes the public app without router port forwarding.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md).
