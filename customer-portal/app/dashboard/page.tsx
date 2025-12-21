'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, TrendingUp, Clock, MapPin, ArrowRight, Truck, Plus, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { Job, OrderStats, PaginatedResponse } from '@/types';
import { PremiumCard } from '@/components/shared/PremiumCard';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function DashboardPage() {
    const { backendUser } = useAuth();
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [statsRes, ordersRes] = await Promise.all([
                    apiClient.get<OrderStats>('/customers/me/orders/stats/'),
                    apiClient.get<PaginatedResponse<Job>>('/customers/me/orders/?limit=4')
                ]);
                setStats(statsRes.data);
                setRecentOrders(ordersRes.data.results);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (backendUser) {
            fetchDashboardData();
        }
    }, [backendUser]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'IN_TRANSIT':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 animate-pulse';
            case 'PENDING':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            case 'FAILED':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-7xl mx-auto"
        >
            {/* Header Section */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Hello, {backendUser?.first_name || 'Partner'}
                        <span className="ml-2 inline-block animate-wave">👋</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Welcome to your logistics command center.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link href="/book">
                            <Plus className="mr-2 h-5 w-5" />
                            New Shipment
                        </Link>
                    </Button>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PremiumCard
                    title="Active Orders"
                    icon={Package}
                    iconColor="text-blue-500"
                    loading={loading}
                    className="relative overflow-hidden group"
                >
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                            {stats?.active || 0}
                        </span>
                        <span className="text-sm text-muted-foreground">in progress</span>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
                </PremiumCard>

                <PremiumCard
                    title="Completed"
                    icon={CheckCircle}
                    iconColor="text-emerald-500"
                    loading={loading}
                    className="relative overflow-hidden group"
                >
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                            {stats?.completed || 0}
                        </span>
                        <span className="text-sm text-muted-foreground">all time</span>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                </PremiumCard>

                <PremiumCard
                    title="Total Volume"
                    icon={TrendingUp}
                    iconColor="text-amber-500"
                    loading={loading}
                    className="relative overflow-hidden group"
                >
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                            {stats?.total || 0}
                        </span>
                        <span className="text-sm text-muted-foreground">orders</span>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
                </PremiumCard>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Recent Orders */}
                <motion.div variants={item} className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-400" />
                            Recent Activity
                        </h2>
                        <Link
                            href="/dashboard/orders"
                            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <PremiumCard key={i} loading={true} />
                            ))
                        ) : recentOrders.length === 0 ? (
                            <div className="glass-card rounded-2xl p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h3>
                                <p className="text-muted-foreground mb-6">Create your first shipment to get started.</p>
                                <Button asChild>
                                    <Link href="/book">Create Shipment</Link>
                                </Button>
                            </div>
                        ) : (
                            recentOrders.map((order) => (
                                <Link href={`/track/${order.id}`} key={order.id} className="block group">
                                    <div className="glass-card rounded-2xl p-5 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-mono text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                                                        #{order.id.slice(0, 8)}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center gap-2 min-w-[140px]">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        <span className="font-medium truncate">{order.pickup_city}</span>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block" />
                                                    <div className="flex items-center gap-2 min-w-[140px]">
                                                        <MapPin className="w-4 h-4 text-emerald-500" />
                                                        <span className="font-medium truncate">{order.delivery_city}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 border-t md:border-t-0 border-gray-100 dark:border-gray-800 pt-3 md:pt-0 pl-0 md:pl-4">
                                                <div className="text-right hidden md:block">
                                                    <div className="text-xs text-muted-foreground">Estimated Delivery</div>
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {order.estimated_delivery_date
                                                            ? format(new Date(order.estimated_delivery_date), 'MMM d, yyyy')
                                                            : 'Pending Schedule'}
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Right Column: Quick Actions & Promo */}
                <motion.div variants={item} className="space-y-6">
                    <div className="glass-card rounded-2xl p-1 bg-gradient-to-b from-blue-500/10 to-cyan-500/5 border-blue-100 dark:border-blue-900/30">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Detailed Tracking</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Enter a tracking number to see exactly where your freight is right now.
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" className="w-full justify-start text-muted-foreground bg-white dark:bg-gray-900">
                                    # Order ID...
                                </Button>
                                <Button size="icon" className="bg-blue-600 hover:bg-blue-700">
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border-l-4 border-l-emerald-500">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-emerald-500" />
                            Book a Move
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Planning a residential move? Get a comprehensive quote with our new AI-powered estimator.
                        </p>
                        <Button variant="ghost" className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group">
                            Get Moving Quote <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border-l-4 border-l-amber-500">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Package className="w-5 h-5 text-amber-500" />
                            Send a Parcel
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Express courier services for documents and small packages. Same-day delivery available.
                        </p>
                        <Button variant="ghost" className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 group">
                            Book Courier <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
// Helper component for icon import
function CheckCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    )
}
