# Based Gecko

A full-stack decentralized token monitoring platform for the Brain ecosystem on Ethereum. Track activated Brain tokens with real-time price charts, liquidity data, transaction history, and community chat.


## Features

- **Real-time Token Dashboard** — Monitor all activated Brain tokens with live price, market cap, and 24h/7d change
- **Interactive Price Charts** — Historical price visualization built from on-chain Uniswap reserve data
- **Transaction Feed** — Live buy/sell activity parsed from Uniswap swap events
- **TrollBox Chat** — WebSocket-powered community chat with leaderboards and streak tracking
- **Wallet Authentication** — Sign-in via Ethereum wallet signature verification
- **3D Particle Visualization** — Three.js animated scene for tokens without active trading pairs
- **Responsive Design** — Adaptive layouts for desktop and mobile

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│  React 18 + TypeScript + Tailwind + Recharts + Three.js  │
│               Valtio (state) + Socket.io                 │
└────────────────────────┬────────────────────────────────┘
                         │ REST + WebSocket
┌────────────────────────▼────────────────────────────────┐
│                  Backend (Express.js)                     │
│   Cron jobs · Chart aggregation · Auth · Chat server     │
└───┬──────────────┬──────────────────┬───────────────────┘
    │              │                  │
    ▼              ▼                  ▼
 Alchemy       Uniswap            Supabase
(Ethereum RPC) (V2 + V3)        (PostgreSQL)
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts, Three.js (React Three Fiber), Valtio, Socket.io |
| Backend | Node.js, Express, Ethers.js v6, Socket.io, node-cron |
| Data | Supabase (PostgreSQL), Alchemy (Ethereum RPC), CoinGecko API |
| Infrastructure | Vercel (frontend), Railway (backend) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Alchemy API key (Ethereum mainnet)
- CoinGecko API key
- Supabase project

### Environment Setup

```bash
# Clone the repository
git clone <repo-url>
cd based-gecko

# Backend
cd server
cp .env.example .env
# Fill in your API keys in .env
npm install

# Frontend
cd ../app
cp .env.example .env
# Fill in your API keys in .env
npm install
```

### Running Locally

```bash
# Terminal 1 — Backend (port 3001)
cd server
npm start

# Terminal 2 — Frontend (port 3000)
cd app
npm run dev
```

### Running Tests

```bash
# Frontend (Vitest)
cd app
npm run test:run

# Backend (Jest)
cd server
npm test
```

## Deployment

- **Frontend**: Deployed to Vercel via Git integration
- **Backend**: Deployed to Railway with automatic builds

## Security Note

API keys are loaded from environment variables and are not committed to the repository. If you previously had keys in source control, rotate them immediately.

## License

MIT
