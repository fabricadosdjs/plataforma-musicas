import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIbizaSessions2025() {
    try {
        console.log('🔍 Verificando músicas do folder "Ibiza Sessions 2025"...');

        // Buscar todas as músicas com esse folder
        const tracks = await prisma.track.findMany({
            where: {
                folder: 'Ibiza Sessions 2025'
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                folder: true,
                createdAt: true,
                updatedAt: true,
                imageUrl: true,
                downloadUrl: true,
                releaseDate: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`\n📊 Encontradas ${tracks.length} músicas com folder "Ibiza Sessions 2025":`);

        if (tracks.length === 0) {
            console.log('✅ Nenhuma música encontrada com esse folder');
            return;
        }

        // Mostrar detalhes de cada música
        tracks.forEach((track, index) => {
            console.log(`\n${index + 1}. 🎵 "${track.songName}" - ${track.artist}`);
            console.log(`   📁 Folder: ${track.folder}`);
            console.log(`   🎨 Estilo: ${track.style || 'N/A'}`);
            console.log(`   🏢 Pool: ${track.pool || 'N/A'}`);
            console.log(`   🆔 ID: ${track.id}`);
            console.log(`   📅 Criado: ${track.createdAt}`);
            console.log(`   📸 Imagem: ${track.imageUrl ? '✅ Sim' : '❌ Não'}`);
        });

        // Estatísticas adicionais
        const stats = {
            totalTracks: tracks.length,
            uniqueArtists: new Set(tracks.map(t => t.artist)).size,
            uniqueStyles: new Set(tracks.map(t => t.style).filter(Boolean)).size,
            uniquePools: new Set(tracks.map(t => t.pool).filter(Boolean)).size,
            tracksWithImages: tracks.filter(t => t.imageUrl).length,
            tracksWithoutImages: tracks.filter(t => !t.imageUrl).length
        };

        console.log('\n📊 Estatísticas:');
        console.log(`- Total de músicas: ${stats.totalTracks}`);
        console.log(`- Artistas únicos: ${stats.uniqueArtists}`);
        console.log(`- Estilos únicos: ${stats.uniqueStyles}`);
        console.log(`- Pools únicos: ${stats.uniquePools}`);
        console.log(`- Músicas com imagem: ${stats.tracksWithImages}`);
        console.log(`- Músicas sem imagem: ${stats.tracksWithoutImages}`);

        // Verificar dados relacionados
        console.log('\n🔗 Verificando dados relacionados...');

        const relatedDownloads = await prisma.download.count({
            where: {
                trackId: {
                    in: tracks.map(t => t.id)
                }
            }
        });

        const relatedLikes = await prisma.like.count({
            where: {
                trackId: {
                    in: tracks.map(t => t.id)
                }
            }
        });

        const relatedPlays = await prisma.play.count({
            where: {
                trackId: {
                    in: tracks.map(t => t.id)
                }
            }
        });

        const relatedRequests = await prisma.request.count({
            where: {
                trackId: {
                    in: tracks.map(t => t.id)
                }
            }
        });

        console.log(`- Downloads relacionados: ${relatedDownloads}`);
        console.log(`- Likes relacionados: ${relatedLikes}`);
        console.log(`- Plays relacionados: ${relatedPlays}`);
        console.log(`- Requests relacionados: ${relatedRequests}`);

        console.log('\n⚠️ ATENÇÃO: Se você executar o script de remoção, TODOS esses dados serão excluídos permanentemente!');
        console.log('💡 Para remover, execute: node scripts/remove-ibiza-sessions-2025.js');

    } catch (error) {
        console.error('❌ Erro durante a verificação:', error);

        if (error instanceof Error) {
            console.error('🔍 Detalhes do erro:', {
                message: error.message,
                stack: error.stack
            });
        }

        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Executar o script
checkIbizaSessions2025()
    .then(() => {
        console.log('\n✅ Verificação concluída!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Verificação falhou:', error);
        process.exit(1);
    });
