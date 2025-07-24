// Criar API proxy para Google Drive
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get('id');

    if (!fileId) {
        return new NextResponse('File ID is required', { status: 400 });
    }

    try {
        // Tentar diferentes endpoints do Google Drive
        const urls = [
            `https://drive.google.com/uc?export=download&id=${fileId}`,
            `https://docs.google.com/uc?export=open&id=${fileId}`,
            `https://drive.google.com/uc?id=${fileId}`,
        ];

        let lastError = null;

        for (const url of urls) {
            try {
                console.log(`🔄 Tentando proxy para: ${url}`);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'audio/*,*/*;q=0.9',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                    },
                });

                if (response.ok) {
                    console.log(`✅ Sucesso com URL: ${url}`);

                    // Verificar se é um arquivo de áudio
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.startsWith('audio/')) {
                        return new NextResponse(response.body, {
                            status: 200,
                            headers: {
                                'Content-Type': contentType,
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': 'GET',
                                'Access-Control-Allow-Headers': 'Content-Type',
                                'Cache-Control': 'public, max-age=3600',
                            },
                        });
                    }
                }

                lastError = `Status: ${response.status}`;
            } catch (error) {
                lastError = error instanceof Error ? error.message : 'Unknown error';
                console.error(`❌ Erro com URL ${url}:`, lastError);
            }
        }

        return new NextResponse(`Falha em todas as tentativas. Último erro: ${lastError}`, {
            status: 500
        });

    } catch (error) {
        console.error('Erro no proxy:', error);
        return new NextResponse('Erro interno do proxy', { status: 500 });
    }
}
