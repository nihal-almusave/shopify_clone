-- Per-store browser tab icon, uploaded in Admin → Settings → Brand.
alter table public.merchants add column if not exists favicon_url text;
grant select (favicon_url) on public.merchants to anon;
