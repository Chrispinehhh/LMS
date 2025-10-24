// driver-app/src/types/index.ts

export interface BackendUser {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'DRIVER' | 'CUSTOMER';
  first_name: string;
  last_name: string;
}

export interface ShipmentListItem {
  id: string;
  job_id: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  customer_name: string;
  pickup_address: string;
  delivery_address: string;
  requested_pickup_date: string;
}

export interface JobDetail {
  id: string;
  service_type: string;
  // --- THIS IS THE FIX ---
  // This now uses the same statuses as a Shipment.
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
}