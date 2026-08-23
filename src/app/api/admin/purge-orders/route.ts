import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Delete all order items first due to foreign key constraints
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'All dummy and sample orders deleted successfully!',
    });
  } catch (error) {
    console.error('Error purging orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to purge orders' }, { status: 500 });
  }
}
