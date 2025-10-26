// frontend/lib/validators.ts
import { z } from 'zod';

// For the Manager's "Create User" form
export const userSchema = z.object({
  first_name: z.string()
    .min(2, { message: "First name must be at least 2 characters." })
    .max(50, { message: "First name cannot exceed 50 characters." }),
  last_name: z.string()
    .min(2, { message: "Last name must be at least 2 characters." })
    .max(50, { message: "Last name cannot exceed 50 characters." }),
  email: z.string()
    .email({ message: "Please enter a valid email address." })
    .max(100, { message: "Email cannot exceed 100 characters." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(128, { message: "Password cannot exceed 128 characters." }),
  role: z.enum(['ADMIN', 'MANAGER', 'DRIVER', 'CUSTOMER']),
  customer_type: z.enum(['ONE_TIME', 'REGULAR']).optional(),
}).refine((data) => {
  // Only require customer_type if role is CUSTOMER
  if (data.role === 'CUSTOMER') {
    return data.customer_type !== undefined;
  }
  return true;
}, {
  message: "Customer type is required when role is CUSTOMER",
  path: ["customer_type"],
});

export type UserFormData = z.infer<typeof userSchema>;

// For the "Create/Edit Vehicle" form - FIXED: Use z.number() instead of z.coerce.number()
export const vehicleSchema = z.object({
  license_plate: z.string()
    .min(2, { message: "License plate is required." })
    .max(20, { message: "License plate cannot exceed 20 characters." }),
  make: z.string()
    .min(2, { message: "Make is required." })
    .max(50, { message: "Make cannot exceed 50 characters." }),
  model: z.string()
    .min(2, { message: "Model is required." })
    .max(50, { message: "Model cannot exceed 50 characters." }),
  year: z.number()
    .min(1900, { message: "Year must be 1900 or later." })
    .max(new Date().getFullYear() + 1, { message: "Year cannot be in the future." }),
  capacity_kg: z.number()
    .min(1, { message: "Capacity must be at least 1 kg." })
    .max(50000, { message: "Capacity cannot exceed 50,000 kg." }),
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
  cargo_description: z.string()
    .min(10, { message: "Please provide a detailed description of the cargo (at least 10 characters)." })
    .max(500, { message: "Cargo description cannot exceed 500 characters." }),
  pickup_address: z.string()
    .min(5, { message: "Pickup address is required." })
    .max(200, { message: "Pickup address cannot exceed 200 characters." }),
  pickup_city: z.string()
    .min(2, { message: "Pickup city is required." })
    .max(50, { message: "Pickup city cannot exceed 50 characters." }),
  pickup_contact_person: z.string()
    .min(2, { message: "Contact person is required." })
    .max(100, { message: "Contact person name cannot exceed 100 characters." }),
  pickup_contact_phone: z.string()
    .min(10, { message: "A valid phone number is required." })
    .max(20, { message: "Phone number cannot exceed 20 characters." }),
  delivery_address: z.string()
    .min(5, { message: "Delivery address is required." })
    .max(200, { message: "Delivery address cannot exceed 200 characters." }),
  delivery_city: z.string()
    .min(2, { message: "Delivery city is required." })
    .max(50, { message: "Delivery city cannot exceed 50 characters." }),
  delivery_contact_person: z.string()
    .min(2, { message: "Contact person is required." })
    .max(100, { message: "Contact person name cannot exceed 100 characters." }),
  delivery_contact_phone: z.string()
    .min(10, { message: "A valid phone number is required." })
    .max(20, { message: "Phone number cannot exceed 20 characters." }),
  requested_pickup_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please select a valid date and time.",
  }),
});
export type JobFormData = z.infer<typeof jobSchema>;

// For the "Create Driver" composite form
export const driverSchema = z.object({
  // User fields
  first_name: z.string()
    .min(2, { message: "First name must be at least 2 characters." })
    .max(50, { message: "First name cannot exceed 50 characters." }),
  last_name: z.string()
    .min(2, { message: "Last name must be at least 2 characters." })
    .max(50, { message: "Last name cannot exceed 50 characters." }),
  email: z.string()
    .email({ message: "Please enter a valid email address." })
    .max(100, { message: "Email cannot exceed 100 characters." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(128, { message: "Password cannot exceed 128 characters." }),

  // Driver profile fields
  license_number: z.string()
    .min(3, { message: "License number is required." })
    .max(20, { message: "License number cannot exceed 20 characters." }),
  phone_number: z.string()
    .min(10, { message: "A valid phone number is required." })
    .max(20, { message: "Phone number cannot exceed 20 characters." }),
});

export type DriverFormData = z.infer<typeof driverSchema>;

// Optional: Add a login schema if needed
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;