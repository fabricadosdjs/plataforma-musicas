import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const userId = session.user.id;

        // Buscar estatísticas da biblioteca do usuário
        const userLibraryPlaylists = await prisma.userLibrary.findMany({
            where: { userId },
            include: {
                playlist: {
                    include: {
                        tracks: {
                            include: {
                                track: true
                            }
                        }
                    }
                }
            }
        });

        // Calcular estatísticas
        let totalPlaylists = userLibraryPlaylists.length;
        let totalTracksCount = 0;
        let totalDuration = 0;
        const genreCounts: { [key: string]: number } = {};

        userLibraryPlaylists.forEach((userLibrary: any) => {
            if (userLibrary.playlist) {
                userLibrary.playlist.tracks.forEach((playlistTrack: any) => {
                    if (playlistTrack.track) {
                        totalTracksCount++;

                        // Simular duração (em minutos) - você pode ajustar isso baseado nos dados reais
                        totalDuration += 3.5; // 3.5 minutos por música em média

                        // Contar gêneros
                        if (playlistTrack.track.style) {
                            genreCounts[playlistTrack.track.style] = (genreCounts[playlistTrack.track.style] || 0) + 1;
                        }
                    }
                });
            }
        });

        // Gêneros favoritos (top 3)
        const favoriteGenres = Object.entries(genreCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([genre, count]) => ({ genre, count }));

        // Atividade recente (simulada - você pode implementar um sistema real de atividade)
        const recentActivity = Math.floor(Math.random() * 10) + 1;

        const stats = {
            totalPlaylists,
            totalTracks: totalTracksCount,
            totalDuration: Math.round(totalDuration),
            favoriteGenres,
            recentActivity
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Erro ao buscar estatísticas da biblioteca:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
