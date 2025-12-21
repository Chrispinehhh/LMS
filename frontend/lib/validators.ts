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

  // Core Type
  job_type: z.enum(['RESIDENTIAL', 'COMMERCIAL']),

  // Metrics
  room_count: z.number().optional(),
  volume_cf: z.number().optional(),
  estimated_items: z.string().optional(), // Input as text/JSON string
  crew_size: z.number().optional(),

  pallet_count: z.number().optional(),
  weight_lbs: z.number().optional(),
  is_hazardous: z.boolean().optional(),
  bol_number: z.string().optional(),

  // Pricing
  pricing_model: z.enum(['HOURLY', 'FLAT_RATE', 'CWT']),
  hourly_rate: z.number().optional(),
  travel_fee: z.number().optional(),
  cwt_rate: z.number().optional(),
  flat_rate: z.number().optional(),

  // Common Fields
  cargo_description: z.string()
    .min(10, { message: "Please provide a detailed description (at least 10 chars)." })
    .max(500, { message: "Description cannot exceed 500 characters." }),
  pickup_address: z.string().min(5, "Pickup address is required."),
  pickup_city: z.string().min(2, "Pickup city is required."),
  pickup_contact_person: z.string().min(2, "Contact person is required."),
  pickup_contact_phone: z.string().min(10, "Valid phone number is required."),
  delivery_address: z.string().min(5, "Delivery address is required."),
  delivery_city: z.string().min(2, "Delivery city is required."),
  delivery_contact_person: z.string().min(2, "Contact person is required."),
  delivery_contact_phone: z.string().min(10, "Valid phone number is required."),
  requested_pickup_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please select a valid date and time.",
  }),
}).superRefine((data, ctx) => {
  // Residential Validation
  if (data.job_type === 'RESIDENTIAL') {
    if (!data.room_count || data.room_count < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Room count is required for Residential jobs.",
        path: ["room_count"],
      });
    }
    // Residential defaults to Hourly usually, but we check if model is HOURLY
    if (data.pricing_model === 'HOURLY') {
      if (!data.hourly_rate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Hourly rate is required.", path: ["hourly_rate"] });
      }
      if (!data.travel_fee) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Travel fee is required.", path: ["travel_fee"] });
      }
    }
  }

  // Commercial Validation
  if (data.job_type === 'COMMERCIAL') {
    if ((!data.pallet_count || data.pallet_count < 1) && (!data.weight_lbs || data.weight_lbs < 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either Pallet Count or Weight is required for Commercial jobs.",
        path: ["pallet_count"],
      });
    }

    if (data.pricing_model === 'FLAT_RATE' && !data.flat_rate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Flat rate is required.", path: ["flat_rate"] });
    }
    if (data.pricing_model === 'CWT' && !data.cwt_rate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CWT rate is required.", path: ["cwt_rate"] });
    }
  }
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