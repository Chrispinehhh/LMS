'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin } from 'lucide-react';

const quickQuoteSchema = z.object({
    origin: z.string().min(2, 'Required'),
    destination: z.string().min(2, 'Required'),
    weight: z.string().min(1, 'Required'),
});

type QuickQuoteData = z.infer<typeof quickQuoteSchema>;

export function QuickQuote() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<QuickQuoteData>({
        resolver: zodResolver(quickQuoteSchema),
    });

    const onSubmit = (data: QuickQuoteData) => {
        // Navigate to booking with pre-filled data
        const params = new URLSearchParams({
            origin: data.origin,
            destination: data.destination,
            weight: data.weight,
        });
        router.push(`/book?${params.toString()}`);
    };

    return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Get Instant Quote
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            {...register('origin')}
                            placeholder="Pickup location"
                            className="pl-11 h-12 text-base"
                        />
                    </div>
                    {errors.origin && (
                        <p className="text-destructive text-xs mt-1">{errors.origin.message}</p>
                    )}
                </div>

                <div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
                        <Input
                            {...register('destination')}
                            placeholder="Delivery location"
                            className="pl-11 h-12 text-base"
                        />
                    </div>
                    {errors.destination && (
                        <p className="text-destructive text-xs mt-1">{errors.destination.message}</p>
                    )}
                </div>

                <div>
                    <Input
                        {...register('weight')}
                        type="number"
                        placeholder="Estimated weight (lbs)"
                        className="h-12 text-base"
                    />
                    {errors.weight && (
                        <p className="text-destructive text-xs mt-1">{errors.weight.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                    Get Quote & Book
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-4">
                Free quote • No commitment • Instant pricing
            </p>
        </div>
    );
}
