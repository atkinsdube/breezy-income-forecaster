# Breezy Income Forecaster

A Next.js lead magnet for solo service professionals. Users answer a short multi-step questionnaire and receive a market-informed monthly income forecast with a likely range, risk factors, and improvement opportunities — powered by Monte Carlo simulation.

## Stack

- Next.js 15 (App Router)
- TypeScript
- React
- Recharts
- Zod

## Getting started

```bash
npm install
npm run dev
```

Create a `.env.local` file from `.env.local.example`.

## Notes

Works without external API keys — falls back to sensible priors if Google Places or PageSpeed are unavailable.
