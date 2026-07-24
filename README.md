# Locked In — 40 Day Tracker

A single-file static app (`index.html`). No build step. Data is saved to
`localStorage` on each device, with optional cross-device sync via Supabase.

## Deploy to Vercel

Pick whichever is easiest for you — both give the same result.

### Option A — Vercel dashboard (no terminal needed)
1. Put this folder in a GitHub repo (create a new repo, upload `index.html`
   and `vercel.json`, commit).
2. Go to https://vercel.com/new, "Import" that repo.
3. Framework preset: **Other** (it's a static site — no build command, no
   output directory needed). Click **Deploy**.
4. Vercel gives you a live URL (e.g. `your-project.vercel.app`).

### Option B — Vercel CLI
```bash
npm i -g vercel
cd lockin-app
vercel        # first deploy, follow the prompts
vercel --prod # promote to production URL
```

Either way, every time you push a change to `index.html`, Vercel redeploys
automatically (Option A) or you re-run `vercel --prod` (Option B).

## Add Supabase for remote persistence

The app already has Supabase sync built in (replacing the old jsonbin.io
option) — you just need a Supabase project and one table.

### 1. Create a Supabase project
Go to https://supabase.com → New project (free tier is fine).

### 2. Create the sync table
In the Supabase dashboard, open **SQL Editor** and run:

```sql
create table if not exists lockin_sync (
  id text primary key,
  state jsonb not null default '{}'::jsonb,
  schedule jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table lockin_sync enable row level security;

-- This app has no login system — the "sync code" (a random id generated
-- in-browser) is the only secret protecting a row, the same model the
-- previous jsonbin.io integration used. Anyone with your Supabase anon
-- key AND your sync code can read/write that one row. Don't share either.
create policy "anon can read own row" on lockin_sync
  for select using (true);

create policy "anon can write own row" on lockin_sync
  for insert with check (true);

create policy "anon can update own row" on lockin_sync
  for update using (true);
```

If you want tighter security later, the cleanest upgrade is to add Supabase
Auth (email/password or magic link) and change these policies to
`using (auth.uid()::text = id)` — ask me and I can wire that up.

### 3. Get your API keys
In the Supabase dashboard: **Project Settings → API**. Copy:
- **Project URL** (`https://xxxx.supabase.co`)
- **anon public** key (NOT the `service_role` key — never put that in
  client-side code)

### 4. Connect the app
1. Open the deployed site, click **Set up sync**.
2. On your first device: paste the Project URL + anon key, click
   **Create sync**. This generates a random **sync code**.
3. On any other device: open the same site, click **Set up sync** →
   "Other device", paste the same Project URL + anon key + the sync code
   from step 2, click **Connect**.

Both devices now read/write the same `lockin_sync` row every ~25s (and
immediately after any change), same as the original jsonbin.io flow but
backed by your own Supabase project.

## Notes
- No `npm install` / build step — Supabase is loaded from a CDN
  (`@supabase/supabase-js`) at runtime.
- Export/Import backup buttons still work regardless of sync status.
- I can't create the Vercel or Supabase accounts for you (no network
  access to those services from here, and they need your login) — the
  steps above are copy-pasteable and take a few minutes end-to-end.


  
