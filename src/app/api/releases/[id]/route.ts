import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Dados mockados para demonstração
const mockReleases = [
    {
        id: 1,
        title: "Universe",
        artist: "DJ Jéssika Luana",
        albumArt: "https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png",
        description: "Primeiro álbum completo da DJ Jéssika Luana, explorando os limites da música eletrônica com influências do progressive house e deep house.",
        genre: "Progressive House",
        releaseDate: "2025-01-15T00:00:00.000Z",
        trackCount: 12,
        duration: "78:32",
        label: "Nexor Records",
        producer: "DJ Jéssika Luana",
        featured: true,
        exclusive: true,
        streaming: {
            spotify: "https://open.spotify.com/album/example1",
            deezer: "https://www.deezer.com/album/example1",
            apple: "https://music.apple.com/album/example1"
        },
        social: {
            instagram: "@djessikaluana",
            facebook: "DJ Jéssika Luana",
            website: "https://djessikaluana.com"
        },
        tracks: [],
        createdAt: "2025-01-15T10:00:00.000Z",
        updatedAt: "2025-01-15T10:00:00.000Z"
    },
    {
        id: 2,
        title: "Deep Vibes Collection",
        artist: "Various Artists",
        albumArt: "https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png",
        description: "Compilação exclusiva com os melhores artistas da cena deep house, incluindo tracks inéditas e remixes exclusivos.",
        genre: "Deep House",
        releaseDate: "2025-02-20T00:00:00.000Z",
        trackCount: 15,
        duration: "92:15",
        label: "Nexor Records",
        producer: "Nexor Records",
        featured: true,
        exclusive: false,
        streaming: {
            spotify: "https://open.spotify.com/album/example2",
            deezer: "https://www.deezer.com/album/example2"
        },
        tracks: [],
        createdAt: "2025-01-15T10:00:00.000Z",
        updatedAt: "2025-01-15T10:00:00.000Z"
    }
];

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'ID inválido' },
                { status: 400 }
            );
        }

        // Tentar buscar do banco primeiro
        try {
            const release = await prisma.release.findUnique({
                where: { id }
            });

            if (release) {
                // Adicionar array vazio de tracks por enquanto (será implementado depois)
                const releaseWithTracks = {
                    ...release,
                    tracks: []
                };

                console.log(`✅ Release ${id} carregado do banco`);
                return NextResponse.json(releaseWithTracks);
            }
        } catch (dbError: any) {
            console.log('⚠️ Erro ao buscar do banco, usando dados mockados:', dbError.message);
        }

        // Fallback para dados mockados
        const release = mockReleases.find(r => r.id === id);

        if (!release) {
            return NextResponse.json(
                { error: 'Release não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(release);

    } catch (error) {
        console.error('Erro ao buscar release:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'ID inválido' },
                { status: 400 }
            );
        }

        const body = await request.json();

        // Tentar atualizar no banco primeiro
        try {
            const updatedRelease = await prisma.release.update({
                where: { id },
                data: {
                    title: body.title,
                    artist: body.artist,
                    albumArt: body.albumArt,
                    description: body.description,
                    genre: body.genre,
                    releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
                    trackCount: body.trackCount,
                    duration: body.duration,
                    label: body.label,
                    producer: body.producer,
                    featured: body.featured,
                    exclusive: body.exclusive,
                    streaming: body.streaming,
                    social: body.social
                }
            });

            console.log(`✅ Release ${id} atualizado no banco`);

            return NextResponse.json({
                message: 'Release atualizado com sucesso',
                release: updatedRelease
            });

        } catch (dbError: any) {
            console.log('⚠️ Erro ao atualizar no banco, usando dados mockados:', dbError.message);
        }

        // Fallback para dados mockados
        const releaseIndex = mockReleases.findIndex(r => r.id === id);

        if (releaseIndex === -1) {
            return NextResponse.json(
                { error: 'Release não encontrado' },
                { status: 404 }
            );
        }

        // Atualizar release (dados mockados)
        const existingRelease = mockReleases[releaseIndex];
        const updatedRelease = {
            ...existingRelease,
            title: body.title || existingRelease.title,
            artist: body.artist || existingRelease.artist,
            albumArt: body.albumArt || existingRelease.albumArt,
            description: body.description !== undefined ? body.description : existingRelease.description,
            genre: body.genre || existingRelease.genre,
            releaseDate: body.releaseDate ? new Date(body.releaseDate).toISOString() : existingRelease.releaseDate,
            trackCount: body.trackCount || existingRelease.trackCount,
            duration: body.duration !== undefined ? body.duration : existingRelease.duration,
            label: body.label !== undefined ? body.label : existingRelease.label,
            producer: body.producer !== undefined ? body.producer : existingRelease.producer,
            featured: body.featured !== undefined ? body.featured : existingRelease.featured,
            exclusive: body.exclusive !== undefined ? body.exclusive : existingRelease.exclusive,
            streaming: body.streaming || existingRelease.streaming,
            social: body.social || existingRelease.social,
            updatedAt: new Date().toISOString()
        };

        mockReleases[releaseIndex] = updatedRelease;

        return NextResponse.json({
            message: 'Release atualizado com sucesso (dados de demonstração)',
            release: updatedRelease
        });

    } catch (error) {
        console.error('Erro ao atualizar release:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'ID inválido' },
                { status: 400 }
            );
        }

        // Tentar deletar do banco primeiro
        try {
            await prisma.release.delete({
                where: { id }
            });

            console.log(`✅ Release ${id} deletado do banco`);

            return NextResponse.json({
                message: 'Release deletado com sucesso'
            });

        } catch (dbError: any) {
            console.log('⚠️ Erro ao deletar do banco, usando dados mockados:', dbError.message);
        }

        // Fallback para dados mockados
        const releaseIndex = mockReleases.findIndex(r => r.id === id);

        if (releaseIndex === -1) {
            return NextResponse.json(
                { error: 'Release não encontrado' },
                { status: 404 }
            );
        }

        // Deletar release (dados mockados)
        mockReleases.splice(releaseIndex, 1);

        return NextResponse.json({
            message: 'Release deletado com sucesso (dados de demonstração)'
        });

    } catch (error) {
        console.error('Erro ao deletar release:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
