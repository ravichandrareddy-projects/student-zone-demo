'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  FileText,
  Eye,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

interface OrderKanbanCard {
  id: string;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  status: string;
  estimatedReadyTime: string;
  totalAmount: number;
  paymentStatus: string;
  items: Array<{ documentName: string; copies: number; colorMode: string; binding: string }>;
}

export default function KanbanLiveBoardPage() {
  const [orders, setOrders] = useState<OrderKanbanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/orders?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch {
      console.error('Failed to fetch Kanban orders');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    await fetchOrders();
    setToastMessage('✓ Board refreshed live with latest database updates!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 10s auto-refresh for live shop monitor
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
      }
    } catch {
      alert('Error updating status');
    }
  };

  const updateOrderTime = async (id: string, minutesToAdd: number) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    const newTimeObj = new Date(Date.now() + minutesToAdd * 60 * 1000);
    const newTimeStr = newTimeObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimatedReadyTime: newTimeStr }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, estimatedReadyTime: newTimeStr } : o))
        );
      }
    } catch {
      alert('Error updating time');
    }
  };

  const columns = [
    { key: 'NEW', title: '01 NEW ORDERS', color: 'border-amber-400 bg-amber-50/40 text-amber-900' },
    { key: 'ACCEPTED', title: '02 ACCEPTED', color: 'border-indigo-400 bg-indigo-50/40 text-indigo-900' },
    { key: 'PRINTING', title: '03 PRINTING NOW', color: 'border-blue-500 bg-blue-50/40 text-blue-900' },
    { key: 'FINISHING', title: '04 FINISHING', color: 'border-purple-400 bg-purple-50/40 text-purple-900' },
    { key: 'READY', title: '05 READY FOR PICKUP', color: 'border-emerald-500 bg-emerald-50/40 text-emerald-900' },
    { key: 'COLLECTED', title: '06 COLLECTED', color: 'border-slate-300 bg-slate-100 text-slate-700' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-2xl font-black text-slate-900">Live Order Board (Kanban)</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Advance order status in 1-click. Status changes immediately sync with customer tracking page.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition cursor-pointer active:scale-95 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Board Now'}
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs flex items-center justify-between shadow-xs">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="font-black text-emerald-800">✕</button>
        </div>
      )}

      {/* KANBAN COLUMNS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        {columns.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.key);

          return (
            <div
              key={col.key}
              className={`rounded-3xl border-2 p-4 space-y-4 min-h-[500px] ${col.color}`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-200/60">
                <h2 className="text-xs font-black uppercase tracking-wider">{col.title}</h2>
                <span className="w-6 h-6 rounded-full bg-white font-black text-xs flex items-center justify-center shadow-xs">
                  {colOrders.length}
                </span>
              </div>

              <div className="space-y-3">
                {colOrders.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic text-center py-6">No orders</p>
                ) : (
                  colOrders.map((o) => (
                    <div
                      key={o.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-black text-blue-700 text-sm">{o.orderNumber}</span>
                        <span className="font-bold text-slate-900">₹{o.totalAmount.toFixed(0)}</span>
                      </div>

                      <div>
                        <p className="font-bold text-slate-900 truncate">{o.customerName}</p>
                        <p className="text-[11px] text-slate-500">{o.customerMobile}</p>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                        <span className="font-bold text-slate-700 block truncate">
                          📄 {o.items[0]?.documentName || 'Document'}
                        </span>
                        <span className="text-slate-500 block text-[10px]">
                          {o.items.length} item(s) • {o.items[0]?.colorMode} • {o.items[0]?.binding}
                        </span>
                      </div>

                      {/* Ready Time Controller */}
                      <div className="flex items-center justify-between bg-amber-50 p-2 rounded-xl border border-amber-200 text-[11px]">
                        <span className="font-bold text-amber-900 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {o.estimatedReadyTime}
                        </span>
                        <button
                          onClick={() => updateOrderTime(o.id, 15)}
                          className="px-2 py-0.5 rounded bg-white border border-amber-300 font-bold text-[10px] text-amber-900 hover:bg-amber-100"
                          title="Add +15 minutes"
                        >
                          +15m
                        </button>
                      </div>

                      {/* Advance / Revert Status Controls */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </Link>

                        <div className="flex items-center gap-1">
                          {col.key === 'NEW' && (
                            <button
                              onClick={() => updateOrderStatus(o.id, 'ACCEPTED')}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px]"
                            >
                              Accept →
                            </button>
                          )}
                          {col.key === 'ACCEPTED' && (
                            <button
                              onClick={() => updateOrderStatus(o.id, 'PRINTING')}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px]"
                            >
                              Print →
                            </button>
                          )}
                          {col.key === 'PRINTING' && (
                            <button
                              onClick={() => updateOrderStatus(o.id, 'FINISHING')}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px]"
                            >
                              Finish →
                            </button>
                          )}
                          {col.key === 'FINISHING' && (
                            <button
                              onClick={() => updateOrderStatus(o.id, 'READY')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                            >
                              Mark Ready →
                            </button>
                          )}
                          {col.key === 'READY' && (
                            <button
                              onClick={() => updateOrderStatus(o.id, 'COLLECTED')}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px]"
                            >
                              Mark Collected ✓
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
