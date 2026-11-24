-- Platform admin: themes, storefront traffic, merchant activity, and usage stats.

-- ---------------------------------------------------------------------------
-- Who is a platform admin (bound to an account id, never to an email string)
-- ---------------------------------------------------------------------------
create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;
create policy "Admins can see the admin list" on public.platform_admins
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.platform_admins where user_id = (select auth.uid()));
$$;
revoke execute on function public.is_platform_admin() from public, anon;
grant execute on function public.is_platform_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Themes (design presets; no code)
-- ---------------------------------------------------------------------------
create table public.themes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 280),
  preview_url text,
  tokens jsonb not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tokens_shape check (
    jsonb_typeof(tokens) = 'object'
    and (tokens ->> 'background') ~ '^#[0-9a-fA-F]{6}$'
    and (tokens ->> 'surface') ~ '^#[0-9a-fA-F]{6}$'
    and (tokens ->> 'text') ~ '^#[0-9a-fA-F]{6}$'
    and (tokens ->> 'muted') ~ '^#[0-9a-fA-F]{6}$'
    and (tokens ->> 'border') ~ '^#[0-9a-fA-F]{6}$'
    and (tokens ->> 'accent' is null or (tokens ->> 'accent') ~ '^#[0-9a-fA-F]{6}$')
    and (tokens ->> 'headingFont') in ('grotesk', 'sans', 'serif', 'mono')
    and (tokens ->> 'corners') in ('sharp', 'rounded', 'pill')
    and (tokens ->> 'hero') in ('image', 'split', 'minimal')
  )
);
create trigger themes_updated_at before update on public.themes
  for each row execute function public.set_updated_at();

alter table public.themes enable row level security;
create policy "Published themes are public" on public.themes
  for select to anon, authenticated using (is_published or (select public.is_platform_admin()));
create policy "Admins insert themes" on public.themes
  for insert to authenticated with check ((select public.is_platform_admin()));
create policy "Admins update themes" on public.themes
  for update to authenticated using ((select public.is_platform_admin())) with check ((select public.is_platform_admin()));
create policy "Admins delete themes" on public.themes
  for delete to authenticated using ((select public.is_platform_admin()));

alter table public.merchants add column if not exists theme_id uuid references public.themes (id) on delete set null;
grant select (theme_id) on public.merchants to anon;
create index if not exists merchants_theme_id_idx on public.merchants (theme_id);

insert into public.themes (name, slug, description, tokens, is_published) values
  ('Classic', 'classic', 'Clean white storefront with a big photo hero. The ShopHub default.',
   '{"background":"#ffffff","surface":"#fafafa","text":"#171717","muted":"#737373","border":"#e5e5e5","headingFont":"grotesk","corners":"rounded","hero":"image"}', true),
  ('Noir', 'noir', 'Dark, dramatic and photo-first. Great for fashion, sneakers and tech.',
   '{"background":"#111412","surface":"#1b1f1d","text":"#f3f4f1","muted":"#a3aba6","border":"#2c322f","accent":"#36fba1","headingFont":"grotesk","corners":"sharp","hero":"image"}', true),
  ('Bazaar', 'bazaar', 'Warm paper tones and a classic serif. Made for food, crafts and heritage brands.',
   '{"background":"#fbf6ee","surface":"#f3eadb","text":"#2b1d12","muted":"#7a6553","border":"#e6d8c3","accent":"#9c2f1f","headingFont":"serif","corners":"sharp","hero":"split"}', true),
  ('Fresh', 'fresh', 'Soft mint, pill buttons and a type-led hero. Friendly for beauty, wellness and cafés.',
   '{"background":"#ffffff","surface":"#eefaf3","text":"#12201a","muted":"#5d6b63","border":"#d8eadf","accent":"#0b6e4f","headingFont":"sans","corners":"pill","hero":"minimal"}', true);

