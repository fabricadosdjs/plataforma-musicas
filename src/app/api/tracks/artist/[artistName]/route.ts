import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { artistName: string } }
) {
    try {
        const artistName = decodeURIComponent(params.artistName);

        if (!artistName) {
            return NextResponse.json(
                { error: 'Nome do artista é obrigatório' },
                { status: 400 }
            );
        }

        // Buscar tracks do artista (case-insensitive)
        const tracks = await prisma.track.findMany({
            where: {
                artist: {
                    contains: artistName,
                    mode: 'insensitive'
                }
            },
            orderBy: [
                { releaseDate: 'desc' },
                { createdAt: 'desc' }
            ],
            include: {
                // Incluir relacionamentos se necessário
            }
        });

        return NextResponse.json({
            tracks: tracks,
            total: tracks.length,
            artist: artistName
        });

    } catch (error) {
        console.error('Erro ao buscar tracks do artista:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
