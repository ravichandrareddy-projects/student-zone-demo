'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Phone, Mail, FileText, CheckCircle2, Save } from 'lucide-react';

interface LeadItem {
  id: string;
  leadNumber: string;
  customerName: string;
  businessName: string;
  phone: string;
  email?: string;
  service: string;
  quantity: number;
  preferredSize?: string;
  requirements?: string;
  quotedPrice?: number;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit lead modal
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [status, setStatus] = useState('New');
  const [quotedPrice, setQuotedPrice] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/admin/leads');
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch {
      console.error('Error fetching leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const openLeadModal = (lead: LeadItem) => {
    setSelectedLead(lead);
    setStatus(lead.status);
    setQuotedPrice(lead.quotedPrice ? String(lead.quotedPrice) : '');
    setAdminNotes(lead.adminNotes || '');
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLead.id,
          status,
          quotedPrice,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedLead(null);
        fetchLeads();
      } else {
        alert(data.error || 'Failed to update lead');
      }
    } catch {
      alert('Error updating lead');
    } finally {
      setSaving(false);
    }
  };

  const leadStatuses = ['New', 'Contacted', 'Quotation Sent', 'Confirmed', 'In Production', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900">Advertising & Banner Leads</h1>
        <p className="text-xs text-slate-500 font-medium">Business promotional quote requests from local shops & events</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading advertising leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No advertising quote requests submitted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Ref ID</th>
                  <th className="px-6 py-3.5">Customer & Business</th>
                  <th className="px-6 py-3.5">Service Requested</th>
                  <th className="px-6 py-3.5">Qty / Size</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Quoted Amount</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-black text-blue-700">{l.leadNumber}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">{l.businessName}</span>
                      <span className="text-slate-500 text-[11px] block">{l.customerName} ({l.phone})</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{l.service}</td>
                    <td className="px-6 py-4 text-slate-600">{l.quantity} pcs ({l.preferredSize || 'Standard'})</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        l.status === 'New' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      {l.quotedPrice ? `₹${l.quotedPrice.toFixed(2)}` : 'Pending Quote'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openLeadModal(l)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold"
                      >
                        Manage Quote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <h2 className="text-lg font-extrabold text-slate-900">
              Manage Advertising Lead #{selectedLead.leadNumber}
            </h2>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <p><strong>Business:</strong> {selectedLead.businessName} ({selectedLead.customerName})</p>
              <p><strong>Phone:</strong> {selectedLead.phone}</p>
              <p><strong>Service:</strong> {selectedLead.service} - Qty: {selectedLead.quantity}</p>
              {selectedLead.requirements && <p><strong>Details:</strong> &ldquo;{selectedLead.requirements}&rdquo;</p>}
            </div>

            <form onSubmit={handleSaveLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lead Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
                  {leadStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quoted Price (₹)</label>
                <input
                  type="number"
                  step="10"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  placeholder="e.g. 1200"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Notes</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes on proof sent, customer feedback..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold"
                >
                  {saving ? 'Saving...' : 'Save Lead Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
