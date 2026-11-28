-- Per-store payment methods. Offline methods work today; gateways (Stripe, SSLCommerz, bKash)
-- are listed so the app can offer them once their integrations are switched on.
create table public.merchant_payment_methods (
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  method text not null check (method in ('cod', 'bank_transfer', 'mobile_wallet', 'stripe', 'sslcommerz', 'bkash')),
  enabled boolean not null default false,
  -- Public details shown to paying customers (e.g. wallet number, bank account, instructions). Never secrets.
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object' and pg_column_size(details) < 4000),
  updated_at timestamptz not null default now(),
  primary key (merchant_id, method)
);
create trigger merchant_payment_methods_updated_at before update on public.merchant_payment_methods
  for each row execute function public.set_updated_at();

alter table public.merchant_payment_methods enable row level security;
create policy "Customers see enabled payment methods" on public.merchant_payment_methods
  for select to anon, authenticated using (enabled or merchant_id = (select auth.uid()));
create policy "Owners add payment methods" on public.merchant_payment_methods
  for insert to authenticated with check (merchant_id = (select auth.uid()) and method in ('cod', 'bank_transfer', 'mobile_wallet'));
create policy "Owners update payment methods" on public.merchant_payment_methods
  for update to authenticated using (merchant_id = (select auth.uid()))
  with check (merchant_id = (select auth.uid()) and method in ('cod', 'bank_transfer', 'mobile_wallet'));
create policy "Owners remove payment methods" on public.merchant_payment_methods
  for delete to authenticated using (merchant_id = (select auth.uid()));

-- Orders may record any of the new methods
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('manual', 'cod', 'bank_transfer', 'mobile_wallet', 'stripe', 'sslcommerz', 'bkash'));

-- Widen place_order's accepted values in place (the rest of the function is unchanged)
do $$
declare d text;
begin
  select pg_get_functiondef('public.place_order(text,jsonb,jsonb,jsonb,text,text)'::regprocedure) into d;
  if position($q$if p_payment_method not in ('manual', 'stripe') then$q$ in d) = 0 then
    raise exception 'place_order changed; update this migration';
  end if;
  d := replace(d, $q$if p_payment_method not in ('manual', 'stripe') then$q$,
               $q$if p_payment_method not in ('manual', 'cod', 'bank_transfer', 'mobile_wallet', 'stripe', 'sslcommerz', 'bkash') then$q$);
  execute d;
end $$;

-- An order may only use a method the store has switched on. Stores that never set up
-- payments keep working with 'manual'/'cod' (cash on delivery), as before.
create or replace function public.check_order_payment_method()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_configured boolean;
begin
  if new.payment_method = 'stripe' then return new; end if; -- platform-level Stripe, verified server-side
  select exists (select 1 from public.merchant_payment_methods where merchant_id = new.merchant_id) into v_configured;
  if not v_configured and new.payment_method in ('manual', 'cod') then return new; end if;
  if not exists (select 1 from public.merchant_payment_methods
                 where merchant_id = new.merchant_id and method = new.payment_method and enabled) then
    raise exception 'This store doesn’t accept that payment method';
  end if;
  return new;
end;
$$;
revoke execute on function public.check_order_payment_method() from public, anon, authenticated;
create trigger orders_payment_method_allowed before insert on public.orders
  for each row execute function public.check_order_payment_method();
