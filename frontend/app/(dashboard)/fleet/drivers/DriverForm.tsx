// frontend/app/(dashboard)/fleet/drivers/DriverForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { driverSchema, DriverFormData } from "@/lib/validators";
import apiClient from "@/lib/api";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface DriverFormProps {
  onSuccess: () => void;
}

export function DriverForm({ onSuccess }: DriverFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      license_number: "",
      phone_number: "",
    },
  });

  async function onSubmit(values: DriverFormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create the User object with DRIVER role
      const userResponse = await apiClient.post('/users/create/', {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
        role: 'DRIVER', // Hardcode the role
      });

      const newUserId = userResponse.data.id;

      // Step 2: Create the Driver profile linked to the new user - UPDATED ENDPOINT
      await apiClient.post('/transportation/drivers/', {
        user_id: newUserId,
        license_number: values.license_number,
        phone_number: values.phone_number,
      });

      toast.success("Driver created successfully!");
      form.reset();
      onSuccess();

    } catch (err: unknown) {
      console.error("Failed to create driver:", err);
      
      let errorMessage = "An unknown error occurred.";
      
      if (err instanceof AxiosError) {
        const errorData = err.response?.data;
        
        // Handle different error formats from Django/DRF
        if (typeof errorData === 'object') {
          // Handle field-specific errors (e.g., email already exists)
          if (errorData.email && Array.isArray(errorData.email)) {
            errorMessage = errorData.email[0];
          } 
          // Handle nested errors
          else if (errorData.error && typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          }
          // Handle non-field errors
          else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
            errorMessage = errorData.non_field_errors[0];
          }
          // Handle generic object with string values
          else {
            const firstError = Object.values(errorData).flat()[0];
            if (firstError && typeof firstError === 'string') {
              errorMessage = firstError;
            }
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
      
      // TODO: In a production app, consider implementing rollback logic here
      // If user creation succeeded but driver profile failed, we should delete the user
      // to maintain data consistency
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">User Account Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField 
              name="first_name" 
              control={form.control} 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              name="last_name" 
              control={form.control} 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>
          
          <FormField 
            name="email" 
            control={form.control} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
          
          <FormField 
            name="password" 
            control={form.control} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temporary Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Driver Profile Details</h3>
          <FormField 
            name="license_number" 
            control={form.control} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
          <FormField 
            name="phone_number" 
            control={form.control} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
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
            {isSubmitting ? "Creating Driver..." : "Create Driver"}
          </Button>
        </div>
      </form>
    </Form>
  );
}