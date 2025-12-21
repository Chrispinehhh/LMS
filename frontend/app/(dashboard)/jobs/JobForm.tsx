"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema, JobFormData } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import apiClient from "@/lib/api";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { BackendUser, PaginatedResponse } from "@/types";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Briefcase,
  Info,
  Building2,
  Home,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from "lucide-react";

interface JobFormProps {
  onSuccess: () => void;
}

type CustomersResponse =
  | BackendUser[]
  | PaginatedResponse<BackendUser>;

function extractCustomers(data: CustomersResponse | null): BackendUser[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ('results' in data && Array.isArray(data.results)) return data.results;
  return [];
}

const STEPS = [
  { id: 1, title: 'Classification', description: 'Job Type & Client', icon: Briefcase },
  { id: 2, title: 'Route', description: 'Pickup & Delivery', icon: MapPin },
  { id: 3, title: 'Cargo', description: 'Item Details', icon: Package },
  { id: 4, title: 'Billing', description: 'Pricing Model', icon: DollarSign },
];

export default function JobForm({ onSuccess }: JobFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: customersResponse, isLoading: isLoadingCustomers } = useApi<CustomersResponse>('/users/?role=CUSTOMER');
  const customers = extractCustomers(customersResponse);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      customer_id: "",
      job_type: "COMMERCIAL",
      pricing_model: "FLAT_RATE",
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
      is_hazardous: false,
      bol_number: "",
      estimated_items: "",
    },
  });

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof JobFormData)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['job_type', 'customer_id'];
        break;
      case 2:
        fieldsToValidate = [
          'pickup_address', 'pickup_city', 'requested_pickup_date',
          'pickup_contact_person', 'pickup_contact_phone',
          'delivery_address', 'delivery_city',
          'delivery_contact_person', 'delivery_contact_phone'
        ];
        break;
      case 3:
        fieldsToValidate = ['cargo_description'];
        // Add conditional fields if needed, though zod handles type specific requirements
        break;
      case 4:
        fieldsToValidate = ['pricing_model'];
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setDirection(1);
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  async function onSubmit(values: JobFormData) {
    setIsSubmitting(true);
    setError(null);

    // Prepare payload
    const payload: any = { ...values };

    // Handle estimated_items parsing
    if (values.estimated_items) {
      try {
        payload.estimated_items = JSON.parse(values.estimated_items);
      } catch (e) {
        payload.estimated_items = { "description": values.estimated_items };
      }
    }

    try {
      await apiClient.post('/jobs/', payload);
      toast.success("Job created successfully!");
      form.reset();
      onSuccess();
    } catch (err: unknown) {
      console.error("Failed to create job:", err);
      let errorMessage = "Failed to create job.";
      if (err instanceof AxiosError) {
        const errorData = err.response?.data;
        if (typeof errorData === 'object') {
          // Simplified error extraction
          if (errorData.detail) errorMessage = errorData.detail;
          else errorMessage = JSON.stringify(errorData);
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
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

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="relative after:absolute after:inset-x-0 after:top-1/2 after:-translate-y-1/2 after:h-0.5 after:bg-gray-200 dark:after:bg-gray-800 after:-z-10">
          <div className="relative z-10 flex justify-between">
            {STEPS.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white dark:bg-gray-900
                      ${isCompleted || isCurrent
                        ? 'border-emerald-500 text-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]'
                        : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600'}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <div className={`text-sm font-semibold ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-2xl p-6 sm:p-8 shadow-xl"
            >
              {/* Step 1: Classification */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project Classification</h2>
                    <p className="text-gray-500 dark:text-gray-400">Define the type of job and assign a client to get started.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      name="job_type"
                      control={form.control}
                      render={({ field }) => (
                        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div
                            onClick={() => {
                              field.onChange('RESIDENTIAL');
                              form.setValue('pricing_model', 'HOURLY');
                            }}
                            className={`
                              relative p-6 rounded-xl cursor-pointer transition-all duration-200 border-2
                              flex flex-col items-center justify-center text-center gap-3 group
                              ${field.value === 'RESIDENTIAL'
                                ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10'
                                : 'border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 bg-white dark:bg-gray-800'}
                            `}
                          >
                            <Home className={`w-10 h-10 ${field.value === 'RESIDENTIAL' ? 'text-purple-600' : 'text-gray-400'}`} />
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">Residential Move</div>
                              <div className="text-xs text-gray-500">Home relocation services</div>
                            </div>
                            {field.value === 'RESIDENTIAL' && (
                              <div className="absolute top-3 right-3 text-purple-600">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          <div
                            onClick={() => {
                              field.onChange('COMMERCIAL');
                              form.setValue('pricing_model', 'FLAT_RATE');
                            }}
                            className={`
                              relative p-6 rounded-xl cursor-pointer transition-all duration-200 border-2
                              flex flex-col items-center justify-center text-center gap-3 group
                              ${field.value === 'COMMERCIAL'
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                                : 'border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-gray-800'}
                            `}
                          >
                            <Building2 className={`w-10 h-10 ${field.value === 'COMMERCIAL' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">Commercial Freight</div>
                              <div className="text-xs text-gray-500">Business logistics & transport</div>
                            </div>
                            {field.value === 'COMMERCIAL' && (
                              <div className="absolute top-3 right-3 text-blue-600">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    />

                    <div className="col-span-2">
                      <FormField
                        name="customer_id"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Client</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCustomers}>
                              <FormControl>
                                <SelectTrigger className="h-14 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center">
                                    <User className="w-5 h-5 mr-3 text-gray-400" />
                                    <SelectValue placeholder={isLoadingCustomers ? "Loading customers..." : "Select Key Account"} />
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customers?.map(customer => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    <div className="flex flex-col text-left">
                                      <span className="font-medium">{customer.first_name} {customer.last_name}</span>
                                      <span className="text-xs text-gray-500">{customer.email}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Route */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Route Information</h2>
                    <p className="text-gray-500 dark:text-gray-400">Specify pickup and delivery locations and schedule.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pickup Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Origin (Pickup)</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          name="pickup_address"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Origin St" {...field} className="h-12 bg-gray-50 dark:bg-gray-800/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            name="pickup_city"
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="City" {...field} className="bg-gray-50 dark:bg-gray-800/50" />
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
                                <FormLabel>Date & Time</FormLabel>
                                <FormControl>
                                  <Input type="datetime-local" {...field} className="bg-gray-50 dark:bg-gray-800/50" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            name="pickup_contact_person"
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Site Contact" {...field} className="bg-gray-50 dark:bg-gray-800/50" />
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
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 (555)..." {...field} className="bg-gray-50 dark:bg-gray-800/50" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delivery Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Destination (Delivery)</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          name="delivery_address"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="456 Destination Blvd" {...field} className="h-12 bg-gray-50 dark:bg-gray-800/50" />
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
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="City" {...field} className="bg-gray-50 dark:bg-gray-800/50" />
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
                                <FormLabel>Contact Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Recipient" {...field} className="bg-gray-50 dark:bg-gray-800/50" />
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
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 (555)..." {...field} className="bg-gray-50 dark:bg-gray-800/50" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Cargo */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cargo Manifest</h2>
                    <p className="text-gray-500 dark:text-gray-400">Detailed inventory and shipment specifications.</p>
                  </div>

                  <FormField
                    name="cargo_description"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the cargo..."
                            {...field}
                            className="min-h-[120px] resize-none bg-gray-50 dark:bg-gray-800/50 text-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                    {form.watch('job_type') === 'RESIDENTIAL' ? (
                      <>
                        <FormField
                          name="room_count"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Room Count</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="bg-gray-50 dark:bg-gray-800/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="crew_size"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Required Crew</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="bg-gray-50 dark:bg-gray-800/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="sm:col-span-2">
                          <FormField
                            name="estimated_items"
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inventory (JSON)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder='{"sofa": 1, "boxes": 12}' {...field} className="font-mono text-sm bg-gray-50 dark:bg-gray-800/50" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <FormField
                          name="pallet_count"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pallet Count</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="bg-gray-50 dark:bg-gray-800/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="weight_lbs"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Weight (lbs)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="bg-gray-50 dark:bg-gray-800/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="bol_number"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>BOL Number</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-gray-50 dark:bg-gray-800/50" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="is_hazardous"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20">
                              <div className="space-y-0.5">
                                <FormLabel className="text-red-900 dark:text-red-200">Hazardous Material</FormLabel>
                              </div>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  className="data-[state=checked]:bg-red-600 border-red-300"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Billing */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Billing & Finalize</h2>
                    <p className="text-gray-500 dark:text-gray-400">Configure pricing and create the job order.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/30 p-6 rounded-xl border border-gray-100 dark:border-gray-700/50">
                    <FormField
                      name="pricing_model"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="mb-6">
                          <FormLabel>Pricing Model</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-gray-800 h-12">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {form.watch('job_type') === 'RESIDENTIAL' && (
                                <SelectItem value="HOURLY">Hourly Rate + Travel</SelectItem>
                              )}
                              {form.watch('job_type') === 'COMMERCIAL' && (
                                <>
                                  <SelectItem value="FLAT_RATE">Flat Lane Rate</SelectItem>
                                  <SelectItem value="CWT">CWT (Per 100 lbs)</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {form.watch('pricing_model') === 'HOURLY' && (
                        <>
                          <FormField
                            name="hourly_rate"
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hourly Rate ($)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="bg-white dark:bg-gray-800" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            name="travel_fee"
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Travel Fee ($)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="bg-white dark:bg-gray-800" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {form.watch('pricing_model') === 'FLAT_RATE' && (
                        <FormField
                          name="flat_rate"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Flat Rate Amount ($)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="bg-white dark:bg-gray-800 text-lg font-semibold" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {form.watch('pricing_model') === 'CWT' && (
                        <FormField
                          name="cwt_rate"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Rate per 100 lbs ($)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="bg-white dark:bg-gray-800" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8 max-w-5xl mx-auto px-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 h-12 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
              >
                Next Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-500 text-white px-8 h-12 rounded-full font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Job Order
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}