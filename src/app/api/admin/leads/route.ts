import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leads = await prisma.advertisingLead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, leads });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch advertising leads' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      businessName,
      phone,
      email,
      service,
      quantity,
      preferredSize,
      designAvailable,
      designFileUrl,
      requirements,
    } = body;

    if (!customerName || !businessName || !phone || !service) {
      return NextResponse.json(
        { error: 'Name, business name, phone, and service are required' },
        { status: 400 }
      );
    }

    const count = await prisma.advertisingLead.count();
    const leadNumber = `ADV-${1001 + count}`;

    const lead = await prisma.advertisingLead.create({
      data: {
        leadNumber,
        customerName,
        businessName,
        phone,
        email: email || null,
        service,
        quantity: parseInt(quantity) || 1,
        preferredSize: preferredSize || null,
        designAvailable: designAvailable || 'No',
        designFileUrl: designFileUrl || null,
        requirements: requirements || null,
        status: 'New',
      },
    });

    return NextResponse.json({ success: true, leadNumber: lead.leadNumber });
  } catch (error) {
    console.error('Advertising quote request error:', error);
    return NextResponse.json({ error: 'Failed to submit quote request' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, quotedPrice, adminNotes } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (quotedPrice !== undefined) data.quotedPrice = parseFloat(quotedPrice);
    if (adminNotes !== undefined) data.adminNotes = adminNotes;

    const updated = await prisma.advertisingLead.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update advertising lead' }, { status: 500 });
  }
}
