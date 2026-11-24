-- The themes read policy calls is_platform_admin(); visitors must be able to run it (it returns false for them).
grant execute on function public.is_platform_admin() to anon;
