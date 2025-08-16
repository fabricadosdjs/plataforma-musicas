import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function withCorsHeaders(headers: Record<string, string> = {}) {
    return {
        ...headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: withCorsHeaders() });
}

function isAllowedUrl(url: string) {
    try {
        const u = new URL(url);
        return (
            u.hostname.includes('catbox.moe') ||
            u.hostname.includes('files.catbox.moe') ||
            u.hostname.includes('contabostorage.com')
        );
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { url } = await request.json();
        if (!url || typeof url !== 'string' || !isAllowedUrl(url)) {
            return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
        }

        // Tentar HEAD primeiro
        let size = 0;
        try {
            const headRes = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
            const cl = headRes.headers.get('content-length');
            if (cl) size = parseInt(cl, 10) || 0;
        } catch { }

        // Fallback: GET com Range 0-0 para obter content-range
        if (!size) {
            try {
                const rangeRes = await fetch(url, {
                    method: 'GET',
                    headers: { Range: 'bytes=0-0' },
                    cache: 'no-cache',
                });
                const contentRange = rangeRes.headers.get('content-range');
                if (contentRange) {
                    const totalPart = contentRange.split('/')[1];
                    const total = parseInt(totalPart, 10);
                    if (!isNaN(total)) size = total;
                } else {
                    const cl = rangeRes.headers.get('content-length');
                    if (cl) size = parseInt(cl, 10) || 0;
                }
            } catch { }
        }

        return NextResponse.json({ size }, { status: 200, headers: withCorsHeaders({ 'Cache-Control': 'no-cache' }) });
    } catch (error) {
        return NextResponse.json({ size: 0 }, { status: 200, headers: withCorsHeaders() });
    }
}








