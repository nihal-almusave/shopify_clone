-- A policy on themes can't query themes itself (infinite recursion); count through a definer function instead.
create or replace function public.own_theme_count()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer from public.themes where owner_id = (select auth.uid());
$$;
revoke execute on function public.own_theme_count() from public, anon;
grant execute on function public.own_theme_count() to authenticated;

drop policy if exists "Merchants add their own themes" on public.themes;
create policy "Merchants add their own themes" on public.themes
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and not is_published and (select public.own_theme_count()) < 20);
