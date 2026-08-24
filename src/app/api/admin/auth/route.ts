import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAdminSession, clearAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    let admin = await prisma.admin.findUnique({
      where: { email: cleanEmail },
    });

    // Auto-initialize default shop owner account on first login if database is fresh
    if (!admin && cleanEmail === 'admin@studentzone.com') {
      try {
        const defaultPasswordHash = await bcrypt.hash('admin123', 10);
        admin = await prisma.admin.create({
          data: {
            name: 'Shop Owner',
            email: 'admin@studentzone.com',
            passwordHash: defaultPasswordHash,
            role: 'ADMIN',
          },
        });
      } catch (seedErr) {
        console.error('Auto-seed admin creation error:', seedErr);
      }
    }

    if (!admin) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const passwordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    await createAdminSession(admin.id, admin.email);

    return NextResponse.json({
      success: true,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
