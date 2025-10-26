// frontend/app/(dashboard)/jobs/JobForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema, JobFormData } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import apiClient from "@/lib/api";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { BackendUser, PaginatedResponse } from "@/types";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

interface JobFormProps {
  onSuccess: () => void;
}

// Define the possible response types for customers endpoint
type CustomersResponse = 
  | BackendUser[]
  | PaginatedResponse<BackendUser>;

// Helper function to extract customers from different response formats
function extractCustomers(data: CustomersResponse | null): BackendUser[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ('results' in data && Array.isArray(data.results)) return data.results;
  return [];
}

export default function JobForm({ onSuccess }: JobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { data: customersResponse, isLoading: isLoadingCustomers } = useApi<CustomersResponse>('/users/?role=CUSTOMER');
  const customers = extractCustomers(customersResponse);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      customer_id: "",
      service_type: "SMALL_DELIVERIES",
      cargo_description: "",
      pickup_address: "",
      pickup_city: "",
      pickup_contact_person: "",
      pickup_contact_phone: "",
      delivery_address: "",
      delivery_city: "",
      delivery_contact_person: "",
      delivery_contact_phone: "",
      requested_pickup_date: "",
    },
  });

  async function onSubmit(values: JobFormData) {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await apiClient.post('/jobs/', values);
      toast.success("Job created successfully!");
      form.reset();
      onSuccess();
    } catch (err: unknown) {
      console.error("Failed to create job:", err);
      
      let errorMessage = "Failed to create job.";
      
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField 
            name="customer_id" 
            control={form.control} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCustomers}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCustomers ? "Loading customers..." : "Select a customer"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers?.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name} ({customer.email})
                      </SelectItem>
                    ))}
                    {customers?.length === 0 && !isLoadingCustomers && (
                      <SelectItem value="" disabled>No customers found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} 
          />
          
          <FormField 
            name="service_type" 
            control={form.control} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="RESIDENTIAL_MOVING">Residential Moving</SelectItem>
                    <SelectItem value="OFFICE_RELOCATION">Office Relocation</SelectItem>
                    <SelectItem value="PALLET_DELIVERY">Pallet Delivery</SelectItem>
                    <SelectItem value="SMALL_DELIVERIES">Small Deliveries</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} 
          />

          <FormField 
            name="cargo_description" 
            control={form.control} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo Description *</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="e.g., 3 standard pallets, 10 office chairs, fragile items..." 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
          
          <FormField 
            name="requested_pickup_date" 
            control={form.control} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requested Pickup Date & Time *</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    min={new Date().toISOString().slice(0, 16)}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pickup Details</h3>
          
          <FormField 
            name="pickup_address" 
            control={form.control} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Input placeholder="Street address, apartment/suite number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
          
          <FormField 
            name="pickup_city" 
            control={form.control} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input placeholder="City name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField 
              name="pickup_contact_person" 
              control={form.control} 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person *</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            
            <FormField 
              name="pickup_contact_phone" 
              control={form.control} 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Delivery Details</h3>
          
          <FormField 
            name="delivery_address" 
            control={form.control} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address *</FormLabel>
                <FormControl>
                  <Input placeholder="Street address, apartment/suite number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
          
          <FormField 
            name="delivery_city" 
            control={form.control} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input placeholder="City name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField 
              name="delivery_contact_person" 
              control={form.control} 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person *</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            
            <FormField 
              name="delivery_contact_phone" 
              control={form.control} 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>
        </div>

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
            {isSubmitting ? "Creating Job..." : "Create Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
}