import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, existsSync, unlinkSync, statSync } from 'fs';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function withCorsHeaders(headers: Record<string, string> = {}) {
    return {
        ...headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: withCorsHeaders() });
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token ausente' }, { status: 400 });
        }

        // Validar token assinado (payload.signature)
        const secret = process.env.ZIP_TOKEN_SECRET || 'dev-zip-token-secret';
        const [payload, signature] = token.split('.');
        if (!payload || !signature) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
        }
        const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
        if (signature !== expected) {
            return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 });
        }
        let entry: { path: string; filename: string; ts: number };
        try {
            entry = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        } catch {
            return NextResponse.json({ error: 'Token corrompido' }, { status: 400 });
        }
        const filePath = entry.path;
        if (!existsSync(filePath)) {
            return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
        }

        const fileStat = statSync(filePath);
        const stream = createReadStream(filePath);

        // Apagar o arquivo depois de enviado
        stream.on('close', () => {
            try {
                unlinkSync(filePath);
            } catch (e) { }
        });

        return new NextResponse(stream as any, {
            headers: withCorsHeaders({
                'Content-Type': 'application/zip',
                'Content-Length': String(fileStat.size),
                'Content-Disposition': `attachment; filename="${entry.filename || 'nexor-records.zip'}"`,
                'Cache-Control': 'no-store',
            }),
        });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao servir ZIP temporário' }, { status: 500 });
    }
}


