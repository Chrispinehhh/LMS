// customer-portal/app/page.tsx

import Link from 'next/link';
import { Truck, Building2, Package, ShieldCheck, Clock, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('/hero-background.jpg')" }}>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-20 filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-20 filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="relative z-10 px-6">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight drop-shadow-lg">
            Seamless Logistics, <br />
            <span className="text-blue-400">Perfectly Delivered.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg lg:text-xl text-gray-200 drop-shadow">
            Your trusted partner for professional moving and on-demand delivery services. Experience reliability and peace of mind.
          </p>
          <div className="mt-10">
            <Link href="/book">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 group">
                Get a Free Quote
                <Truck className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-base font-semibold text-blue-600 uppercase">Our Services</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Solutions for Every Scale
            </p>
          </div>
          <div className="mt-20 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
              <Truck className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Residential Moving</h3>
              <p className="mt-2 text-gray-600">Expert handling for a stress-free move to your new home.</p>
            </div>
            <div className="p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
              <Building2 className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Office Relocation</h3>
              <p className="mt-2 text-gray-600">Efficient and organized moving services to minimize business downtime.</p>
            </div>
            <div className="p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
              <Package className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Specialized Deliveries</h3>
              <p className="mt-2 text-gray-600">From critical pallets to urgent parcels, we guarantee timely and secure delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-base font-semibold text-blue-600 uppercase">Why Choose Us?</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              A Superior Delivery Experience
            </p>
          </div>
          <div className="mt-20 max-w-5xl mx-auto grid gap-12 md:grid-cols-3">
            <div className="text-center p-6 rounded-lg hover:bg-white hover:shadow-md transition-all duration-300">
              <ShieldCheck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Fully Insured</h3>
              <p className="mt-1 text-gray-600">Your items are protected for your peace of mind.</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:bg-white hover:shadow-md transition-all duration-300">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">On-Time Guarantee</h3>
              <p className="mt-1 text-gray-600">We value your time and meet our schedules, every time.</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:bg-white hover:shadow-md transition-all duration-300">
              <Navigation className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Real-Time Tracking</h3>
              <p className="mt-1 text-gray-600">Watch your delivery move on a live map from start to finish.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}