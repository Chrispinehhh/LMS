'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Package, Ruler } from 'lucide-react';
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
import { useBookingStore } from '@/lib/useBookingStore';

const packageSchema = z.object({
    packageType: z.string().min(1, 'Please select a package type'),
    weight: z.string().min(1, 'Weight is required'),
    description: z.string().optional(),
    length: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageDetailsStepProps {
    onNext: () => void;
}

export function PackageDetailsStep({ onNext }: PackageDetailsStepProps) {
    const { packageDetails, setPackageDetails } = useBookingStore();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<PackageFormData>({
        resolver: zodResolver(packageSchema),
        defaultValues: packageDetails || undefined,
    });

    const packageType = watch('packageType');

    const onSubmit = (data: PackageFormData) => {
        setPackageDetails({
            packageType: data.packageType,
            weight: data.weight,
            description: data.description || '',
            dimensions: data.length && data.width && data.height ? {
                length: data.length,
                width: data.width,
                height: data.height,
            } : undefined,
        });
        onNext();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Package Details</h2>
                        <p className="text-gray-600">Tell us about your shipment</p>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Package Type */}
                    <div>
                        <Label htmlFor="packageType">Package Type *</Label>
                        <Select
                            onValueChange={(value) => setValue('packageType', value)}
                            value={packageType}
                        >
                            <SelectTrigger className="mt-1 h-12">
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
                            <p className="text-red-500 text-sm mt-1">{errors.packageType.message}</p>
                        )}
                    </div>

                    {/* Weight */}
                    <div>
                        <Label htmlFor="weight">Weight (lbs) *</Label>
                        <Input
                            id="weight"
                            type="number"
                            {...register('weight')}
                            placeholder="Enter weight in pounds"
                            className="mt-1 h-12"
                        />
                        {errors.weight && (
                            <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                        )}
                    </div>

                    {/* Dimensions */}
                    <div>
                        <Label className="mb-2 flex items-center gap-2">
                            <Ruler className="h-4 w-4" />
                            Dimensions (optional)
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Input
                                    {...register('length')}
                                    placeholder="Length (in)"
                                    className="h-12"
                                />
                            </div>
                            <div>
                                <Input
                                    {...register('width')}
                                    placeholder="Width (in)"
                                    className="h-12"
                                />
                            </div>
                            <div>
                                <Input
                                    {...register('height')}
                                    placeholder="Height (in)"
                                    className="h-12"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Description (optional)</Label>
                        <textarea
                            id="description"
                            {...register('description')}
                            placeholder="Briefly describe your items..."
                            className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" size="lg" className="px-8 bg-blue-600 hover:bg-blue-700">
                    Continue to Addresses
                </Button>
            </div>
        </form>
    );
}