-- ---------------------------------------------------------------------------
-- Storefront traffic (anonymous: visitor hash is salted per day, no IP stored)
-- ---------------------------------------------------------------------------
create table public.page_views (
  id bigint generated always as identity primary key,
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  path text not null check (char_length(path) <= 300),
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  created_at timestamptz not null default now()
);
create index page_views_merchant_created_idx on public.page_views (merchant_id, created_at desc);
create index page_views_created_idx on public.page_views (created_at desc);
alter table public.page_views enable row level security;
create policy "Admins read page views" on public.page_views
  for select to authenticated using ((select public.is_platform_admin()));

create or replace function public.track_page_view(p_store_slug text, p_path text, p_visitor_hash text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_id uuid;
begin
  if p_visitor_hash !~ '^[0-9a-f]{64}$' then return; end if;
  select id into v_id from public.merchants where store_slug = p_store_slug;
  if v_id is null then return; end if;
  insert into public.page_views (merchant_id, path, visitor_hash)
  values (v_id, left(coalesce(p_path, '/'), 300), p_visitor_hash);
end;
$$;
revoke execute on function public.track_page_view(text, text, text) from public;
grant execute on function public.track_page_view(text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Merchant activity, recorded by triggers
-- ---------------------------------------------------------------------------
create table public.merchant_events (
  id bigint generated always as identity primary key,
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  event text not null check (event in ('login', 'product_created', 'product_updated', 'order_fulfilled', 'settings_updated')),
  created_at timestamptz not null default now()
);
create index merchant_events_created_idx on public.merchant_events (created_at desc);
create index merchant_events_merchant_idx on public.merchant_events (merchant_id, created_at desc);
alter table public.merchant_events enable row level security;
create policy "Admins read merchant events" on public.merchant_events
  for select to authenticated using ((select public.is_platform_admin()));

create or replace function public.log_product_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Stock changes made by checkout are not merchant activity.
  if tg_op = 'UPDATE' and (select auth.uid()) is distinct from new.merchant_id then return new; end if;
  insert into public.merchant_events (merchant_id, event)
  values (new.merchant_id, case when tg_op = 'INSERT' then 'product_created' else 'product_updated' end);
  return new;
end;
$$;
create trigger products_activity after insert or update on public.products
  for each row execute function public.log_product_event();

create or replace function public.log_order_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.fulfillment_status = 'fulfilled' and old.fulfillment_status is distinct from 'fulfilled' then
    insert into public.merchant_events (merchant_id, event) values (new.merchant_id, 'order_fulfilled');
  end if;
  return new;
end;
$$;
create trigger orders_activity after update on public.orders
  for each row execute function public.log_order_event();

create or replace function public.log_settings_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Ignore order-number bumps made by checkout.
  if (select auth.uid()) is distinct from new.id then return new; end if;
  insert into public.merchant_events (merchant_id, event) values (new.id, 'settings_updated');
  return new;
end;
$$;
create trigger merchants_activity after update on public.merchants
  for each row execute function public.log_settings_event();

create or replace function public.log_login_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.merchant_events (merchant_id, event)
  select m.id, 'login' from public.merchants m where m.id = new.user_id;
  return new;
end;
$$;
create trigger on_session_created after insert on auth.sessions
  for each row execute function public.log_login_event();

revoke execute on function public.log_product_event() from public, anon, authenticated;
revoke execute on function public.log_order_event() from public, anon, authenticated;
revoke execute on function public.log_settings_event() from public, anon, authenticated;
revoke execute on function public.log_login_event() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Usage stats for the platform dashboard (admins only)
-- ---------------------------------------------------------------------------
create or replace function public.platform_stats(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_days integer := least(greatest(coalesce(p_days, 30), 7), 365);
  v_start timestamptz := date_trunc('day', now()) - make_interval(days => v_days - 1);
  v_result jsonb;
begin
  if not public.is_platform_admin() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  with days as (
    select generate_series(v_start, date_trunc('day', now()), interval '1 day')::date as day
  ),
  daily as (
    select d.day,
      (select count(*) from public.merchants m where m.created_at::date = d.day) as new_stores,
      (select count(*) from public.orders o where o.created_at::date = d.day and o.status <> 'cancelled') as orders,
      (select count(*) from public.page_views v where v.created_at::date = d.day) as views,
      (select count(distinct v.visitor_hash) from public.page_views v where v.created_at::date = d.day) as visitors,
      (select count(*) filter (where e.event = 'login') from public.merchant_events e where e.created_at::date = d.day) as ev_login,
      (select count(*) filter (where e.event = 'product_created') from public.merchant_events e where e.created_at::date = d.day) as ev_product_created,
      (select count(*) filter (where e.event = 'product_updated') from public.merchant_events e where e.created_at::date = d.day) as ev_product_updated,
      (select count(*) filter (where e.event = 'order_fulfilled') from public.merchant_events e where e.created_at::date = d.day) as ev_order_fulfilled,
      (select count(*) filter (where e.event = 'settings_updated') from public.merchant_events e where e.created_at::date = d.day) as ev_settings_updated
    from days d
  ),
  store_rows as (
    select m.id, m.store_name, m.store_slug, m.currency, m.created_at, t.name as theme_name,
      (select count(*) from public.products p where p.merchant_id = m.id) as products,
      (select count(*) from public.orders o where o.merchant_id = m.id and o.status <> 'cancelled' and o.created_at >= v_start) as orders,
      (select coalesce(sum(o.total_price), 0) from public.orders o where o.merchant_id = m.id and o.status <> 'cancelled' and o.created_at >= v_start) as sales,
      (select count(*) from public.page_views v where v.merchant_id = m.id and v.created_at >= v_start) as views,
      (select count(distinct v.visitor_hash) from public.page_views v where v.merchant_id = m.id and v.created_at >= v_start) as visitors,
      greatest(
        (select max(e.created_at) from public.merchant_events e where e.merchant_id = m.id),
        (select max(o.created_at) from public.orders o where o.merchant_id = m.id),
        m.created_at
      ) as last_active
    from public.merchants m
    left join public.themes t on t.id = m.theme_id
  )
  select jsonb_build_object(
    'days', v_days,
    'totals', jsonb_build_object(
      'stores', (select count(*) from public.merchants),
      'new_stores', (select count(*) from public.merchants where created_at >= v_start),
      'active_stores', (select count(*) from store_rows where last_active >= v_start),
      'products', (select count(*) from public.products),
      'orders', (select count(*) from public.orders where status <> 'cancelled' and created_at >= v_start),
      'views', (select count(*) from public.page_views where created_at >= v_start),
      'visitors', (select count(distinct (merchant_id, visitor_hash)) from public.page_views where created_at >= v_start)
    ),
    'sales_by_currency', coalesce((
      select jsonb_agg(jsonb_build_object('currency', currency, 'sales', sales, 'orders', orders) order by orders desc)
      from (select currency, sum(total_price) as sales, count(*) as orders from public.orders
            where status <> 'cancelled' and created_at >= v_start group by currency) c
    ), '[]'::jsonb),
    'daily', (select jsonb_agg(to_jsonb(daily) order by day) from daily),
    'stores', coalesce((select jsonb_agg(to_jsonb(store_rows) - 'id' order by orders desc, views desc, created_at desc) from store_rows), '[]'::jsonb),
    'themes', coalesce((
      select jsonb_agg(jsonb_build_object('name', coalesce(t.name, 'No theme'), 'stores', c) order by c desc)
      from (select theme_id, count(*) c from public.merchants group by theme_id) x
      left join public.themes t on t.id = x.theme_id
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;
revoke execute on function public.platform_stats(integer) from public, anon;
grant execute on function public.platform_stats(integer) to authenticated;

-- The platform owner
insert into public.platform_admins (user_id)
select id from auth.users where id = '1567c965-db97-4481-95be-f65bf6ff2b32'
on conflict do nothing;
