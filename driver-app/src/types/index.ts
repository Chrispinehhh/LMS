// src/types/index.ts
export interface BackendUser {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'DRIVER' | 'CUSTOMER';
  first_name: string;
  last_name: string;
}

// Job and Shipment types
export interface Job {
    id: string;
    pickup_address: string;
    delivery_address: string;
    requested_pickup_date: string; // ISO String
}

export interface Shipment {
    id: string;
    job: Job;
    status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
}