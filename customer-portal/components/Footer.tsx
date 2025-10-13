// customer-portal/components/Footer.tsx
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Company Info */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-white">
              LogiPro
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              Your trusted partner for professional moving and on-demand delivery services. We deliver reliability and peace of mind.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Delivery</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Our Services */}
          <div>
            <h3 className="text-lg font-semibold text-white uppercase tracking-wider">Our Services</h3>
            <ul className="mt-4 space-y-2">
              <li><p className="text-gray-400">Residential Moving</p></li>
              <li><p className="text-gray-400">Office Relocation</p></li>
              <li><p className="text-gray-400">Pallet Delivery</p></li>
              <li><p className="text-gray-400">Small Deliveries</p></li>
            </ul>
          </div>
          
          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white uppercase tracking-wider">Contact Info</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
                <span>123 Logistics Ave, Suite 100<br />Metropolis, USA 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>(123) 456-7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>contact@logipro.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} LogiPro Logistics Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}