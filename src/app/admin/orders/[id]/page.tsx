'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle2,
  FileText,
  Download,
  Printer,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  Save,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  status: string;
  estimatedReadyTime: string;
  estimatedReadyDate?: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: string;
  items: Array<{
    id: string;
    documentName: string;
    originalFileName: string;
    fileUrl: string;
    fileSize: number;
    copies: number;
    colorMode: string;
    paperSize: string;
    sides: string;
    binding: string;
    paperType: string;
    pageRange: string;
    itemInstructions?: string;
    price: number;
  }>;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = typeof params?.id === 'string' ? params.id : '';

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [status, setStatus] = useState('NEW');
  const [estimatedReadyTime, setEstimatedReadyTime] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('UNPAID');
  const [adminNotes, setAdminNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const fetchOrderDetail = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setStatus(data.order.status);
        setEstimatedReadyTime(data.order.estimatedReadyTime || '');
        setPaymentStatus(data.order.paymentStatus);
        setAdminNotes(data.order.adminNotes || '');
        setTotalAmount(data.order.totalAmount);
      }
    } catch {
      console.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          estimatedReadyTime,
          paymentStatus,
          adminNotes,
          totalAmount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchOrderDetail();
      } else {
        alert(data.error || 'Failed to update order');
      }
    } catch {
      alert('Error updating order');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/orders');
      } else {
        alert(data.error || 'Failed to delete order');
      }
    } catch {
      alert('Error deleting order');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500 font-medium">Loading order details...</div>;
  }

  if (!order) {
    return <div className="p-12 text-center text-xs text-slate-500">Order not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* SCREEN BLUR DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-red-200 text-slate-900 space-y-5 relative">
            
            <button
              onClick={() => setDeleteModalOpen(false)}
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
                  Confirm Order Deletion
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Delete Order #{order.orderNumber}?
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900">Order #{order.orderNumber}</strong>? This action cannot be undone and will remove all associated document items.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleDeleteOrder}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-extrabold text-xs shadow-lg transition active:scale-95"
              >
                {deleting ? 'Deleting Order...' : 'Yes, Delete Order'}
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition"
          >
            <Trash2 className="w-4 h-4" /> Delete Order
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md"
          >
            <Printer className="w-4 h-4" /> Print Job Sheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Customer & Documents */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customer Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Customer Information
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Customer Name</span>
                <span className="font-bold text-slate-900 text-sm">{order.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Mobile Number</span>
                <a href={`tel:${order.customerMobile}`} className="font-bold text-blue-600 hover:underline">
                  {order.customerMobile}
                </a>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Email</span>
                <span className="font-semibold text-slate-700">{order.customerEmail || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Payment Mode</span>
                <span className="font-bold text-slate-800">{order.paymentMethod}</span>
              </div>
            </div>

            {order.customerNotes && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mt-2">
                <strong>Customer Notes:</strong> &ldquo;{order.customerNotes}&rdquo;
              </div>
            )}
          </div>

          {/* Uploaded Documents */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Uploaded Documents ({order.items.length})
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center font-bold border border-slate-200">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">{item.documentName}</p>
                        <p className="text-[11px] text-slate-500">
                          {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <a
                      href={item.fileUrl}
                      download={item.originalFileName}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> Download File
                    </a>
                  </div>

                  {/* Print specifications */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-200">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Copies</span>
                      <span className="font-bold text-slate-900">{item.copies} Copy(ies)</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Color Mode</span>
                      <span className="font-bold text-blue-700">{item.colorMode}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Paper Size</span>
                      <span className="font-bold text-slate-900">{item.paperSize}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Print Sides</span>
                      <span className="font-bold text-slate-900">{item.sides}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Binding</span>
                      <span className="font-bold text-slate-900">{item.binding}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-medium">Paper Type</span>
                      <span className="font-bold text-slate-900">{item.paperType}</span>
                    </div>
                  </div>

                  {item.itemInstructions && (
                    <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                      <strong>Special instructions:</strong> {item.itemInstructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Admin Management Controls */}
        <div className="lg:col-span-5">
          <form onSubmit={handleSaveChanges} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
            
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Shop Admin Controls
            </h2>

            {/* Status Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="NEW">NEW (Submitted)</option>
                <option value="ACCEPTED">ACCEPTED (Shop confirmed)</option>
                <option value="PRINTING">PRINTING (Documents printing)</option>
                <option value="FINISHING">FINISHING (Binding / trimming)</option>
                <option value="READY">READY (Ready for pickup)</option>
                <option value="COLLECTED">COLLECTED (Customer collected)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Estimated Ready Time Picker */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Estimated Ready Time (Shows on tracking page)
              </label>
              <input
                type="text"
                value={estimatedReadyTime}
                onChange={(e) => setEstimatedReadyTime(e.target.value)}
                placeholder="e.g. 12:45 PM"
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-blue-700 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEstimatedReadyTime('In 15 mins')}
                  className="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  +15m
                </button>
                <button
                  type="button"
                  onClick={() => setEstimatedReadyTime('In 30 mins')}
                  className="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  +30m
                </button>
                <button
                  type="button"
                  onClick={() => setEstimatedReadyTime('12:45 PM')}
                  className="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  12:45 PM
                </button>
              </div>
            </div>

            {/* Total Amount & Payment Status */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-extrabold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900"
                >
                  <option value="UNPAID">UNPAID</option>
                  <option value="PAID">PAID</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>
            </div>

            {/* Admin Internal Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Internal Shop Notes
              </label>
              <textarea
                rows={3}
                placeholder="Internal instructions for shop staff..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>

            {/* Quick Action Shortcuts */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving Updates...' : 'Save & Update Tracking'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatus('READY');
                  setPaymentStatus('PAID');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 hover:bg-emerald-100"
              >
                Quick Mark as Ready & Paid ✓
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
