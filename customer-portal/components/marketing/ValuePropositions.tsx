'use client';

import { CheckCircle, Shield, Zap, DollarSign } from 'lucide-react';

const values = [
    {
        icon: Zap,
        title: 'Lightning Fast',
        description: 'Same-day pickup available. Your cargo moves when you need it.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
        icon: DollarSign,
        title: 'Transparent Pricing',
        description: 'No hidden fees. What you see is what you pay.',
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
        icon: Shield,
        title: 'Fully Insured',
        description: 'Every shipment protected. Real-time GPS tracking included.',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
];

export function ValuePropositions() {
    return (
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Why Choose LogiPro?
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Professional logistics with a personal touch
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {values.map((value, index) => {
                        const Icon = value.icon;
                        return (
                            <div
                                key={index}
                                className="group p-8 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary transition-all hover:shadow-xl bg-white dark:bg-slate-900"
                            >
                                <div className={`w-16 h-16 ${value.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-8 h-8 ${value.color}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-muted-foreground">
                                    {value.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
