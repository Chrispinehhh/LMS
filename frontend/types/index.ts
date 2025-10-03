// frontend/types/index.ts

export interface BackendUser {
  id: string;
  username: string; // This is the Firebase UID
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'DRIVER' | 'CUSTOMER';
  first_name: string;
  last_name: string;
  customer_type: 'ONE_TIME' | 'REGULAR';
}

export interface Vehicle {
  id: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  capacity_kg: number;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
}

export interface Driver {
  id: string;
  user: BackendUser; // Contains the driver's name, email, etc.
  license_number: string;
  phone_number: string;
}

export interface Job {
  id: string;
  customer: BackendUser;
  service_type: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  cargo_description: string;
  pickup_address: string;
  pickup_city: string;
  pickup_contact_person: string;
  pickup_contact_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_contact_person: string;
  delivery_contact_phone: string;
  requested_pickup_date: string; // ISO 8601 date string
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  total_customers: number;
  total_jobs: number;
  shipments_in_transit: number;
  recent_revenue_30d: string;
}

export interface JobChartData {
  date: string;
  short_date: string;
  jobs: number;
}

// ... (add this new type)
export interface Shipment {
  id: string;
  job: string; // The Job ID
  driver: Driver | null;
  vehicle: Vehicle | null;
  status: string;
}