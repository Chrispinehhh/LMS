import { z } from 'zod';

// Base fields shared by both types
const baseJobFields = {
    cargo_description: z.string().min(10, "Please provide a more detailed description (at least 10 chars)."),

    // Pickup fields
    pickup_address: z.string().min(5, "Pickup address is required."),
    pickup_city: z.string().min(2, "Pickup city is required."),
    pickup_contact_person: z.string().min(2, "Contact name required."),
    pickup_contact_phone: z.string().min(10, "Valid phone number required."),

    // Delivery fields
    delivery_address: z.string().min(5, "Delivery address is required."),
    delivery_city: z.string().min(2, "Delivery city is required."),
    delivery_contact_person: z.string().min(2, "Contact name required."),
    delivery_contact_phone: z.string().min(10, "Valid phone number required."),

    requested_pickup_date: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
        message: "Please select a valid date and time.",
    }),
};

// Residential job schema
const residentialJobSchema = z.object({
    job_type: z.literal('RESIDENTIAL'),
    service_type: z.enum(['RESIDENTIAL_MOVING', 'SMALL_DELIVERIES']),

    // Residential-specific metrics
    room_count: z.number().min(1, "At least 1 room required").max(20, "Maximum 20 rooms"),
    volume_cf: z.number().positive().optional(),
    estimated_items: z.record(z.string(), z.number()).optional(),
    crew_size: z.number().min(1).max(10).optional(),

    // Pricing (optional for customers, filled by system)
    pricing_model: z.enum(['HOURLY', 'FLAT_RATE']).optional(),
    hourly_rate: z.number().positive().optional(),
    travel_fee: z.number().positive().optional(),
    flat_rate: z.number().positive().optional(),

    ...baseJobFields,
});

// Commercial job schema
const commercialJobSchema = z.object({
    job_type: z.literal('COMMERCIAL'),
    service_type: z.enum(['OFFICE_RELOCATION', 'PALLET_DELIVERY']),

    // Commercial-specific metrics
    pallet_count: z.number().min(1).optional(),
    weight_lbs: z.number().min(1, "Weight is required for commercial jobs"),
    is_hazardous: z.boolean().default(false),
    bol_number: z.string().optional(),

    // Pricing (optional for customers, filled by system)
    pricing_model: z.enum(['FLAT_RATE', 'CWT', 'HOURLY']).optional(),
    cwt_rate: z.number().positive().optional(),
    flat_rate: z.number().positive().optional(),
    hourly_rate: z.number().positive().optional(),

    ...baseJobFields,
});

// Discriminated union for complete validation
export const bookingSchema = z.discriminatedUnion('job_type', [
    residentialJobSchema,
    commercialJobSchema,
]);

export type BookingFormData = z.infer<typeof bookingSchema>;

// Export individual schemas for step validation
export { residentialJobSchema, commercialJobSchema };
