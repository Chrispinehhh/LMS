'use client';

import React from 'react';
import { Truck, Users, Shield, Clock, Star, CheckCircle } from 'lucide-react';

// Define types locally if not available yet in index.ts for this component scope
// but ideally we import from @/types
import apiClient from '@/lib/api';
import { useEffect, useState } from 'react';

const defaultStats = [
    { icon: Users, label: 'Happy Customers', value: '10,000+', color: 'blue', key: 'totalCustomers' },
    { icon: Truck, label: 'Deliveries Completed', value: '50,000+', color: 'green', key: 'completedDeliveries' },
    { icon: Shield, label: 'Active Orders', value: '230+', color: 'amber', key: 'activeOrders' },
    { icon: Clock, label: 'On-Time Delivery', value: '99.9%', color: 'cyan', key: 'onTimeRate' },
];

const testimonials = [
    {
        name: 'Sarah Johnson',
        company: 'Tech Innovations Inc.',
        rating: 5,
        text: 'Exceptional service! They handled our office relocation seamlessly. Everything arrived on time and in perfect condition.',
        image: '/testimonials/sarah.jpg' // Placeholder
    },
    {
        name: 'Michael Chen',
        company: 'Downtown Retail',
        rating: 5,
        text: 'The real-time tracking and professional drivers made this the easiest shipping experience we\'ve ever had.',
        image: '/testimonials/michael.jpg' // Placeholder
    },
    {
        name: 'Emily Rodriguez',
        company: 'Home Owner',
        rating: 5,
        text: 'Moving to a new state was stressful, but S&S Logistics made the logistics part effortless. Highly recommend!',
        image: '/testimonials/emily.jpg' // Placeholder
    },
];

const badges = [
    { name: 'SSL Secured', icon: Shield, description: '256-bit encryption' },
    { name: 'Fully Insured', icon: CheckCircle, description: 'Up to $100k coverage' },
    { name: '24/7 Support', icon: Clock, description: 'Always here to help' },
];

export function TrustSignals() {
    const [statsData, setStatsData] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/analytics/public-stats/');
                setStatsData(response.data);
            } catch (error) {
                console.error("Failed to fetch public stats", error);
                // Fallback will be handled by rendering logic
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="py-20 bg-muted/20">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Stats Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-2 mb-4">
                        <Star className="h-5 w-5 text-primary fill-primary" />
                        <span className="text-sm font-semibold text-primary">TRUSTED BY THOUSANDS</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                        Why Customers Choose Us
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Join thousands of satisfied customers who trust S&S Logistics for their logistics needs
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {defaultStats.map((stat, index) => {
                        const Icon = stat.icon;
                        const colorClasses = {
                            blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                            green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                            amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                            cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
                        };

                        // Determine display value
                        let displayValue = stat.value;
                        if (statsData && statsData[stat.key]) {
                            const val = statsData[stat.key];
                            if (stat.key === 'onTimeRate') {
                                displayValue = `${val}%`;
                            } else if (typeof val === 'number') {
                                displayValue = val.toLocaleString() + '+';
                            }
                        }

                        return (
                            <div
                                key={index}
                                className="group bg-card rounded-2xl border border-border p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${colorClasses[stat.color as keyof typeof colorClasses]} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="h-7 w-7" />
                                </div>
                                <div className="text-3xl font-black text-foreground mb-2">{displayValue}</div>
                                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>


                {/* Testimonials Section */}
                <div className="mb-20">
                    <h3 className="text-2xl font-bold text-foreground text-center mb-10">
                        What Our Customers Say
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground leading-relaxed mb-6">
                                    "{testimonial.text}"
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-border">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Badges */}
                <div className="bg-card rounded-2xl border border-border p-8">
                    <h3 className="text-xl font-bold text-foreground text-center mb-8">
                        Your Security is Our Priority
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {badges.map((badge, index) => {
                            const Icon = badge.icon;
                            return (
                                <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                                    <div className="flex-shrink-0 h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{badge.name}</p>
                                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-8 pt-6 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Money-Back Guarantee:</span> If we don't meet our delivery promise, you get a full refund.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
