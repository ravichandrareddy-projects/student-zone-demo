'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Trash2,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface OrderItemWithDetails {
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
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerMobile: string;
    status: string;
    paymentStatus: string;
    createdAt: string;
  };
}

export default function AdminDocumentsPage() {
  const [items, setItems] = useState<OrderItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ACTIVE' | 'ERASED' | 'ALL'>('ACTIVE');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [erasingId, setErasingId] = useState<string | null>(null);
  const [purgingBulk, setPurgingBulk] = useState(false);

  const fetchOrdersAndFiles = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/orders?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.orders) {
        const allItems: OrderItemWithDetails[] = [];
        data.orders.forEach((order: any) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              allItems.push({
                ...item,
                order: {
                  id: order.id,
                  orderNumber: order.orderNumber,
                  customerName: order.customerName,
                  customerMobile: order.customerMobile,
                  status: order.status,
                  paymentStatus: order.paymentStatus,
                  createdAt: order.createdAt,
                },
              });
            });
          }
        });
        setItems(allItems);
      }
    } catch {
      console.error('Failed to load document files');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndFiles();
  }, []);

  // 1-Click Erase Single File and Remove Card
  const handleEraseFile = async (orderItemId: string, docName: string, deleteRecord = true) => {
    if (!confirm(`Permanently erase "${docName}" file and remove it from active queue?`)) {
      return;
    }

    setErasingId(orderItemId);
    try {
      const res = await fetch('/api/admin/documents/erase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderItemId, deleteRecord }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✓ ${data.message}`);
        // Remove locally from UI state immediately
        setItems((prev) => prev.filter((i) => i.id !== orderItemId));
        fetchOrdersAndFiles();
      } else {
        alert(data.error || 'Failed to erase document.');
      }
    } catch {
      alert('Error connecting to file erasure API.');
    } finally {
      setErasingId(null);
    }
  };

  // Bulk Purge All Storage Files & Remove Erased Cards
  const handleBulkPurge = async () => {
    if (!confirm('Purge all document files for orders marked COLLECTED/CANCELLED and remove erased files from active queue?')) {
      return;
    }

    setPurgingBulk(true);
    try {
      const res = await fetch('/api/admin/documents/erase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purgeCollected: true, purgeAllOrphans: true }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✓ ${data.message}`);
        fetchOrdersAndFiles();
      } else {
        alert(data.error || 'Failed bulk purge.');
      }
    } catch {
      alert('Error running bulk privacy purge.');
    } finally {
      setPurgingBulk(false);
    }
  };

  // Filtered documents list
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const isErased = item.fileUrl.startsWith('[ERASED]');

    if (filterStatus === 'ACTIVE') return matchesSearch && !isErased;
    if (filterStatus === 'ERASED') return matchesSearch && isErased;
    return matchesSearch;
  });

  const activeFilesCount = items.filter((i) => !i.fileUrl.startsWith('[ERASED]')).length;
  const erasedFilesCount = items.filter((i) => i.fileUrl.startsWith('[ERASED]')).length;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure Local Storage (Zero Supabase Dependency)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Document Print Queue & Privacy Vault
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Download customer documents directly for printing. Erasing a file instantly wipes it from server disk and cleans the active queue.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchOrdersAndFiles}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-extrabold hover:bg-slate-50 transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh List'}
          </button>

          <button
            onClick={handleBulkPurge}
            disabled={purgingBulk}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" /> {purgingBulk ? 'Purging...' : '🔒 Purge All Disk Storage'}
          </button>
        </div>
      </div>

      {/* Storage Summary Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterStatus('ACTIVE')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'ACTIVE'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold block">Active Ready to Print</span>
              <span className="text-2xl font-black text-blue-900">{activeFilesCount} Files</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('ERASED')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'ERASED'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold block">Erased Privacy Archive</span>
              <span className="text-2xl font-black text-emerald-900">{erasedFilesCount} Protected</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => setFilterStatus('ALL')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            filterStatus === 'ALL'
              ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-400/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shadow-xs">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold block">Total History</span>
              <span className="text-2xl font-black text-slate-900">{items.length} Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center justify-between shadow-xs animate-fade-in">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-black">
            ✕
          </button>
        </div>
      )}

      {/* Queue Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('ACTIVE')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${
              filterStatus === 'ACTIVE'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📥 Active Print Queue ({activeFilesCount})
          </button>

          <button
            onClick={() => setFilterStatus('ERASED')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${
              filterStatus === 'ERASED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔒 Erased Log ({erasedFilesCount})
          </button>

          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({items.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents or order #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Queue Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> Loading active document queue...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="font-extrabold text-slate-800 text-sm">No documents found in this view!</p>
          <p className="text-slate-400">
            {filterStatus === 'ACTIVE'
              ? 'All customer uploads have been printed and erased.'
              : 'No matching document files.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            const isErased = item.fileUrl.startsWith('[ERASED]');

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl bg-white border ${
                  isErased ? 'border-slate-200 opacity-75' : 'border-blue-200 shadow-sm hover:shadow-md'
                } transition space-y-4 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        #{item.order.orderNumber}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        {item.order.customerName} ({item.order.customerMobile})
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                        item.order.status === 'READY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.order.status === 'PRINTING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.order.status}
                    </span>
                  </div>

                  {/* Document Name */}
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                      isErased ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <FileText className="w-6 h-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-slate-900 text-sm truncate">
                        {item.documentName}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{(item.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        <span>•</span>
                        <span>Placed {new Date(item.order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Copies</span>
                      <span className="font-bold text-slate-900">{item.copies} Copy(ies)</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Color Mode</span>
                      <span className="font-extrabold text-blue-700">{item.colorMode}</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Paper & Binding</span>
                      <span className="font-bold text-slate-900">{item.paperSize} • {item.binding}</span>
                    </div>
                  </div>

                  {item.itemInstructions && (
                    <p className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      <strong>Customer note:</strong> {item.itemInstructions}
                    </p>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  {!isErased ? (
                    <>
                      <a
                        href={item.fileUrl}
                        download={item.originalFileName}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-sm transition"
                      >
                        <Download className="w-4 h-4" /> Download & Print
                      </a>

                      <button
                        onClick={() => handleEraseFile(item.id, item.documentName, true)}
                        disabled={erasingId === item.id}
                        className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Erase File & Remove
                      </button>
                    </>
                  ) : (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-between border border-slate-200">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> File Erased (Protected)
                      </span>
                      <button
                        onClick={() => handleEraseFile(item.id, item.documentName, true)}
                        className="text-red-600 hover:underline text-[11px] font-extrabold"
                      >
                        Delete Log Entry
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
