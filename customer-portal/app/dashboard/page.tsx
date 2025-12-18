'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, TrendingUp, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { Job, OrderStats, PaginatedResponse } from '@/types';

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
                    apiClient.get<PaginatedResponse<Job>>('/customers/me/orders/?limit=3')
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

    const statCards = [
        { label: 'Active Orders', value: stats?.active || 0, icon: Package, color: 'blue' },
        { label: 'Completed', value: stats?.completed || 0, icon: TrendingUp, color: 'green' },
        { label: 'Total Orders', value: stats?.total || 0, icon: Clock, color: 'amber' },
    ];


    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {backendUser?.first_name || 'Customer'}!</h1>
                <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your shipments today.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    // Using direct colors for consistency but adapting backgrounds for dark mode
                    // e.g. bg-blue-100 -> dark:bg-blue-500/10
                    const colorClasses = {
                        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
                        green: 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400',
                        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
                    };

                    return (
                        <div key={index} className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`h-12 w-12 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-foreground mb-1">
                                {loading ? '...' : stat.value}
                            </p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-white shadow-md">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Need to ship something?</h2>
                        <p className="text-blue-100">Get an instant quote and book your shipment in minutes.</p>
                    </div>
                    <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-white/90 font-semibold flex-shrink-0 border-0">
                        <Link href="/book">
                            Book Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Recent Orders */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Recent Orders</h2>
                    <Button asChild variant="outline" className="text-foreground border-input hover:bg-accent hover:text-accent-foreground">
                        <Link href="/dashboard/orders">View All</Link>
                    </Button>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <p className="text-center text-muted-foreground py-8">Loading recent orders...</p>
                    ) : recentOrders.length === 0 ? (
                        <div className="text-center py-8 bg-card rounded-xl border border-border">
                            <p className="text-muted-foreground mb-4">No recent orders found.</p>
                            <Button asChild variant="outline">
                                <Link href="/book">Create your first order</Link>
                            </Button>
                        </div>
                    ) : (
                        recentOrders.map((order) => (
                            <div key={order.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <p className="text-lg font-semibold text-foreground">#{order.id.slice(0, 8)}...</p>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{order.pickup_city}</span>
                                            <ArrowRight className="h-4 w-4" />
                                            <span>{order.delivery_city}</span>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            Booked: {new Date(order.requested_pickup_date).toLocaleDateString()} • ETA: {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : 'Pending'}
                                        </p>
                                    </div>

                                    <Button asChild variant="outline" className="border-input hover:bg-accent text-foreground">
                                        <Link href={`/track/${order.id}`}>Track Order</Link>
                                    </Button>
                                </div>
                            </div>
                        )))}
                </div>
            </div>
        </div>
    );
}
