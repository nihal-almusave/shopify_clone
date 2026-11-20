-- ShopHub: multi-store commerce schema
-- Tables: merchants (stores), products, customers, orders, order_items
-- Checkout runs through SECURITY DEFINER functions so prices, stock and totals
-- are always computed on the server, never trusted from the browser.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.slugify(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Merchants (one store per merchant account)
-- ---------------------------------------------------------------------------
create table public.merchants (
  id uuid primary key references auth.users (id) on delete cascade,
  store_name text not null,
  store_slug text not null unique check (store_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  logo_url text,
  banner_url text,
  announcement text,
  accent_color text not null default '#008060',
  email text not null,
  phone text,
  currency text not null default 'USD',
  tax_rate numeric(5, 2) not null default 0 check (tax_rate >= 0 and tax_rate <= 100),
  shipping_rate numeric(10, 2) not null default 0 check (shipping_rate >= 0),
  free_shipping_threshold numeric(10, 2) check (free_shipping_threshold >= 0),
  next_order_number integer not null default 1001,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger merchants_updated_at before update on public.merchants
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  name text not null,
  description text,
  sku text,
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price >= 0),
  cost numeric(10, 2) check (cost >= 0),
  quantity integer not null default 0,
  track_inventory boolean not null default true,
  category text,
  vendor text,
  images text[] not null default '{}',
  status text not null default 'draft' check (status in ('active', 'draft', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_merchant_id_idx on public.products (merchant_id);
create index products_merchant_status_idx on public.products (merchant_id, status);
create unique index products_merchant_sku_idx on public.products (merchant_id, sku) where sku is not null and sku <> '';

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Customers (scoped per store, like a store's customer list)
-- ---------------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  accepts_marketing boolean not null default false,
  orders_count integer not null default 0,
  total_spent numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, email)
);

create index customers_merchant_id_idx on public.customers (merchant_id);

create trigger customers_updated_at before update on public.customers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  order_number integer not null,
  email text not null,
  customer_name text,
  phone text,
  status text not null default 'open' check (status in ('open', 'archived', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  fulfillment_status text not null default 'unfulfilled' check (fulfillment_status in ('unfulfilled', 'fulfilled')),
  payment_method text not null default 'manual' check (payment_method in ('manual', 'stripe')),
  stripe_session_id text,
  subtotal numeric(12, 2) not null,
  shipping_cost numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  total_price numeric(12, 2) not null,
  currency text not null default 'USD',
  shipping_address jsonb,
  note text,
  tracking_number text,
  paid_at timestamptz,
  fulfilled_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, order_number)
);

create index orders_merchant_created_idx on public.orders (merchant_id, created_at desc);
create index orders_customer_id_idx on public.orders (customer_id);
create index orders_stripe_session_idx on public.orders (stripe_session_id);

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_image text,
  sku text,
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.merchants enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Merchants: anyone can read a storefront's public columns (column grants below
-- keep email/phone/order counters private); owners can read and update their row.
create policy "Storefronts are public" on public.merchants
  for select to anon, authenticated using (true);
create policy "Owners update their store" on public.merchants
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

revoke select on public.merchants from anon;
grant select (id, store_name, store_slug, description, logo_url, banner_url, announcement,
              accent_color, currency, tax_rate, shipping_rate, free_shipping_threshold, created_at)
  on public.merchants to anon;

-- Products
create policy "Active products are public" on public.products
  for select to anon, authenticated using (status = 'active');
create policy "Owners read their products" on public.products
  for select to authenticated using ((select auth.uid()) = merchant_id);
create policy "Owners insert products" on public.products
  for insert to authenticated with check ((select auth.uid()) = merchant_id);
create policy "Owners update products" on public.products
  for update to authenticated
  using ((select auth.uid()) = merchant_id) with check ((select auth.uid()) = merchant_id);
create policy "Owners delete products" on public.products
  for delete to authenticated using ((select auth.uid()) = merchant_id);

-- Customers, orders and order items are private to the store owner.
-- Shoppers create them only through place_order().
create policy "Owners read customers" on public.customers
  for select to authenticated using ((select auth.uid()) = merchant_id);
create policy "Owners update customers" on public.customers
  for update to authenticated
  using ((select auth.uid()) = merchant_id) with check ((select auth.uid()) = merchant_id);

create policy "Owners read orders" on public.orders
  for select to authenticated using ((select auth.uid()) = merchant_id);
create policy "Owners update orders" on public.orders
  for update to authenticated
  using ((select auth.uid()) = merchant_id) with check ((select auth.uid()) = merchant_id);

create policy "Owners read order items" on public.order_items
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and o.merchant_id = (select auth.uid()))
  );

