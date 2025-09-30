// frontend/types/index.ts

export interface BackendUser {
  id: string;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

export interface OrderItem {
  id: string;
  product: {
    id: string;
    sku: string;
    name: string;
  };
  quantity: number;
  price_at_order: string;
}

export interface Order {
  id: string;
  customer: BackendUser;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  order_date: string; // This will be an ISO date string
  items: OrderItem[];
}

export interface DashboardSummary {
  total_customers: number;
  total_orders: number;
  total_products: number;
  shipments_in_transit: number;
  recent_revenue_30d: string; // The backend sends this as a formatted string
}