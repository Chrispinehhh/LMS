"use client";

import React, { useState } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingSchema, BookingFormData } from '@/lib/validators';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, CheckCircle, Package, MapPin, Building2, Home, Layers, AlertTriangle, Hash } from 'lucide-react';
import AuthModal from '@/components/Auth/AuthModal';
import { PremiumCard } from '@/components/shared/PremiumCard';
import { Checkbox } from '@/components/ui/checkbox';

const steps = [
  { id: 1, name: 'Job Type', icon: Layers },
  { id: 2, name: 'Service', icon: Package },
  { id: 3, name: 'Metrics', icon: Hash },
  { id: 4, name: 'Logistics', icon: MapPin },
  { id: 5, name: 'Confirm', icon: CheckCircle },
];

export default function EnhancedBookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [direction, setDirection] = useState(0);
  const { backendUser } = useAuth();
  const router = useRouter();

  const methods = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: 'onTouched',
    defaultValues: {
      job_type: undefined,
      service_type: undefined,
      cargo_description: "",
      // Residential defaults
      room_count: 0,
      volume_cf: 0,
      crew_size: 0,
      // Commercial defaults
      weight_lbs: 0,
      pallet_count: 0,
      is_hazardous: false,
      // Location defaults
      pickup_address: "",
      pickup_city: "",
      pickup_contact_person: "",
      pickup_contact_phone: "",
      delivery_address: "",
      delivery_city: "",
      delivery_contact_person: "",
      delivery_contact_phone: "",
      requested_pickup_date: "",
    } as any,
  });

  const { trigger, getValues, watch } = methods;
  const jobType = watch('job_type');

  const nextStep = async () => {
    const fieldsToValidate = getStepFields(currentStep);
    if (fieldsToValidate.length > 0) {
      const output = await trigger(fieldsToValidate);
      if (!output) return;
    }

    if (currentStep === 4) {
      // Calculate estimate before confirmation
      await calculateEstimate();
    }

    if (currentStep < steps.length) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepFields = (step: number): (keyof BookingFormData)[] => {
    switch (step) {
      case 1: return ['job_type'];
      case 2: return ['service_type', 'cargo_description'];
      case 3:
        if (jobType === 'RESIDENTIAL') {
          return ['room_count'];
        } else if (jobType === 'COMMERCIAL') {
          return ['weight_lbs'];
        }
        return [];
      case 4: return ['pickup_address', 'pickup_city', 'pickup_contact_person', 'pickup_contact_phone',
        'delivery_address', 'delivery_city', 'delivery_contact_person', 'delivery_contact_phone', 'requested_pickup_date'];
      default: return [];
    }
  };

  const calculateEstimate = async () => {
    const values = getValues();
    try {
      const response = await apiClient.post('/quotes/calculate/', {
        origin: values.pickup_city,
        destination: values.delivery_city,
        job_type: values.job_type,
        service_type: values.service_type,
        weight: values.job_type === 'RESIDENTIAL' ? undefined : values.weight_lbs,
        room_count: values.job_type === 'RESIDENTIAL' ? values.room_count : undefined,
        pallet_count: values.job_type === 'COMMERCIAL' ? values.pallet_count : undefined,
      });
      setEstimatedPrice(parseFloat(response.data.estimated_price));
    } catch (error) {
      console.error('Failed to get estimate:', error);
      setEstimatedPrice(299.99); // Fallback
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!backendUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await apiClient.post('/book/', data);
      toast.success('Booking submitted successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit booking');
    }
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4">
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}

      <div className="container mx-auto max-w-3xl">
        <FormProvider {...methods}>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Book a Shipment</h1>
            <p className="text-muted-foreground">Complete all fields for an accurate quote</p>
          </div>

          {/* Stepper */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-4">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                      ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                        isActive ? 'bg-primary border-primary text-white shadow-lg scale-110' :
                          'bg-white dark:bg-slate-900 border-gray-200 text-gray-400'}`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <PremiumCard className="p-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              >
                {currentStep === 1 && <JobTypeStep />}
                {currentStep === 2 && <ServiceStep />}
                {currentStep === 3 && <MetricsStep />}
                {currentStep === 4 && <LogisticsStep />}
                {currentStep === 5 && <ConfirmStep price={estimatedPrice} onSubmit={methods.handleSubmit(onSubmit)} />}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <Button onClick={prevStep} disabled={currentStep === 1} variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              {currentStep < steps.length && (
                <Button onClick={nextStep} size="lg">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </PremiumCard>
        </FormProvider>
      </div>
    </div>
  );
}

// Step Components
function JobTypeStep() {
  const { control } = useFormContext<BookingFormData>();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Job Type</h2>
        <p className="text-muted-foreground">Choose between residential or commercial service</p>
      </div>

      <FormField
        control={control}
        name="job_type"
        render={({ field }) => (
          <FormItem>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'RESIDENTIAL', icon: Home, label: 'Residential', desc: 'Home moving services' },
                { value: 'COMMERCIAL', icon: Building2, label: 'Commercial', desc: 'Business freight' }
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => field.onChange(type.value)}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${field.value === type.value
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-gray-200 dark:border-gray-800 hover:border-primary/50'
                      }`}
                  >
                    <Icon className={`w-12 h-12 mx-auto mb-3 ${field.value === type.value ? 'text-primary' : 'text-gray-400'}`} />
                    <h3 className="font-semibold text-lg mb-1">{type.label}</h3>
                    <p className="text-sm text-muted-foreground">{type.desc}</p>
                  </button>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function ServiceStep() {
  const { control, watch } = useFormContext<BookingFormData>();
  const jobType = watch('job_type');

  const services = jobType === 'RESIDENTIAL'
    ? [
      { value: 'RESIDENTIAL_MOVING', label: 'Full Home Moving', desc: 'Complete moving service with crew' },
      { value: 'SMALL_DELIVERIES', label: 'Small Delivery', desc: 'Few items or boxes' }
    ]
    : [
      { value: 'OFFICE_RELOCATION', label: 'Office Relocation', desc: 'Business asset transport' },
      { value: 'PALLET_DELIVERY', label: 'Pallet Delivery', desc: 'Warehouse freight' }
    ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Service Type</h2>
        <p className="text-muted-foreground">Choose your specific service</p>
      </div>

      <FormField
        control={control}
        name="service_type"
        render={({ field }) => (
          <FormItem>
            <div className="grid grid-cols-1 gap-4">
              {services.map((service) => (
                <button
                  key={service.value}
                  type="button"
                  onClick={() => field.onChange(service.value)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${field.value === service.value
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 dark:border-gray-800'
                    }`}
                >
                  <h3 className="font-semibold text-lg mb-1">{service.label}</h3>
                  <p className="text-sm text-muted-foreground">{service.desc}</p>
                </button>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="cargo_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cargo Description</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Describe your items..." rows={4} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function MetricsStep() {
  const { control, watch } = useFormContext<BookingFormData>();
  const jobType = watch('job_type');

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job Metrics</h2>
        <p className="text-muted-foreground">Provide details for accurate pricing</p>
      </div>

      {jobType === 'RESIDENTIAL' ? (
        <>
          <FormField
            control={control}
            name="room_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Rooms</FormLabel>
                <FormControl>
                  <Input type="number" value={field.value || 0} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} placeholder="e.g., 3" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="crew_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Crew Size (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" value={field.value || 0} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} placeholder="e.g., 2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ) : (
        <>
          <FormField
            control={control}
            name="weight_lbs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (lbs)</FormLabel>
                <FormControl>
                  <Input type="number" value={field.value || 0} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} placeholder="e.g., 1500" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="pallet_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pallet Count (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" value={field.value || 0} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} placeholder="e.g., 4" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="is_hazardous"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-3 space-y-0 p-4 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/10">
                <FormControl>
                  <Checkbox checked={field.value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.checked)} />
                </FormControl>
                <div className="flex-1">
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Hazardous Material
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">Check if shipment contains hazardous materials</p>
                </div>
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
}

function LogisticsStep() {
  const { control } = useFormContext<BookingFormData>();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Logistics Details</h2>
        <p className="text-muted-foreground">Pickup and delivery information</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Pickup Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={control} name="pickup_address" render={({ field }) => (
            <FormItem className="col-span-2"><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="pickup_city" render={({ field }) => (
            <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="pickup_contact_person" render={({ field }) => (
            <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="pickup_contact_phone" render={({ field }) => (
            <FormItem className="col-span-2"><FormLabel>Phone</FormLabel><FormControl><Input {...field} type="tel" /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Delivery Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={control} name="delivery_address" render={({ field }) => (
            <FormItem className="col-span-2"><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="delivery_city" render={({ field }) => (
            <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="delivery_contact_person" render={({ field }) => (
            <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={control} name="delivery_contact_phone" render={({ field }) => (
            <FormItem className="col-span-2"><FormLabel>Phone</FormLabel><FormControl><Input {...field} type="tel" /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
      </div>

      <FormField control={control} name="requested_pickup_date" render={({ field }) => (
        <FormItem><FormLabel>Requested Pickup Date</FormLabel><FormControl><Input {...field} type="datetime-local" /></FormControl><FormMessage /></FormItem>
      )} />
    </div>
  );
}

function ConfirmStep({ price, onSubmit }: { price: number | null; onSubmit: () => void }) {
  const { getValues } = useFormContext<BookingFormData>();
  const values = getValues();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Confirm Booking</h2>
        <p className="text-muted-foreground">Review your details before submitting</p>
      </div>

      {price && (
        <div className="bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Estimated Price</p>
          <p className="text-4xl font-bold text-primary">${price.toFixed(2)}</p>
        </div>
      )}

      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <span className="text-muted-foreground">Job Type:</span>
          <span className="font-medium">{values.job_type}</span>
          <span className="text-muted-foreground">Service:</span>
          <span className="font-medium">{values.service_type}</span>
          <span className="text-muted-foreground">From:</span>
          <span className="font-medium">{values.pickup_city}</span>
          <span className="text-muted-foreground">To:</span>
          <span className="font-medium">{values.delivery_city}</span>
        </div>
      </div>

      <Button onClick={onSubmit} size="lg" className="w-full">
        <CheckCircle className="w-5 h-5 mr-2" /> Confirm Booking
      </Button>
    </div>
  );
}