-- ---------------------------------------------------------------------------
-- New merchant signup → store row
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_merchant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'store_name'), ''), 'My Store');
  v_slug text := public.slugify(coalesce(nullif(new.raw_user_meta_data ->> 'store_slug', ''), v_name));
begin
  if v_slug = '' then
    v_slug := 'store';
  end if;
  if exists (select 1 from public.merchants where store_slug = v_slug) then
    v_slug := v_slug || '-' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;

  insert into public.merchants (id, store_name, store_slug, email)
  values (new.id, v_name, v_slug, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_merchant();

-- ---------------------------------------------------------------------------
-- Checkout: place_order
-- p_items: [{ "product_id": uuid, "quantity": int }]
-- p_customer: { email, first_name, last_name, phone, accepts_marketing }
-- p_shipping: { address1, address2, city, province, postal_code, country }
-- ---------------------------------------------------------------------------
create or replace function public.place_order(
  p_store_slug text,
  p_items jsonb,
  p_customer jsonb,
  p_shipping jsonb,
  p_payment_method text default 'manual',
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_store public.merchants%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_subtotal numeric(12, 2) := 0;
  v_shipping numeric(12, 2);
  v_tax numeric(12, 2);
  v_total numeric(12, 2);
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number integer;
  v_email text := lower(trim(p_customer ->> 'email'));
  v_lines jsonb := '[]'::jsonb;
begin
  if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'A valid email address is required';
  end if;
  if p_payment_method not in ('manual', 'stripe') then
    raise exception 'Unsupported payment method';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty';
  end if;
  if jsonb_array_length(p_items) > 100 then
    raise exception 'Too many items in cart';
  end if;

  select * into v_store from public.merchants where store_slug = p_store_slug;
  if not found then
    raise exception 'Store not found';
  end if;

  -- Validate every line against live product data and lock the rows.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 999 then
      raise exception 'Invalid quantity';
    end if;

    select * into v_product from public.products
      where id = (v_item ->> 'product_id')::uuid
        and merchant_id = v_store.id
        and status = 'active'
      for update;
    if not found then
      raise exception 'A product in your cart is no longer available';
    end if;
    if v_product.track_inventory and v_product.quantity < v_qty then
      raise exception 'Only % of "%" left in stock', greatest(v_product.quantity, 0), v_product.name;
    end if;

    v_subtotal := v_subtotal + v_product.price * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product.id,
      'name', v_product.name,
      'image', v_product.images[1],
      'sku', v_product.sku,
      'price', v_product.price,
      'quantity', v_qty,
      'track', v_product.track_inventory
    );
  end loop;

  v_shipping := case
    when v_store.free_shipping_threshold is not null and v_subtotal >= v_store.free_shipping_threshold then 0
    else v_store.shipping_rate
  end;
  v_tax := round(v_subtotal * v_store.tax_rate / 100, 2);
  v_total := v_subtotal + v_shipping + v_tax;

  insert into public.customers (merchant_id, email, first_name, last_name, phone, accepts_marketing,
                                orders_count, total_spent)
  values (
    v_store.id, v_email,
    nullif(trim(p_customer ->> 'first_name'), ''),
    nullif(trim(p_customer ->> 'last_name'), ''),
    nullif(trim(p_customer ->> 'phone'), ''),
    coalesce((p_customer ->> 'accepts_marketing')::boolean, false),
    1, v_total
  )
  on conflict (merchant_id, email) do update set
    first_name = coalesce(excluded.first_name, public.customers.first_name),
    last_name = coalesce(excluded.last_name, public.customers.last_name),
    phone = coalesce(excluded.phone, public.customers.phone),
    accepts_marketing = public.customers.accepts_marketing or excluded.accepts_marketing,
    orders_count = public.customers.orders_count + 1,
    total_spent = public.customers.total_spent + v_total
  returning id into v_customer_id;

  update public.merchants set next_order_number = next_order_number + 1
    where id = v_store.id
    returning next_order_number - 1 into v_order_number;

  insert into public.orders (
    merchant_id, customer_id, order_number, email, customer_name, phone,
    payment_method, subtotal, shipping_cost, tax, total_price, currency, shipping_address, note
  ) values (
    v_store.id, v_customer_id, v_order_number, v_email,
    nullif(trim(concat_ws(' ', p_customer ->> 'first_name', p_customer ->> 'last_name')), ''),
    nullif(trim(p_customer ->> 'phone'), ''),
    p_payment_method, v_subtotal, v_shipping, v_tax, v_total, v_store.currency, p_shipping,
    nullif(left(trim(p_note), 1000), '')
  ) returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, product_image, sku, quantity, price)
  select v_order_id, (l ->> 'product_id')::uuid, l ->> 'name', l ->> 'image', l ->> 'sku',
         (l ->> 'quantity')::integer, (l ->> 'price')::numeric
  from jsonb_array_elements(v_lines) l;

  update public.products p set quantity = p.quantity - (l ->> 'quantity')::integer
  from jsonb_array_elements(v_lines) l
  where p.id = (l ->> 'product_id')::uuid and (l ->> 'track')::boolean;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total', v_total,
    'currency', v_store.currency,
    'email', v_email,
    'lines', v_lines,
    'shipping', v_shipping,
    'tax', v_tax
  );
