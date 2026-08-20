import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  Printer,
  UploadCloud,
  Clock,
  Search,
  CheckCircle2,
  BookOpen,
  Copy,
  CreditCard,
  Camera,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import AuroraReviewsCarousel from '@/components/AuroraReviewsCarousel';

export const revalidate = 0; // Fresh rendering for live reviews

const DEFAULT_SERVICES = [
  {
    id: 's1',
    name: 'B&W & Color Document Printing',
    category: 'Printing',
    description: 'High-speed laser printing on A4, A3, and Legal paper for project reports & study notes.',
    startingPrice: '₹1.50 / page',
  },
  {
    id: 's2',
    name: 'Project Golden Embossed Hard Binding',
    category: 'Binding',
    description: 'Official university grade hard cover binding with gold leaf lettering for B.Tech & Degree theses.',
    startingPrice: '₹220.00 / book',
  },
  {
    id: 's3',
    name: 'Spiral & Soft Cover Binding',
    category: 'Binding',
    description: 'Durable plastic spiral coil binding with clear front transparent sheet & colored back cover.',
    startingPrice: '₹25.00 / book',
  },
  {
    id: 's4',
    name: 'Lamination & Passport Photo Printing',
    category: 'Photo & Document Services',
    description: 'Thermal pouch document lamination and instant 8/16/32 count passport photo sets.',
    startingPrice: '₹15.00 / doc',
  },
  {
    id: 's5',
    name: 'A4 / A3 Heavy Duty Xerox Photocopy',
    category: 'Xerox & Photocopy',
    description: 'Bulk study material, textbook, and question bank photocopy with automatic document feeder.',
    startingPrice: '₹1.00 / page',
  },
  {
    id: 's6',
    name: 'College Project & ID Card Printing',
    category: 'Cards & Student Services',
    description: 'PVC student ID card printing, lanyard attachment, and glossy project certificates.',
    startingPrice: '₹45.00 / card',
  },
];

const DEFAULT_REVIEWS = [
  { id: 'r1', customerName: 'Kavya S.', rating: 5, comment: 'Super fast project report printing! The golden embossed hard binding quality for our B.Tech thesis was top notch. Saved 2 hours standing in line!', date: 'Yesterday', isApproved: true, isFeatured: true, createdAt: new Date() },
  { id: 'r2', customerName: 'Venkatesh Rao', rating: 5, comment: 'Best xerox shop in Tenali opposite VSR college. Online upload feature is super convenient. Uploaded from classroom and picked up ready prints.', date: '2 days ago', isApproved: true, isFeatured: true, createdAt: new Date() },
  { id: 'r3', customerName: 'Anusha Reddy', rating: 5, comment: 'Clean spiral binding and very affordable rates for students. Color prints were crisp and clear. Highly recommended!', date: '3 days ago', isApproved: true, isFeatured: true, createdAt: new Date() },
  { id: 'r4', customerName: 'Sai Teja M.', rating: 5, comment: 'Ordered 150 pages double sided project report. Ready in 15 minutes! Live tracking update is extremely useful.', date: '4 days ago', isApproved: true, isFeatured: true, createdAt: new Date() },
];


