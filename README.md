# Unheard Voices

Unheard Voices is an interactive timeline and constellation-style visualization that highlights important people and movements that are often underrepresented in mainstream history summaries.

Live URL:
https://un-heard-voices-8xof.vercel.app/

## What This Project Does

- Shows curated events from 1700 to 2026
- Lets users explore history in two modes: Timeline and Constellation
- Supports text search with quick scopes (title, person, movement, place)
- Supports category filtering and a true start/end year range
- Includes connected event relationships (influenced by, same movement, same region)
- Includes keyboard-friendly and touch-friendly event exploration
- Deep-links UI state in the URL for easy sharing
- Links each event to a public reference for deeper reading


## Run Locally

1. Install dependencies:
	npm install
2. Start dev server:
	npm run dev
	(after this step is not needed if you want to host it!)
3. Build for production:
	npm run build
4. Preview production build locally:
	npm run preview

This project is configured for Node.js 20.x.

## Host It Yourself

### Option 1: Vercel (Recommended)

1. Push this project to a GitHub repository.
2. Sign in to Vercel and click Add New Project.
3. Import your repository.
4. Keep the detected settings:
	- Framework: Vite
	- Build command: npm run build
	- Output directory: dist
5. Click Deploy.

Vercel will auto-deploy new updates when you push to your main branch.

### Option 2: Any Static Host

1. Build the app:

```bash
npm install
npm run build
```

2. Upload the generated dist folder to any static host (Netlify, GitHub Pages, Cloudflare Pages, etc.).

## If "nothing works"

If you see vite not found or exit code 127, dependencies were likely not installed correctly.

Run:

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```
This Ai (Copilot) was used to find and debug bugs in the code and to make sure everything was up to date and it was also used to make the README.md!
