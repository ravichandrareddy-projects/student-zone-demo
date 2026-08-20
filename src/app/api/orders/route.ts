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

    // Generate unique order number (e.g. SZ-2026-1051)
    const count = await prisma.order.count();
    const orderNumSequence = 1048 + count + 1;
    const orderNumber = `SZ-2026-${orderNumSequence}`;

    // Get default estimated ready time setting (e.g. +25 minutes)
    const prepSetting = await prisma.setting.findUnique({
      where: { key: 'default_prep_time_minutes' },
    });
    const prepMinutes = parseInt(prepSetting?.value || '25', 10);

    const readyDateObj = new Date(Date.now() + prepMinutes * 60 * 1000);
    const estimatedTimeStr = readyDateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Create or find user by mobile
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

    // Create Order and OrderItems in single transaction
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
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
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
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
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
