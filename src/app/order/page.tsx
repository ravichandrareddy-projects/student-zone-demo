'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileText,
  Trash2,
  Plus,
  CheckCircle2,
  Printer,
  ShieldCheck,
  HelpCircle,
  Clock,
  Sparkles,
  AlertCircle,
  FileCheck,
  UserCheck,
} from 'lucide-react';
import { calculateItemPrice, DocumentConfig } from '@/lib/pricing';

interface UploadedDocument extends DocumentConfig {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  estimatedPageCount: number;
  price: number;
  itemInstructions: string;
}

// Smart PDF / Document page count parser
const parsePdfPageCount = async (file: File): Promise<number> => {
  if (file.type.includes('image') || file.name.match(/\.(jpg|jpeg|png)$/i)) {
    return 1;
  }

  if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const text = new TextDecoder('latin1').decode(arrayBuffer);

      // Search for /Count N in page tree
      const countMatches = text.match(/\/Count\s+(\d+)/g);
      if (countMatches && countMatches.length > 0) {
        const counts = countMatches
          .map((m) => {
            const match = m.match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
          })
          .filter((n) => n > 0 && n < 10000);

        if (counts.length > 0) {
          return Math.max(...counts);
        }
      }

      // Fallback: count /Type /Page objects
      const pageMatches = text.match(/\/Type\s*\/Page\b/g);
      if (pageMatches && pageMatches.length > 0) {
        return pageMatches.length;
      }
    } catch (err) {
      console.warn('PDF page count parsing error:', err);
    }
  }

  return 1;
};

