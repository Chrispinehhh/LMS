"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Truck, Package, Home, Building2, Armchair, Warehouse, ShoppingCart, Ship, Briefcase, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="fixed inset-0 bg-gradient-to-br from-background to-muted/30 -z-10"></div>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-6 py-1.5 text-sm uppercase tracking-wider">
            Our Departments
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
            World-Class <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Logistics</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Specialized solutions for both residential homes and commercial enterprises. Tailored, efficient, and reliable.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-24 max-w-7xl space-y-32">

        {/* Residential Moving Department */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            {/* Image Placeholder - In real app, use next/image with actual asset */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-muted relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent mix-blend-overlay z-10"></div>
              <img
                src="/images/fleet/box-truck-small.jpg"
                alt="Residential Moving"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Floating Price Card */}
            <div className="absolute -bottom-8 -right-8 bg-card p-6 rounded-2xl shadow-xl border border-border max-w-xs animate-bounce-slow hidden md:block">
              <div className="text-sm text-muted-foreground uppercase font-semibold mb-1">Standard Rate</div>
              <div className="text-4xl font-black text-primary">$120<span className="text-lg text-muted-foreground">/hr</span></div>
              <div className="text-sm text-foreground mt-2 font-medium">Includes Truck + Driver + 2 Helpers</div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                  <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Residential Movers</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're moving a single studio apartment or a large family home, our residential team handles your belongings with care. We specialize in making your move stress-free.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground text-lg">We Handle:</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Studio Apartments (Bedsitters)",
                  "1-2 Bedroom Apartments",
                  "3-5 Bedroom Homes",
                  "Single Item Moves (TVs, Stands)",
                  "Furniture Relocation",
                  "Appliance Delivery"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
              <div className="flex items-start gap-4">
                <Armchair className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="font-bold text-foreground mb-1">Single Item Transport</h4>
                  <p className="text-sm text-muted-foreground">
                    Bought a new TV or sofa? We pick it up and deliver it directly to your living room. No move is too small.
                  </p>
                </div>
              </div>
            </div>

            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25">
              <Link href="/book" className="flex items-center">
                Book Residential Move <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Small Moves & Quick Hauls (Ram 1500) */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Small Moves & Quick Hauls</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Perfect for studio apartments, student moves, or when you just need to move a few items. We prioritize agility and cost-effectiveness without compromising on care.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground text-lg">Perfect For:</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Studio / 1-Bedroom Apts",
                  "Student Living Moves",
                  "Furniture Store Pickups",
                  "Single Item Transport",
                  "Craigslist / Marketplace Hauls",
                  "Appliance Delivery"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/10">
              <div className="flex items-start gap-4">
                <Truck className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <h4 className="font-bold text-foreground mb-1">Agile Fleet: Ram 1500</h4>
                  <p className="text-sm text-muted-foreground">
                    Our powerful pickups can access tight city streets and loading docks that larger trucks can't.
                  </p>
                </div>
              </div>
            </div>

            <Button size="lg" variant="outline" className="border-indigo-500/20 text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400">
              <Link href="/book" className="flex items-center">
                Get Quick Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-muted relative group">
              <div className="absolute inset-0 bg-gradient-to-bl from-indigo-600/20 to-transparent mix-blend-overlay z-10"></div>
              <img
                src="/images/fleet/ram-pickup.jpg"
                alt="Small Moves"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </section>

        {/* Commercial Freight Department */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            {/* Image Placeholder */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-muted relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent mix-blend-overlay z-10"></div>
              <img
                src="/images/fleet/box-truck-large.jpg"
                alt="Commercial Freight"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Feature Badges */}
            <div className="flex gap-3 absolute -bottom-6 left-6 right-6 justify-center">
              <div className="bg-card px-4 py-2 rounded-xl border border-border shadow-lg flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" />
                <span className="font-semibold text-sm">Palletized</span>
              </div>
              <div className="bg-card px-4 py-2 rounded-xl border border-border shadow-lg flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-sm">Lift Gate</span>
              </div>
            </div>
          </div>

          <div className="space-y-8 order-1 lg:order-2">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Commercial Freight</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Professional B2B logistics for warehouse-to-warehouse and company-to-company freight movement. We handle heavy, bulky, and specialized commercial cargo.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground text-lg">Cargo Types:</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Warehouse to Warehouse",
                  "Company to Company",
                  "Heavy Boxes (up to 80lb)",
                  "Pallets / Skids (All Sizes)",
                  "Barrels & Cylinders",
                  "Industrial Tubes",
                  "Lift / Long Pallets"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-500/5 p-6 rounded-2xl border border-orange-500/10">
              <div className="flex items-start gap-4">
                <Warehouse className="h-6 w-6 text-orange-600 mt-1" />
                <div>
                  <h4 className="font-bold text-foreground mb-1">Corporate Contracts</h4>
                  <p className="text-sm text-muted-foreground">
                    Reliable scheduled routes and contract logistics for businesses. Secure, tracked, and insured.
                  </p>
                </div>
              </div>
            </div>

            <Button size="lg" variant="outline" className="border-orange-500/20 text-orange-600 hover:bg-orange-500/10 dark:text-orange-400">
              <Link href="/contact" className="flex items-center">
                Get Commercial Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Express Courier (Ford Focus) */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 order-1 lg:order-1">
            {/* Left Text */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Express Courier</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Rapid, secure city logistics for documents, small parcels, and time-sensitive materials. We keep your business connected.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground text-lg">Services:</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Legal Document Delivery",
                  "Medical Specimen Transport",
                  "E-commerce Last Mile",
                  "Inter-office Mail",
                  "Passport & Visa Service",
                  "Bank Deposit Runs"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10">
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-amber-600 mt-1" />
                <div>
                  <h4 className="font-bold text-foreground mb-1">Chain of Custody</h4>
                  <p className="text-sm text-muted-foreground">
                    Full tracking and signature requirements available for sensitive materials.
                  </p>
                </div>
              </div>
            </div>

            <Button size="lg" variant="outline" className="border-amber-500/20 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400">
              <Link href="/book" className="flex items-center">
                Book Courier <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="relative order-2 lg:order-2">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-muted relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent mix-blend-overlay z-10"></div>
              <img
                src="/images/fleet/ford-focus.jpg"
                alt="Courier Service"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </section>

        {/* VIP & Priority Service (Jeep) */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-muted relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 to-transparent mix-blend-overlay z-10"></div>
              <img
                src="/images/fleet/jeep-suv.jpg"
                alt="VIP Priority"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Badge */}
            <div className="absolute -top-4 -right-4 bg-rose-600 text-white px-6 py-2 rounded-full font-bold shadow-lg animate-pulse">
              PRIORITY
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">VIP & Priority Service</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                When "soon" isn't good enough. Our premium rush service guarantees direct, non-stop delivery for your most critical items.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground text-lg">Why Choose VIP?</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Direct A-to-B Transport",
                  "No Stops for Other Orders",
                  "Fragile / High-Value Care",
                  "Real-Time Live Tracking",
                  "Confidential Handling",
                  "24/7 Availability"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-rose-500 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-rose-500/5 p-6 rounded-2xl border border-rose-500/10">
              <div className="flex items-start gap-4">
                <Truck className="h-6 w-6 text-rose-600 mt-1" />
                <div>
                  <h4 className="font-bold text-foreground mb-1">Premium Fleet: Grand Cherokee</h4>
                  <p className="text-sm text-muted-foreground">
                    Transported in high-end SUVs ensuring maximum shock absorption and security for fragile goods.
                  </p>
                </div>
              </div>
            </div>

            <Button size="lg" className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25">
              <Link href="/book" className="flex items-center">
                Book Priority Run <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-10">
          <h2 className="text-3xl font-bold mb-6">Ready to get moving?</h2>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              <Link href="/book">Book Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-input hover:bg-accent text-foreground">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}