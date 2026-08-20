'use client';

import { useState } from 'react';
import {
  Megaphone,
  CheckCircle2,
  UploadCloud,
  FileText,
  Building,
  Phone,
  Send,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export default function AdvertisingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('Flex & Banner Printing');

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [preferredSize, setPreferredSize] = useState('');
  const [designAvailable, setDesignAvailable] = useState('No');
  const [requirements, setRequirements] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submittedLeadNumber, setSubmittedLeadNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          businessName,
          phone,
          email,
          service: selectedService,
          quantity,
          preferredSize,
          designAvailable,
          requirements,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedLeadNumber(data.leadNumber);
      } else {
        setError(data.error || 'Failed to submit quote request.');
      }
    } catch {
      setError('Network error submitting quote request.');
    } finally {
      setSubmitting(false);
    }
  };

  const servicesList = [
    {
      title: 'Flex & Banner Printing',
      desc: 'Shop front banners, event banners, outdoor promotional signage, HD glossy flex prints.',
      icon: Megaphone,
    },
    {
      title: 'Poster Printing',
      desc: 'Promotional posters, event announcements, campaign posters, glossy indoor poster prints.',
      icon: Sparkles,
    },
    {
      title: 'Visiting Cards',
      desc: 'Premium 350 GSM business cards, single & double sided matte, glossy, velvet finish.',
      icon: FileText,
    },
    {
      title: 'ID Cards & Lanyards',
      desc: 'Employee plastic PVC identity cards, student badges, event press tags with custom printed lanyards.',
      icon: Building,
    },
    {
      title: 'Stickers & Product Labels',
      desc: 'Waterproof product branding stickers, promotional labels, die-cut custom vinyl decals.',
      icon: CheckCircle2,
    },
    {
      title: 'Flyers & Pamphlets',
      desc: 'Mass promotional leaflets, product brochures, newspaper inserts, event flyers.',
      icon: Send,
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            Business Advertising Solutions
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Make Your Business Impossible to Miss.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Professional printing and promotional solutions for businesses, shops, events, and organizations in Tenali and surrounding regions.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.title}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 font-bold">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">{srv.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">{srv.desc}</p>
                </div>

                <button
                  onClick={() => {
                    setSelectedService(srv.title);
                    setModalOpen(true);
                    setSubmittedLeadNumber(null);
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  Request a Quote →
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* QUOTE REQUEST MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-lg font-bold"
            >
              ✕
            </button>

            {submittedLeadNumber ? (
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-bold text-2xl">
                  ✓
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Quote Request Sent!</h3>
                <p className="text-xs text-slate-600">
                  Your reference ID is <strong className="text-slate-900">{submittedLeadNumber}</strong>. Student Zone team will contact you shortly with exact pricing and proof details.
                </p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuote} className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase">Service Selected</span>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedService}</h3>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Suresh Naidu"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Tenali Tiffins"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="9848012345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Preferred Size (e.g. 10ft x 4ft)</label>
                    <input
                      type="text"
                      placeholder="Standard or custom dimensions"
                      value={preferredSize}
                      onChange={(e) => setPreferredSize(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ready Design Available?</label>
                    <select
                      value={designAvailable}
                      onChange={(e) => setDesignAvailable(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                    >
                      <option value="No">No (Need Student Zone Design)</option>
                      <option value="Yes">Yes (Ready file available)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Additional Requirements</label>
                  <textarea
                    rows={2}
                    placeholder="Specific colors, material preference, delivery date..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Quote Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
