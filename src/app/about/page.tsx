import Link from 'next/link';
import { Printer, MapPin, CheckCircle2, ShieldCheck, Award, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          About Our Shop
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900">
          Student Zone Xerox & Binding Shop
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Tenali, Andhra Pradesh — Serving students, college faculty, and local businesses with speed, quality, and modern convenience.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-md space-y-8">
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
          <h2 className="text-xl font-extrabold text-slate-900">Our Story & Mission</h2>
          <p>
            Located directly opposite VSR & NVR College in Tenali, <strong>Student Zone Xerox & Binding Shop</strong> was established to eliminate the long standing queues and delays traditional Xerox shops impose on students during exam times and project submission deadlines.
          </p>
          <p>
            With our new online document ordering and tracking platform, students can upload their PDFs or image files from their phone, customize copies, color, and binding options, and track the exact estimated ready time before visiting the shop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Industrial Machinery</h3>
            <p className="text-xs text-slate-600">Heavy duty high-speed laser printers and precision report binding equipment.</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Student First</h3>
            <p className="text-xs text-slate-600">Student-friendly pricing, transparent page rates, and fast turnarounds.</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Privacy & Security</h3>
            <p className="text-xs text-slate-600">Private document storage and automatic cleanup of printed files.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Main Road, Opp. VSR College, Tenali, Andhra Pradesh 522201</span>
          </div>
          <Link
            href="/order"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
          >
            Start Printing Order Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
