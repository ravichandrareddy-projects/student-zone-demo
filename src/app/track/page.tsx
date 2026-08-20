'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, CheckCircle2, AlertCircle, Phone, MessageSquare, MapPin } from 'lucide-react';

export default function TrackSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.success && data.order) {
        router.push(`/track/${data.order.orderNumber}`);
      } else {
        setError("We couldn't find that order. Please check your order number or mobile number and try again.");
      }
    } catch {
      setError('Error searching for order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Live Order Status
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Track Your Print Order
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          Enter your unique order number (e.g. SZ-2026-1048) or mobile number to see real-time preparation status and ready time.
        </p>
      </div>

      {/* Search Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl max-w-xl mx-auto space-y-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Order Number or Mobile Number
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. SZ-2026-1048 or 9848012345"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition active:scale-98"
          >
            {loading ? 'Searching Order...' : 'Track My Order Status →'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2 text-center">
          <p className="font-semibold text-slate-700">Need immediate help with your order?</p>
          <div className="flex items-center justify-center gap-4">
            <a href="tel:+919848012345" className="text-blue-600 hover:underline font-bold flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Call Shop
            </a>
            <span>•</span>
            <a href="https://wa.me/919848012345" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline font-bold flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Shop
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
