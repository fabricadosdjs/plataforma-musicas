import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Ajuste para suas variáveis de ambiente
const s3 = new S3Client({
    region: process.env.CONTABO_REGION,
    endpoint: process.env.CONTABO_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CONTABO_ACCESS_KEY!,
        secretAccessKey: process.env.CONTABO_SECRET_KEY!,
    },
    forcePathStyle: true,
});

const BUCKET = process.env.CONTABO_BUCKET_NAME!;

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { fileName, fileType } = await req.json();
    if (!fileName || !fileType) {
        return NextResponse.json({ error: 'Parâmetros ausentes' }, { status: 400 });
    }

    const key = `uploads/${session.user.id}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: fileType,
        ACL: 'public-read',
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return NextResponse.json({ url: presignedUrl, key });
}
