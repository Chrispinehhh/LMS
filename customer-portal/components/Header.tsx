// customer-portal/components/Header.tsx
"use client"; // This component uses client-side hooks like Link

import Link from 'next/link';

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-white">
              LogiPro
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/services" className="text-gray-300 hover:text-white transition-colors font-medium">
              Our Services
            </Link>
            <Link href="/track" className="text-gray-300 hover:text-white transition-colors font-medium">
              Track Your Delivery
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors font-medium">
              Contact Us
            </Link>
          </div>
          <div className="hidden md:block">
              <Link href="http://localhost:3000/login" target="_blank" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Client Portal
              </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}