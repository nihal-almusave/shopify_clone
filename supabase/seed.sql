-- Demo store at /store/demo (used by the "See a demo store" link on the landing page).
-- The demo account has no password, so nobody can sign in to it.
do $$
declare
  demo_id uuid := '00000000-0000-4000-8000-00000000d3e0';
  img text := 'https://images.unsplash.com/';
begin
  if exists (select 1 from public.merchants where store_slug = 'demo') then
    return;
  end if;

  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
  values (demo_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo@shophub.invalid',
          '{"store_name":"Northwind Goods","store_slug":"demo"}', now(), now(), now());

  update public.merchants set
    description = 'Everyday goods, thoughtfully made. Ceramics, textiles and small-batch home essentials.',
    announcement = 'Free shipping on orders over $75',
    accent_color = '#c05717',
    banner_url = img || 'photo-1556228453-efd6c1ff04f6?w=2000&q=80&auto=format&fit=crop',
    shipping_rate = 6.50,
    free_shipping_threshold = 75,
    tax_rate = 8
  where id = demo_id;

  insert into public.products (merchant_id, name, description, price, compare_at_price, cost, quantity, category, vendor, status, images) values
  (demo_id, 'Stoneware Mug', 'Hand-thrown stoneware with a speckled glaze. Holds 12 oz. Dishwasher safe.', 28, null, 9, 42, 'Ceramics', 'Northwind Studio', 'active',
    array[img || 'photo-1514228742587-6b1558fcca3d?w=1200&q=80&auto=format&fit=crop', img || 'photo-1577937927133-66ef06acdf18?w=1200&q=80&auto=format&fit=crop']),
  (demo_id, 'Linen Throw Blanket', 'Stonewashed European linen, soft from the first use. 130 × 170 cm.', 120, 150, 44, 12, 'Textiles', 'Northwind Studio', 'active',
    array[img || 'photo-1580301762395-21ce84d00bc6?w=1200&q=80&auto=format&fit=crop']),
  (demo_id, 'Ceramic Vase', 'Matte white vase with an organic silhouette. 22 cm tall.', 46, null, 15, 4, 'Ceramics', 'Kiln & Co', 'active',
    array[img || 'photo-1578500494198-246f612d3b3d?w=1200&q=80&auto=format&fit=crop']),
  (demo_id, 'Soy Candle — Cedar', 'Hand-poured soy wax with notes of cedar, vetiver and smoke. 50-hour burn.', 32, null, 8, 60, 'Home', 'Ember', 'active',
    array[img || 'photo-1602874801007-bd458bb1b8b6?w=1200&q=80&auto=format&fit=crop']),
  (demo_id, 'Woven Storage Basket', 'Seagrass basket with handles, perfect for blankets and toys.', 58, 72, 20, 18, 'Home', 'Northwind Studio', 'active',
    array[img || 'photo-1595408076683-5d0c643e4f0e?w=1200&q=80&auto=format&fit=crop']),
  (demo_id, 'Cotton Tea Towels (Set of 2)', 'Waffle-weave organic cotton. Highly absorbent and quick drying.', 24, null, 7, 0, 'Textiles', 'Northwind Studio', 'active',
    array[img || 'photo-1583845112203-29329902332e?w=1200&q=80&auto=format&fit=crop']),
  (demo_id, 'Serving Board', 'Solid walnut board finished with food-safe oil. 40 × 20 cm.', 64, null, 22, 9, 'Kitchen', 'Grain Goods', 'active',
    array[img || 'photo-1594226801341-41427b4e5c22?w=1200&q=80&auto=format&fit=crop']),
  (demo_id, 'Pour-Over Coffee Set', 'Glass carafe and ceramic dripper for a slow morning ritual.', 54, null, 19, 15, 'Kitchen', 'Kiln & Co', 'active',
    array[img || 'photo-1495474472287-4d71bcdd2085?w=1200&q=80&auto=format&fit=crop']);
end $$;