export default async function HomePage() {
  let services = DEFAULT_SERVICES;
  let reviews = DEFAULT_REVIEWS;

  try {
    const dbServices = await prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      take: 6,
    });
    if (dbServices && dbServices.length > 0) {
      services = dbServices as any;
    }

    const dbReviews = await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
    });
    if (dbReviews && dbReviews.length > 0) {
      reviews = dbReviews as any;
    }
  } catch (err) {
    console.warn('Prisma DB query fallback triggered:', err);
  }

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION WITH AURORA ACCENTS */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/50 via-slate-950 to-slate-950 -z-10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-tr from-blue-600/30 to-indigo-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-600/30 to-pink-500/30 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Fast Document Printing in Tenali, AP
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
                Your Documents. <br />
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                  Printed Before You Arrive.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
                Upload your documents online, choose your exact printing requirements, track your order in real time, and collect it from Student Zone when it&apos;s ready.
              </p>

              {/* Tagline Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-800/90 border border-slate-700/80 max-w-xl mx-auto lg:mx-0 backdrop-blur-md shadow-xl">
                <p className="text-sm font-semibold text-cyan-300 flex items-center justify-center lg:justify-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400" /> Don&apos;t wait at the Xerox shop!
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Upload from anywhere. We&apos;ll print it. Track the order. Come when it&apos;s ready.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/order"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 transition-all active:scale-98"
                >
                  <Printer className="w-5 h-5" /> Order Prints Now
                </Link>

                <Link
                  href="/track"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition backdrop-blur-md"
                >
                  <Search className="w-5 h-5 text-cyan-400" /> Track My Order
                </Link>
              </div>

              {/* Quick Specs Pills */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> B&W & Color Xerox
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Project Golden Embossed Binding
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Pay at Store or UPI
                </span>
              </div>
            </div>

            {/* Right Card Column */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Start Your Print Order</h2>
                    <p className="text-xs text-slate-500 font-medium">Upload PDF, images or documents</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                </div>

                <Link
                  href="/order"
                  className="group border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer block"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    Click here to Upload Documents
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF, DOCX, JPG, PNG (Up to 50MB)
                  </p>
                </Link>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Color Mode</span>
                    <span className="font-bold text-slate-800">B&W or Full Color</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-medium">Paper Size</span>
                    <span className="font-bold text-slate-800">A4, A3, Legal</span>
                  </div>
                </div>

                <Link
                  href="/order"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-center block shadow-lg shadow-blue-600/20 transition"
                >
                  Continue to Order Customization →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. VISUAL WORKFLOW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Order in 4 Simple Steps
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Zero queue, zero waiting. Manage your document printing directly from your smartphone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative group hover:border-blue-400 hover:shadow-md transition">
            <div className="text-3xl font-black text-blue-100 group-hover:text-blue-200 transition mb-2">01</div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Upload</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload your PDF, images or documents directly from your phone or computer.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative group hover:border-blue-400 hover:shadow-md transition">
            <div className="text-3xl font-black text-blue-100 group-hover:text-blue-200 transition mb-2">02</div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Customize</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose copies, color/B&W, paper size, binding type and special requirements.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative group hover:border-blue-400 hover:shadow-md transition">
            <div className="text-3xl font-black text-blue-100 group-hover:text-blue-200 transition mb-2">03</div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Track</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Get a unique order number (e.g. SZ-2026-1048) and live estimated ready time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative group hover:border-blue-400 hover:shadow-md transition">
            <div className="text-3xl font-black text-blue-100 group-hover:text-blue-200 transition mb-2">04</div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Collect</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Visit Student Zone in Tenali when your status changes to Ready & collect instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SERVICES CATALOG */}
      <section className="bg-slate-100/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                Services Offered
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Popular Printing & Binding Services
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Professional quality for college students, faculty, businesses, and locals in Tenali.
              </p>
            </div>
            <Link
              href="/services"
              className="mt-4 md:mt-0 inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              View Full Services Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 font-bold">
                    <Printer className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    {service.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2 mb-1">{service.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{service.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Starting Price</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {service.startingPrice || 'Configured at Order'}
                    </span>
                  </div>
                  <Link
                    href="/order"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    Order Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CONTINUOUS AURORA REVIEWS CAROUSEL */}
      {reviews.length > 0 && <AuroraReviewsCarousel reviews={reviews} />}

      {/* 5. TRUST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Why Student Zone
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Why Students & Locals Trust Us
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Fast Service</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Industrial high-speed heavy duty printers ensure rapid completion of 100+ page reports.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Quality Printing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Crisp black text, vibrant color diagrams, and official golden embossed project hard covers.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Affordable Pricing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent per-page rates tailored for student budgets with no hidden service charges.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Convenient Pickup</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Order from your hostel room or classroom, monitor status, and collect without waiting in queue.
            </p>
          </div>
        </div>
      </section>

      {/* 6. LOCATION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Visit Student Zone Tenali</h2>
            <p className="text-sm text-blue-100 max-w-xl">
              Opposite VSR & NVR College, Main Road, Tenali, Andhra Pradesh 522201
            </p>
            <p className="text-xs text-blue-200">
              Open Monday to Saturday: 8:00 AM – 9:30 PM | Sunday: 9:00 AM – 2:00 PM
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <a
              href="tel:+919848012345"
              className="px-6 py-3.5 rounded-xl bg-white text-blue-800 font-bold text-sm text-center shadow-md hover:bg-blue-50 transition flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-blue-700" /> Call Shop
            </a>
            <a
              href="https://wa.me/919848012345?text=Hello%20Student%20Zone"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm text-center shadow-md transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
