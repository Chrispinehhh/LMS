"use client";

import { useApi } from "@/hooks/useApi";
import { Job } from "@/types";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
    CheckCircle2,
    Truck,
    Clock,
    AlertCircle,
    ChevronRight,
    Package
} from "lucide-react";

interface JobsResponse {
    count: number;
    results: Job[];
}

export function RecentActivity() {
    const { data: response, isLoading, error } = useApi<JobsResponse>('/jobs/?limit=5');
    const jobs = response?.results || [];

    const getStatusIcon = (status: Job['status']) => {
        switch (status) {
            case 'DELIVERED': return CheckCircle2;
            case 'IN_TRANSIT': return Truck;
            case 'PENDING': return Clock;
            case 'FAILED': return AlertCircle;
            default: return Package;
        }
    };

    const getStatusColor = (status: Job['status']) => {
        switch (status) {
            case 'DELIVERED': return "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20";
            case 'IN_TRANSIT': return "text-blue-500 bg-blue-100 dark:bg-blue-900/20";
            case 'PENDING': return "text-amber-500 bg-amber-100 dark:bg-amber-900/20";
            case 'FAILED': return "text-red-500 bg-red-100 dark:bg-red-900/20";
            default: return "text-gray-500 bg-gray-100 dark:bg-gray-800";
        }
    };

    if (error) return (
        <div className="glass-card p-6 rounded-2xl flex items-center justify-center text-destructive h-[400px]">
            Failed to load recent activity
        </div>
    );

    return (
        <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Recent Activity</h2>
                <Link
                    href="/jobs"
                    className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                    View All <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
                            </div>
                        </div>
                    ))
                ) : jobs.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">No recent activity</div>
                ) : (
                    jobs.map((job, i) => {
                        const Icon = getStatusIcon(job.status);
                        const colorClass = getStatusColor(job.status);

                        return (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative flex gap-4"
                            >
                                {/* Timeline Line */}
                                {i !== jobs.length - 1 && (
                                    <div className="absolute left-[1.25rem] top-10 bottom-[-1.5rem] w-px bg-border group-hover:bg-primary/30 transition-colors" />
                                )}

                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 ${colorClass}`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 pb-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                                                {job.job_type === 'RESIDENTIAL' ? 'Residential Move' : 'Commercial Freight'}
                                            </h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {job.customer?.first_name} {job.customer?.last_name} • {job.pickup_city} → {job.delivery_city}
                                            </p>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-full whitespace-nowrap">
                                            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                                        </span>
                                    </div>

                                    <div className="mt-2 flex items-center gap-2">
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${job.status === 'DELIVERED' ? 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400' :
                                                'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400'
                                            }`}>
                                            {job.status.replace('_', ' ')}
                                        </span>
                                        <Link href={`/jobs/${job.id}`} className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
