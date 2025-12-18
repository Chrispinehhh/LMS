'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Truck, Package, MapPin, ArrowRight, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const quoteSchema = z.object({
    origin: z.string().min(3, 'Origin is required'),
    destination: z.string().min(3, 'Destination is required'),
    packageType: z.string().min(1, 'Please select a package type'),
    weight: z.string().min(1, 'Weight is required'),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteEstimate {
    price: number;
    estimatedDays: string;
    distance: number;
}

export function QuoteCalculator() {
    const [estimate, setEstimate] = useState<QuoteEstimate | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<QuoteFormData>({
        resolver: zodResolver(quoteSchema),
    });

    const packageType = watch('packageType');

    const calculateEstimate = async (data: QuoteFormData) => {
        setIsCalculating(true);
        setEstimate(null); // Clear previous estimate

        try {
            const { default: apiClient } = await import('@/lib/api');
            const response = await apiClient.post('/quotes/instant-estimate/', data);

            setEstimate({
                price: response.data.price,
                estimatedDays: response.data.estimatedDays,
                distance: response.data.distance
            });
        } catch (error) {
            console.error('Failed to get quote:', error);
            // In a real app we'd set an error state here, for now alert
            alert("Failed to calculate quote. Please try again.");
        } finally {
            setIsCalculating(false);
        }
    };


    return (
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-foreground">Instant Quote</h3>
                    <p className="text-sm text-muted-foreground">Get your price in seconds</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(calculateEstimate)} className="space-y-5">
                {/* Origin */}
                <div>
                    <Label htmlFor="origin" className="text-muted-foreground font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Pickup Location
                    </Label>
                    <Input
                        id="origin"
                        {...register('origin')}
                        placeholder="Enter city or zip code"
                        className="h-12 border-input focus:border-primary focus:ring-primary"
                    />
                    {errors.origin && (
                        <p className="text-destructive text-sm mt-1">{errors.origin?.message}</p>
                    )}
                </div>

                {/* Destination */}
                <div>
                    <Label htmlFor="destination" className="text-muted-foreground font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-orange-600" />
                        Delivery Location
                    </Label>
                    <Input
                        id="destination"
                        {...register('destination')}
                        placeholder="Enter city or zip code"
                        className="h-12 border-input focus:border-primary focus:ring-primary"
                    />
                    {errors.destination && (
                        <p className="text-destructive text-sm mt-1">{errors.destination?.message}</p>
                    )}
                </div>

                {/* Package Type */}
                <div>
                    <Label htmlFor="packageType" className="text-muted-foreground font-medium mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        Package Type
                    </Label>
                    <Select
                        onValueChange={(value) => setValue('packageType', value)}
                        value={packageType}
                    >
                        <SelectTrigger className="h-12 border-input focus:border-primary focus:ring-primary">
                            <SelectValue placeholder="Select package size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="small">Small (&lt; 50 lbs)</SelectItem>
                            <SelectItem value="medium">Medium (50-150 lbs)</SelectItem>
                            <SelectItem value="large">Large (150-500 lbs)</SelectItem>
                            <SelectItem value="pallet">Pallet (500+ lbs)</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.packageType && (
                        <p className="text-destructive text-sm mt-1">{errors.packageType?.message}</p>
                    )}
                </div>

                {/* Weight */}
                <div>
                    <Label htmlFor="weight" className="text-muted-foreground font-medium mb-2 flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        Weight (lbs)
                    </Label>
                    <Input
                        id="weight"
                        type="number"
                        {...register('weight')}
                        placeholder="Enter weight in pounds"
                        className="h-12 border-input focus:border-primary focus:ring-primary"
                    />
                    {errors.weight && (
                        <p className="text-destructive text-sm mt-1">{errors.weight?.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isCalculating}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg disabled:opacity-50"
                >
                    {isCalculating ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                            Calculating...
                        </>
                    ) : (
                        <>
                            Get Instant Quote
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>
            </form>

            {/* Estimate Display */}
            {estimate && (
                <div className="mt-6 p-5 bg-gradient-to-br from-primary/5 to-cyan-500/10 rounded-xl border border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Estimated Price</p>
                            <p className="text-4xl font-bold text-primary">${estimate.price}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Delivery Time</p>
                            <p className="text-2xl font-semibold text-foreground">{estimate.estimatedDays} days</p>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-primary/20">
                        <p className="text-sm text-muted-foreground mb-3">
                            <span className="font-medium text-foreground">Distance:</span> ~{estimate.distance} miles
                        </p>
                        <Button
                            asChild
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-lg"
                        >
                            <a href="/book">
                                Continue to Booking <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
