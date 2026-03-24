export interface Store {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'picking_up' | 'delivering' | 'delivered' | 'cancelled';
export type PaymentMethod = 'bizum' | 'card' | 'cash';

export interface Order {
  id: string;
  store_id: string;
  store_name: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  notes?: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  driver_id?: string;
  driver_name?: string;
  estimated_delivery?: string;
  total_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  is_available: boolean;
  is_active: boolean;
  current_order_id?: string;
  created_at: string;
}

export interface PaymentInfo {
  bizum_phone: string;
  card_info: string;
  cash_note: string;
}

export interface Stats {
  total_orders: number;
  pending_orders: number;
  active_orders: number;
  delivered_orders: number;
  total_drivers: number;
  available_drivers: number;
  total_stores: number;
}
