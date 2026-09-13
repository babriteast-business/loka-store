# Loka — 3D D2C storefront

SvelteKit + Threlte (3D) + Tailwind + Supabase + Razorpay.

## What's in this scaffold

- **`/` (home)** — 3D hero: five procedurally-generated shapes (torus knot, icosahedron,
  octahedron, dodecahedron, capsule) orbiting slowly, one per category. No external 3D
  model files needed — everything is generated in code, colored per category. Click a
  shape (or the card below it) to go to that category.
- **`/category/[slug]`** — flat, fast product grid pulled from Supabase. Kept deliberately
  non-3D so browsing and scrolling stay snappy on phones.
- **`/product/[id]`** — product detail + add to cart.
- **`/cart`** — quantity editing, persisted to localStorage.
- **`/checkout`** — Razorpay Checkout integration (test mode by default). The server
  recomputes the total from Supabase prices — the client only ever sends product IDs and
  quantities, never a price, so the amount can't be tampered with in the browser.
- **`/admin`** — password-gated panel (set `ADMIN_PASSWORD` in `.env`) to add, view, and
  delete products without touching the Supabase table editor directly. Products are
  grouped by category so gaps are obvious, and each can be flagged as a "Bestseller"
  (shows a badge, sorts first in its category page).
- **`supabase/schema.sql`** — run this once in your Supabase project's SQL editor.
- **`supabase/migration_001_bestseller.sql`** — only needed if you already ran
  `schema.sql` before the bestseller/units_sold columns existed. Safe to re-run.
- **`supabase/seed.sql`** — 10 sample products across all 5 categories, so the store isn't
  empty on first run. Replace the placeholder images and details with your real listings
  (or delete them from `/admin` once you've added your own).

## Conversion features (built in, not guaranteed sales)

These reduce friction and add the nudges that help convert visitors who already arrived —
they don't replace getting traffic, building trust, or pricing right:

- Bestseller badges + bestseller-first sorting per category
- Automatic discount-percentage badge when `compare_at_inr` is set
- Low-stock urgency ("Only N left") when stock ≤ 10
- "N+ sold" social proof once `units_sold` passes 20
- Sticky mobile add-to-cart bar on product pages (keeps the CTA reachable while scrolling)
- Trust row on product pages (secure checkout, delivery coverage)

`units_sold` increments automatically after each verified payment — no manual updating.

## 3D throughout, not just the hero

Full WebGL on every product card would hurt load time and scroll performance on phones —
bad for the exact conversions you want. Instead:

- **Home hero** — the orbiting 3D category shapes (Threlte/Three.js)
- **Category page headers** — a small self-rotating 3D icon per category (same shape
  language as the hero, `CategoryIcon3D.svelte`), cheap since only one renders per page
- **Every card, everywhere** — a lightweight CSS 3D tilt-on-hover effect
  (`$lib/actions/tilt.ts`) that responds to the cursor. No WebGL cost, works on the whole
  grid at once.
- **Ambient background glow** — a fixed, near-free CSS radial-gradient layer that gives
  every page a sense of depth even without a canvas on it.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
1. Create a free project at supabase.com → Settings → API → copy the URL, anon key, and
   **service role key** (Settings → API → `service_role` — keep this one secret).
2. Run `supabase/schema.sql` then `supabase/seed.sql` in the Supabase SQL editor, in that
   order (schema creates the tables, seed adds 10 sample products).
3. Sign up at razorpay.com → Dashboard → Settings → API Keys → generate **test mode** keys first.
4. Pick an `ADMIN_PASSWORD` for the `/admin` panel.

```bash
npm run dev
```

Open http://localhost:5173.

## Before taking real payments

- Switch Razorpay from test to live keys only after KYC/GST is approved on your account.
- ~~Recompute cart total server-side~~ — done: `create-order` looks up real prices from
  Supabase using the product IDs the client sends; it never trusts a client-sent amount.
- ~~Write orders after payment~~ — done: `verify-payment` writes a row to `orders` and
  decrements stock once the Razorpay signature checks out.
- Still worth adding before real volume: an email/SMS notification to yourself on each new
  paid order (e.g. via Resend or Twilio), and a proper multi-user auth system for `/admin`
  if more than one person will manage the catalog.

## Adding products

Go to `/admin`, log in with your `ADMIN_PASSWORD`, and use the form — no SQL needed. Each
product includes an optional "supplier note" field for your own reference (e.g. the
AliExpress/1688 listing link), which never appears on the public storefront.

## Deploying

See `RENDER_DEPLOYMENT.md` for the full walkthrough (this is the current target — GitHub →
Render → environment variables → live demo URL). Configured with `@sveltejs/adapter-node`,
which runs anywhere Node does, so a future move to Vercel/Railway/your own server is just a
different host, no code changes.
