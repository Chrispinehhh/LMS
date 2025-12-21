// frontend/types/index.ts

// First, define User interface since BackendUser references it
export interface User {
  id: string;
  username: string; // This is the Firebase UID
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'DRIVER' | 'CUSTOMER';
  first_name: string;
  last_name: string;
  customer_type: 'ONE_TIME' | 'REGULAR';
  is_active?: boolean;
  phone_number?: string;
}

// Alias BackendUser to User for consistency
export type BackendUser = User;

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
  user: User; // Use User interface instead of BackendUser
  license_number: string;
  phone_number: string;
}

export interface Job {
  id: string;
  job_number?: number;
  customer: User;

  // New Fields
  job_type: 'RESIDENTIAL' | 'COMMERCIAL';
  service_type?: string; // Legacy

  // Metrics
  room_count?: number;
  volume_cf?: number;
  estimated_items?: Record<string, number>; // New
  crew_size?: number; // New

  pallet_count?: number;
  weight_lbs?: number;
  is_hazardous?: boolean; // New
  bol_number?: string; // New

  // Pricing
  pricing_model: 'HOURLY' | 'FLAT_RATE' | 'CWT';
  hourly_rate?: number;
  travel_fee?: number;
  cwt_rate?: number;
  flat_rate?: number;

  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
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
  estimated_delivery_date?: string; // ISO 8601 date string
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  proof_of_delivery_image?: string | null;
  assigned_driver?: string | null;
}

export interface Shipment {
  id: string;
  job: Job; // Changed from string to Job object for better typing
  driver: Driver | null;
  vehicle: Vehicle | null;
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  proof_of_delivery_image?: string;
  estimated_departure?: string;
  actual_departure?: string;
  estimated_arrival?: string;
  actual_arrival?: string;
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

// Response interfaces for paginated endpoints
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Use type aliases instead of empty interfaces
export type JobsResponse = PaginatedResponse<Job>;
export type ShipmentsResponse = PaginatedResponse<Shipment>;