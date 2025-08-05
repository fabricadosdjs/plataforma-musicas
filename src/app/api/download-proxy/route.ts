import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        console.log('📥 Download proxy: Iniciando requisição');

        const session = await getServerSession(authOptions);

        if (!session?.user) {
            console.log('📥 Download proxy: Usuário não autorizado');
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        let url = searchParams.get('url');
        const filename = searchParams.get('filename');

        // Decodificar a URL que pode estar duplamente codificada
        if (url) {
            try {
                // Primeira decodificação
                url = decodeURIComponent(url);
                // Segunda decodificação se necessário (para casos de dupla codificação)
                if (url.includes('%')) {
                    url = decodeURIComponent(url);
                }
            } catch (error) {
                console.log('📥 Download proxy: Erro ao decodificar URL:', error);
            }
        }

        console.log('📥 Download proxy: Parâmetros recebidos:', { url, filename });

        if (!url) {
            console.log('📥 Download proxy: URL não fornecida');
            return NextResponse.json(
                { error: 'URL é obrigatória' },
                { status: 400 }
            );
        }

        // Verificar se é um URL válido do Catbox ou Contabo
        if (!url.includes('catbox.moe') && !url.includes('files.catbox.moe') && !url.includes('contabostorage.com')) {
            return NextResponse.json(
                { error: 'Apenas URLs do Catbox ou Contabo são permitidos' },
                { status: 403 }
            );
        }

        // Fazer o download do arquivo via servidor
        const headers: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'audio/mpeg, application/octet-stream, */*',
        };

        // Adicionar referer específico baseado no domínio
        if (url.includes('catbox.moe')) {
            headers['Referer'] = 'https://catbox.moe/';
        } else if (url.includes('contabostorage.com')) {
            headers['Referer'] = 'https://usc1.contabostorage.com/';
        }

        console.log('📥 Download proxy: URL decodificada:', url);
        console.log('📥 Download proxy: Fazendo requisição para:', url);
        const response = await fetch(url, {
            headers,
            // Garantir que arquivos pequenos sejam baixados completamente
            cache: 'no-cache',
        });

        console.log('📥 Download proxy: Resposta recebida:', response.status, response.statusText);

        if (!response.ok) {
            console.error('📥 Download proxy: Falha ao baixar arquivo:', response.status, response.statusText);
            return NextResponse.json(
                { error: 'Falha ao baixar o arquivo' },
                { status: response.status }
            );
        }

        const fileBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        // Log para debug
        console.log(`📥 Download proxy: ${filename}, size: ${fileBuffer.byteLength} bytes`);

        // Retornar o arquivo com headers de download
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename || 'download.mp3'}"`,
                'Content-Length': fileBuffer.byteLength.toString(),
                'Cache-Control': 'no-cache',
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
