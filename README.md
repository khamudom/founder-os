# Founder OS

A small personal **founder accountability** web app: duties checklists, lightweight investor CRM, startup events, and a Discord-friendly weekly update generator.

## Stack

- Vite + React + TypeScript
- Plain CSS design tokens (`src/styles/tokens.css`) + minimal primitives (`src/components/ui/`)
- Local persistence via **`localStorage`** (key `founder-os.app.v1`) — **no backend**

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy on Vercel

This repo is a static SPA (`vite build` outputs `dist/`). Connect the repo to Vercel or deploy with the Vercel CLI.

`vercel.json` includes a SPA fallback rewrite so client-side routes work on refresh.

### Privacy notes

- Data lives **only in the browser profile** that uses the app (per origin). Visitors to your deployment **do not see your CRM by default** — they get their own empty LocalStorage.
- Optional: enable **[Deployment Protection](https://vercel.com/docs/security/deployment-protection)** on Vercel if you want a simple access gate (availability varies by plan).
- Use **Settings → Export backup** regularly; clearing site data deletes LocalStorage unless you’ve exported JSON.

## Backup format

Exports are plaintext JSON (`AppState` v1). Treat backup files as confidential.
