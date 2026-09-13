-- Only needed if you already ran schema.sql before bestseller/units_sold existed.
-- Safe to run even if the columns are already there (checks first).

alter table products add column if not exists bestseller boolean not null default false;
alter table products add column if not exists units_sold integer not null default 0;

create or replace function decrement_stock(p_id uuid, p_qty integer)
returns void
language sql
as $$
	update products
	set stock = greatest(stock - p_qty, 0), units_sold = units_sold + p_qty
	where id = p_id;
$$;
