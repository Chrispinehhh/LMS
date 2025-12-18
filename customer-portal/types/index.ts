// types/index.ts

export interface BackendUser {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'DRIVER' | 'CUSTOMER';
  first_name: string;
  last_name: string;
  customer_type: 'ONE_TIME' | 'REGULAR';
}

export interface CustomerAddress {
  id: number;
  label: 'HOME' | 'OFFICE' | 'WAREHOUSE' | 'OTHER';
  label_display: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobTimeline {
  id: number;
  status: 'ORDER_PLACED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  status_display: string;
  timestamp: string;
  location: string;
  description: string;
  completed: boolean;
  is_current: boolean;
}

export interface Job {
  id: string;
  status: string;
  service_type: string;
  cargo_description: string;
  pickup_address: string;
  pickup_city: string;
  pickup_contact_person: string;
  pickup_contact_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_contact_person: string;
  delivery_contact_phone: string;
  requested_pickup_date: string;
  estimated_delivery?: string;
  timeline: JobTimeline[];
  created_at: string;
  updated_at: string;

  // Tracking specific
  current_location?: string;
  current_status?: string;
  driver?: {
    name: string;
    phone: string;
    vehicle: string;
  } | null;
  proof?: {
    signature: string | null;
    photo: string | null;
  };
}

export interface QuoteRequest {
  origin: string;
  destination: string;
  packageType: string;
  weight: number;
}

export interface QuoteResponse {
  price: number;
  estimatedDays: string;
  distance: number;
  serviceType: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Stats Reaponse
export interface PublicStats {
  totalCustomers: number;
  completedDeliveries: number;
  onTimeRate: number;
  activeOrders: number;
}

// Order Stats
export interface OrderStats {
  total: number;
  active: number;
  completed: number;
}

export interface FirebaseError extends Error {
  code: string;
  message: string;
  name: string;
}

export interface AuthError extends FirebaseError {
  code: string;
  message: string;
  name: string;
}
