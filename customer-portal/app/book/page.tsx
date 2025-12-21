"use client";

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, Truck, MapPin, CheckCircle, Package, Building2, Home, Calendar, CreditCard, User, Phone } from 'lucide-react';
import AuthModal from '@/components/Auth/AuthModal';
import { PremiumCard } from '@/components/shared/PremiumCard';

const bookingSchema = z.object({
  service_type: z.enum(['RESIDENTIAL_MOVING', 'OFFICE_RELOCATION', 'PALLET_DELIVERY', 'SMALL_DELIVERIES']),
  cargo_description: z.string().min(10, "Please provide a more detailed description (at least 10 chars)."),

  // Pickup fields
  pickup_address: z.string().min(5, "Pickup address is required."),
  pickup_contact_person: z.string().min(2, { message: "Contact name required." }),
  pickup_contact_phone: z.string().min(10, { message: "Valid phone number required." }),

  // Delivery fields
  delivery_address: z.string().min(5, "Delivery address is required."),
  delivery_contact_person: z.string().min(2, { message: "Contact name required." }),
  delivery_contact_phone: z.string().min(10, { message: "Valid phone number required." }),

  requested_pickup_date: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: "Please select a valid date and time.",
  }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const steps = [
  { id: 1, name: 'Service', fields: ['service_type', 'cargo_description'] as const, icon: Package },
  { id: 2, name: 'Logistics', fields: ['pickup_address', 'pickup_contact_person', 'pickup_contact_phone', 'delivery_address', 'delivery_contact_person', 'delivery_contact_phone', 'requested_pickup_date'] as const, icon: MapPin },
  { id: 3, name: 'Confirm', icon: CheckCircle },
];

const serviceOptions = {
  RESIDENTIAL_MOVING: { name: "Residential Moving", description: "Full home moving service with crew", icon: Home },
  OFFICE_RELOCATION: { name: "Office Relocation", description: "Secure transport for business assets", icon: Building2 },
  PALLET_DELIVERY: { name: "Pallet Delivery", description: "Warehouse to warehouse freight", icon: Package },
  SMALL_DELIVERIES: { name: "Small Deliveries", description: "Quick courier for small items", icon: Truck },
};

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  const methods = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: 'onTouched',
    defaultValues: {
      service_type: undefined,
      cargo_description: "",
      pickup_address: "",
      pickup_contact_person: "",
      pickup_contact_phone: "",
      delivery_address: "",
      delivery_contact_person: "",
      delivery_contact_phone: "",
      requested_pickup_date: "",
    },
  });
  const { trigger, getValues } = methods;

  // Safe modal handling
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthModalOpen) setIsAuthModalOpen(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const nextStep = async () => {
    const fields = steps[currentStep - 1].fields;
    if (fields) {
      const output = await trigger(fields, { shouldFocus: true });
      if (!output) return;
    }

    if (currentStep === 2) {
      const values = getValues();
      let price = 50.00;
      if (values.service_type === 'RESIDENTIAL_MOVING') price += 250.00;
      if (values.service_type === 'OFFICE_RELOCATION') price += 400.00;
      if (values.service_type === 'PALLET_DELIVERY') price += 100.00;
      setEstimatedPrice(price);
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 transition-colors duration-300">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      <div className="relative z-10 container mx-auto max-w-3xl">
        <FormProvider {...methods}>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Book a Shipment</h1>
            <p className="text-muted-foreground">Get an instant quote and reliable logistics in minutes.</p>
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
                    <div className={`
                                     flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                                     ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                        isActive ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110' :
                          'bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-400'}
                                 `}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <PremiumCard className="p-0 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 shadow-2xl">
            <div className="p-8">
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
                  {currentStep === 1 && <Step1ServiceDetails />}
                  {currentStep === 2 && <Step2Location />}
                  {currentStep === 3 && (
                    <Step3Confirm
                      price={estimatedPrice}
                      onLoginRequired={() => setIsAuthModalOpen(true)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50/50 dark:bg-slate-950/50 p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              {currentStep < steps.length && (
                <Button
                  onClick={nextStep}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
                >
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </PremiumCard>
        </FormProvider>
      </div>
    </div>
  );
}

// ... Subcomponents ...

const ThemeFormField = ({ name, label, children }: { name: keyof BookingFormData, label: string, children: (field: ControllerRenderProps<BookingFormData, keyof BookingFormData>) => React.ReactNode }) => {
  const { control } = useFormContext<BookingFormData>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="mb-5">
          <FormLabel className="text-foreground font-medium text-sm flex items-center gap-2">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              {children(field)}
            </div>
          </FormControl>
          <FormMessage className="text-red-500 text-xs mt-1 font-medium" />
        </FormItem>
      )}
    />
  )
}

function Step1ServiceDetails() {
  const { setValue, watch } = useFormContext<BookingFormData>();
  const selectedService = watch('service_type');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select a Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(serviceOptions).map(([key, { name, description, icon: Icon }]) => (
            <div
              key={key}
              onClick={() => setValue('service_type', key as any, { shouldValidate: true })}
              className={`
                        cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden group
                        ${selectedService === key
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 dark:border-gray-800 hover:border-primary/50 hover:shadow-sm bg-white dark:bg-slate-950'}
                    `}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${selectedService === key ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:text-primary transition-colors'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-bold ${selectedService === key ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
              {selectedService === key && (
                <div className="absolute top-2 right-2 text-primary">
                  <CheckCircle className="w-5 h-5 fill-primary/20" />
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Hidden select for hook form registration if needed, or just let custom onClick handle it */}
        <div className="h-0 overflow-hidden">
          <ThemeFormField name="service_type" label="">
            {(field) => <Input {...field} />}
          </ThemeFormField>
        </div>
      </div>

      <ThemeFormField name="cargo_description" label="Cargo Description">
        {(field) => (
          <Textarea
            rows={4}
            placeholder="Describe your items in detail (e.g. '1 large oak dining table, 6 chairs, 10 medium boxes')"
            {...field}
            className="bg-white dark:bg-slate-950 border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-primary/20 resize-none"
          />
        )}
      </ThemeFormField>
    </div>
  );
}

function Step2Location() {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Pickup Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Pickup Details</h3>
          </div>

          <ThemeFormField name="pickup_address" label="Address">
            {(field) => <Input placeholder="123 Pickup St, City, Country" {...field} className="h-11 bg-white dark:bg-slate-950" />}
          </ThemeFormField>

          <div className="grid grid-cols-2 gap-3">
            <ThemeFormField name="pickup_contact_person" label="Contact Name">
              {(field) => <Input placeholder="John Doe" {...field} className="h-11 bg-white dark:bg-slate-950" />}
            </ThemeFormField>
            <ThemeFormField name="pickup_contact_phone" label="Phone">
              {(field) => <Input placeholder="(555) 123-4567" {...field} className="h-11 bg-white dark:bg-slate-950" />}
            </ThemeFormField>
          </div>
        </div>

        {/* Delivery Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Delivery Details</h3>
          </div>

          <ThemeFormField name="delivery_address" label="Address">
            {(field) => <Input placeholder="456 Dropoff Ave, City, Country" {...field} className="h-11 bg-white dark:bg-slate-950" />}
          </ThemeFormField>

          <div className="grid grid-cols-2 gap-3">
            <ThemeFormField name="delivery_contact_person" label="Contact Name">
              {(field) => <Input placeholder="Jane Smith" {...field} className="h-11 bg-white dark:bg-slate-950" />}
            </ThemeFormField>
            <ThemeFormField name="delivery_contact_phone" label="Phone">
              {(field) => <Input placeholder="(555) 987-6543" {...field} className="h-11 bg-white dark:bg-slate-950" />}
            </ThemeFormField>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" /> Desired Pickup Date
        </h3>
        <div className="max-w-xs">
          <ThemeFormField name="requested_pickup_date" label="">
            {(field) => <Input type="datetime-local" {...field} className="h-12 bg-white dark:bg-slate-950 text-lg" />}
          </ThemeFormField>
        </div>
      </div>
    </div>
  );
}

function Step3Confirm({ price, onLoginRequired }: { price: number | null; onLoginRequired: () => void }) {
  const { getValues } = useFormContext<BookingFormData>();
  const { backendUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const values = getValues();

  const handleConfirmBooking = async () => {
    if (!backendUser) {
      toast('Please log in to complete your booking.', { icon: '🔒' });
      onLoginRequired();
      return;
    }

    setIsSubmitting(true);
    try {
      const extractCity = (address: string): string => {
        const parts = address.split(',');
        return parts.length > 1 ? parts[parts.length - 2]?.trim() || "City" : "City";
      };

      const jobPayload = {
        ...values,
        customer_id: backendUser.id,
        pickup_city: extractCity(values.pickup_address),
        delivery_city: extractCity(values.delivery_address),
      };

      await apiClient.post('/book/', jobPayload);
      toast.success("Booking successful! Redirecting...");
      router.push('/dashboard/orders');
    } catch (error: any) {
      // Simplified error handling
      toast.error("Booking failed. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 bg-gray-50/50 dark:bg-slate-900/50">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <span className="font-bold text-lg text-gray-900 dark:text-white">Booking Summary</span>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">Draft</span>
        </div>

        <div className="grid md:grid-cols-2 gap-y-6 gap-x-12 mb-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Service</p>
            <p className="font-semibold">{serviceOptions[values.service_type]?.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date</p>
            <p className="font-semibold">{values.requested_pickup_date ? new Date(values.requested_pickup_date).toLocaleString() : 'Not scheduled'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">From</p>
            <p className="font-semibold flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-500" /> {values.pickup_address}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">To</p>
            <p className="font-semibold flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500" /> {values.delivery_address}</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
          <span className="text-muted-foreground">Estimated Total</span>
          <span className="text-3xl font-black text-gray-900 dark:text-white">${price?.toFixed(2)}</span>
        </div>
      </div>

      <Button
        onClick={handleConfirmBooking}
        disabled={isSubmitting}
        size="lg"
        className="w-full text-lg h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xl shadow-emerald-500/20"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50"></div> Processing...</span>
        ) : (
          backendUser ? "Confirm Booking" : "Login to Book"
        )}
      </Button>
    </div>
  );
}