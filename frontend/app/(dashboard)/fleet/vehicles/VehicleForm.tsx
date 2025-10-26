// frontend/app/(dashboard)/fleet/vehicles/VehicleForm.tsx
"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { vehicleSchema, VehicleFormData } from "@/lib/validators";
import { Vehicle } from "@/types";
import apiClient from "@/lib/api";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

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
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!initialData;

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
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
      // Convert the initial data to match the form data type
      form.reset({
        license_plate: initialData.license_plate,
        make: initialData.make,
        model: initialData.model,
        year: initialData.year,
        capacity_kg: initialData.capacity_kg,
        status: initialData.status,
      });
    }
  }, [initialData, form]);

  async function onSubmit(values: VehicleFormData) {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (isEditMode) {
        // CORRECT ENDPOINT for editing
        await apiClient.put(`/transportation/vehicles/${initialData!.id}/`, values);
        toast.success("Vehicle updated successfully!");
      } else {
        // CORRECT ENDPOINT for creating
        await apiClient.post("/transportation/vehicles/", values);
        toast.success("Vehicle created successfully!");
      }
      form.reset();
      onSuccess();
    } catch (err: unknown) {
      console.error("Failed to save vehicle:", err);
      
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} vehicle.`;
      
      if (err instanceof AxiosError) {
        const errorData = err.response?.data;
        
        // Handle different error formats from Django/DRF
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              }
              return `${field}: ${messages}`;
            })
            .join('; ');
          
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
          // Handle nested errors
          else if (errorData.error && typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          }
          // Handle non-field errors
          else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
            errorMessage = errorData.non_field_errors[0];
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        
        // Network errors
        if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
          errorMessage = "Unable to connect to the server. Please try again.";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
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
              <FormControl>
                <Input 
                  placeholder="e.g., ABC-123" 
                  {...field} 
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
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
                <FormControl>
                  <Input placeholder="e.g., Ford" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input placeholder="e.g., Transit" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input 
                    type="number" 
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
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
                <FormControl>
                  <Input 
                    type="number" 
                    step="10" 
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
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
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
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
        
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        <div className="flex gap-3 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()} 
            disabled={isSubmitting}
            className="flex-1"
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="flex-1"
          >
            {isSubmitting 
              ? (isEditMode ? "Saving..." : "Creating...") 
              : (isEditMode ? "Save Changes" : "Create Vehicle")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}