// frontend/app/(dashboard)/products/ProductForm.tsx
"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod"; // Import all of zod as z

import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// 1. Define the validation schema using 'z' directly
const formSchema = z.object({
  sku: z.string().min(3, { message: "SKU must be at least 3 characters." }),
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().optional(),
  weight_kg: z.coerce.number().min(0).optional(),
});

// Define the shape of a Product object for initialData
interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  weight_kg?: number | null;
}

interface ProductFormProps {
  onSuccess: () => void;
  initialData?: Product | null;
}

export function ProductForm({ onSuccess, initialData }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  // 2. Infer the type from the schema
  type FormValues = z.infer<typeof formSchema>;

  // 3. Define the form with the correct resolver and types
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: initialData?.sku || "",
      name: initialData?.name || "",
      description: initialData?.description || "",
      weight_kg: initialData?.weight_kg || undefined,
    },
  });

  useEffect(() => {
    form.reset({
      sku: initialData?.sku || "",
      name: initialData?.name || "",
      description: initialData?.description || "",
      weight_kg: initialData?.weight_kg || undefined,
    });
  }, [initialData, form]);

  // 4. This is the official pattern for the submit handler
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await apiClient.put(`/products/${initialData.id}/`, values);
      } else {
        await apiClient.post("/products/", values);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      {/* 5. The handler is passed directly to the form component */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input placeholder="e.g., LAPTOP-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="14-inch Business Laptop" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Product details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="weight_kg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg, Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="1.5"
                  {...field}
                  // Ensure controlled component behavior
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value)}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Changes" : "Create Product")}
        </Button>
      </form>
    </Form>
  );
}