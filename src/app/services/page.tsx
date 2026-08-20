import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Printer, Copy, BookOpen, CreditCard, Camera, FileSpreadsheet, Layers, ArrowRight } from 'lucide-react';

export const revalidate = 60;

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
  });

  const categories = [
    'All',
    'Xerox & Photocopy',
    'Printing',
    'Binding',
    'Cards',
    'Photo & Document Services',
    'Student Services',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Comprehensive Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Our Xerox & Printing Services
        </h1>
        <p className="text-slate-600 text-sm">
          Everything from high-speed black & white copies to official golden embossed college project report binding.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 font-bold">
                <Printer className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                {service.category}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2 mb-1">{service.name}</h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">{service.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Starting Price</span>
                <span className="text-base font-black text-slate-900">
                  {service.startingPrice || 'Configured at Order'}
                </span>
              </div>
              <Link
                href="/order"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1"
              >
                Order Prints <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold">Have custom bulk printing requirements?</h3>
          <p className="text-xs sm:text-sm text-slate-300">
            We provide special volume discounts for college departments, schools, and local businesses in Tenali.
          </p>
        </div>
        <Link
          href="/contact"
          className="px-6 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-blue-50 transition shrink-0"
        >
          Contact Shop Owner
        </Link>
      </div>

    </div>
  );
}
