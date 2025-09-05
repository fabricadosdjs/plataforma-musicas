import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 API Debug: Iniciando...');

        // Contar total de tracks
        const totalTracks = await prisma.track.count();
        console.log(`📊 Total de tracks: ${totalTracks}`);

        // Contar tracks da comunidade
        const communityTracks = await prisma.track.count({
            where: { isCommunity: true }
        });
        console.log(`📊 Tracks da comunidade: ${communityTracks}`);

        // Buscar algumas tracks para exemplo
        const sampleTracks = await prisma.track.findMany({
            take: 10,
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                folder: true,
                isCommunity: true,
                uploadedBy: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Verificar campos únicos
        const uniqueArtists = await prisma.track.findMany({
            select: { artist: true },
            distinct: ['artist']
        });

        const uniqueUploaders = await prisma.track.findMany({
            where: { uploadedBy: { not: null } },
            select: { uploadedBy: true },
            distinct: ['uploadedBy']
        });

        return NextResponse.json({
            success: true,
            debug: {
                totalTracks,
                communityTracks,
                sampleTracks,
                uniqueArtists: uniqueArtists.map(a => a.artist),
                uniqueUploaders: uniqueUploaders.map(u => u.uploadedBy),
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Erro na API Debug:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}





