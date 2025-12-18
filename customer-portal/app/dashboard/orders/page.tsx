'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Search, Filter, ArrowRight, MapPin, Calendar, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { Job, PaginatedResponse } from '@/types';

export default function OrdersPage() {
    const { backendUser } = useAuth();
    const [orders, setOrders] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Pagination state
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [prevPage, setPrevPage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchOrders = async (url?: string) => {
        try {
            setLoading(true);

            // Build query params
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            // If a direct URL is provided (next/prev), use it. Otherwise construct base URL with params
            const endpoint = url || `/customers/me/orders/?${params.toString()}`;

            // Handle the case where the API returns a full URL (e.g. http://server/api/...)
            // vs relative path. Our apiClient expects relative path or we can use axios directly if full URL.
            // Since apiClient has baseURL, strict full URLs might be tricky if domains mismatch in dev.
            // But Django REST framework usually returns full absolute URLs for next/previous.
            // We can strip the domain to be safe and use relative path with apiClient.

            let requestUrl = endpoint;
            if (url && url.startsWith('http')) {
                const urlObj = new URL(url);
                requestUrl = urlObj.pathname + urlObj.search;
            }

            const response = await apiClient.get<PaginatedResponse<Job>>(requestUrl);
            setOrders(response.data.results);
            setNextPage(response.data.next);
            setPrevPage(response.data.previous);
            setTotalCount(response.data.count);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (backendUser) fetchOrders();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter, backendUser]);

    const handlePageChange = (url: string | null, direction: 'next' | 'prev') => {
        if (url) {
            fetchOrders(url);
            setCurrentPage(prev => direction === 'next' ? prev + 1 : prev - 1);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_TRANSIT':
                return 'bg-blue-100 text-blue-700';
            case 'DELIVERED':
                return 'bg-green-100 text-green-700';
            case 'PENDING':
                return 'bg-amber-100 text-amber-700';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                <p className="text-gray-600">Track and manage all your shipments in one place.</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="grid md:grid-cols-[1fr_200px] gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search by ID, city, or address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12"
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-12">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Orders</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600 mb-6">Try adjusting your search or filters.</p>
                        <Button asChild>
                            <Link href="/book">Create New Order</Link>
                        </Button>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                {/* Order Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-lg font-bold text-gray-900">Order #{order.id.slice(0, 8)}...</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-gray-900">{order.pickup_city}</p>
                                                <p className="text-gray-600">→ {order.delivery_city}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-gray-900">Pickup: {new Date(order.requested_pickup_date).toLocaleDateString()}</p>
                                                <p className="text-gray-600">ETA: {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : 'Pending'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-gray-100">
                                        <p className="text-sm font-medium text-gray-500">{order.service_type.replace('_', ' ')}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3 lg:flex-shrink-0">
                                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                        <Link href={`/track/${order.id}`}>
                                            Track Order <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href={`/dashboard/orders/${order.id}`}>View Details</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalCount > 0 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(prevPage, 'prev')}
                        disabled={!prevPage}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-600">Page {currentPage}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(nextPage, 'next')}
                        disabled={!nextPage}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

