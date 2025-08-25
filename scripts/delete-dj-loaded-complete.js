import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🚀 Script de Limpeza Completa - DJ LOADED');
        console.log('=========================================');

        // 1. Buscar músicas
        console.log('🔍 Buscando músicas do DJ LOADED...');
        const tracks = await prisma.track.findMany({
            where: {
                OR: [
                    {
                        artist: {
                            contains: 'DJ LOADED',
                            mode: 'insensitive'
                        }
                    },
                    {
                        songName: {
                            contains: 'DJ LOADED',
                            mode: 'insensitive'
                        }
                    },
                    {
                        downloadUrl: {
                            contains: 'DJ%20LOADED',
                            mode: 'insensitive'
                        }
                    },
                    {
                        downloadUrl: {
                            contains: '250%20PRIME%20CHANGE%20AHEAD',
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true
            }
        });

        if (tracks.length === 0) {
            console.log('✅ Nenhuma música encontrada.');
            return;
        }

        console.log(`📊 Total de músicas encontradas: ${tracks.length}`);
        console.log('');

        // 2. Mostrar algumas músicas
        console.log('📋 Primeiras 10 músicas:');
        tracks.slice(0, 10).forEach((track, index) => {
            console.log(`   ${index + 1}. ${track.songName} - ${track.artist}`);
        });
        console.log('');

        // 3. Deletar relacionamentos primeiro
        console.log('🗑️ Deletando relacionamentos...');
        const trackIds = tracks.map(track => track.id);

        // Deletar downloads
        console.log('   - Deletando downloads...');
        const downloadsDeleted = await prisma.download.deleteMany({
            where: {
                trackId: {
                    in: trackIds
                }
            }
        });
        console.log(`   ✅ Downloads deletados: ${downloadsDeleted.count}`);

        // Deletar playlists (se existir)
        try {
            console.log('   - Deletando playlists...');
            const playlistsDeleted = await prisma.playlist.deleteMany({
                where: {
                    tracks: {
                        some: {
                            id: {
                                in: trackIds
                            }
                        }
                    }
                }
            });
            console.log(`   ✅ Playlists deletadas: ${playlistsDeleted.count}`);
        } catch (error) {
            console.log('   ℹ️  Tabela playlist não encontrada ou sem relacionamentos');
        }

        // Deletar outras relações se existirem
        try {
            console.log('   - Verificando outras relações...');
            // Adicione aqui outras tabelas que possam ter relacionamentos
        } catch (error) {
            console.log('   ℹ️  Sem outras relações encontradas');
        }

        // 4. Agora deletar as músicas
        console.log('🗑️ Deletando músicas...');
        const tracksDeleted = await prisma.track.deleteMany({
            where: {
                id: {
                    in: trackIds
                }
            }
        });

        // 5. Resultado
        console.log('');
        console.log('✅ Exclusão concluída!');
        console.log(`📊 Músicas deletadas: ${tracksDeleted.count}`);
        console.log(`📊 Total esperado: ${tracks.length}`);

        // 6. Verificação final
        const remaining = await prisma.track.findMany({
            where: {
                OR: [
                    {
                        artist: {
                            contains: 'DJ LOADED',
                            mode: 'insensitive'
                        }
                    },
                    {
                        downloadUrl: {
                            contains: 'DJ%20LOADED',
                            mode: 'insensitive'
                        }
                    }
                ]
            }
        });

        console.log(`📊 Músicas restantes: ${remaining.length}`);

        if (remaining.length === 0) {
            console.log('🎯 Todas as músicas do DJ LOADED foram deletadas com sucesso!');
        }

    } catch (error) {
        console.error('💥 Erro:', error);
        console.error('Detalhes:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();