end;
$$;

-- Order status page for shoppers: the unguessable order id acts as the access token.
create or replace function public.get_order_public(p_order_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'email', o.email,
    'customer_name', o.customer_name,
    'payment_status', o.payment_status,
    'fulfillment_status', o.fulfillment_status,
    'payment_method', o.payment_method,
    'status', o.status,
    'subtotal', o.subtotal,
    'shipping_cost', o.shipping_cost,
    'tax', o.tax,
    'total_price', o.total_price,
    'currency', o.currency,
    'shipping_address', o.shipping_address,
    'tracking_number', o.tracking_number,
    'created_at', o.created_at,
    'store_slug', m.store_slug,
    'store_name', m.store_name,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id, 'name', i.product_name, 'image', i.product_image,
        'quantity', i.quantity, 'price', i.price) order by i.created_at)
      from public.order_items i where i.order_id = o.id
    ), '[]'::jsonb)
  )
  from public.orders o
  join public.merchants m on m.id = o.merchant_id
  where o.id = p_order_id;
$$;

-- Called only by the server (service role) after Stripe confirms payment.
create or replace function public.mark_order_paid(p_order_id uuid, p_session_id text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.orders
     set payment_status = 'paid', paid_at = coalesce(paid_at, now()), stripe_session_id = p_session_id
   where id = p_order_id and payment_status = 'pending';
$$;

create or replace function public.attach_stripe_session(p_order_id uuid, p_session_id text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.orders set stripe_session_id = p_session_id
   where id = p_order_id and payment_method = 'stripe' and stripe_session_id is null;
$$;

revoke execute on function public.place_order(text, jsonb, jsonb, jsonb, text, text) from public;
revoke execute on function public.get_order_public(uuid) from public;
revoke execute on function public.mark_order_paid(uuid, text) from public, anon, authenticated;
revoke execute on function public.attach_stripe_session(uuid, text) from public, anon, authenticated;
revoke execute on function public.handle_new_merchant() from public, anon, authenticated;

grant execute on function public.place_order(text, jsonb, jsonb, jsonb, text, text) to anon, authenticated;
grant execute on function public.get_order_public(uuid) to anon, authenticated;
grant execute on function public.mark_order_paid(uuid, text) to service_role;
grant execute on function public.attach_stripe_session(uuid, text) to service_role;

-- ---------------------------------------------------------------------------
-- Storage: public product/brand images, each merchant writes only to their folder
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('store-media', 'store-media', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do nothing;

create policy "Merchants upload to their folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'store-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Merchants update their files" on storage.objects
  for update to authenticated
  using (bucket_id = 'store-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Merchants delete their files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'store-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
