import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const { email: emailParam } = await params;
        const email = decodeURIComponent(emailParam);

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email é obrigatório' },
                { status: 400 }
            );
        }

        console.log(`🔍 Buscando músicas para usuário: ${email}`);

        // Primeiro, vamos ver quantas tracks existem no total
        const totalTracks = await prisma.track.count();
        console.log(`📊 Total de tracks na base: ${totalTracks}`);

        // Buscar algumas tracks para debug
        const sampleTracks = await prisma.track.findMany({
            take: 5,
            select: {
                id: true,
                songName: true,
                artist: true,
                uploadedBy: true,
                isCommunity: true
            }
        });
        console.log('🔍 Sample tracks para debug:', sampleTracks);

        // Buscar músicas do usuário na comunidade (isCommunity: true)
        const communityTracks = await prisma.track.findMany({
            where: {
                AND: [
                    { isCommunity: true },
                    {
                        OR: [
                            { uploadedBy: email },
                            { artist: { equals: email, mode: 'insensitive' } }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                folder: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        downloads: true,
                        likes: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Buscar também músicas onde o usuário pode ser o artista (sem filtro isCommunity)
        const artistTracks = await prisma.track.findMany({
            where: {
                OR: [
                    { uploadedBy: email },
                    { artist: { equals: email, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                folder: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        downloads: true,
                        likes: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Buscar também músicas que possam ser do usuário por similaridade
        const similarTracks = await prisma.track.findMany({
            where: {
                OR: [
                    { artist: { contains: email.split('@')[0], mode: 'insensitive' } },
                    { songName: { contains: email.split('@')[0], mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                folder: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        downloads: true,
                        likes: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Combinar e remover duplicatas
        const allTracks = [...communityTracks, ...artistTracks, ...similarTracks];
        const userTracks = allTracks.filter((track, index, self) =>
            index === self.findIndex(t => t.id === track.id)
        );

        console.log(`🔍 Community tracks: ${communityTracks.length}`);
        console.log(`🔍 Artist tracks: ${artistTracks.length}`);
        console.log(`🔍 Similar tracks: ${similarTracks.length}`);
        console.log(`🔍 Total unique tracks: ${userTracks.length}`);

        // Formatar dados para resposta
        const formattedTracks = userTracks.map(track => ({
            id: track.id,
            songName: track.songName,
            artist: track.artist,
            style: track.style,
            pool: track.pool,
            folder: track.folder,
            imageUrl: track.imageUrl,
            createdAt: track.createdAt,
            updatedAt: track.updatedAt,
            downloadCount: track._count.downloads,
            likeCount: track._count.likes
        }));

        console.log(`✅ ${formattedTracks.length} músicas encontradas para ${email}`);
        console.log('🎵 Tracks encontradas:', formattedTracks.map(t => ({ id: t.id, songName: t.songName, artist: t.artist })));

        return NextResponse.json({
            success: true,
            tracks: formattedTracks,
            total: formattedTracks.length,
            userEmail: email
        });

    } catch (error) {
        console.error('❌ Erro ao buscar músicas do usuário:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro interno do servidor',
                tracks: [],
                total: 0
            },
            { status: 500 }
        );
    }
}
