-- Merchants can upload private themes for their own store (owner_id); platform themes have owner_id null.
alter table public.themes add column if not exists owner_id uuid references public.merchants (id) on delete cascade;
create index if not exists themes_owner_id_idx on public.themes (owner_id);

drop policy if exists "Published themes are public" on public.themes;
create policy "Readable themes" on public.themes
  for select to anon, authenticated using (
    is_published
    or owner_id = (select auth.uid())
    or (select public.is_platform_admin())
    or exists (select 1 from public.merchants m where m.theme_id = themes.id)
  );

create policy "Merchants add their own themes" on public.themes
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and not is_published
    and (select count(*) from public.themes t where t.owner_id = (select auth.uid())) < 20
  );
create policy "Merchants edit their own themes" on public.themes
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()) and not is_published);
create policy "Merchants delete their own themes" on public.themes
  for delete to authenticated using (owner_id = (select auth.uid()));
