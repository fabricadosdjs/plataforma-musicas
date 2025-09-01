import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

// Configuração do storage
const STORAGE_BASE_PATH = process.env.STORAGE_BASE_PATH || '/var/www/html/storage';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const resolvedParams = await params;
        const filePath = join(STORAGE_BASE_PATH, ...resolvedParams.path);

        console.log('📁 Servindo arquivo:', filePath);

        // Verificar se o arquivo existe
        if (!existsSync(filePath)) {
            console.log('❌ Arquivo não encontrado:', filePath);
            return NextResponse.json(
                { error: 'Arquivo não encontrado' },
                { status: 404 }
            );
        }

        // Ler o arquivo
        const fileBuffer = await readFile(filePath);

        // Determinar o tipo MIME baseado na extensão
        const ext = filePath.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';

        switch (ext) {
            case 'mp3':
                contentType = 'audio/mpeg';
                break;
            case 'jpg':
            case 'jpeg':
                contentType = 'image/jpeg';
                break;
            case 'png':
                contentType = 'image/png';
                break;
            case 'gif':
                contentType = 'image/gif';
                break;
            case 'webp':
                contentType = 'image/webp';
                break;
        }

        // Retornar o arquivo com headers apropriados
        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileBuffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000', // Cache por 1 ano
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('❌ Erro ao servir arquivo:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
