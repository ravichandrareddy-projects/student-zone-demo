import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';

export const metadata: Metadata = {
  title: 'Student Zone Xerox & Binding Shop | Tenali, Andhra Pradesh',
  description:
    'Upload your documents online, customize copies, color, binding & requirements, track order status in real time, and collect from Student Zone Tenali when ready. Don\'t wait in line!',
  keywords: [
    'Xerox shop in Tenali',
    'Printing services in Tenali',
    'Xerox and binding shop Tenali',
    'Color printing Tenali',
    'Spiral binding Tenali',
    'Project report binding Tenali',
    'Visiting cards Tenali',
    'ID card printing Tenali',
    'Student printing services Tenali',
  ],
  authors: [{ name: 'Student Zone Tenali' }],
  openGraph: {
    title: 'Student Zone Xerox & Binding Shop — Tenali',
    description: 'Your Documents. Printed Before You Arrive. Upload online & track live.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="font-sans flex flex-col min-h-screen bg-slate-50 text-slate-900" suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
