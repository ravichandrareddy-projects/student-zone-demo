import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const query = searchParams.get('q');

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (query) {
      const q = query.trim();
      whereClause.OR = [
        { orderNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerMobile: { contains: q } },
      ];
    }

    // Direct single query for maximum speed (<80ms)
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to latest 100 orders for instant response
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Admin fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
