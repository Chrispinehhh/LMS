// src/types/index.ts

// Reusable status type
export type ShipmentStatus =
  | 'ORDER_PLACED'
  | 'PENDING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface ShipmentListItem {
  id: string; // The URL/UUID
  job_id: number;
  status: ShipmentStatus;
  pickup_address: string;
  pickup_city: string;
  delivery_address: string;
  delivery_city: string;
  requested_pickup_date: string;
  customer_name: string;
}

export interface JobDetail {
  id: string; // The shipment ID or Job ID depending on usage
  job_id: number; // The visible numeric ID
  service_type: string;
  status: ShipmentStatus;
  customer_name: string;
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
  created_at?: string;
  updated_at?: string;
  proof_of_delivery_image?: string | null;
}

export interface BackendUser {
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'DRIVER' | 'CUSTOMER' | 'ADMIN' | string;
  driver_id?: string; // Optional Driver ID (e.g. "#8291")
}

export type Job = JobDetail;