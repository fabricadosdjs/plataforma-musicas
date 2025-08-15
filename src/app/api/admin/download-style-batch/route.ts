import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { style } = await request.json();

        if (!style) {
            return NextResponse.json({ error: 'Estilo é obrigatório' }, { status: 400 });
        }

        // Buscar todas as músicas do estilo
        const tracks = await prisma.track.findMany({
            where: { style: style },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                downloadUrl: true,
            }
        });

        if (tracks.length === 0) {
            return NextResponse.json({ error: 'Nenhuma música encontrada para este estilo' }, { status: 404 });
        }

        // Retornar apenas as informações das músicas para download individual
        return NextResponse.json({
            tracks: tracks,
            totalTracks: tracks.length,
            message: `Encontradas ${tracks.length} músicas do estilo "${style}"`
        });

    } catch (error) {
        console.error("[GET_STYLE_TRACKS_ERROR]", error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
