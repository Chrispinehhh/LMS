"use client";

import { ClipboardCheck, Truck, PackageCheck, ArrowRight } from "lucide-react";

const steps = [
    {
        icon: ClipboardCheck,
        title: "1. Get a Quote",
        description: "Enter your details for an instant, transparent price estimate with no hidden fees.",
        color: "blue",
    },
    {
        icon: Truck,
        title: "2. We Pick Up",
        description: "Our professional team arrives at your scheduled time to securely load your items.",
        color: "cyan",
    },
    {
        icon: PackageCheck,
        title: "3. Delivered",
        description: "Track your shipment in real-time until it safely arrives at its destination.",
        color: "emerald",
    },
];

export function ProcessSteps() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-60 pointer-events-none" />

            <div className="container mx-auto px-6 max-w-7xl relative">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-4">
                        How S&S Logistics Works
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        A seamless experience from start to finish
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-[2.5rem] left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-blue-300 via-cyan-300 to-emerald-300 opacity-30" />

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className="relative group text-center">
                                <div className={`relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-${step.color}-500/10 to-${step.color}-500/5 border border-${step.color}-200/20 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-${step.color}-500/10`}>
                                    <Icon className={`h-10 w-10 text-${step.color}-600 dark:text-${step.color}-400`} />
                                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-${step.color}-600 text-white flex items-center justify-center text-sm font-bold border-4 border-background`}>
                                        {index + 1}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
