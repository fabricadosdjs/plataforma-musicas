import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        console.log('🔍 API Admin Tracks by Style chamada');

        // Buscar todas as músicas organizadas por estilo
        const tracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                imageUrl: true,
                downloadUrl: true,
                releaseDate: true,
                createdAt: true,
                previewUrl: true,
                isCommunity: true,
                uploadedBy: true,
            },
            orderBy: [
                { style: 'asc' },
                { artist: 'asc' },
                { songName: 'asc' }
            ],
        });

        // Organizar por estilo
        const tracksByStyle = tracks.reduce((acc: any, track: any) => {
            const style = track.style || 'Sem Estilo';
            if (!acc[style]) {
                acc[style] = [];
            }
            acc[style].push(track);
            return acc;
        }, {});

        // Contar total por estilo
        const styleCounts = Object.keys(tracksByStyle).map((style: any) => ({
            style,
            count: tracksByStyle[style].length
        }));

        console.log(`📊 Resultado: ${tracks.length} músicas organizadas em ${Object.keys(tracksByStyle).length} estilos`);

        return NextResponse.json({
            tracksByStyle,
            styleCounts,
            totalTracks: tracks.length,
            totalStyles: Object.keys(tracksByStyle).length
        });

    } catch (error) {
        console.error("[GET_TRACKS_BY_STYLE_ERROR]", error);
        return NextResponse.json({
            error: "Erro interno do servidor ao buscar músicas por estilo",
            tracksByStyle: {},
            styleCounts: []
        }, { status: 500 });
    }
}




