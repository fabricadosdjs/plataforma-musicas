// src/app/api/contabo/delete-object/route.ts
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { key } = await req.json();
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  // Configure com seus dados reais
  const s3 = new S3Client({
    region: 'eu-central-1',
    endpoint: 'https://<SEU_ENDPOINT_CONTABO>',
    credentials: {
      accessKeyId: '<SEU_ACCESS_KEY>',
      secretAccessKey: '<SEU_SECRET_KEY>',
    },
    forcePathStyle: true,
  });

  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: '<SEU_BUCKET>',
      Key: key,
    }));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
