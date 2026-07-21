# Unheard Voices

Interactive timeline + constellation visualization of historical figures and movements that mainstream history usually skips over.

**Live:** [https://un-heard-voices-8xof.vercel.app/](https://un-heard-voices-8xof.vercel.app/)

## What this is

I noticed that most "history timeline" projects cover the same canon — a handful of Western figures and events. So I started curating a dataset of underrepresented historical moments: indigenous resistance, queer pioneers, anti-colonial movements, forgotten inventors. It covers 1700 to 2026.

You can explore it in two views:
- **Timeline** — chronological, good for seeing what happened when
- **Constellation** — graph view showing how events connect (influences, shared movements, regions)

Both views filter by category, person, movement, or place. The UI state lives in the URL so you can share what you're looking at.

## Run it

```bash
npm install
npm run dev       # localhost:5173
npm run build     # dist/
```

## Stack

Vite + TypeScript. Custom Canvas renderer — I initially tried D3 but hit performance issues with 300+ interactive nodes, so I built something more targeted. The dataset is a static JSON file which keeps deployment trivial (no backend needed).

## Deploy

Vercel auto-detects Vite settings. Or just `npm run build` and upload `dist/` anywhere.

## If it doesn't work

```bash
rm -rf node_modules package-lock.json
npm install
```
