'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Save, RefreshCw, CheckCircle2 } from 'lucide-react';

interface RateItem {
  id: string;
  key: string;
  label: string;
  category: string;
  rate: number;
  unit: string;
  description?: string;
}

export default function AdminPricingPage() {
  const [rates, setRates] = useState<RateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/admin/pricing');
      const data = await res.json();
      if (data.success) {
        setRates(data.rates);
      }
    } catch {
      console.error('Failed to load rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleRateChange = (key: string, newRate: string) => {
    setRates((prev) =>
      prev.map((r) => (r.key === key ? { ...r, rate: parseFloat(newRate) || 0 } : r))
    );
  };

  const handleSaveAllRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);

    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rates: rates.map((r) => ({ key: r.key, rate: r.rate })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      } else {
        alert(data.error || 'Failed to save pricing rates');
      }
    } catch {
      alert('Error updating rates');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pricing Engine Configuration</h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure per-page rates and binding charges. Directly impacts customer order price estimator.
          </p>
        </div>

        <button
          onClick={fetchRates}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Pricing rates updated successfully! Dynamic estimator reflects new rates immediately.
        </div>
      )}

      <form onSubmit={handleSaveAllRates} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading rates...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rates.map((rate) => (
                <div key={rate.key} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded">
                      {rate.category}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1">{rate.label}</h3>
                    <p className="text-xs text-slate-500">{rate.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      value={rate.rate}
                      onChange={(e) => handleRateChange(rate.key, e.target.value)}
                      className="w-28 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-black text-slate-900 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-500 font-semibold">{rate.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving Changes...' : 'Save All Pricing Rates'}
        </button>
      </form>

    </div>
  );
}
