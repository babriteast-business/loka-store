-- Run this in the Supabase SQL editor to set up the products table.

create table if not exists products (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	slug text not null,
	category text not null check (
		category in ('home-care', 'personal-care', 'kitchen-accessories', 'kids-section', 'electronics')
	),
	price_inr integer not null,
	compare_at_inr integer,
	description text default '',
	image_url text not null,
	stock integer not null default 0,
	bestseller boolean not null default false,
	units_sold integer not null default 0,
	source_note text, -- e.g. supplier name/link, for your own dropship tracking
	created_at timestamptz not null default now()
);

alter table products enable row level security;

-- Anyone can read products (it's a public storefront).
create policy "Public read access" on products
	for select using (true);

-- Only service-role (server-side, e.g. an admin script) can write.
-- No insert/update policy is created for the anon key on purpose.

create table if not exists orders (
	id uuid primary key default gen_random_uuid(),
	razorpay_order_id text,
	razorpay_payment_id text,
	customer_name text,
	customer_phone text,
	delivery_address text,
	items jsonb not null,
	total_inr integer not null,
	status text not null default 'pending', -- pending | paid | fulfilled | cancelled
	created_at timestamptz not null default now()
);

alter table orders enable row level security;
-- No public policies on orders — only your server (using the service_role key)
-- should read/write this table.

-- Called from the server (service_role) after a verified payment.
-- SQL-level GREATEST prevents stock from ever going negative. Also tracks
-- units_sold, which powers the "X people bought this" conversion badge.
create or replace function decrement_stock(p_id uuid, p_qty integer)
returns void
language sql
as $$
	update products
	set stock = greatest(stock - p_qty, 0), units_sold = units_sold + p_qty
	where id = p_id;
$$;
