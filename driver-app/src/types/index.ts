// src/types/index.ts
export interface ShipmentListItem {
  id: string;
  job_id: string;
  pickup_address: string;
  delivery_address: string;
  requested_pickup_date: string;
  customer_name: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED'; // Added ASSIGNED
}

export interface JobDetail {
  id: string;
  service_type: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED'; // Added ASSIGNED
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

// You might also want to create a reusable type for status
export type ShipmentStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

// Then you can use it in your interfaces:
export interface ShipmentListItem {
  id: string;
  job_id: string;
  pickup_address: string;
  delivery_address: string;
  requested_pickup_date: string;
  customer_name: string;
  status: ShipmentStatus;
}

export interface JobDetail {
  id: string;
  service_type: string;
  status: ShipmentStatus;
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