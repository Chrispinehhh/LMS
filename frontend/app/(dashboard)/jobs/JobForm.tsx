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
import { BackendUser } from "@/types";
// Don't forget to import toast if you plan to use it!
// import { toast } from "react-hot-toast"; 

interface JobFormProps {
  onSuccess: () => void;
}

export function JobForm({ onSuccess }: JobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: customers, isLoading: isLoadingCustomers } = useApi<BackendUser[]>('/users/?role=CUSTOMER');

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      customer_id: undefined,
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
    try {
      await apiClient.post('/jobs/', values);
      onSuccess();
    } catch (error) {
      console.error("Failed to create job:", error);
      // Here you would add a toast.error() notification
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
        <FormField name="customer_id" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCustomers}>
                <FormControl><SelectTrigger><SelectValue placeholder={isLoadingCustomers ? "Loading customers..." : "Select a customer"} /></SelectTrigger></FormControl>
                <SelectContent>
                  {customers?.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
        )} />
        
        <FormField name="service_type" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Service Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="RESIDENTIAL_MOVING">Residential Moving</SelectItem>
                  <SelectItem value="OFFICE_RELOCATION">Office Relocation</SelectItem>
                  <SelectItem value="PALLET_DELIVERY">Pallet Delivery</SelectItem>
                  <SelectItem value="SMALL_DELIVERIES">Small Deliveries</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
        )} />

        <FormField name="cargo_description" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Cargo Description</FormLabel><FormControl><Textarea placeholder="e.g., 3 standard pallets, 10 office chairs..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        
        <FormField name="requested_pickup_date" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Requested Pickup Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <h3 className="text-lg font-semibold pt-4 border-b">Pickup Details</h3>
        <FormField name="pickup_address" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField name="pickup_city" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
            <FormField name="pickup_contact_person" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="pickup_contact_phone" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>

        <h3 className="text-lg font-semibold pt-4 border-b">Delivery Details</h3>
        <FormField name="delivery_address" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField name="delivery_city" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
            <FormField name="delivery_contact_person" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="delivery_contact_phone" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage /> {/* <-- FIX: Corrected component name and structure */}
                </FormItem>
            )} />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating Job..." : "Create Job"}
        </Button>
      </form>
    </Form>
  );
}