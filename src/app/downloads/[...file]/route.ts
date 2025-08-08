import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
    req: NextRequest,
    { params }: { params: { file: string[] } }
) {
    try {
        const fileName = params.file.join('/');
        const filePath = path.join(process.cwd(), 'downloads', fileName);

        // Verificar se o arquivo existe
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
        }

        // Ler o arquivo como buffer para arquivos binários
        let fileContent;
        if (fileName.endsWith('.mp3') || fileName.endsWith('.zip')) {
            fileContent = fs.readFileSync(filePath);
        } else {
            fileContent = fs.readFileSync(filePath, 'utf8');
        }
        const fileStats = fs.statSync(filePath);

        // Determinar o tipo de conteúdo baseado na extensão
        let contentType = 'text/plain';
        if (fileName.endsWith('.mp3')) {
            contentType = 'audio/mpeg';
        } else if (fileName.endsWith('.zip')) {
            contentType = 'application/zip';
        }

        // Criar resposta com headers apropriados
        const response = new NextResponse(fileContent, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileStats.size.toString(),
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Cache-Control': 'no-cache'
            }
        });

        return response;

    } catch (error) {
        console.error('Erro ao servir arquivo:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
