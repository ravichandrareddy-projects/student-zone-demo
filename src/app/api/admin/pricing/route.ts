import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const rates = await prisma.pricingRate.findMany({
      orderBy: { category: 'asc' },
    });
    return NextResponse.json({ success: true, rates });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pricing rates' }, { status: 500 });
  }
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update pricing rates' }, { status: 500 });
  }
}