export default function OrderPage() {
  const router = useRouter();

  // Document list
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Customer Details Form (Auto-Saved on Device)
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Pay at Store' | 'UPI'>('Pay at Store');
  const [hasRestoredDetails, setHasRestoredDetails] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{
    orderNumber: string;
    estimatedReadyTime: string;
  } | null>(null);

  // Pricing matrix rates loaded from DB
  const [ratesMap, setRatesMap] = useState<Record<string, number>>({});

  // Auto-restore customer details from localStorage on mount
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('sz_customer_name');
      const savedMobile = localStorage.getItem('sz_customer_mobile');
      const savedEmail = localStorage.getItem('sz_customer_email');
      if (savedName) setCustomerName(savedName);
      if (savedMobile) setCustomerMobile(savedMobile);
      if (savedEmail) setCustomerEmail(savedEmail);
      if (savedName || savedMobile) setHasRestoredDetails(true);
    } catch {}
  }, []);

  const handleNameChange = (val: string) => {
    setCustomerName(val);
    try { localStorage.setItem('sz_customer_name', val); } catch {}
  };

  const handleMobileChange = (val: string) => {
    setCustomerMobile(val);
    try { localStorage.setItem('sz_customer_mobile', val); } catch {}
  };

  const handleEmailChange = (val: string) => {
    setCustomerEmail(val);
    try { localStorage.setItem('sz_customer_email', val); } catch {}
  };

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (data.rates && Array.isArray(data.rates)) {
          const map: Record<string, number> = {};
          data.rates.forEach((r: any) => {
            map[r.key] = r.rate;
          });
          setRatesMap(map);
        }
      })
      .catch(() => {});
  }, []);

  // Recalculate prices whenever document settings or rates change
  useEffect(() => {
    setDocuments((prev) =>
      prev.map((doc) => ({
        ...doc,
        price: calculateItemPrice(doc, ratesMap),
      }))
    );
  }, [ratesMap]);

  // File Upload Handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 50 * 1024 * 1024) {
        setUploadError(`File ${file.name} exceeds maximum 50MB size limit.`);
        setUploading(false);
        return;
      }

      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
        setUploadError(`File format of ${file.name} is not supported. Please upload PDF, Word or Image files.`);
        setUploading(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          // Detect exact PDF page count
          const estPages = await parsePdfPageCount(file);

          const defaultConfig: DocumentConfig = {
            copies: 1,
            colorMode: 'B&W',
            paperSize: 'A4',
            sides: 'Double-sided',
            binding: 'None',
            paperType: '70 GSM Standard',
            estimatedPageCount: estPages,
          };

          const newDoc: UploadedDocument = {
            id: Math.random().toString(36).substring(2, 9),
            fileName: data.fileName,
            fileSize: data.fileSize,
            fileType: data.fileType,
            fileUrl: data.fileUrl,
            estimatedPageCount: estPages,
            itemInstructions: '',
            ...defaultConfig,
            price: calculateItemPrice(defaultConfig, ratesMap),
          };

          setDocuments((prev) => [...prev, newDoc]);
        } else {
          setUploadError(data.error || 'Failed to upload file');
        }
      } catch {
        setUploadError('Network error uploading file');
      }
    }

    setUploading(false);
  };

  // Update specific document field
  const updateDocument = (id: string, updates: Partial<UploadedDocument>) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const updatedDoc = { ...doc, ...updates };
          updatedDoc.price = calculateItemPrice(updatedDoc, ratesMap);
          return updatedDoc;
        }
        return doc;
      })
    );
  };

  // Remove document
  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Total order price calculation
  const totalEstimatedPrice = documents.reduce((acc, d) => acc + d.price, 0);

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (documents.length === 0) {
      alert('Please upload at least one document to proceed.');
      return;
    }
    if (!customerName.trim() || !customerMobile.trim()) {
      alert('Please enter your name and mobile number.');
      return;
    }

    // Save details to device memory
    try {
      localStorage.setItem('sz_customer_name', customerName.trim());
      localStorage.setItem('sz_customer_mobile', customerMobile.trim());
      if (customerEmail) localStorage.setItem('sz_customer_email', customerEmail.trim());
    } catch {}

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerMobile,
          customerEmail,
          customerNotes,
          paymentMethod,
          totalAmount: totalEstimatedPrice,
          items: documents.map((d) => ({
            fileName: d.fileName,
            fileUrl: d.fileUrl,
            fileSize: d.fileSize,
            fileType: d.fileType,
            copies: d.copies,
            colorMode: d.colorMode,
            paperSize: d.paperSize,
            sides: d.sides,
            binding: d.binding,
            paperType: d.paperType,
            itemInstructions: d.itemInstructions,
            price: d.price,
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPlacedOrder({
          orderNumber: data.orderNumber,
          estimatedReadyTime: data.estimatedReadyTime,
        });
      } else {
        alert(data.error || 'Failed to place order.');
      }
    } catch {
      alert('Error connecting to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (placedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Order Placed Successfully
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Order #{placedOrder.orderNumber}
        </h1>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4 max-w-md mx-auto text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs text-slate-500 font-medium">Estimated Ready Time</span>
            <span className="text-lg font-black text-blue-600 flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-500" /> {placedOrder.estimatedReadyTime}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs text-slate-500 font-medium">Current Status</span>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
              Order Received
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Payment Mode</span>
            <span className="text-xs font-bold text-slate-800">{paymentMethod}</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Please keep your order number <strong className="text-slate-900">{placedOrder.orderNumber}</strong> saved. You can track live ready status online or call us directly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => router.push(`/track/${placedOrder.orderNumber}`)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition"
          >
            Track Order Status Now
          </button>
          <button
            onClick={() => {
              setPlacedOrder(null);
              setDocuments([]);
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Online Document Upload
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Order Document Prints & Binding
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl">
          Upload your files, set your printing preferences, and collect from Student Zone Tenali when ready.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload & Document Requirements */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* STEP 1: UPLOAD AREA */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                  1
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">Upload Documents</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Multiple files allowed</span>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div className="relative group border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/80 rounded-2xl p-8 text-center transition cursor-pointer">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">
                    Drag & Drop your documents here or <span className="text-blue-600 underline">Browse Files</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF, DOCX, JPG, PNG (Max 50MB per file)
                  </p>
                </div>
              </div>
            </div>

            {uploading && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-3 text-blue-700 text-xs font-semibold animate-pulse">
                <UploadCloud className="w-5 h-5 animate-bounce" /> Uploading document to server...
              </div>
            )}

            {uploadError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" /> {uploadError}
              </div>
            )}

            {/* Uploaded Documents List */}
            {documents.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Uploaded Files ({documents.length})
                </h3>

                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                    >
                      {/* File Header Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center font-bold border border-slate-200 shadow-xs">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                              {doc.fileName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • Detected {doc.estimatedPageCount} page(s)
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeDocument(doc.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Configurations Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                        
                        {/* Pages to Print */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Total Pages</label>
                          <input
                            type="number"
                            min="1"
                            max="5000"
                            value={doc.estimatedPageCount}
                            onChange={(e) => updateDocument(doc.id, { estimatedPageCount: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-extrabold text-blue-700 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Copies */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Copies</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={doc.copies}
                            onChange={(e) => updateDocument(doc.id, { copies: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Color Mode */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Color Mode</label>
                          <select
                            value={doc.colorMode}
                            onChange={(e) => updateDocument(doc.id, { colorMode: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="B&W">B&W (Black & White)</option>
                            <option value="Color">Full Color</option>
                          </select>
                        </div>

                        {/* Paper Size */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Paper Size</label>
                          <select
                            value={doc.paperSize}
                            onChange={(e) => updateDocument(doc.id, { paperSize: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="A4">A4 (Standard)</option>
                            <option value="A3">A3 (Large Format)</option>
                            <option value="Legal">Legal Size</option>
                          </select>
                        </div>

                        {/* Sides */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Print Sides</label>
                          <select
                            value={doc.sides}
                            onChange={(e) => updateDocument(doc.id, { sides: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Double-sided">Double-sided (Back to Back)</option>
                            <option value="Single-sided">Single-sided</option>
                          </select>
                        </div>

                        {/* Binding */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Binding</label>
                          <select
                            value={doc.binding}
                            onChange={(e) => updateDocument(doc.id, { binding: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="None">None (Stapled / Loose)</option>
                            <option value="Spiral">Spiral Binding</option>
                            <option value="Project Binding">Project Hard Golden Embossed</option>
                            <option value="Soft Binding">Soft Cover Strip Binding</option>
                          </select>
                        </div>

                        {/* Paper Quality */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Paper Quality</label>
                          <select
                            value={doc.paperType}
                            onChange={(e) => updateDocument(doc.id, { paperType: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="70 GSM Standard">70 GSM Standard</option>
                            <option value="80 GSM Premium">80 GSM Premium</option>
                            <option value="Glossy">Glossy Paper</option>
                            <option value="Photo Paper">High Gloss Photo Paper</option>
                          </select>
                        </div>

                      </div>

                      {/* Instructions for this document */}
                      <div>
                        <input
                          type="text"
                          placeholder="Special instructions for this file (e.g., Print pages 1-20 only)"
                          value={doc.itemInstructions}
                          onChange={(e) => updateDocument(doc.id, { itemInstructions: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Calculated price per item */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500">Document Estimated Subtotal:</span>
                        <span className="font-bold text-slate-900">₹{doc.price.toFixed(2)}</span>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: CUSTOMER DETAILS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                  2
                </span>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Customer Details</h2>
                  <p className="text-xs text-slate-500">Saved on your device. No need to re-type next time.</p>
                </div>
              </div>

              {hasRestoredDetails && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Saved Info Restored
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Kumar"
                  value={customerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9848012345"
                  value={customerMobile}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="student@example.com"
                value={customerEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                General Order Instructions
              </label>
              <textarea
                rows={2}
                placeholder="Any special notes for shop owner (e.g. Call when starting print)..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* STEP 3: PAYMENT METHOD */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                3
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">Payment Option</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setPaymentMethod('Pay at Store')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition ${
                  paymentMethod === 'Pay at Store'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="font-bold text-sm text-slate-900 block">Pay at Store (Cash / UPI)</span>
                  <span className="text-xs text-slate-500">Pay when you collect your printed documents</span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'Pay at Store' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'Pay at Store' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition ${
                  paymentMethod === 'UPI'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="font-bold text-sm text-slate-900 block">UPI QR Payment</span>
                  <span className="text-xs text-slate-500">Pay online via GPay / PhonePe / Paytm</span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'UPI' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'UPI' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 sticky top-24 shadow-xl space-y-6">
            <h3 className="text-xl font-extrabold border-b border-slate-800 pb-4">
              Order Summary
            </h3>

            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {documents.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
                    <span className="text-slate-300 truncate max-w-[180px]">{d.fileName}</span>
                    <span className="font-bold text-white">₹{d.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Documents:</span>
                <span className="font-bold text-slate-200">{documents.length}</span>
              </div>
              <div className="flex items-center justify-between text-base font-extrabold pt-2">
                <span>Estimated Total:</span>
                <span className="text-xl text-blue-400">₹{totalEstimatedPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-[11px] text-slate-300 space-y-1">
              <p className="font-bold text-blue-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Note on Final Pricing:
              </p>
              <p>
                Final price may be confirmed by Student Zone upon inspecting page counts and exact paper dimensions.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || documents.length === 0}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-center shadow-lg transition active:scale-98"
            >
              {submitting ? 'Submitting Order...' : 'Confirm & Place Order →'}
            </button>

            <div className="text-[11px] text-slate-400 space-y-1 text-center pt-2">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure Document Storage
              </p>
              <p>Uploaded documents are never publicly shared.</p>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
