-- Create tables for the SaaS e-commerce platform

-- Merchants (users who create stores)
CREATE TABLE IF NOT EXISTS public.merchants (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  store_slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  quantity INTEGER DEFAULT 0,
  weight DECIMAL(8, 2),
  category TEXT,
  images TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants (sizes, colors, etc.)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  price DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  quantity INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping cart
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers (buyers)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending',
  total_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  fulfillment_status TEXT DEFAULT 'unfulfilled',
  shipping_address JSONB,
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collections (product groupings)
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection products
CREATE TABLE IF NOT EXISTS public.collection_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INTEGER,
  UNIQUE(collection_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

-- Merchant RLS Policies
CREATE POLICY "Merchants can view their own data" ON public.merchants
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Merchants can update their own data" ON public.merchants
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view published merchant info" ON public.merchants
  FOR SELECT USING (TRUE);

-- Product RLS Policies
CREATE POLICY "Merchants can view all their products" ON public.products
  FOR SELECT USING (merchant_id IN (
    SELECT id FROM public.merchants WHERE id = auth.uid()
  ));

CREATE POLICY "Merchants can create products" ON public.products
  FOR INSERT WITH CHECK (merchant_id IN (
    SELECT id FROM public.merchants WHERE id = auth.uid()
  ));

CREATE POLICY "Merchants can update their products" ON public.products
  FOR UPDATE USING (merchant_id IN (
    SELECT id FROM public.merchants WHERE id = auth.uid()
  ));

CREATE POLICY "Merchants can delete their products" ON public.products
  FOR DELETE USING (merchant_id IN (
    SELECT id FROM public.merchants WHERE id = auth.uid()
  ));

CREATE POLICY "Anyone can view published products" ON public.products
  FOR SELECT USING (is_published = TRUE);

-- Product Variants RLS Policies
CREATE POLICY "Anyone can view product variants for published products" ON public.product_variants
  FOR SELECT USING (product_id IN (
    SELECT id FROM public.products WHERE is_published = TRUE
  ));

CREATE POLICY "Merchants can manage their product variants" ON public.product_variants
  FOR ALL USING (product_id IN (
    SELECT id FROM public.products WHERE merchant_id = auth.uid()
  ));

-- Cart RLS Policies (allow anonymous users for session_id)
CREATE POLICY "Users can view their own carts" ON public.carts
  FOR SELECT USING (user_id = auth.uid() OR TRUE);

CREATE POLICY "Users can create carts" ON public.carts
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update their carts" ON public.carts
  FOR UPDATE USING (user_id = auth.uid() OR TRUE);

-- Cart Items RLS Policies
CREATE POLICY "Anyone can view cart items" ON public.cart_items
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can manage cart items" ON public.cart_items
  FOR ALL USING (TRUE);

-- Orders RLS Policies
CREATE POLICY "Merchants can view their orders" ON public.orders
  FOR SELECT USING (merchant_id IN (
    SELECT id FROM public.merchants WHERE id = auth.uid()
  ));

CREATE POLICY "Customers can view their own orders" ON public.orders
  FOR SELECT USING (customer_id IN (
    SELECT id FROM public.customers WHERE id = auth.uid()
  ));

CREATE POLICY "Merchants can update their orders" ON public.orders
  FOR UPDATE USING (merchant_id IN (
    SELECT id FROM public.merchants WHERE id = auth.uid()
  ));

-- Collections RLS Policies
CREATE POLICY "Merchants can view their collections" ON public.collections
  FOR SELECT USING (merchant_id IN (
    SELECT id FROM public.merchants WHERE id = auth.uid()
  ));

CREATE POLICY "Merchants can manage their collections" ON public.collections
  FOR ALL USING (merchant_id IN (
    SELECT id FROM public.merchants WHERE id = auth.uid()
  ));

CREATE POLICY "Anyone can view published collections" ON public.collections
  FOR SELECT USING (TRUE);

-- Reviews RLS Policies
CREATE POLICY "Anyone can view reviews for published products" ON public.reviews
  FOR SELECT USING (product_id IN (
    SELECT id FROM public.products WHERE is_published = TRUE
  ));

CREATE POLICY "Customers can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (customer_id IN (
    SELECT id FROM public.customers WHERE id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX idx_products_merchant_id ON public.products(merchant_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_orders_merchant_id ON public.orders(merchant_id);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX idx_carts_user_id ON public.carts(user_id);
CREATE INDEX idx_collection_products_collection_id ON public.collection_products(collection_id);
