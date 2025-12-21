'use client';

import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Sarah Johnson',
        company: 'Tech Startup Inc.',
        text: 'LogiPro made our office relocation seamless. The team was professional, and the real-time tracking gave us peace of mind.',
        rating: 5,
    },
    {
        name: 'Michael Chen',
        company: 'Residential Customer',
        text: 'Best moving experience ever! They handled my furniture with care and arrived exactly on time. Highly recommend!',
        rating: 5,
    },
    {
        name: 'Emily Rodriguez',
        company: 'E-commerce Business',
        text: 'We ship hundreds of packages monthly. LogiPro\'s pricing is transparent and their service is consistently excellent.',
        rating: 5,
    },
];

export function Testimonials() {
    return (
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Trusted by thousands of businesses and individuals
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                                "{testimonial.text}"
                            </p>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {testimonial.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {testimonial.company}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
