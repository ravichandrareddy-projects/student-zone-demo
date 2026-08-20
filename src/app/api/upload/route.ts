import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;

    let fileUrl = `/uploads/${fileName}`;

    // 1. Try local disk storage (works on local machine / Node server)
    try {
      const publicUploadsDir = join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
      }
      const filePath = join(publicUploadsDir, fileName);
      await writeFile(filePath, buffer);
    } catch (diskErr) {
      // 2. On Vercel Serverless (read-only filesystem), convert file to Data URI format
      // This allows instant download & printing in Admin Vault with zero storage issues
      console.warn('Vercel read-only filesystem detected, using inline storage:', diskErr);
      const mimeType = file.type || 'application/octet-stream';
      const base64 = buffer.toString('base64');
      fileUrl = `data:${mimeType};base64,${base64}`;
    }

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || 'application/octet-stream',
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
