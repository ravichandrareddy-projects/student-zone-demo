'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  ShoppingBag,
  FileText,
  Layers,
  Megaphone,
  DollarSign,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Printer,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/admin/live', label: 'Live Order Board (Kanban)', icon: Kanban, highlight: true },
    { href: '/admin/documents', label: 'Document Vault & Erase Queue', icon: FileText, highlight: true },
    { href: '/admin/orders', label: 'All Orders', icon: ShoppingBag },
    { href: '/admin/services', label: 'Services Catalog', icon: Layers },
    { href: '/admin/pricing', label: 'Pricing Matrix', icon: DollarSign },
    { href: '/admin/leads', label: 'Advertising Leads', icon: Megaphone },
    { href: '/admin/reviews', label: 'Reviews Approval', icon: Star },
    { href: '/admin/settings', label: 'Shop Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
            <Printer className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight">STUDENT ZONE ADMIN</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-white text-base tracking-tight block">STUDENT ZONE</span>
              <span className="text-[11px] text-blue-400 font-semibold block">Admin Dashboard</span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : item.highlight
                      ? 'text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs px-2">
            <div>
              <span className="font-bold text-white block">Shop Owner</span>
              <span className="text-[10px] text-slate-400 block">admin@studentzone.com</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-600/20 text-slate-300 hover:text-red-400 border border-slate-700 text-xs font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between bg-white border-b border-slate-200/80 px-8 py-4 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Management System</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-extrabold text-slate-900">Tenali Shop Branch</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
            >
              🌐 View Live Public Site ↗
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>

    </div>
  );
}
