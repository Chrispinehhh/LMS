// customer-portal/app/book/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, Truck, MapPin, CheckCircle, Package, Building2, Home } from 'lucide-react';
import AuthModal from '@/components/Auth/AuthModal';

const bookingSchema = z.object({
  service_type: z.enum(['RESIDENTIAL_MOVING', 'OFFICE_RELOCATION', 'PALLET_DELIVERY', 'SMALL_DELIVERIES']),
  cargo_description: z.string().min(10, "Please provide a more detailed description."),
  pickup_address: z.string().min(5, "Pickup address is required."),
  delivery_address: z.string().min(5, "Delivery address is required."),
  requested_pickup_date: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: "Please select a valid date and time.",
  }),
});
type BookingFormData = z.infer<typeof bookingSchema>;

const steps = [
  { id: 1, name: 'Service', fields: ['service_type', 'cargo_description'] as const, icon: Package },
  { id: 2, name: 'Logistics', fields: ['pickup_address', 'delivery_address', 'requested_pickup_date'] as const, icon: MapPin },
  { id: 3, name: 'Confirm', icon: CheckCircle },
];

const serviceOptions = {
  RESIDENTIAL_MOVING: { name: "Residential Moving", icon: Home },
  OFFICE_RELOCATION: { name: "Office Relocation", icon: Building2 },
  PALLET_DELIVERY: { name: "Pallet Delivery", icon: Package },
  SMALL_DELIVERIES: { name: "Small Deliveries", icon: Truck },
};

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const methods = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: 'onTouched',
    defaultValues: {
      service_type: undefined,
      cargo_description: "",
      pickup_address: "",
      delivery_address: "",
      requested_pickup_date: "",
    },
  });
  const { trigger, getValues } = methods;

  // Debugging and safety measures
  useEffect(() => {
    console.log('🚀 Booking Page mounted - initial modal state:', isAuthModalOpen);
  }, []);

  useEffect(() => {
    console.log('🔍 Booking Page - AuthModal state changed:', isAuthModalOpen);
    console.log('🔍 Booking Page - Current step:', currentStep);
  }, [isAuthModalOpen, currentStep]);

  // Force close modal on mount as safety measure
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthModalOpen) {
        console.log('🛠️ Safety: Forcing AuthModal closed on booking page mount');
        setIsAuthModalOpen(false);
      }
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
        setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
    }
  };

  const handleAuthModalClose = () => {
    console.log('Closing AuthModal from booking page');
    setIsAuthModalOpen(false);
  };

  return (
    <div className="relative bg-gray-900 text-white min-h-screen py-20">
      <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/hero-background.jpg')" }}></div>
      <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm"></div>
      
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Conditional AuthModal rendering */}
      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={handleAuthModalClose}
        />
      )}

      <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
        <FormProvider {...methods}>
          <div className="w-full max-w-2xl mx-auto bg-black/20 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <React.Fragment key={step.id}>
                      <div className="flex flex-col items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${ isCompleted ? 'bg-green-500 border-green-500' : isActive ? 'bg-blue-500 border-blue-500' : 'bg-white/10 border-white/30'}`}>
                          {isCompleted ? <CheckCircle className="h-5 w-5 text-white" /> : <StepIcon className={`h-5 w-5 ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`} />}
                        </div>
                        <span className={`mt-2 text-xs font-medium ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>{step.name}</span>
                      </div>
                      {index < steps.length - 1 && <div className="flex-1 h-px bg-white/20 mx-4"></div>}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            
            <div className="p-8">
              <div className="mb-6 text-left">
                <h2 className="text-2xl font-bold text-white">Step {currentStep}: {steps[currentStep - 1].name}</h2>
              </div>

              {currentStep === 1 && <Step1ServiceDetails />}
              {currentStep === 2 && <Step2Location />}
              {currentStep === 3 && (
                <Step3Confirm 
                  price={estimatedPrice} 
                  onLoginRequired={() => {
                    console.log('Login required triggered from Step3');
                    setIsAuthModalOpen(true);
                  }} 
                />
              )}
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={prevStep} 
                    disabled={currentStep === 1} 
                    className="border-white/30 bg-white/5 hover:bg-white/10 text-white hover:text-white disabled:opacity-50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  {currentStep < steps.length && (
                    <Button 
                      onClick={nextStep} 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold group"
                    >
                      Next Step <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </FormProvider>
      </div>
    </div>
  );
}

const GlassFormField = ({ name, label, children }: { name: keyof BookingFormData, label: string, children: (field: ControllerRenderProps<BookingFormData, keyof BookingFormData>) => React.ReactNode }) => {
    const { control } = useFormContext<BookingFormData>();
    return ( 
      <FormField 
        control={control} 
        name={name} 
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel className="text-gray-300 font-medium text-sm">{label}</FormLabel>
            <FormControl>{children(field)}</FormControl>
            <FormMessage className="text-red-400 text-sm mt-1" />
          </FormItem>
        )} 
      /> 
    )
}

function Step1ServiceDetails() {
  return (
    <div className="space-y-4">
      <GlassFormField name="service_type" label="Which service do you need?">
        {(field) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white h-12 text-base">
              <SelectValue placeholder="Select a service type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800/95 backdrop-blur-lg border-white/20 text-white">
              {Object.entries(serviceOptions).map(([key, { name, icon: Icon }]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </GlassFormField>
      <GlassFormField name="cargo_description" label="Briefly describe the items">
        {(field) => (
          <Textarea 
            rows={4} 
            placeholder="e.g., 10 moving boxes, 1 large sofa, electronics..." 
            {...field} 
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none"
          />
        )}
      </GlassFormField>
    </div>
  );
}

function Step2Location() {
    return (
        <div className="space-y-6">
            <GlassFormField name="pickup_address" label="Pickup Address">
                {(field) => (
                  <Input 
                    placeholder="123 Main St, Anytown, USA" 
                    {...field} 
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 h-12"
                  />
                )}
            </GlassFormField>
            <GlassFormField name="delivery_address" label="Delivery Address">
                {(field) => (
                  <Input 
                    placeholder="456 Oak Ave, Othertown, USA" 
                    {...field} 
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 h-12"
                  />
                )}
            </GlassFormField>
            <GlassFormField name="requested_pickup_date" label="Requested Pickup Date & Time">
                {(field) => (
                  <Input 
                    type="datetime-local" 
                    {...field} 
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 h-12"
                  />
                )}
            </GlassFormField>
        </div>
    );
}

function Step3Confirm({ price, onLoginRequired }: { price: number | null; onLoginRequired: () => void }) {
    const { getValues } = useFormContext<BookingFormData>();
    const { backendUser } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const values = getValues();

    // Debugging for Step3
    useEffect(() => {
      console.log('🔍 Step3Confirm - backendUser:', backendUser);
      console.log('🔍 Step3Confirm - isSubmitting:', isSubmitting);
    }, [backendUser, isSubmitting]);

    const handleConfirmBooking = async () => {
        console.log('Confirm booking clicked, backendUser:', backendUser);
        
        if (!backendUser) {
            console.log('No user logged in, triggering login modal');
            toast('Please log in to complete your booking.', { icon: '🔒' });
            onLoginRequired();
            return;
        }
        
        setIsSubmitting(true);
        try {
            const jobPayload = {
                ...values,
                customer_id: backendUser.id,
                pickup_city: "City",
                pickup_contact_person: `${backendUser.first_name} ${backendUser.last_name}`,
                pickup_contact_phone: 'N/A',
                delivery_city: "City",
                delivery_contact_person: "Recipient",
                delivery_contact_phone: 'N/A',
            };
            console.log('Submitting booking:', jobPayload);
            await apiClient.post('/book/', jobPayload);
            toast.success("Booking successful! A manager will be in touch shortly.");
            router.push('/');
        } catch (error) {
            console.error('Booking error:', error);
            toast.error("Booking failed. Please try again or contact support.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 border border-white/20 rounded-xl space-y-2 bg-white/5 text-white">
                <h3 className="text-lg font-bold text-center mb-4">Review Your Details</h3>
                <p><strong>Service:</strong> <span className="font-medium">{serviceOptions[values.service_type]?.name}</span></p>
                <p><strong>Pickup:</strong> <span className="font-medium">{values.pickup_address}</span></p>
                <p><strong>Delivery:</strong> <span className="font-medium">{values.delivery_address}</span></p>
                <p><strong>Date:</strong> <span className="font-medium">{values.requested_pickup_date ? new Date(values.requested_pickup_date).toLocaleString() : ''}</span></p>
            </div>
            <div className="text-center py-4">
                <p className="text-gray-300">Estimated Price</p>
                <p className="text-4xl font-black text-white">${price ? price.toFixed(2) : '--.--'}</p>
            </div>
            <Button 
              onClick={handleConfirmBooking} 
              disabled={isSubmitting} 
              className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? "Confirming..." : (backendUser ? "Confirm & Book Now" : "Login & Book Now")}
            </Button>
            { !backendUser && (
              <p className="text-center text-sm text-gray-400 mt-2">
                You will be prompted to log in to continue.
              </p>
            )}
        </div>
    );
}