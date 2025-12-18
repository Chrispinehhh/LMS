// customer-portal/app/page.tsx
import Link from 'next/link';
import { Truck, Building2, Package, ArrowRight, ShieldCheck, Clock, Navigation, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteCalculator } from '@/components/QuoteCalculator';
import { TrustSignals } from '@/components/TrustSignals';

export default function HomePage() {
  return (
    <div className="relative bg-white min-h-screen">
      {/* Hero Section with Quote Calculator */}
      <section className="relative bg-gradient-to-br from-gray-50 to-blue-50 py-20 lg:py-32">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Value Proposition */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-sm font-semibold text-blue-700">Now Serving 150+ Cities</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight mb-6">
                Modern Logistics,{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Brilliantly Executed.
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-xl">
                Experience the future of delivery and moving. We blend cutting-edge technology with an unwavering commitment to premium service.
              </p>

              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Fully Insured</p>
                    <p className="text-sm text-gray-600">100% Protection</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">On-Time</p>
                    <p className="text-sm text-gray-600">99.9% Delivery Rate</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button asChild size="lg" className="h-14 px-8 bg-gray-900 hover:bg-gray-800 text-white font-semibold">
                  <Link href="/track">Track Order</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 border-2 font-semibold">
                  <Link href="/services">View Services</Link>
                </Button>
              </div>
            </div>

            {/* Right: Quote Calculator */}
            <div>
              <QuoteCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <TrustSignals />

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">
              Solutions for Every Scale
            </h2>
            <p className="text-lg text-gray-600">
              Professional logistics services tailored to your specific needs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Residential Moving Card */}
            <div className="group bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Residential Moving</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Expert handling for a stress-free move to your new home with our professional team and secure vehicles.
              </p>
              <ul className="space-y-2">
                {["Full packing services", "Furniture protection", "Secure transportation", "Timely delivery"].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Office Relocation Card */}
            <div className="group bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Office Relocation</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Efficient and organized moving services to minimize business downtime and ensure smooth transitions.
              </p>
              <ul className="space-y-2">
                {["IT equipment handling", "Minimal disruption", "Flexible scheduling", "Document security"].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Small Deliveries Card */}
            <div className="group bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Small Deliveries</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Fast, secure delivery of documents, parcels, and small pallets with real-time tracking and flexible options.
              </p>
              <ul className="space-y-2">
                {["Same-day delivery", "Small pallets", "Real-time tracking", "Multiple vehicles"].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-2 font-semibold">
              <Link href="/services">
                View All Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">
              A Superior Delivery Experience
            </h2>
            <p className="text-lg text-gray-600">
              We go above and beyond to ensure your complete satisfaction
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="group text-center bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fully Insured</h3>
              <p className="text-gray-600 leading-relaxed">
                Your items are protected with comprehensive insurance for complete peace of mind throughout the journey.
              </p>
            </div>

            <div className="group text-center bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">On-Time Guarantee</h3>
              <p className="text-gray-600 leading-relaxed">
                We value your time and maintain strict schedules with our on-time delivery guarantee for every service.
              </p>
            </div>

            <div className="group text-center bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-100 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Navigation className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Watch your delivery move on a live map from start to finish with our advanced real-time tracking system.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="h-14 px-10 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg">
              <Link href="/contact">
                Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}