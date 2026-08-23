import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Auto-purge dummy orders if they exist in the database (Vercel cache fallback)
    const dummyOrderNumbers = ['SZ-2026-1046', 'SZ-2026-1047', 'SZ-2026-1048', 'SZ-2026-1049', 'SZ-2026-1050'];
    const dummyExists = await prisma.order.findFirst({
      where: { orderNumber: { in: dummyOrderNumbers } }
    });
    if (dummyExists) {
      try {
        await prisma.orderItem.deleteMany({
          where: { order: { orderNumber: { in: dummyOrderNumbers } } }
        });
        await prisma.order.deleteMany({
          where: { orderNumber: { in: dummyOrderNumbers } }
        });
      } catch (err) {
        console.error('Auto-purge dummy orders error:', err);
      }
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

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Admin fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
