// frontend/app/(dashboard)/fleet/vehicles/VehicleForm.tsx
"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { vehicleSchema, VehicleFormData } from "@/lib/validators";
import { Vehicle } from "@/types";

import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleFormProps {
  onSuccess: () => void;
  initialData?: Vehicle | null;
}

export function VehicleForm({ onSuccess, initialData }: VehicleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData || {
      license_plate: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      capacity_kg: 1000,
      status: "AVAILABLE",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  async function onSubmit(values: VehicleFormData) {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await apiClient.put(`/vehicles/${initialData!.id}/`, values);
      } else {
        await apiClient.post("/vehicles/", values);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save vehicle:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="license_plate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Plate</FormLabel>
              <FormControl><Input placeholder="e.g., ABC-123" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl><Input placeholder="e.g., Ford" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl><Input placeholder="e.g., Transit" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity_kg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (kg)</FormLabel>
                <FormControl><Input type="number" step="10" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="IN_USE">In Use</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Changes" : "Create Vehicle")}
        </Button>
      </form>
    </Form>
  );
}