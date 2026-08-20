'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Printer, MapPin, Phone, MessageSquare, Clock, Mail, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Branding & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <Printer className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                STUDENT ZONE
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Tenali’s premier online document printing and binding platform. Upload from anywhere, track in real-time, collect when ready.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">Our Differentiator</p>
              <p className="text-xs text-slate-300">
                &ldquo;Don&apos;t wait at the Xerox shop. Upload online, track live, and visit only when it&apos;s ready.&rdquo;
              </p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/order" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <span className="text-blue-500">•</span> Order Prints Online
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <span className="text-blue-500">•</span> Track My Order Status
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <span className="text-blue-500">•</span> Xerox & Binding Services
                </Link>
              </li>
              <li>
                <Link href="/advertising" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <span className="text-blue-500">•</span> Business Advertising & Flex
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <span className="text-blue-500">•</span> About Student Zone Tenali
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <span className="text-blue-500">•</span> Contact & Directions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Services Offered */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Key Services</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• B&W & Color Xerox / Photocopy</li>
              <li>• Project Report Hard Embossed Binding</li>
              <li>• Spiral & Soft Cover Strip Binding</li>
              <li>• Resume & Assignment Printing</li>
              <li>• Visiting Cards & PVC ID Cards</li>
              <li>• Instant Passport Size Photographs</li>
              <li>• Flex Banners & Shop Signage</li>
              <li>• High Speed Document Scanning</li>
            </ul>
          </div>

          {/* Col 4: Shop Info & Direct Triggers */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Shop Contact</h3>
            <p className="text-xs text-slate-300 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Main Road, Opposite VSR College, Tenali, Andhra Pradesh 522201</span>
            </p>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Mon - Sat: 8:00 AM - 9:30 PM</span>
            </p>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>contact@studentzonetenali.com</span>
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="tel:+919848012345"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
              >
                <Phone className="w-3.5 h-3.5" /> Call Shop (+91 98480 12345)
              </a>
              <a
                href="https://wa.me/919848012345?text=Hello%20Student%20Zone%20Tenali"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Shop
              </a>
              <a
                href="https://maps.google.com/?q=Tenali+Andhra+Pradesh"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Get Google Maps Directions
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Student Zone Xerox & Binding Shop, Tenali. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link href="/admin/login" className="hover:text-slate-300 flex items-center gap-1 transition">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Admin Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
