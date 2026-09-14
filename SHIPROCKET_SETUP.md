# Shiprocket integration — how it works

## What's automated

After a customer pays (Razorpay signature verified):
1. Order is saved to the `orders` table
2. Stock is decremented for each item
3. **Loka automatically creates the shipment in Shiprocket**: creates the order,
   assigns a courier + AWB number, and requests pickup — no manual booking.
4. Shipment status is saved back to the order (`not_created` → `created` →
   `pickup_scheduled`, or `failed` with the reason)

You can watch/manage all of this from **`/admin/orders`** — every order shows its
shipment status, AWB number, courier, and a **Download label** link once generated.

## What still needs a human

- **Printing the label and physically handing the package to the courier** — no
  API replaces that (yet).
- **If shipment creation fails** — usually because the pincode has no
  serviceable courier, or the address couldn't be parsed — `/admin/orders`
  shows the error and a **Create shipment** retry button.
- **Getting the shipping label** — currently a manual click ("Get shipping
  label") per order rather than fully automatic, since Shiprocket sometimes
  needs a few minutes after AWB assignment before a label can be generated.

## One real limitation, worth knowing

The checkout form collects delivery address as a single free-text box. Loka's
Shiprocket integration finds the 6-digit PIN code inside that text automatically,
but city/state are sent as `NA` since they can't be reliably extracted from
free text. Shiprocket still accepts and ships the order fine using the pincode
— but if you want cleaner data in your own records, the fix is splitting the
checkout form into separate Name / Phone / Address Line / City / State / Pincode
fields. Worth doing once you're past the demo stage; ask and I'll build it.

## Setup checklist

1. **shiprocket.in** → sign up
2. **Settings → Pickup Addresses → Add New Address** → the address stock ships
   from. Note the exact nickname you give it.
3. **Settings → API → Add New API User** → separate email from your main
   login, copy the email + password immediately
4. In `.env` (and in Render's environment variables):
   ```
   SHIPROCKET_EMAIL=your-api-user@example.com
   SHIPROCKET_PASSWORD=your-shiprocket-api-password
   SHIPROCKET_PICKUP_LOCATION=exact-nickname-from-step-2
   ```
5. Run `supabase/migration_002_shiprocket.sql` in Supabase's SQL editor (adds
   weight/dimension columns to `products`, shipment tracking columns to `orders`)
6. In `/admin`, when adding/editing products, the weight and package
   dimensions default to reasonable small-item values (300g, 12×10×6cm) — for
   anything notably heavier or bulkier, update those so Shiprocket quotes the
   right courier and doesn't get surprised at pickup.

## Testing without a real order

Shiprocket's live API affects your real seller account even from a test
purchase — there's no separate sandbox mode for this endpoint. Use a very
low-value test product and your own address/phone the first time, so any
mistake is a shipment to yourself, not a customer.
