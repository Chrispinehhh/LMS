"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from "lucide-react";
import JobForm from "../JobForm";

export default function CreateJobPage() {
    const router = useRouter();

    const handleSuccess = () => {
        // Redirect to the jobs list on success
        router.push('/jobs');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 pb-20">
            {/* Premium Header Bar */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 shadow-sm backdrop-blur-xl bg-opacity-80 dark:bg-opacity-80">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/jobs"
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                Create New Job
                                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                                    Draft
                                </span>
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                                New Shipment Entry
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mr-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> System Online
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Canvas */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <JobForm onSuccess={handleSuccess} />
            </div>
        </div>
    );
}
