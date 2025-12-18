'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Package,
    MapPin,
    Clock,
    CheckCircle,
    Truck,
    ArrowLeft,
    Phone,
    Mail,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import { Job, JobTimeline } from '@/types';

export default function TrackingPage() {
    const params = useParams();
    const trackingId = params.trackingId as string;
    const [data, setData] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrackingInfo = async () => {
            try {
                setLoading(true);
                // The public tracking endpoint
                const response = await apiClient.get<Job>(`/tracking/${trackingId}/`);
                setData(response.data);
            } catch (err: any) {
                console.error("Failed to fetch tracking data", err);
                setError(err.response?.status === 404 ? "Tracking ID not found" : "Failed to load tracking info");
            } finally {
                setLoading(false);
            }
        };

        if (trackingId) {
            fetchTrackingInfo();
        }
    }, [trackingId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 text-lg">Loading shipment details...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Package className="h-16 w-16 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || "Shipment not found"}</h1>
                <p className="text-gray-600 mb-6">Please check your tracking ID and try again.</p>
                <Button asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        );
    }

    // Calculate ETA
    const eta = data.estimated_delivery ? new Date(data.estimated_delivery) : null;
    const now = new Date();
    let hoursRemaining = 0;
    let minutesRemaining = 0;

    if (eta && eta > now) {
        hoursRemaining = Math.max(0, Math.floor((eta.getTime() - now.getTime()) / (1000 * 60 * 60)));
        minutesRemaining = Math.max(0, Math.floor(((eta.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)));
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Back Button */}
                <Button asChild variant="ghost" className="mb-6">
                    <Link href="/dashboard/orders">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Link>
                </Button>

                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">Tracking: {data.id}</h1>
                                <span className={`px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold`}>
                                    {data.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-gray-600">Current Location: {data.current_location || 'Processing'}</p>
                        </div>

                        <div className="text-right">
                            {eta ? (
                                <>
                                    <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {eta.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-sm text-blue-600 font-medium">
                                        {eta > now
                                            ? (hoursRemaining > 0 ? `${hoursRemaining}h ${minutesRemaining}m remaining` : 'Arriving soon')
                                            : 'Scheduled'}
                                    </p>
                                </>
                            ) : (
                                <p className="text-gray-500">ETA Pending</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Timeline */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Shipment Timeline</h2>

                            <div className="space-y-6">
                                {data.timeline && data.timeline.length > 0 ? (
                                    data.timeline.map((event, index) => (
                                        <div key={index} className="flex gap-4">
                                            {/* Icon */}
                                            <div className="flex-shrink-0">
                                                {event.completed ? (
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${event.is_current ? 'bg-blue-500 ring-4 ring-blue-100' : 'bg-green-500'
                                                        }`}>
                                                        <CheckCircle className="h-6 w-6 text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <div className="h-3 w-3 rounded-full bg-gray-400" />
                                                    </div>
                                                )}

                                                {/* Connector Line */}
                                                {index < data.timeline.length - 1 && (
                                                    <div className={`ml-5 mt-2 w-0.5 h-12 ${event.completed ? 'bg-green-300' : 'bg-gray-200'
                                                        }`} />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 pb-6">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={`font-semibold ${event.completed ? 'text-gray-900' : 'text-gray-400'
                                                        }`}>
                                                        {event.status_display}
                                                    </h3>
                                                    {event.timestamp && (
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(event.timestamp).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-sm ${event.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    {event.description}
                                                </p>
                                                <p className={`text-sm mt-1 flex items-center gap-1 ${event.completed ? 'text-gray-500' : 'text-gray-400'
                                                    }`}>
                                                    <MapPin className="h-3 w-3" />
                                                    {event.location}
                                                </p>
                                            </div>
                                        </div>
                                    ))) : (
                                    <p className="text-gray-500">No updates available yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Delivery Proof (if delivered) */}
                        {data.status === 'DELIVERED' && data.proof && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Proof of Delivery</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {data.proof.photo && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Delivery Photo</p>
                                            <img src={data.proof.photo} alt="Delivery proof" className="rounded-lg border border-gray-200" />
                                        </div>
                                    )}
                                    {data.proof.signature && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Signature</p>
                                            <img src={data.proof.signature} alt="Signature" className="rounded-lg border border-gray-200 bg-gray-50" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Driver Info - Only show if assigned */}
                        {data.driver && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Truck className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Your Driver</p>
                                        <p className="font-semibold text-gray-900">{data.driver.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Package className="h-4 w-4" />
                                        <span>{data.driver.vehicle}</span>
                                    </div>
                                    <Button variant="outline" className="w-full mt-4">
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call Driver
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Addresses */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Shipment Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-green-600" />
                                        Pickup
                                    </p>
                                    <p className="text-sm text-gray-900 font-medium">{data.pickup_contact_person}</p>
                                    <p className="text-sm text-gray-600">{data.pickup_address}, {data.pickup_city}</p>
                                    <p className="text-sm text-gray-600">{data.pickup_contact_phone}</p>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                        Delivery
                                    </p>
                                    <p className="text-sm text-gray-900 font-medium">{data.delivery_contact_person}</p>
                                    <p className="text-sm text-gray-600">{data.delivery_address}, {data.delivery_city}</p>
                                    <p className="text-sm text-gray-600">{data.delivery_contact_phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Help */}
                        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-5 w-5 text-blue-600" />
                                <h3 className="font-semibold text-blue-900">Need Help?</h3>
                            </div>
                            <p className="text-sm text-blue-800 mb-4">
                                Our support team is available 24/7 to assist you.
                            </p>
                            <Button variant="outline" className="w-full border-blue-300 hover:bg-blue-100">
                                <Mail className="h-4 w-4 mr-2" />
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

