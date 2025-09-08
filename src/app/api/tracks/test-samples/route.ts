import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        console.log('🔍 API test-samples: Iniciando...');

        // Primeiro, testar uma query simples
        console.log('🔍 Testando contagem de tracks...');
        const count = await prisma.track.count();
        console.log(`📊 Total de tracks no banco: ${count}`);

        if (count === 0) {
            return NextResponse.json({
                success: false,
                message: 'Nenhuma track encontrada no banco de dados',
                tracks: [],
                totalCount: count
            });
        }

        // Buscar algumas tracks reais do banco para testes
        console.log('🔍 Executando query Prisma...');
        const tracks = await prisma.track.findMany({
            take: 5, // Limitar a 5 tracks
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                previewUrl: true,
                downloadUrl: true,
                imageUrl: true,
                bitrate: true,
                releaseDate: true
            },
            orderBy: {
                createdAt: 'desc' // Mais recentes primeiro
            }
        });

        console.log(`📊 Query executada: ${tracks.length} tracks encontradas`);

        if (tracks.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Nenhuma track encontrada no banco de dados',
                tracks: []
            });
        }

        // Formatar as tracks para o formato esperado pelos testes
        const formattedTracks = tracks.map((track: any) => ({
            id: track.id,
            songName: track.songName,
            artist: track.artist,
            style: track.style,
            previewUrl: track.previewUrl,
            downloadUrl: track.downloadUrl,
            imageUrl: track.imageUrl,
            bitrate: track.bitrate || 320, // Fallback para 320 se não tiver
            releaseDate: track.releaseDate,
            testType: 'real-database-track'
        }));

        return NextResponse.json({
            success: true,
            message: `${tracks.length} tracks encontradas no banco de dados`,
            tracks: formattedTracks,
            total: tracks.length
        });

    } catch (error) {
        console.error('Erro ao buscar tracks do banco:', error);
        return NextResponse.json({
            success: false,
            message: 'Erro interno do servidor',
            error: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
        }, { status: 500 });
    }
}
