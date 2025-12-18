"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Car, Package, Box } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const fleet = [
    {
        id: 2,
        name: "S&S Logistics Box Truck (Standard)",
        category: "Residential Moving",
        image: "/images/fleet/box-truck-small.jpg",
        description: "The gold standard for residential moving. Spacious enough for 1-2 bedroom apartments.",
        capabilities: ["1-2 Bedroom Apartments", "Studio Moves", "Appliance Delivery"],
        icon: Box
    },
    {
        id: 1,
        name: "Ram 1500 Limited",
        category: "Residential & Small Moves",
        image: "/images/fleet/ram-pickup.jpg",
        description: "Perfect for quick, single-item moves or small apartment relocations. Powerful and reliable.",
        capabilities: ["Single Furniture Items", "Small Apartments", "Quick Deliveries"],
        icon: Truck
    },
    {
        id: 3,
        name: "S&S Logistics Heavy Hauler",
        category: "Commercial & Large Residential",
        image: "/images/fleet/box-truck-large.jpg",
        description: "Our heavy-duty solution for large homes (3-5 bedrooms) and commercial freight.",
        capabilities: ["3-5 Bedroom Houses", "Office Relocations", "Palletized Freight"],
        icon: Truck
    },
    {
        id: 4,
        name: "Ford Focus Fleet",
        category: "Courier & Documents",
        image: "/images/fleet/ford-focus.jpg",
        description: "Agile and efficient for urgent document delivery and small parcels.",
        capabilities: ["Document Courier", "Small Parcels", "City Logistics"],
        icon: Car
    },
    {
        id: 5,
        name: "Jeep Grand Cherokee",
        category: "Priority Express",
        image: "/images/fleet/jeep-suv.jpg",
        description: "Premium express delivery for sensitive packages requiring extra care and speed.",
        capabilities: ["VIP Delivery", "Fragile Items", "Express Service"],
        icon: Car
    }
];

export default function FleetShowcase() {
    return (
        <section className="py-24 bg-muted/20 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm">
                        Our Premium Fleet
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
                        Ready for Any <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Challenge</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        From agile courier cars to heavy-duty freight trucks, we have the right vehicle for your specific needs.
                    </p>
                </div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full max-w-7xl mx-auto"
                >
                    <CarouselContent className="-ml-4">
                        {fleet.map((vehicle) => (
                            <CarouselItem key={vehicle.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="p-1 h-full">
                                    <Card className="h-full border-border bg-card overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-2">
                                        <div className="relative h-64 w-full overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                            <Image
                                                src={vehicle.image}
                                                alt={vehicle.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute bottom-4 left-4 z-20">
                                                <Badge variant="secondary" className="mb-2 backdrop-blur-md bg-white/20 text-white border-0">
                                                    {vehicle.category}
                                                </Badge>
                                                <h3 className="text-white text-xl font-bold">{vehicle.name}</h3>
                                            </div>
                                        </div>
                                        <CardContent className="p-6">
                                            <p className="text-muted-foreground mb-6 line-clamp-3">
                                                {vehicle.description}
                                            </p>

                                            <div className="space-y-3">
                                                {vehicle.capabilities.map((cap, i) => (
                                                    <div key={i} className="flex items-center gap-3 text-sm text-foreground">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                                                        {cap}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="hidden md:block">
                        <CarouselPrevious className="left-[-20px] bg-background border-border hover:bg-muted" />
                        <CarouselNext className="right-[-20px] bg-background border-border hover:bg-muted" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
}
