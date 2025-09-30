// frontend/lib/validators.ts
import { z } from 'zod';

export const warehouseSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long." }).max(100),
  address: z.string().min(5, { message: "Address must be at least 5 characters long." }),
  city: z.string().min(2, { message: "City is required." }),
  country: z.string().min(2, { message: "Country is required." }),
});

// This creates a TypeScript type based on the schema
export type WarehouseFormData = z.infer<typeof warehouseSchema>;