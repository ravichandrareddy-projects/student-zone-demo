'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle2, XCircle, Printer, AlertTriangle, X } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  startingPrice?: string;
  active: boolean;
  sortOrder: number;
}

export default function AdminServicesManagerPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Xerox & Photocopy');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [active, setActive] = useState(true);

  // Delete Confirmation Blur Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch {
      console.error('Error loading services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const body = editingId
        ? { id: editingId, name, category, description, startingPrice, active }
        : { name, category, description, startingPrice, active };

      const res = await fetch('/api/admin/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchServices();
      } else {
        alert(data.error || 'Failed to save service');
      }
    } catch {
      alert('Error saving service');
    }
  };

  const promptDeleteService = (s: ServiceItem) => {
    setDeleteTargetId(s.id);
    setDeleteTargetName(s.name);
  };

  const confirmDeleteService = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/admin/services?id=${deleteTargetId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeleteTargetId(null);
        fetchServices();
      }
    } catch {
      alert('Error deleting service');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setCategory('Xerox & Photocopy');
    setDescription('');
    setStartingPrice('');
    setActive(true);
    setModalOpen(true);
  };

  const openEditModal = (s: ServiceItem) => {
    setEditingId(s.id);
    setName(s.name);
    setCategory(s.category);
    setDescription(s.description);
    setStartingPrice(s.startingPrice || '');
    setActive(s.active);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* SCREEN BLUR DELETE CONFIRMATION MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-red-200 text-slate-900 space-y-5 relative">
            
            <button
              onClick={() => setDeleteTargetId(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold shadow-md">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 rounded-md">
                  Confirm Deletion
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Delete Service?
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900">&ldquo;{deleteTargetName}&rdquo;</strong> from your active website catalog?
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={confirmDeleteService}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg transition active:scale-95"
              >
                Yes, Delete Service
              </button>
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Service Catalog Manager</h1>
          <p className="text-xs text-slate-500 font-medium">Add, edit or update public website service listings & prices</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Add New Service
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Service Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Starting Price</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-slate-900 block">{s.name}</span>
                      <span className="text-[11px] text-slate-500 max-w-xs block truncate">{s.description}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-700">{s.category}</td>
                    <td className="px-6 py-4 font-black text-slate-900">{s.startingPrice || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {s.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => promptDeleteService(s)}
                        className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL FORM FOR ADD/EDIT */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900">
              {editingId ? 'Edit Service' : 'Add New Service'}
            </h2>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="Xerox & Photocopy">Xerox & Photocopy</option>
                  <option value="Printing">Printing</option>
                  <option value="Binding">Binding</option>
                  <option value="Cards">Cards</option>
                  <option value="Photo & Document Services">Photo & Document Services</option>
                  <option value="Student Services">Student Services</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Starting Price (e.g. ₹2.00 / page)</label>
                <input
                  type="text"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="active" className="font-bold text-slate-800">Service Active on Public Website</label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
