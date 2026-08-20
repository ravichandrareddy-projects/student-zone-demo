'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  MapPin,
  RefreshCw,
  Printer,
  FileText,
  Sparkles,
} from 'lucide-react';

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  status: string;
  estimatedReadyTime: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    documentName: string;
    copies: number;
    colorMode: string;
    paperSize: string;
    sides: string;
    binding: string;
    paperType: string;
    price: number;
  }>;
}

export default function OrderTrackingDetail() {
  const params = useParams();
  const orderNumber = typeof params?.orderNumber === 'string' ? params.orderNumber : '';

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchOrder = async () => {
    if (!orderNumber) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/orders?q=${encodeURIComponent(orderNumber)}&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        setError(null);
      } else {
        setError('Order not found. Please check your order number.');
      }
    } catch {
      setError('Failed to refresh order status.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
      const interval = setInterval(fetchOrder, 15000);
      return () => clearInterval(interval);
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-slate-600 text-sm font-medium">Fetching real-time order status...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Order Not Found</h1>
        <p className="text-sm text-slate-600">{error}</p>
        <Link
          href="/track"
          className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md"
        >
          Try Searching Again
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'NEW', label: 'Order Received' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'PRINTING', label: 'Printing' },
    { key: 'FINISHING', label: 'Finishing / Binding' },
    { key: 'READY', label: 'Ready for Pickup' },
    { key: 'COLLECTED', label: 'Collected' },
  ];

  const currentStatusIndex = steps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isReady = order.status === 'READY';
  const isCollected = order.status === 'COLLECTED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
              Swiggy-Style Live Tracking
            </span>
            <span className="text-[11px] text-slate-400">Updated {lastUpdated}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Customer: <strong className="text-slate-800">{order.customerName}</strong> ({order.customerMobile})
          </p>
        </div>

        <button
          onClick={fetchOrder}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition cursor-pointer active:scale-95 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      {/* READY ALERT BANNER */}
      {isReady && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 rounded-3xl text-white shadow-xl text-center space-y-3 animate-pulse-subtle">
          <div className="w-14 h-14 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Your Order Is Ready 🎉</h2>
          <p className="text-sm text-emerald-100 max-w-md mx-auto">
            Please visit Student Zone Xerox & Binding Shop in Tenali to collect your printed documents.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <a
              href="https://maps.google.com/?q=Tenali+Andhra+Pradesh"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-md"
            >
              Get Directions to Shop
            </a>
          </div>
        </div>
      )}

      {/* ESTIMATED TIME CARD */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider">
            Estimated Ready Time
          </span>
          <div className="text-3xl sm:text-4xl font-black text-amber-400 flex items-center justify-center sm:justify-start gap-2">
            <Clock className="w-8 h-8 text-amber-400" />
            {order.estimatedReadyTime || '25 minutes'}
          </div>
          <p className="text-xs text-slate-300">
            {isReady ? 'Order completed and waiting for pickup!' : 'Subject to current shop queue.'}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center sm:text-right space-y-1">
          <span className="text-xs text-slate-300 block">Total Amount</span>
          <span className="text-2xl font-black text-white">₹{order.totalAmount.toFixed(2)}</span>
          <span className="text-[11px] block font-bold text-emerald-300">
            {order.paymentStatus === 'PAID' ? '✓ PAID (' + order.paymentMethod + ')' : 'PAY AT PICKUP (' + order.paymentMethod + ')'}
          </span>
        </div>
      </div>

      {/* TIMELINE INDICATOR */}
      {!isCancelled ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Preparation Progress
          </h2>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
            {steps.map((step, idx) => {
              const isDone = currentStatusIndex >= idx;
              const isCurrent = currentStatusIndex === idx;

              return (
                <div key={step.key} className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-1 relative z-10 w-full sm:w-auto">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isDone
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    } ${isCurrent ? 'ring-4 ring-blue-100 border-2 border-blue-600 animate-pulse' : ''}`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div className="text-left sm:text-center">
                    <p className={`text-xs font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] text-blue-600 font-semibold uppercase block">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-red-800 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="text-lg font-bold">This Order Was Cancelled</h3>
          <p className="text-xs text-red-600">Please contact Student Zone staff for assistance.</p>
        </div>
      )}

      {/* ORDER ITEMS BREAKDOWN */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
          Document Items & Specifications ({order.items.length})
        </h3>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-sm">{item.documentName}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 pt-1">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.copies} Copies
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-blue-700">
                    {item.colorMode}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.paperSize} ({item.sides})
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    Binding: {item.binding}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Item Subtotal</span>
                <span className="font-bold text-slate-900 text-sm">₹{item.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {order.customerNotes && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Your Instructions:</strong> &ldquo;{order.customerNotes}&rdquo;
          </div>
        )}
      </div>

      {/* SHOP LOCATION & ASSISTANCE */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" /> Shop Pickup Information
        </h3>
        <p className="text-xs text-slate-300">
          <strong>Student Zone Xerox & Binding Shop</strong> • Main Road, Opposite VSR College, Tenali, AP.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="tel:+919848012345"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2"
          >
            <Phone className="w-4 h-4" /> Call Shop
          </a>
          <a
            href={`https://wa.me/919848012345?text=Hi%20Student%20Zone,%20checking%20status%20for%20order%20${order.orderNumber}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp Shop
          </a>
        </div>
      </div>

    </div>
  );
}
