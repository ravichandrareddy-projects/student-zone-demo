'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  Printer,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Eye,
  Kanban,
  RefreshCw,
  FileText,
  Bell,
  X,
  Volume2,
} from 'lucide-react';

interface OrderItem {
  id: string;
  documentName: string;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  status: string;
  estimatedReadyTime: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

const playAdminNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playNote = (freq: number, startTime: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    };
    playNote(659.25, ctx.currentTime); // E5
    playNote(880.00, ctx.currentTime + 0.18); // A5
  } catch {}
};

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);

  const prevNewCountRef = useRef<number>(0);
  const isFirstLoadRef = useRef<boolean>(true);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/orders?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const fetchedOrders: Order[] = data.orders;
        setOrders(fetchedOrders);
        setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        const newOrders = fetchedOrders.filter((o) => o.status === 'NEW');

        // Check if new order arrived for screen blur alert + chime sound
        if (!isFirstLoadRef.current && newOrders.length > prevNewCountRef.current) {
          const latestNew = newOrders[0];
          if (latestNew) {
            setNewOrderAlert(latestNew);
            playAdminNotificationSound();
          }
        }

        prevNewCountRef.current = newOrders.length;
        isFirstLoadRef.current = false;
      }
    } catch {
      console.error('Failed to fetch admin dashboard orders');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh metrics every 10 seconds for real-time order detection
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalOrdersCount = orders.length;
  const newCount = orders.filter((o) => o.status === 'NEW').length;
  const printingCount = orders.filter((o) => o.status === 'PRINTING').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;
  const completedCount = orders.filter((o) => o.status === 'COLLECTED').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-8 relative">
      
      {/* SCREEN BLUR NEW ORDER POPUP ALERT MODAL */}
      {newOrderAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-amber-400 text-slate-900 space-y-5 relative">
            
            <button
              onClick={() => setNewOrderAlert(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg animate-bounce">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> New Order Received!
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Order #{newOrderAlert.orderNumber}
                </h2>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-bold text-slate-900">{newOrderAlert.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile Number:</span>
                <span className="font-bold text-slate-900">{newOrderAlert.customerMobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order Amount:</span>
                <span className="font-black text-blue-700 text-sm">₹{newOrderAlert.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/admin/live"
                onClick={() => setNewOrderAlert(null)}
                className="flex-1 py-3 text-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg transition active:scale-95"
              >
                Open Live Kanban Board →
              </Link>
              <button
                onClick={() => setNewOrderAlert(null)}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Dismiss
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 font-medium">
            Real-time store metrics for Student Zone Tenali {lastRefreshed && `(Updated ${lastRefreshed})`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-extrabold hover:bg-slate-50 transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Updating...' : 'Refresh Now'}
          </button>

          <Link
            href="/admin/live"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition"
          >
            <Kanban className="w-4 h-4" /> Open Kanban Live Order Board →
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Orders</span>
          <span className="text-2xl font-black text-slate-900">{totalOrdersCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase block">New Pending</span>
          <span className="text-2xl font-black text-amber-600">{newCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-blue-800 uppercase block">Printing Now</span>
          <span className="text-2xl font-black text-blue-600">{printingCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase block">Ready for Pickup</span>
          <span className="text-2xl font-black text-emerald-600">{readyCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Collected</span>
          <span className="text-2xl font-black text-slate-900">{completedCount}</span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-blue-300 uppercase block">Total Revenue</span>
          <span className="text-2xl font-black text-amber-400">₹{totalRevenue.toFixed(0)}</span>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">Recent Customer Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> Loading real-time dashboard...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium">
            No active orders placed yet. New real customer orders will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Order Number</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Mobile</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Ready Time</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.slice(0, 10).map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-black text-blue-700">{o.orderNumber}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{o.customerName}</td>
                    <td className="px-6 py-4 text-slate-600">{o.customerMobile}</td>
                    <td className="px-6 py-4 text-slate-600">{o.items ? o.items.length : 0} file(s)</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          o.status === 'READY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'PRINTING'
                            ? 'bg-blue-100 text-blue-800'
                            : o.status === 'NEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{o.estimatedReadyTime}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{o.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
