# OBENAN Partner Performance Dashboard

Interactive dashboard for tracking partner channel performance (Referrals, Resellers, Agencies) against monthly MRR targets.

## Quick Start (Local)

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Deploy to Vercel

See deployment instructions below.

## Updating Data

Edit `src/data.js`:

1. Update `CURRENT_MONTH_IDX` (0 = Jan, 1 = Feb, ... 11 = Dec)
2. Update the monthly arrays in `PERF` with new actuals
3. Update individual partner `mrr2026` arrays
4. Commit and push — Vercel auto-deploys

## Tech Stack

- Vite + React 18
- Recharts for charts
- No backend required (static data)
