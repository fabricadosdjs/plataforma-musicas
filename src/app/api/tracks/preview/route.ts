import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { contaboStorage } from '@/lib/contabo-storage';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const trackId = searchParams.get('trackId');

        if (!trackId) {
            return NextResponse.json({ error: 'ID da música é obrigatório' }, { status: 400 });
        }

        // Buscar a música no banco
        const track = await prisma.track.findUnique({
            where: { id: parseInt(trackId) }
        });

        if (!track) {
            return NextResponse.json({ error: 'Música não encontrada' }, { status: 404 });
        }

        // Se a previewUrl já é uma URL assinada válida, retornar ela
        if (track.previewUrl && track.previewUrl.startsWith('https://') && !track.previewUrl.includes('X-Amz-Expires')) {
            return NextResponse.json({ previewUrl: track.previewUrl });
        }

        // Extrair a chave do arquivo da downloadUrl
        let fileKey = track.downloadUrl;
        if (fileKey.startsWith('https://')) {
            const urlParts = fileKey.split('/');
            const bucketIndex = urlParts.findIndex(part => part.includes('plataforma-de-musicas'));
            if (bucketIndex !== -1) {
                // Pegar apenas o caminho do arquivo, sem parâmetros de query
                const pathParts = urlParts.slice(bucketIndex + 1);
                fileKey = pathParts.join('/');
                // Remover parâmetros de query se existirem
                if (fileKey.includes('?')) {
                    fileKey = fileKey.split('?')[0];
                }
            }
        }

        // Gerar nova URL assinada para preview (válida por 1 hora)
        const previewUrl = await contaboStorage.getSignedUrl(fileKey, 3600);

        if (!previewUrl) {
            return NextResponse.json({ error: 'Falha ao gerar URL de preview' }, { status: 500 });
        }

        return NextResponse.json({ previewUrl });

    } catch (error) {
        console.error('Erro ao gerar URL de preview:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
