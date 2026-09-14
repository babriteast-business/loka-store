-- Only needed if you already ran schema.sql before Shiprocket integration
-- existed. Safe to run even if some columns are already there.

alter table products add column if not exists weight_grams integer not null default 300;
alter table products add column if not exists length_cm integer not null default 12;
alter table products add column if not exists breadth_cm integer not null default 10;
alter table products add column if not exists height_cm integer not null default 6;

alter table orders add column if not exists shiprocket_order_id text;
alter table orders add column if not exists shiprocket_shipment_id text;
alter table orders add column if not exists awb_code text;
alter table orders add column if not exists courier_name text;
alter table orders add column if not exists label_url text;
alter table orders add column if not exists shipment_status text default 'not_created';
alter table orders add column if not exists shipment_error text;
