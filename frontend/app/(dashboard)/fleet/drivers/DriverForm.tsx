// frontend/app/(dashboard)/fleet/drivers/DriverForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { driverSchema, DriverFormData } from "@/lib/validators";
import apiClient from "@/lib/api";
import { toast } from "react-hot-toast";

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

      // Step 2: Create the Driver profile linked to the new user
      await apiClient.post('/drivers/', {
        user_id: newUserId,
        license_number: values.license_number,
        phone_number: values.phone_number,
      });

      toast.success("Driver created successfully!");
      onSuccess();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to create driver:", err);
      const errorMessage = err.response?.data?.email?.[0] || err.response?.data?.error || "An unknown error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
      // NOTE: A real production app would need logic to delete the created user
      // if the driver profile creation fails (a "rollback").
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">User Account Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField name="first_name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="last_name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField name="password" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Temporary Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <h3 className="text-lg font-semibold pt-4 border-b pb-2">Driver Profile Details</h3>
        <FormField name="license_number" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>License Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField name="phone_number" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating Driver..." : "Create Driver"}
        </Button>
      </form>
    </Form>
  );
}