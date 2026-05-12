# Founder OS

A small personal **founder accountability** web app: duties checklists, lightweight investor CRM, startup events, and a Discord-friendly weekly update generator.

## Stack

- Vite + React + TypeScript
- Plain CSS design tokens (`src/styles/tokens.css`) + minimal primitives (`src/components/ui/`)
- **Supabase** (Postgres + Auth): signed-in users read/write app state in the database (Row Level Security per user). Theme preference still uses the browser (`founder-os.theme`).
- If you previously used LocalStorage (`founder-os.app.v1`), the app attempts a **one-time upload** of that data after you sign in when your Supabase workspace is still empty, then removes that key.

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

- With Supabase configured, CRM and notes are tied to **your auth user** in your project. Other visitors do not see your rows (RLS).
- Without Supabase env vars, main routes still render but **data is not persisted** (in-memory only until you add a project and sign in).
- Optional: enable **[Deployment Protection](https://vercel.com/docs/security/deployment-protection)** on Vercel if you want a simple access gate (availability varies by plan).
- Use **Settings → Export backup** for a portable JSON copy of your workspace.

## Backup format

Exports are plaintext JSON (`AppState` v1). Treat backup files as confidential.
