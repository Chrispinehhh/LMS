// src/types/index.ts
export interface ShipmentListItem {
  id: string;
  job_id: string;
  pickup_address: string;
  delivery_address: string;
  requested_pickup_date: string;
  customer_name: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
}

export interface JobDetail {
  id: string;
  service_type: string;
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
  requested_pickup_date: string;
  created_at?: string;
  updated_at?: string;
  proof_of_delivery_image?: string | null;
}