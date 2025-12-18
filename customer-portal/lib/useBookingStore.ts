'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PackageDetails {
    packageType: string;
    weight: string;
    dimensions?: {
        length: string;
        width: string;
        height: string;
    };
    description: string;
}

interface Address {
    name: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
}

interface BookingState {
    currentStep: number;
    packageDetails: PackageDetails | null;
    pickupAddress: Address | null;
    deliveryAddress: Address | null;
    pickupDate: string | null;
    serviceLevel: string | null;

    // Actions
    setCurrentStep: (step: number) => void;
    setPackageDetails: (details: PackageDetails) => void;
    setPickupAddress: (address: Address) => void;
    setDeliveryAddress: (address: Address) => void;
    setPickupDate: (date: string) => void;
    setServiceLevel: (level: string) => void;
    resetBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set) => ({
            currentStep: 1,
            packageDetails: null,
            pickupAddress: null,
            deliveryAddress: null,
            pickupDate: null,
            serviceLevel: null,

            setCurrentStep: (step) => set({ currentStep: step }),
            setPackageDetails: (details) => set({ packageDetails: details }),
            setPickupAddress: (address) => set({ pickupAddress: address }),
            setDeliveryAddress: (address) => set({ deliveryAddress: address }),
            setPickupDate: (date) => set({ pickupDate: date }),
            setServiceLevel: (level) => set({ serviceLevel: level }),
            resetBooking: () => set({
                currentStep: 1,
                packageDetails: null,
                pickupAddress: null,
                deliveryAddress: null,
                pickupDate: null,
                serviceLevel: null,
            }),
        }),
        {
            name: 'booking-storage',
        }
    )
);
