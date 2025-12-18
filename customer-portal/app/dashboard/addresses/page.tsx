'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Home, Building, Map } from 'lucide-react';
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
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { CustomerAddress } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define Zod Schema
const addressSchema = z.object({
    label: z.enum(['HOME', 'OFFICE', 'WAREHOUSE', 'OTHER']),
    name: z.string().min(2, "Name is required"),
    address1: z.string().min(5, "Address is required"),
    address2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().length(2, "State must be 2 letters"),
    zip_code: z.string().min(5, "Zip code is required"),
    phone: z.string().min(10, "Phone is required"),
    is_default: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddressesPage() {
    const { backendUser } = useAuth();
    const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            label: 'HOME',
            is_default: false,
            address2: '',
        }
    });

    const fetchAddresses = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get<CustomerAddress[]>('/customers/me/addresses/');
            setAddresses(response.data);
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (backendUser) {
            fetchAddresses();
        }
    }, [backendUser]);


    const onSubmit = async (data: AddressFormData) => {
        const payload = {
            ...data,
            is_default: !!data.is_default
        };

        try {
            if (editingId) {
                await apiClient.put(`/customers/me/addresses/${editingId}/`, payload);
            } else {
                await apiClient.post('/customers/me/addresses/', payload);
            }
            fetchAddresses();
            reset();
            setIsAdding(false);
            setEditingId(null);
        } catch (error) {
            console.error("Failed to save address:", error);
            alert("Failed to save address.");
        }
    };


    const handleEdit = (address: CustomerAddress) => {
        setEditingId(address.id);
        setIsAdding(true);
        // Populate form
        setValue('label', address.label);
        setValue('name', address.name);
        setValue('address1', address.address1);
        setValue('address2', address.address2 || '');
        setValue('city', address.city);
        setValue('state', address.state);
        setValue('zip_code', address.zip_code);
        setValue('phone', address.phone);
        setValue('is_default', address.is_default);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        try {
            await apiClient.delete(`/customers/me/addresses/${id}/`);
            fetchAddresses();
        } catch (error) {
            console.error("Failed to delete address:", error);
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        reset();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Saved Addresses</h1>
                    <p className="text-muted-foreground">Manage your pickup and delivery locations.</p>
                </div>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Address
                    </Button>
                )}
            </div>

            {/* Add/Edit Address Form */}
            {isAdding && (
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-6">
                        {editingId ? 'Edit Address' : 'New Address'}
                    </h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="label" className="text-foreground">Address Label *</Label>
                                <Select onValueChange={(val: any) => setValue('label', val)} defaultValue="HOME">
                                    <SelectTrigger id="label" className="mt-1 bg-background border-input text-foreground">
                                        <SelectValue placeholder="Select label" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HOME">Home</SelectItem>
                                        <SelectItem value="OFFICE">Office</SelectItem>
                                        <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="name" className="text-foreground">Full Name *</Label>
                                <Input id="name" {...register('name')} placeholder="John Doe" className="mt-1 bg-background border-input text-foreground" />
                                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="address1" className="text-foreground">Street Address *</Label>
                            <Input id="address1" {...register('address1')} placeholder="123 Main Street" className="mt-1 bg-background border-input text-foreground" />
                            {errors.address1 && <p className="text-destructive text-sm">{errors.address1.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="address2" className="text-foreground">Apt, Suite, etc.</Label>
                            <Input id="address2" {...register('address2')} placeholder="Apt 4B" className="mt-1 bg-background border-input text-foreground" />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="city" className="text-foreground">City *</Label>
                                <Input id="city" {...register('city')} placeholder="New York" className="mt-1 bg-background border-input text-foreground" />
                                {errors.city && <p className="text-destructive text-sm">{errors.city.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="state" className="text-foreground">State (2 Letters) *</Label>
                                <Input id="state" {...register('state')} placeholder="NY" maxLength={2} className="mt-1 uppercase bg-background border-input text-foreground" />
                                {errors.state && <p className="text-destructive text-sm">{errors.state.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="zip_code" className="text-foreground">ZIP Code *</Label>
                                <Input id="zip_code" {...register('zip_code')} placeholder="10001" className="mt-1 bg-background border-input text-foreground" />
                                {errors.zip_code && <p className="text-destructive text-sm">{errors.zip_code.message}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="phone" className="text-foreground">Phone Number *</Label>
                            <Input id="phone" {...register('phone')} type="tel" placeholder="(555) 123-4567" className="mt-1 bg-background border-input text-foreground" />
                            {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input type="checkbox" id="is_default" {...register('is_default')} className="h-4 w-4 rounded border-input" />
                            <Label htmlFor="is_default" className="cursor-pointer text-foreground">Set as default address</Label>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-border">
                            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Address</Button>
                            <Button type="button" variant="outline" onClick={handleCancel} className="bg-background text-foreground hover:bg-muted">Cancel</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Addresses List */}
            <div className="grid md:grid-cols-2 gap-6">
                {isLoading ? (
                    <p className="text-muted-foreground">Loading addresses...</p>
                ) : addresses.map((address) => (
                    <div key={address.id} className="bg-card rounded-xl border border-border p-6 relative shadow-sm hover:shadow-md transition-shadow">
                        {address.is_default && (
                            <span className="absolute top-4 right-4 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold rounded-full">
                                Default
                            </span>
                        )}

                        <div className="flex items-center gap-3 mb-4">
                            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${(address.label as string) === 'HOME' ? 'bg-blue-100 dark:bg-blue-500/10' : 'bg-green-100 dark:bg-green-500/10'}`}>
                                {(address.label as string) === 'HOME' ? (
                                    <Home className={`h-6 w-6 ${(address.label as string) === 'HOME' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`} />
                                ) : (
                                    <Building className={`h-6 w-6 ${(address.label as string) === 'HOME' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`} />
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">{address.label_display || address.label}</h3>
                                <p className="text-sm text-muted-foreground">{address.name}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <p className="text-sm text-foreground">{address.address1}</p>
                            {address.address2 && <p className="text-sm text-foreground">{address.address2}</p>}
                            <p className="text-sm text-foreground">
                                {address.city}, {address.state} {address.zip_code}
                            </p>
                            <p className="text-sm text-foreground">{address.phone}</p>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-border">
                            <Button variant="outline" size="sm" className="flex-1 bg-background text-foreground hover:bg-muted" onClick={() => handleEdit(address)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(address.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {!isLoading && addresses.length === 0 && !isAdding && (
                    <div className="col-span-2 bg-card rounded-xl border border-border p-12 text-center">
                        <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No saved addresses</h3>
                        <p className="text-muted-foreground mb-6">Add your first address to speed up future bookings.</p>
                        <Button onClick={() => setIsAdding(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="h-5 w-5 mr-2" />
                            Add Address
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
