import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

let cachedRates: any = null;
let cacheTime = 0;

export async function GET() {
  // Instant 0ms response if cached in memory within 60s
  if (cachedRates && Date.now() - cacheTime < 60000) {
    return NextResponse.json({ success: true, rates: cachedRates });
  }

  try {
    const ratesPromise = prisma.pricingRate.findMany({
      orderBy: { category: 'asc' },
    });
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 1000));
    const rates = (await Promise.race([ratesPromise, timeoutPromise])) as any;

    if (rates && Array.isArray(rates)) {
      cachedRates = rates;
      cacheTime = Date.now();
      return NextResponse.json({ success: true, rates });
    }
  } catch (error) {
    console.warn('Pricing GET fallback:', error);
  }

  if (cachedRates) {
    return NextResponse.json({ success: true, rates: cachedRates });
  }

  return NextResponse.json({ success: true, rates: [] });
}

export async function PATCH(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rates } = await request.json(); // Array of { key, rate }

    if (!Array.isArray(rates)) {
      return NextResponse.json({ error: 'Rates array required' }, { status: 400 });
    }

    for (const item of rates) {
      await prisma.pricingRate.update({
        where: { key: item.key },
        data: { rate: parseFloat(item.rate) },
      });
    }

    // Invalidate cache immediately on update
    cachedRates = null;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update pricing rates' }, { status: 500 });
  }
}
