import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');
        const filename = searchParams.get('filename');

        if (!url) {
            return NextResponse.json(
                { error: 'URL é obrigatória' },
                { status: 400 }
            );
        }

        // Verificar se é um URL válido do Catbox
        if (!url.includes('catbox.moe') && !url.includes('files.catbox.moe')) {
            return NextResponse.json(
                { error: 'Apenas URLs do Catbox são permitidos' },
                { status: 403 }
            );
        }

        // Fazer o download do arquivo via servidor
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://catbox.moe/',
                'Accept': 'audio/mpeg, application/octet-stream, */*',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Falha ao baixar o arquivo' },
                { status: response.status }
            );
        }

        const fileBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        // Retornar o arquivo com headers de download
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename || 'download.mp3'}"`,
                'Content-Length': fileBuffer.byteLength.toString(),
            },
        });

    } catch (error) {
        console.error('Erro no proxy de download:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
