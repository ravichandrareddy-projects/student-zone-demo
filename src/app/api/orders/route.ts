import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerMobile,
      customerEmail,
      customerNotes,
      paymentMethod,
      items,
      totalAmount,
    } = body;

    if (!customerName || !customerMobile || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required order details or documents' },
        { status: 400 }
      );
    }

    // Generate unique order number (e.g. SZ-2026-4821)
    const timestampSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SZ-2026-${timestampSuffix}`;

    // Fail-safe prep time calculation
    let prepMinutes = 25;
    try {
      const prepSetting = await prisma.setting.findUnique({
        where: { key: 'default_prep_time_minutes' },
      });
      if (prepSetting?.value) {
        prepMinutes = parseInt(prepSetting.value, 10) || 25;
      }
    } catch {
      prepMinutes = 25;
    }

    const readyDateObj = new Date(Date.now() + prepMinutes * 60 * 1000);
    const estimatedTimeStr = readyDateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Fail-safe user creation / lookup
    let userId: string | null = null;
    try {
      let user = await prisma.user.findUnique({
        where: { mobile: customerMobile },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: customerName,
            mobile: customerMobile,
            email: customerEmail || null,
          },
        });
      }
      userId = user.id;
    } catch (userErr) {
      console.warn('User table lookup skipped:', userErr);
    }

    // Create Order and OrderItems in single operation
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId,
        customerName,
        customerMobile,
        customerEmail: customerEmail || null,
        status: 'NEW',
        estimatedReadyTime: estimatedTimeStr,
        totalAmount: totalAmount || 0.0,
        paymentStatus: 'UNPAID',
        paymentMethod: paymentMethod || 'Pay at Store',
        customerNotes: customerNotes || null,
        items: {
          create: items.map((item: any) => ({
            documentName: item.fileName || item.documentName || 'Document',
            originalFileName: item.fileName || 'Document',
            fileUrl: item.fileUrl || '',
            fileSize: item.fileSize || 0,
            fileType: item.fileType || 'application/pdf',
            copies: item.copies || 1,
            colorMode: item.colorMode || 'B&W',
            paperSize: item.paperSize || 'A4',
            pageRange: item.pageRange || 'All',
            sides: item.sides || 'Double-sided',
            binding: item.binding || 'None',
            paperType: item.paperType || '70 GSM Standard',
            itemInstructions: item.itemInstructions || null,
            price: item.price || 0.0,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      estimatedReadyTime: order.estimatedReadyTime,
      status: order.status,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    const errorMessage = error?.message || 'Failed to place order';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Search query required' }, { status: 400 });
    }

    const trimmed = query.trim();

    // Search by exact order number or mobile
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: trimmed } },
          { customerMobile: { equals: trimmed } },
        ],
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch order' }, { status: 500 });
  }
}
