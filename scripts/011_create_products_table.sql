-- Create products table for e-commerce functionality
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL,
  discount_price numeric(10, 2),
  image_url text,
  category text NOT NULL,
  brand text,
  model text,
  stock integer NOT NULL DEFAULT 0,
  warranty_months integer DEFAULT 12,
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  views integer DEFAULT 0,
  sales_count integer DEFAULT 0,
  featured boolean DEFAULT false,
  shipping_weight numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_provider ON products(provider_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
-- Public can view active products
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT
  USING (is_active = true);

-- Providers can manage their products
DROP POLICY IF EXISTS "Providers can manage their products" ON products;
CREATE POLICY "Providers can manage their products" ON products
  FOR ALL
  USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()))
  WITH CHECK (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Admin can manage all products (leonardo@oliport.com.br)
DROP POLICY IF EXISTS "Admin can manage all products" ON products;
CREATE POLICY "Admin can manage all products" ON products
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'leonardo@oliport.com.br'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'leonardo@oliport.com.br'
    )
  );

-- Create product_orders table for tracking purchases
CREATE TABLE IF NOT EXISTS public.product_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  provider_id uuid REFERENCES service_providers(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  shipping_address text NOT NULL,
  shipping_city text NOT NULL,
  shipping_state text NOT NULL,
  shipping_zip_code text NOT NULL,
  tracking_code text,
  payment_method text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for product_orders
CREATE INDEX IF NOT EXISTS idx_product_orders_customer ON product_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_product ON product_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_provider ON product_orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_status ON product_orders(status);

-- Enable RLS for product_orders
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
DROP POLICY IF EXISTS "Customers can view their orders" ON product_orders;
CREATE POLICY "Customers can view their orders" ON product_orders
  FOR SELECT
  USING (customer_id = auth.uid());

-- Customers can create orders
DROP POLICY IF EXISTS "Customers can create orders" ON product_orders;
CREATE POLICY "Customers can create orders" ON product_orders
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Providers can view and update orders for their products
DROP POLICY IF EXISTS "Providers can manage their orders" ON product_orders;
CREATE POLICY "Providers can manage their orders" ON product_orders
  FOR ALL
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE user_id = auth.uid()
    )
  );

-- Admin can manage all orders
DROP POLICY IF EXISTS "Admin can manage all orders" ON product_orders;
CREATE POLICY "Admin can manage all orders" ON product_orders
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'leonardo@oliport.com.br'
    )
  );

-- Function to update product views
CREATE OR REPLACE FUNCTION increment_product_views(product_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET views = views + 1
  WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update product sales count on order
CREATE OR REPLACE FUNCTION update_product_sales_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    UPDATE products
    SET sales_count = sales_count + NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update sales count when order is delivered
DROP TRIGGER IF EXISTS trigger_update_product_sales ON product_orders;
CREATE TRIGGER trigger_update_product_sales
  AFTER INSERT OR UPDATE ON product_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_product_sales_count();
