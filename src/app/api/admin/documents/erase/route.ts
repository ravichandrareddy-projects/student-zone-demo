import { NextResponse } from 'next/server';
import { unlink, readdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Check admin session (if cookie present) but allow local admin UI requests
    const session = await verifyAdminSession();
    const referer = request.headers.get('referer') || '';
    const isLocalAdminReq = referer.includes('/admin');

    if (!session && !isLocalAdminReq) {
      return NextResponse.json({ error: 'Unauthorized. Please login as admin.' }, { status: 401 });
    }

    const body = await request.json();
    const { orderItemId, purgeCollected, purgeAllOrphans, deleteRecord } = body;

    const uploadsDir = join(process.cwd(), 'public', 'uploads');

    // Helper: Purge any file on disk not belonging to an active non-erased order item
    const cleanOrphanFilesOnDisk = async () => {
      let cleanedOrphans = 0;
      try {
        const diskFiles = await readdir(uploadsDir);
        const activeItems = await prisma.orderItem.findMany({
          select: { fileUrl: true },
        });

        const activeFileNames = new Set(
          activeItems
            .map((i) => i.fileUrl)
            .filter((url) => url && !url.startsWith('[ERASED]'))
            .map((url) => url.replace('/uploads/', '').replace('uploads/', ''))
        );

        for (const file of diskFiles) {
          if (file.startsWith('sample_')) continue;

          if (!activeFileNames.has(file)) {
            const filePath = join(uploadsDir, file);
            try {
              await unlink(filePath);
              cleanedOrphans++;
            } catch (err) {
              console.warn(`Could not delete orphan file ${file}:`, err);
            }
          }
        }
      } catch (err) {
        console.warn('Error during orphan file scan:', err);
      }
      return cleanedOrphans;
    };

    // Option A: Purge all files for orders marked COLLECTED or CANCELLED + clean orphans
    if (purgeCollected || purgeAllOrphans) {
      const itemsToPurge = await prisma.orderItem.findMany({
        where: {
          OR: [
            { order: { status: { in: ['COLLECTED', 'CANCELLED'] } } },
            { fileUrl: { startsWith: '/uploads/' } },
          ],
        },
        include: { order: true },
      });

      let erasedCount = 0;

      if (purgeCollected) {
        const collectedItems = itemsToPurge.filter(
          (i) => i.order && ['COLLECTED', 'CANCELLED'].includes(i.order.status)
        );

        for (const item of collectedItems) {
          if (item.fileUrl && !item.fileUrl.startsWith('[ERASED]')) {
            const fileName = item.fileUrl.replace('/uploads/', '').replace('uploads/', '');
            const filePath = join(uploadsDir, fileName);

            try {
              await unlink(filePath);
            } catch {
              // File might already be gone from disk
            }

            if (deleteRecord) {
              await prisma.orderItem.delete({ where: { id: item.id } });
            } else {
              await prisma.orderItem.update({
                where: { id: item.id },
                data: { fileUrl: '[ERASED_PRIVACY_PROTECTED]' },
              });
            }

            erasedCount++;
          }
        }
      }

      const orphanCount = await cleanOrphanFilesOnDisk();

      return NextResponse.json({
        success: true,
        message: `Storage Purged: Permanently deleted ${erasedCount} collected order files and ${orphanCount} orphaned disk files.`,
        erasedCount,
        orphanCount,
      });
    }

    // Option B: Erase single item document file
    if (!orderItemId) {
      return NextResponse.json({ error: 'orderItemId is required' }, { status: 400 });
    }

    const item = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Document item not found' }, { status: 404 });
    }

    if (item.fileUrl && !item.fileUrl.startsWith('[ERASED]')) {
      const fileName = item.fileUrl.replace('/uploads/', '').replace('uploads/', '');
      const filePath = join(uploadsDir, fileName);

      try {
        await unlink(filePath);
      } catch (err) {
        console.warn('Physical file deletion warning:', err);
      }
    }

    if (deleteRecord) {
      await prisma.orderItem.delete({
        where: { id: orderItemId },
      });
    } else {
      await prisma.orderItem.update({
        where: { id: orderItemId },
        data: { fileUrl: '[ERASED_PRIVACY_PROTECTED]' },
      });
    }

    await cleanOrphanFilesOnDisk();

    return NextResponse.json({
      success: true,
      message: `Document "${item.documentName}" has been permanently removed.`,
    });
  } catch (error) {
    console.error('File erasure error:', error);
    return NextResponse.json({ error: 'Failed to erase document file' }, { status: 500 });
  }
}
