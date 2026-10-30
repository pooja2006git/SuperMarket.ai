export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  unit: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
}

export type Page =
  | 'home'
  | 'shop'
  | 'cart'
  | 'checkout'
  | 'confirmation'
  | 'order-tracking'
  | 'staff-login'
  | 'staff-dashboard'
  | 'staff-add-product'
  | 'staff-edit-product';
