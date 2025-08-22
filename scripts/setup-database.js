const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
    try {
        console.log('🚀 Iniciando configuração do banco de dados...');

        // 1. Verificar conexão
        await prisma.$connect();
        console.log('✅ Conexão com banco estabelecida');

        // 2. Criar dados de exemplo para releases
        const releases = [
            {
                title: 'Summer Vibes 2024',
                artist: 'DJ Jéssika Luana',
                albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
                description: 'Coletânea de músicas eletrônicas para o verão, com batidas contagiantes e melodias energéticas.',
                genre: 'Electronic',
                releaseDate: new Date('2024-01-15'),
                trackCount: 12,
                duration: '1:15:30',
                label: 'Plataforma Músicas',
                producer: 'DJ Jéssika Luana',
                featured: true,
                exclusive: false,
                streaming: {
                    spotify: 'https://open.spotify.com/album/example',
                    deezer: 'https://deezer.com/album/example'
                },
                social: {
                    instagram: '@djessikaluana',
                    facebook: 'DJ Jéssika Luana'
                }
            },
            {
                title: 'Deep House Collection',
                artist: 'Various Artists',
                albumArt: 'https://images.unsplash.com/photo-1511379938545-c1e474798dcd?w=400&h=400&fit=crop',
                description: 'Seleção das melhores músicas deep house da plataforma, perfeita para momentos de relaxamento.',
                genre: 'Deep House',
                releaseDate: new Date('2024-01-10'),
                trackCount: 8,
                duration: '58:45',
                label: 'Plataforma Músicas',
                producer: 'Various',
                featured: false,
                exclusive: true,
                streaming: {
                    spotify: 'https://open.spotify.com/album/example2',
                    apple: 'https://music.apple.com/album/example2'
                },
                social: {
                    website: 'https://plataforma-musicas.com'
                }
            },
            {
                title: 'Progressive House Hits',
                artist: 'DJ Carlos Silva',
                albumArt: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
                description: 'Os maiores sucessos de progressive house, com batidas progressivas e melodias cativantes.',
                genre: 'Progressive House',
                releaseDate: new Date('2024-01-05'),
                trackCount: 15,
                duration: '1:45:20',
                label: 'Plataforma Músicas',
                producer: 'DJ Carlos Silva',
                featured: true,
                exclusive: false,
                streaming: {
                    spotify: 'https://open.spotify.com/album/example3',
                    deezer: 'https://deezer.com/album/example3'
                },
                social: {
                    instagram: '@djcarlossilva',
                    youtube: 'DJ Carlos Silva'
                }
            },
            {
                title: 'Techno Underground',
                artist: 'Various Artists',
                albumArt: 'https://images.unsplash.com/photo-1511379938545-c1e474798dcd?w=400&h=400&fit=crop',
                description: 'Coletânea underground de techno, com artistas emergentes e sons experimentais.',
                genre: 'Techno',
                releaseDate: new Date('2024-01-01'),
                trackCount: 10,
                duration: '1:20:15',
                label: 'Plataforma Músicas',
                producer: 'Various',
                featured: false,
                exclusive: false,
                streaming: {
                    spotify: 'https://open.spotify.com/album/example4'
                },
                social: {
                    discord: 'https://discord.gg/techno'
                }
            },
            {
                title: 'Trance Classics',
                artist: 'DJ Maria Santos',
                albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
                description: 'Clássicos do trance que marcaram época, com melodias épicas e batidas energéticas.',
                genre: 'Trance',
                releaseDate: new Date('2023-12-20'),
                trackCount: 20,
                duration: '2:15:45',
                label: 'Plataforma Músicas',
                producer: 'DJ Maria Santos',
                featured: true,
                exclusive: true,
                streaming: {
                    spotify: 'https://open.spotify.com/album/example5',
                    deezer: 'https://deezer.com/album/example5',
                    apple: 'https://music.apple.com/album/example5'
                },
                social: {
                    instagram: '@djmaria',
                    facebook: 'DJ Maria Santos',
                    youtube: 'DJ Maria Santos'
                }
            }
        ];

        console.log('📝 Criando releases...');

        // 3. Inserir releases
        for (const releaseData of releases) {
            try {
                const release = await prisma.release.create({
                    data: releaseData
                });
                console.log(`✅ Release criado: ${release.title}`);
            } catch (error) {
                if (error.code === 'P2002') {
                    console.log(`⚠️ Release já existe: ${releaseData.title}`);
                } else {
                    console.error(`❌ Erro ao criar release ${releaseData.title}:`, error.message);
                }
            }
        }

        // 4. Atualizar algumas músicas existentes para terem releaseId
        console.log('🔗 Conectando músicas aos releases...');

        try {
            // Buscar releases criados
            const createdReleases = await prisma.release.findMany();

            if (createdReleases.length > 0) {
                // Atualizar músicas de DJ Jéssika
                const jessikaTracks = await prisma.track.findMany({
                    where: {
                        OR: [
                            { artist: { contains: 'Jéssika', mode: 'insensitive' } },
                            { artist: { contains: 'Jessika', mode: 'insensitive' } }
                        ]
                    },
                    take: 5
                });

                if (jessikaTracks.length > 0) {
                    await prisma.track.updateMany({
                        where: { id: { in: jessikaTracks.map(t => t.id) } },
                        data: { releaseId: createdReleases[0].id }
                    });
                    console.log(`✅ ${jessikaTracks.length} músicas conectadas ao release "Summer Vibes 2024"`);
                }

                // Atualizar músicas Deep House
                const deepHouseTracks = await prisma.track.findMany({
                    where: {
                        OR: [
                            { style: { contains: 'Deep House', mode: 'insensitive' } },
                            { style: { contains: 'deep house', mode: 'insensitive' } }
                        ]
                    },
                    take: 3
                });

                if (deepHouseTracks.length > 0) {
                    await prisma.track.updateMany({
                        where: { id: { in: deepHouseTracks.map(t => t.id) } },
                        data: { releaseId: createdReleases[1].id }
                    });
                    console.log(`✅ ${deepHouseTracks.length} músicas conectadas ao release "Deep House Collection"`);
                }

                // Atualizar músicas Progressive House
                const progressiveTracks = await prisma.track.findMany({
                    where: {
                        OR: [
                            { style: { contains: 'Progressive', mode: 'insensitive' } },
                            { style: { contains: 'progressive', mode: 'insensitive' } }
                        ]
                    },
                    take: 4
                });

                if (progressiveTracks.length > 0) {
                    await prisma.track.updateMany({
                        where: { id: { in: progressiveTracks.map(t => t.id) } },
                        data: { releaseId: createdReleases[2].id }
                    });
                    console.log(`✅ ${progressiveTracks.length} músicas conectadas ao release "Progressive House Hits"`);
                }
            }
        } catch (error) {
            console.log('⚠️ Não foi possível conectar músicas aos releases:', error.message);
        }

        // 5. Atualizar contadores de tracks
        console.log('📊 Atualizando contadores de tracks...');

        try {
            const releasesWithTracks = await prisma.release.findMany({
                include: {
                    _count: {
                        select: { tracks: true }
                    }
                }
            });

            for (const release of releasesWithTracks) {
                await prisma.release.update({
                    where: { id: release.id },
                    data: { trackCount: release._count.tracks }
                });
            }
            console.log('✅ Contadores de tracks atualizados');
        } catch (error) {
            console.log('⚠️ Não foi possível atualizar contadores:', error.message);
        }

        // 6. Verificar resultado
        console.log('\n📋 Resumo da configuração:');

        const totalReleases = await prisma.release.count();
        const totalTracksWithRelease = await prisma.track.count({
            where: { releaseId: { not: null } }
        });

        console.log(`🎵 Total de releases: ${totalReleases}`);
        console.log(`🔗 Tracks conectadas a releases: ${totalTracksWithRelease}`);

        console.log('\n🎉 Configuração do banco concluída com sucesso!');
        console.log('💡 Agora você pode usar a API de releases com dados reais do banco.');

    } catch (error) {
        console.error('❌ Erro durante a configuração:', error);

        if (error.code === 'P1001') {
            console.log('💡 Dica: Verifique se o banco está rodando e acessível');
        } else if (error.code === 'P1002') {
            console.log('💡 Dica: Verifique as credenciais do banco no arquivo .env');
        } else if (error.code === 'P2002') {
            console.log('💡 Dica: Alguns dados já existem no banco');
        }
    } finally {
        await prisma.$disconnect();
        console.log('🔌 Conexão com banco fechada');
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };
