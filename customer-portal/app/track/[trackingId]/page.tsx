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
    AlertCircle,
    Calendar,
    ChevronRight,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import { Job } from '@/types';
import { motion } from 'framer-motion';
import { PremiumCard } from '@/components/shared/PremiumCard';
import { format } from 'date-fns';

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

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground animate-pulse">Locating shipment...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card rounded-2xl p-10 text-center max-w-md w-full"
                >
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="h-10 w-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{error || "Shipment not found"}</h1>
                    <p className="text-muted-foreground mb-8">We couldn't find a shipment with ID <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-foreground">{trackingId}</span></p>
                    <Button asChild size="lg" className="w-full">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </motion.div>
            </div>
        );
    }

    // Calculate ETA
    const eta = data.estimated_delivery ? new Date(data.estimated_delivery) : null;

    // Status colors
    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'DELIVERED': return { bg: 'bg-emerald-500', light: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-200' };
            case 'IN_TRANSIT': return { bg: 'bg-blue-500', light: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-200' };
            case 'FAILED': return { bg: 'bg-red-500', light: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-200' };
            default: return { bg: 'bg-amber-500', light: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-200' };
        }
    };

    const theme = getStatusTheme(data.status);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 lg:py-12">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="container mx-auto px-4 md:px-6 max-w-6xl"
            >
                {/* Navigation */}
                <Button asChild variant="ghost" className="mb-8 hover:bg-white/50 dark:hover:bg-slate-800/50 -ml-4">
                    <Link href="/dashboard/orders">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Link>
                </Button>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Status Card */}
                        <div className="glass-card rounded-2xl p-6 md:p-8 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800/50">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                            {data.status.replace('_', ' ')}
                                        </h1>
                                        {data.status === 'IN_TRANSIT' && (
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground flex items-center gap-2 text-lg">
                                        <Truck className="w-5 h-5" />
                                        Tracking ID: <span className="font-mono text-gray-900 dark:text-gray-200 font-semibold">{data.id.slice(0, 8)}...</span>
                                    </p>
                                </div>
                                <div className="text-left md:text-right p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <p className="text-sm text-muted-foreground mb-1">Estimated Arrival</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {eta ? format(eta, 'MMM d, yyyy') : 'Pending'}
                                    </p>
                                    {eta && (
                                        <p className={`text-sm font-medium ${theme.text}`}>
                                            {format(eta, 'EEEE, p')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar (Visual) */}
                            <div className="mt-8 relative pt-4">
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: data.status === 'DELIVERED' ? '100%' : data.status === 'IN_TRANSIT' ? '60%' : '10%' }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full ${theme.bg}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Map Visualization Placeholder */}
                        <div className="glass-card rounded-2xl overflow-hidden h-[300px] relative bg-slate-900 flex items-center justify-center group">
                            <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/0,0,2,0/800x600?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjazl4bm44cmowMzJzM2V0NDI5dG5uOXoxIn0.1')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>

                            <div className="relative z-10 text-center px-4">
                                <div className={`w-16 h-16 ${theme.light} rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/10`}>
                                    <MapPin className={`w-8 h-8 ${theme.text}`} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{data.current_location || "In Transit"}</h3>
                                <p className="text-slate-400">Live Location Update</p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <PremiumCard title="Shipment Journey" icon={Clock} iconColor="text-blue-500">
                            <div className="space-y-8 mt-4 relative before:absolute before:left-3.5 before:top-2 before:h-full before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                                {data.timeline && data.timeline.length > 0 ? (
                                    data.timeline.map((event, index) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            key={index}
                                            className="relative flex gap-6"
                                        >
                                            <div className={`
                                                relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 
                                                ${event.completed ? `border-emerald-500 bg-emerald-500 text-white` : 'border-gray-200 bg-white dark:bg-slate-950 text-gray-300 dark:border-gray-700 dark:text-gray-600'}
                                            `}>
                                                {event.completed ? <CheckCircle className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                                            </div>
                                            <div className="flex flex-col pb-4">
                                                <span className={`text-sm font-semibold ${event.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                                    {event.status_display}
                                                </span>
                                                <span className="text-xs text-muted-foreground mt-0.5 mb-1">
                                                    {event.timestamp ? format(new Date(event.timestamp), 'MMM d, h:mm a') : 'Pending'}
                                                </span>
                                                <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                    {event.description}
                                                    {event.location && (
                                                        <span className="block mt-1 text-xs font-medium text-primary flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" /> {event.location}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">No tracking updates available yet.</div>
                                )}
                            </div>
                        </PremiumCard>
                    </div>

                    {/* Sidebar Details */}
                    <div className="space-y-6">
                        {/* Driver Card */}
                        <PremiumCard title="Assigned Driver" icon={Truck} iconColor="text-indigo-500">
                            {data.driver ? (
                                <div className="flex flex-col items-center text-center p-2">
                                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 text-2xl">
                                        👨‍✈️
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{data.driver.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">{data.driver.vehicle || "Standard Fleet Vehicle"}</p>
                                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                        <Phone className="h-4 w-4 mr-2" /> Call Driver
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Truck className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">A driver has not been assigned to this shipment yet.</p>
                                </div>
                            )}
                        </PremiumCard>

                        {/* Order Details */}
                        <PremiumCard title="Order Details">
                            <div className="space-y-6">
                                <div className="relative pl-6 border-l-2 border-green-500">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-green-500 bg-white dark:bg-slate-900"></div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Pickup</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{data.pickup_city}</p>
                                    <p className="text-sm text-gray-500">{data.pickup_address}</p>
                                    <p className="text-xs text-gray-400 mt-1">{data.pickup_contact_person}</p>
                                </div>
                                <div className="relative pl-6 border-l-2 border-blue-500">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-blue-500 bg-white dark:bg-slate-900"></div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Delivery</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{data.delivery_city}</p>
                                    <p className="text-sm text-gray-500">{data.delivery_address}</p>
                                    <p className="text-xs text-gray-400 mt-1">{data.delivery_contact_person}</p>
                                </div>
                            </div>
                        </PremiumCard>

                        {/* Support Card */}
                        <div className="glass-card rounded-2xl p-6 bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" /> Need Help?
                            </h3>
                            <p className="text-blue-100 text-sm mb-6">
                                Issues with this shipment? Our premium support team is priority ready for you.
                            </p>
                            <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50 border-none">
                                <Mail className="w-4 h-4 mr-2" /> Contact Support
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
