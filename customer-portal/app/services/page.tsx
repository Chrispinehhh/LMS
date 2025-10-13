// customer-portal/app/services/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Truck, Building2, Package, CheckCircle, ArrowRight } from 'lucide-react';
import React from 'react';

// The data array remains the same
const services = [
  {
    icon: Truck as React.ElementType,
    title: "Residential Moving",
    description: "Whether you're moving to a new apartment or a large family home, our expert team is here to help. We handle everything from small loads to full-house moves with the utmost care, ensuring your belongings arrive safely and on time. Our fleet includes spacious lorries designed for protecting your valuable furniture and possessions.",
    features: ["Full-Service Packing & Unpacking", "Furniture Disassembly & Reassembly", "Secure, Padded Lorries", "Experienced Moving Crew"]
  },
  {
    icon: Building2 as React.ElementType,
    title: "Office Relocation",
    description: "Minimize business downtime with our efficient and organized office relocation services. We specialize in the careful handling of sensitive IT equipment, office furniture, and important documents. Our project managers work with you to create a seamless transition plan.",
    features: ["IT Equipment & Server Migration", "Furniture & Cubicle Setup", "Weekend & After-Hours Moves", "Confidential Document Handling"]
  },
  {
    icon: Package as React.ElementType,
    title: "Specialized Deliveries",
    description: "From critical B2B pallet shipments to urgent small parcel deliveries, we offer a range of specialized services. Our system recommends the optimal vehicle—from a small car for documents to a large van for pallets—to ensure cost-effective and timely delivery.",
    features: ["Same-Day & Express Options", "B2B Pallet & Freight", "Urgent Document & Parcel Service", "Real-Time Tracking Included"]
  }
];

export default function ServicesPage() {
  return (
    <div className="relative bg-gray-900 text-white">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/hero-background.jpg')" }}></div>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

      <div className="relative z-10">
        {/* Page Header */}
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Our Logistics Services
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
              Tailored solutions designed for your specific needs, big or small. We handle every job with professionalism and care.
            </p>
          </div>
        </section>

        {/* Services List with Glassmorphism */}
        <section className="pb-24">
          <div className="container mx-auto px-6">
            <div className="space-y-16">
              {services.map((service, index) => (
                // Each service is now a glass card
                <div key={index} className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                  <div className="grid md:grid-cols-5 items-center">
                    {/* Icon section */}
                    <div className={`md:col-span-2 flex items-center justify-center p-8 bg-white/5 ${index % 2 !== 0 ? 'md:order-last' : ''}`}>
                      <service.icon className="h-40 w-40 text-blue-300" />
                    </div>

                    {/* Text content section */}
                    <div className="md:col-span-3 p-8">
                      <h2 className="text-3xl font-bold text-white">{service.title}</h2>
                      <p className="mt-4 text-lg text-gray-300">{service.description}</p>
                      <ul className="mt-6 space-y-3">
                        {service.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                            <span className="text-gray-200">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final Call to Action Section */}
        <section className="bg-transparent">
          <div className="container mx-auto px-6 pb-24 text-center text-white max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight">Ready to Plan Your Move or Delivery?</h2>
            <p className="mt-4 text-lg text-blue-100">
              Our team is standing by to help you get started. Get a free, no-obligation quote in minutes.
            </p>
            <div className="mt-8">
              <Link href="/book">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 font-semibold transition-transform hover:scale-105">
                  Book a Service Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}