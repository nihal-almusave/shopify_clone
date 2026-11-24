# ShopHub

A multi-store commerce platform: merchants sign up, get their own storefront at `/store/<slug>`, add products, and manage orders and customers from an admin. Built with Next.js 16 (App Router), Supabase (Postgres, Auth, Storage), and optional Stripe card payments.

## Features

**Admin (`/admin`)**
- Home: setup guide, 30-day sales chart, total sales / orders / average order value, recent orders
- Products: list with status tabs and search; create/edit with image upload (drag to reorder), compare-at price, cost → profit & margin, SKU, inventory tracking, Active / Draft / Archived
- Inventory: bulk-edit stock levels
- Orders: tabs (unfulfilled, unpaid, open, archived), search by number/name/email; order page with mark as paid, fulfill with tracking number, cancel and restock, archive, notes
- Customers: created automatically at checkout, with order count and lifetime spend
- Settings: store name/URL, logo and cover image, accent color, announcement bar, currency, tax rate, flat shipping rate and free-shipping threshold

**Storefront (`/store/<slug>`)**
- Branded home page with hero, category filters and sorting
- Product pages with gallery, sale badges, low-stock notice, related products
- Slide-out cart with free-shipping progress, cart page
- One-page checkout; order status / thank-you page customers can bookmark

**Security model**
- Row Level Security on every table: merchants only see their own products, orders and customers
- Checkout runs in a `place_order` Postgres function, so prices, stock and totals are always computed server-side and stock is decremented atomically
- Shoppers can read an order only by its unguessable id (`get_order_public`)
- Orders are marked paid only after the server verifies the payment with Stripe (service role)

## Local development

```bash
cp .env.example .env.local   # fill in your Supabase URL + publishable key
npm install
npm run dev
```

Open http://localhost:3000, create a store, and add products. A demo store is at `/store/demo` when the seed has been applied.

## Database

The schema lives in `supabase/migrations/`. Demo data is in `supabase/seed.sql`.

- **Supabase CLI:** `supabase link --project-ref <ref>` then `supabase db push`
- **Or by hand:** paste the migration into the Supabase SQL editor and run it, then optionally run `seed.sql`

## Deploying to Vercel

1. Import the repository in Vercel (framework: Next.js; defaults are fine).
2. Add environment variables (Project → Settings → Environment Variables):

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | The publishable (or legacy anon) key |
   | `NEXT_PUBLIC_SITE_URL` | recommended | e.g. `https://yourstore.com`, used for payment redirects |
   | `SUPABASE_SERVICE_ROLE_KEY` | for Stripe | Server-only. Never expose to the browser |
   | `STRIPE_SECRET_KEY` | for Stripe | Enables card payments |
   | `STRIPE_WEBHOOK_SECRET` | for Stripe | From the webhook endpoint below |

   If you use the Vercel ↔ Supabase integration, the Supabase variables are added for you.
3. In Supabase → Authentication → URL Configuration, set **Site URL** to your production URL and add `https://<your-domain>/auth/callback` to **Redirect URLs** (add your preview URLs too if you test sign-ups there).
4. Deploy.
5. Password reset links work on any device out of the box: the reset email is requested from the server (`lib/password-reset.ts`) and its link lands on `/auth/reset`. No email template changes are needed. Branded templates are in `supabase/templates/`; Supabase only lets you install them once custom SMTP is configured (or on a paid plan).
6. Supabase's built-in email sender only delivers to your own team's addresses, about 2 emails an hour. For real customers, connect your own SMTP provider (e.g. Resend) under Authentication → Emails → SMTP Settings.

### Card payments (optional)

Without Stripe keys, checkout takes **manual payments** (bank transfer / cash on delivery) and merchants click *Mark as paid* in the admin.

To accept cards:
1. Set `STRIPE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.
2. In the Stripe Dashboard → Developers → Webhooks, add an endpoint `https://<your-domain>/api/stripe/webhook` listening to `checkout.session.completed` and `checkout.session.async_payment_succeeded`, then set `STRIPE_WEBHOOK_SECRET` to its signing secret.

Shoppers are sent to Stripe Checkout and the order is marked paid when they return (and again, idempotently, by the webhook).

## Platform admin (`/platform`)

Only accounts listed in the `platform_admins` table can open it (everyone else gets a 404). Platform admins also see a **Platform dashboard** link in their store admin's account menu.

- **Overview**: stores, active stores, products, orders, visitors and conversion for 7/30/90 days; charts for storefront traffic, orders, new stores and merchant activity; top stores, sales by currency and themes in use.
- **Stores**: every store with its theme, products, orders, sales, visitors and last activity.
- **Themes** (works like Shopify's Online Store → Themes):
  - **Add theme → Upload zip file**: a zip with `theme.json` (required) and `preview.png` (optional). Example: `supabase/themes/monsoon.zip`. A bare `theme.json` or **Create blank theme** also work.
  - Uploads arrive as **drafts**. **Preview** shows the theme on the demo store in your browser only; **Customize** opens the editor; **Publish** adds it to the theme store; **Download** exports a zip.
  - Merchants open **Online Store** in their admin to see their current theme and the theme library, **Preview** any theme on their own store (only they see it), and **Publish** it.
  - Merchants can also **Add theme → Upload zip file** (or create one) for their own store. Their uploads are private to that store (up to 20), never appear in the theme store, and can be previewed, customized, published, downloaded and deleted.
  - `theme.json` format: `{ "name", "description", "tokens": { "background", "surface", "text", "muted", "border", "accent" (optional), "headingFont": grotesk|sans|serif|mono, "corners": sharp|rounded|pill, "hero": image|split|minimal } }`. Themes are design settings only; they can't run code.

Tracking:
- Storefront visits are counted anonymously by `/api/track`: the visitor id is a daily-rotating hash, no cookies are set and IP addresses are never stored. Bots and headless browsers are ignored. Optionally set `TRACKING_SALT` to a random secret in Vercel.
- Merchant activity (logins, products added/edited, orders fulfilled, settings changed) is recorded by database triggers.

To add another platform admin, run in the Supabase SQL editor:
```sql
insert into public.platform_admins (user_id) select id from auth.users where email = 'someone@example.com';
```

## Project structure

```
app/
  page.tsx                     marketing landing page
  auth/                        log in, sign up, forgot/reset password, email link callback
  admin/                       merchant admin (home, orders, products, customers, settings)
  store/[storeSlug]/           storefront: (shop) pages, checkout, order status
  api/stripe/webhook/          Stripe webhook
components/admin, components/store
lib/                           Supabase clients, checkout server actions, types, formatting
supabase/migrations, seed.sql  database schema and demo data
proxy.ts                       session refresh + /admin route protection
```
