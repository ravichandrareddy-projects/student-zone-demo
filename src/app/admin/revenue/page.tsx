'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  RefreshCw,
  Download,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

interface DailySummary {
  date: string;
  ordersCount: number;
  collectedCount: number;
  totalRevenue: number;
  upiRevenue: number;
  cashRevenue: number;
}

export default function AdminRevenuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/orders?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch {
      console.error('Failed to load revenue data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // 15s background auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Compute daily summaries grouped by YYYY-MM-DD
  const dailyMap: Record<string, DailySummary> = {};

  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    const dateStr = d.toISOString().split('T')[0]; // e.g. 2026-08-24

    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = {
        date: dateStr,
        ordersCount: 0,
        collectedCount: 0,
        totalRevenue: 0,
        upiRevenue: 0,
        cashRevenue: 0,
      };
    }

    dailyMap[dateStr].ordersCount += 1;

    // Revenue counted for COLLECTED or PAID orders
    if (o.status === 'COLLECTED' || o.paymentStatus === 'PAID') {
      dailyMap[dateStr].collectedCount += 1;
      dailyMap[dateStr].totalRevenue += o.totalAmount || 0;

      if (o.paymentMethod === 'UPI') {
        dailyMap[dateStr].upiRevenue += o.totalAmount || 0;
      } else {
        dailyMap[dateStr].cashRevenue += o.totalAmount || 0;
      }
    }
  });

  const dailySummaries = Object.values(dailyMap).sort((a, b) => (a.date < b.date ? 1 : -1));

  // Overall totals
  const totalRevenue = dailySummaries.reduce((sum, d) => sum + d.totalRevenue, 0);
  const totalUpiRevenue = dailySummaries.reduce((sum, d) => sum + d.upiRevenue, 0);
  const totalCashRevenue = dailySummaries.reduce((sum, d) => sum + d.cashRevenue, 0);
  const totalCompletedOrders = dailySummaries.reduce((sum, d) => sum + d.collectedCount, 0);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (dailySummaries.length === 0) {
      alert('No sales data available to export.');
      return;
    }

    const headers = ['Date', 'Total Orders', 'Completed Orders', 'Total Revenue (INR)', 'UPI Revenue (INR)', 'Pay at Store Revenue (INR)'];
    const rows = dailySummaries.map((d) => [
      d.date,
      d.ordersCount,
      d.collectedCount,
      d.totalRevenue.toFixed(2),
      d.upiRevenue.toFixed(2),
      d.cashRevenue.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Zone_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Monthly & Daily Sales Revenue Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time daily ledger tracking online UPI & Pay-at-store cash revenue for Student Zone Tenali.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchOrders}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-extrabold hover:bg-slate-50 transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Revenue'}
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" /> Export CSV Sales Ledger
          </button>
        </div>
      </div>

      {/* Revenue Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-blue-300 font-bold">
            <span>Total Collected Sales</span>
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-3xl font-black text-amber-400 block">₹{totalRevenue.toFixed(2)}</span>
          <span className="text-[11px] text-slate-400 block">{totalCompletedOrders} Completed Orders</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-blue-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-blue-700 font-bold">
            <span>Online UPI Revenue</span>
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-3xl font-black text-blue-900 block">₹{totalUpiRevenue.toFixed(2)}</span>
          <span className="text-[11px] text-slate-500 block">GPay / PhonePe / Paytm</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
            <span>Pay at Store Cash</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-3xl font-black text-emerald-700 block">₹{totalCashRevenue.toFixed(2)}</span>
          <span className="text-[11px] text-slate-500 block">Counter Cash Collected</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Average Order Value</span>
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 block">
            ₹{totalCompletedOrders > 0 ? (totalRevenue / totalCompletedOrders).toFixed(2) : '0.00'}
          </span>
          <span className="text-[11px] text-slate-500 block">Per completed customer print job</span>
        </div>

      </div>

      {/* Daily Sales Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              Daily Sales & Revenue Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated breakdown per calendar date</p>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            {dailySummaries.length} Days Recorded
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> Calculating real-time sales ledger...
          </div>
        ) : dailySummaries.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No completed sales orders recorded yet. As new orders are placed and completed, daily sales automatically log here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Date (YYYY-MM-DD)</th>
                  <th className="px-6 py-3.5">Total Orders Placed</th>
                  <th className="px-6 py-3.5">Completed / Collected</th>
                  <th className="px-6 py-3.5">UPI Digital Revenue</th>
                  <th className="px-6 py-3.5">Counter Cash</th>
                  <th className="px-6 py-3.5 text-right">Daily Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {dailySummaries.map((d) => (
                  <tr key={d.date} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-black text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" /> {d.date}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-bold">{d.ordersCount} Orders</td>
                    <td className="px-6 py-4 text-emerald-700 font-bold">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {d.collectedCount} Done
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-700">₹{d.upiRevenue.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">₹{d.cashRevenue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-black text-emerald-800 text-sm">
                      ₹{d.totalRevenue.toFixed(2)}
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
