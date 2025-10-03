// frontend/lib/validators.ts
import { z } from 'zod';

// For the Manager's "Create User" form
export const userSchema = z.object({
  first_name: z.string().min(2, { message: "First name is required." }),
  last_name: z.string().min(2, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  role: z.enum(['ADMIN', 'MANAGER', 'DRIVER', 'CUSTOMER']),
});
export type UserFormData = z.infer<typeof userSchema>;

// For the "Create/Edit Vehicle" form
export const vehicleSchema = z.object({
  license_plate: z.string().min(2, "License plate is required."),
  make: z.string().min(2, "Make is required."),
  model: z.string().min(2, "Model is required."),
  year: z.coerce.number().min(1900, "Invalid year.").max(new Date().getFullYear() + 1, "Year cannot be in the future."),
  capacity_kg: z.coerce.number().min(0, "Capacity must be a positive number."),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE']),
});
export type VehicleFormData = z.infer<typeof vehicleSchema>;

// For the "Create Job" form
export const jobSchema = z.object({
  customer_id: z.string().uuid({ message: "A valid customer must be selected." }),
  service_type: z.enum([
    'RESIDENTIAL_MOVING', 
    'OFFICE_RELOCATION', 
    'PALLET_DELIVERY', 
    'SMALL_DELIVERIES'
  ]),
  cargo_description: z.string().min(10, { message: "Please provide a detailed description of the cargo." }),
  pickup_address: z.string().min(5, { message: "Pickup address is required." }),
  pickup_city: z.string().min(2, { message: "Pickup city is required." }),
  pickup_contact_person: z.string().min(2, { message: "Contact person is required." }),
  pickup_contact_phone: z.string().min(10, { message: "A valid phone number is required." }),
  delivery_address: z.string().min(5, { message: "Delivery address is required." }),
  delivery_city: z.string().min(2, { message: "Delivery city is required." }),
  delivery_contact_person: z.string().min(2, { message: "Contact person is required." }),
  delivery_contact_phone: z.string().min(10, { message: "A valid phone number is required." }),
  requested_pickup_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please select a valid date and time.",
  }),
});
export type JobFormData = z.infer<typeof jobSchema>;

// --- ADD THIS NEW SCHEMA ---
// For the "Create Driver" composite form
export const driverSchema = z.object({
  // User fields
  first_name: z.string().min(2, "First name is required."),
  last_name: z.string().min(2, "Last name is required."),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),

  // Driver profile fields
  license_number: z.string().min(3, "License number is required."),
  phone_number: z.string().min(10, "A valid phone number is required."),
});

export type DriverFormData = z.infer<typeof driverSchema>;