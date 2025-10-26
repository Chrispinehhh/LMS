"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, UserFormData } from "@/lib/validators";
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
import apiClient from "@/lib/api";
import { useState } from "react";
import { AxiosError } from "axios";

interface UserFormProps {
  onSuccess: () => void;
}

export function UserForm({ onSuccess }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "CUSTOMER",
      customer_type: "ONE_TIME", // Default customer type
    },
  });

  // Watch the role field to conditionally show customer type
  const selectedRole = useWatch({
    control: form.control,
    name: "role",
  });

  const isCustomerRole = selectedRole === "CUSTOMER";

  async function onSubmit(values: UserFormData) {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Only include customer_type if role is CUSTOMER
      const submitData = {
        ...values,
        customer_type: isCustomerRole ? values.customer_type : undefined,
      };
      
      await apiClient.post('/users/create/', submitData);
      console.log("User created successfully!");
      form.reset();
      onSuccess();
    } catch (err: unknown) {
      console.error("Failed to create user:", err);

      if (err instanceof AxiosError) {
        if (err.response?.data) {
          const errorData = err.response.data;
          
          if (typeof errorData === 'object') {
            const fieldErrors = Object.values(errorData).flat();
            if (fieldErrors.length > 0) {
              setError(fieldErrors.join(', '));
            } else {
              setError("An error occurred while creating the user.");
            }
          } 
          else if (typeof errorData === 'string') {
            setError(errorData);
          }
          else if (errorData.error && typeof errorData.error === 'string') {
            setError(errorData.error);
          } else {
            setError("An error occurred while creating the user.");
          }
        } else if (err.request) {
          setError("Unable to connect to the server. Please try again.");
        } else {
          setError("An unexpected error occurred.");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <FormField 
          name="role" 
          control={form.control} 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="DRIVER">Driver</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        {/* Conditionally show customer type field */}
        {isCustomerRole && (
          <FormField 
            name="customer_type" 
            control={form.control} 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ONE_TIME">One Time</SelectItem>
                    <SelectItem value="REGULAR">Regular</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} 
          />
        )}
        
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
            {isSubmitting ? "Creating User..." : "Create User"}
          </Button>
        </div>
      </form>
    </Form>
  );
}