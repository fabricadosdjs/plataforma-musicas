import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeIbizaSessions2025() {
    try {
        console.log('🔍 Buscando músicas do folder "Ibiza Sessions 2025"...');

        // 1. Primeiro, vamos ver quantas músicas existem com esse folder
        const tracksToDelete = await prisma.track.findMany({
            where: {
                folder: 'Ibiza Sessions 2025'
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                folder: true,
                createdAt: true
            }
        });

        console.log(`📊 Encontradas ${tracksToDelete.length} músicas para remover:`);

        if (tracksToDelete.length === 0) {
            console.log('✅ Nenhuma música encontrada com o folder "Ibiza Sessions 2025"');
            return;
        }

        // Mostrar as músicas que serão removidas
        tracksToDelete.forEach((track, index) => {
            console.log(`${index + 1}. ID: ${track.id} - "${track.songName}" by ${track.artist} (${track.createdAt})`);
        });

        // 2. Confirmar a remoção (em produção, você pode querer adicionar uma confirmação manual)
        console.log('\n⚠️ ATENÇÃO: Esta operação irá REMOVER PERMANENTEMENTE todas essas músicas!');
        console.log('💾 Fazendo backup das informações antes da remoção...');

        // 3. Fazer backup das músicas antes de remover
        const backupData = {
            timestamp: new Date().toISOString(),
            folder: 'Ibiza Sessions 2025',
            removedTracks: tracksToDelete,
            totalCount: tracksToDelete.length
        };

        // Salvar backup em arquivo JSON
        const fs = await import('fs');
        const backupFilename = `backup-ibiza-sessions-2025-${new Date().toISOString().split('T')[0]}.json`;
        fs.writeFileSync(backupFilename, JSON.stringify(backupData, null, 2));
        console.log(`💾 Backup salvo em: ${backupFilename}`);

        // 4. Remover as músicas relacionadas primeiro (downloads, likes, plays, etc.)
        console.log('\n🧹 Removendo dados relacionados...');

        // Remover downloads relacionados
        const deletedDownloads = await prisma.download.deleteMany({
            where: {
                trackId: {
                    in: tracksToDelete.map(track => track.id)
                }
            }
        });
        console.log(`✅ Removidos ${deletedDownloads.count} downloads relacionados`);

        // Remover likes relacionados
        const deletedLikes = await prisma.like.deleteMany({
            where: {
                trackId: {
                    in: tracksToDelete.map(track => track.id)
                }
            }
        });
        console.log(`✅ Removidos ${deletedLikes.count} likes relacionados`);

        // Remover plays relacionados
        const deletedPlays = await prisma.play.deleteMany({
            where: {
                trackId: {
                    in: tracksToDelete.map(track => track.id)
                }
            }
        });
        console.log(`✅ Removidos ${deletedPlays.count} plays relacionados`);

        // Remover requests relacionados
        const deletedRequests = await prisma.request.deleteMany({
            where: {
                trackId: {
                    in: tracksToDelete.map(track => track.id)
                }
            }
        });
        console.log(`✅ Removidos ${deletedRequests.count} requests relacionados`);

        // 5. Finalmente, remover as músicas
        console.log('\n🗑️ Removendo as músicas...');
        const deletedTracks = await prisma.track.deleteMany({
            where: {
                folder: 'Ibiza Sessions 2025'
            }
        });

        console.log(`✅ Removidas ${deletedTracks.count} músicas do folder "Ibiza Sessions 2025"`);

        // 6. Verificar se a remoção foi bem-sucedida
        const remainingTracks = await prisma.track.count({
            where: {
                folder: 'Ibiza Sessions 2025'
            }
        });

        if (remainingTracks === 0) {
            console.log('✅ Todas as músicas foram removidas com sucesso!');
        } else {
            console.log(`⚠️ Ainda restam ${remainingTracks} músicas. Algo pode ter dado errado.`);
        }

        console.log('\n📊 Resumo da operação:');
        console.log(`- Músicas removidas: ${deletedTracks.count}`);
        console.log(`- Downloads removidos: ${deletedDownloads.count}`);
        console.log(`- Likes removidos: ${deletedLikes.count}`);
        console.log(`- Plays removidos: ${deletedPlays.count}`);
        console.log(`- Requests removidos: ${deletedRequests.count}`);
        console.log(`- Backup salvo em: ${backupFilename}`);

    } catch (error) {
        console.error('❌ Erro durante a remoção:', error);

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
removeIbizaSessions2025()
    .then(() => {
        console.log('\n✅ Script executado com sucesso!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script falhou:', error);
        process.exit(1);
    });
