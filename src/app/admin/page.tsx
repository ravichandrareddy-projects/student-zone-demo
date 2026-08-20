import Link from 'next/link';
import { prisma } from '@/lib/prisma';
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
} from 'lucide-react';

export const revalidate = 0; // Always fresh for admin dashboard

export default async function AdminDashboardPage() {
  const orders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  const totalOrdersCount = await prisma.order.count();
  const newCount = await prisma.order.count({ where: { status: 'NEW' } });
  const printingCount = await prisma.order.count({ where: { status: 'PRINTING' } });
  const readyCount = await prisma.order.count({ where: { status: 'READY' } });
  const completedCount = await prisma.order.count({ where: { status: 'COLLECTED' } });

  // Calculate revenue
  const totalRevenueAgg = await prisma.order.aggregate({
    _sum: { totalAmount: true },
  });
  const totalRevenue = totalRevenueAgg._sum.totalAmount || 0;

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time store metrics for Student Zone Tenali</p>
        </div>

        <Link
          href="/admin/live"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition"
        >
          <Kanban className="w-4 h-4" /> Open Kanban Live Order Board →
        </Link>
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
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-black text-blue-700">{o.orderNumber}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{o.customerName}</td>
                  <td className="px-6 py-4 text-slate-600">{o.customerMobile}</td>
                  <td className="px-6 py-4 text-slate-600">{o.items.length} file(s)</td>
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
      </div>

    </div>
  );
}
