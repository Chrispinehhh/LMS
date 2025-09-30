// frontend/lib/validators.ts
import { z } from 'zod';

export const warehouseSchema = z.object({
  // ... your existing warehouse schema ...
});

export type WarehouseFormData = z.infer<typeof warehouseSchema>;

// --- REPLACE THE OLD PRODUCT SCHEMA WITH THIS NEW ONE ---
export const productSchema = z.object({
  sku: z.string().min(3, { message: "SKU must be at least 3 characters." }),
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().optional(),
  
  // This is the key change. We create a pre-processing pipeline.
  weight_kg: z.preprocess(
    // The value from the form
    (val) => (String(val).trim() === '' ? undefined : Number(val)),
    // The validation to apply after pre-processing
    z.number().min(0, { message: "Weight must be a positive number." }).optional()
  ),
});

export type ProductFormData = z.infer<typeof productSchema>;