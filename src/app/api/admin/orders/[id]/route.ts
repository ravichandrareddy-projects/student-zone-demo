import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      status,
      estimatedReadyTime,
      estimatedReadyDate,
      paymentStatus,
      adminNotes,
      totalAmount,
    } = body;

    const updateData: any = {};

    if (status !== undefined) updateData.status = status;
    if (estimatedReadyTime !== undefined) updateData.estimatedReadyTime = estimatedReadyTime;
    if (estimatedReadyDate !== undefined) updateData.estimatedReadyDate = estimatedReadyDate;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (totalAmount !== undefined) updateData.totalAmount = parseFloat(totalAmount);

    if (status === 'COLLECTED' || status === 'READY') {
      updateData.actualReadyTime = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Admin update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
