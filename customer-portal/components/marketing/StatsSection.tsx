'use client';

import { useEffect, useState } from 'react';
import { Package, Users, MapPin, TrendingUp } from 'lucide-react';

const stats = [
    { icon: Package, label: 'Deliveries Completed', value: 50000, suffix: '+' },
    { icon: Users, label: 'Happy Customers', value: 12000, suffix: '+' },
    { icon: MapPin, label: 'Cities Served', value: 150, suffix: '+' },
    { icon: TrendingUp, label: 'On-Time Rate', value: 99, suffix: '%' },
];

function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            setCount(Math.floor(end * percentage));

            if (percentage < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration]);

    return <span>{count.toLocaleString()}</span>;
}

export function StatsSection() {
    return (
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-cyan-500/5">
            <div className="container mx-auto max-w-7xl">
                <div className="grid md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="text-center p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 shadow-lg"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Icon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    <AnimatedCounter end={stat.value} />
                                    {stat.suffix}
                                </div>
                                <p className="text-muted-foreground">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
