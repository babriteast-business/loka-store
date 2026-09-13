# Deploying to Render (for demo)

## 1. Push to GitHub

```bash
cd loka-store
git init
git add .
git commit -m "Initial Loka storefront"
```

Create a repo at github.com/new, then:

```bash
git remote add origin https://github.com/<your-username>/loka-store.git
git branch -M main
git push -u origin main
```

## 2. Create the Supabase project (needed even for a demo)

1. supabase.com → New project → wait ~2 minutes for it to provision.
2. SQL Editor → paste and run `supabase/schema.sql`.
3. SQL Editor → paste and run `supabase/seed.sql` (adds 10 dummy products across all 5
   categories so the demo has something to show).
4. Settings → API → copy the **Project URL**, **anon public** key, and **service_role**
   key — you'll need all three in the next step.

## 3. Create the Render service

1. render.com → **New → Web Service** → connect your GitHub repo (`loka-store`).
2. Render will detect the `render.yaml` in the repo and offer to use it — accept, it
   pre-fills the build/start commands. If it doesn't auto-detect, set manually:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Runtime:** Node
3. Under **Environment**, add each variable (Render will prompt for these automatically
   since `render.yaml` lists them with `sync: false`):

   | Key | Value source |
   |---|---|
   | `PUBLIC_SUPABASE_URL` | from Supabase step above |
   | `PUBLIC_SUPABASE_ANON_KEY` | from Supabase step above |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase step above (keep private) |
   | `PUBLIC_RAZORPAY_KEY_ID` | Razorpay → Settings → API Keys (**test mode** for a demo) |
   | `RAZORPAY_KEY_ID` | same as above |
   | `RAZORPAY_KEY_SECRET` | Razorpay → Settings → API Keys (test mode) |
   | `ADMIN_PASSWORD` | anything you'll remember, for `/admin` |

4. Click **Create Web Service**. First build takes 3–5 minutes.

## 4. What you'll get

Render gives you a live URL like `https://loka-store.onrender.com` — that's your demo
link, shareable immediately.

**Free-tier note:** Render's free web services spin down after 15 minutes of no traffic
and take ~30–50 seconds to wake back up on the next visit. Fine for sending a demo link
to someone who'll click around within a session; if you're demoing live in a call, open
the link a minute before you need it so it's already warm. Upgrade to a paid instance
($7/mo) later to remove this delay for real customers.

## 5. Every future change

```bash
git add .
git commit -m "describe the change"
git push
```

Render redeploys automatically on every push to `main` (auto-deploy is on by default).

## 6. Going live with real payments later

Same as before — complete Razorpay KYC/GST, switch to live keys, replace the three
Razorpay environment variables in Render's dashboard with live-mode values, then
**Manual Deploy → Deploy latest commit** to pick up the new keys.

## Troubleshooting

- **Build fails on Render** — check the build logs tab; usually a missing env var caught
  at build time, or a Node version mismatch (this repo pins `NODE_VERSION=20.11.0` in
  `render.yaml`).
- **Page loads but products are empty** — confirm `seed.sql` actually ran (Supabase →
  Table Editor → `products` should show 10 rows).
- **"Application Error" on first load** — almost always a missing/misspelled environment
  variable; check Render → your service → Logs for the exact error.
