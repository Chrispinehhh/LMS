'use client';

import { ClipboardCheck, Truck, MapPin } from 'lucide-react';

const steps = [
    {
        icon: ClipboardCheck,
        title: 'Get Instant Quote',
        description: 'Enter your details and get transparent pricing in seconds',
    },
    {
        icon: Truck,
        title: 'Schedule Pickup',
        description: 'Choose your preferred pickup time. We handle the rest',
    },
    {
        icon: MapPin,
        title: 'Track & Receive',
        description: 'Real-time GPS tracking until safe delivery',
    },
];

export function HowItWorks() {
    return (
        <section className="py-20 px-4 bg-white dark:bg-slate-950">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        How It Works
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Three simple steps to hassle-free delivery
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className="relative">
                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-cyan-500" />
                                )}

                                <div className="relative z-10 text-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
                                        <Icon className="w-12 h-12 text-white" />
                                    </div>
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-md border-2 border-primary">
                                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
