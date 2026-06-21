# Work2BeFollowed

A simple mobile-first PWA to track conference follows. Built with React + Vite + Tailwind and Supabase realtime.

Key features
- Pick a colleague name on device (stored in localStorage)
- Big stamp button to log follows (optional attendee name)
- Live leaderboard via Supabase realtime
- Export CSV and reset (typed confirm)
- Installable PWA (manifest + service worker)

Supabase schema

Run this SQL in your Supabase project's SQL editor (public schema):

create table if not exists follows (
  id bigserial primary key,
  colleague_name text not null,
  attendee_name text,
  created_at timestamptz default now()
);

Env vars

Create a Supabase project and set the following environment variables in Vercel (or locally in a .env file for vite):

- VITE_SUPABASE_URL - your Supabase URL
- VITE_SUPABASE_ANON_KEY - your anon/public API key

For local development create a .env with:

VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key

Run locally

Install deps and start dev server:

npm install
npm run dev

Deploy to Vercel

1. Push this repository to GitHub.
2. Create a new Vercel project, import the repo.
3. Add environment variables in Vercel dashboard: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
4. Build command: npm run build. Output directory: dist.

Notes
- Replace the placeholder icons in public/icons/ with real PNGs.
- The public/service-worker.js is a simple cache-first service worker to enable offline installability. iOS Safari has limited PWA support — users can still Add to Home Screen.

If you'd like, I can: install npm packages, run the dev server, or commit these files. Which next step?
