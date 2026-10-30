
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric(10,2) NOT NULL,
  image_url text,
  stock_quantity integer NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'piece',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_products" ON products FOR SELECT TO anon USING (true);
CREATE POLICY "insert_products_auth" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_products_auth" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_products_auth" ON products FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_orders_anon" ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "select_orders_anon" ON orders FOR SELECT TO anon USING (true);
CREATE POLICY "update_orders_auth" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_orders_auth" ON orders FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  price numeric(10,2) NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_order_items_anon" ON order_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "select_order_items_anon" ON order_items FOR SELECT TO anon USING (true);
CREATE POLICY "update_order_items_auth" ON order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_order_items_auth" ON order_items FOR DELETE TO authenticated USING (true);


-- Add missing columns to products
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS reserved_qty integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 10;

-- Add stock_alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  alert_type text NOT NULL, -- 'low_stock' or 'out_of_stock'
  stock_quantity integer NOT NULL,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_alerts_auth" ON stock_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_alerts_auth" ON stock_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_alerts_auth" ON stock_alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Add agent_logs table
CREATE TABLE IF NOT EXISTS agent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'success', -- 'success' or 'error'
  created_at timestamptz DEFAULT now()
);

ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_logs_auth" ON agent_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_logs_auth" ON agent_logs FOR INSERT TO authenticated WITH CHECK (true);