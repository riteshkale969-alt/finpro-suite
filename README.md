# FinEdge Pro — Deployment Guide

Built by Ritesh Kale | DCF + Scenario Engine + Portfolio + AI Analyst

## Project Structure

```
finpro-suite/
├── api/
│   └── ai.js          ← Secure Gemini API proxy (key stays server-side)
├── public/
│   └── index.html     ← The entire app
├── vercel.json        ← Vercel routing config
├── package.json
└── .gitignore
```

## Deployment Steps

See the step-by-step guide provided separately.

## Environment Variables Required

| Variable | Value |
|---|---|
| GEMINI_API_KEY | Your key from aistudio.google.com |

## AI Model Used

`gemini-2.0-flash` — Free tier, fast, reliable as of 2025-26
