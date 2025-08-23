import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function restoreIbizaSessions2025(backupFilename) {
    try {
        console.log(`🔄 Restaurando músicas do backup: ${backupFilename}`);

        // 1. Verificar se o arquivo de backup existe
        if (!fs.existsSync(backupFilename)) {
            console.error(`❌ Arquivo de backup não encontrado: ${backupFilename}`);
            return;
        }

        // 2. Ler o arquivo de backup
        const backupData = JSON.parse(fs.readFileSync(backupFilename, 'utf8'));
        console.log(`📊 Backup contém ${backupData.totalCount} músicas do folder "${backupData.folder}"`);
        console.log(`📅 Backup criado em: ${backupData.timestamp}`);

        if (!backupData.removedTracks || backupData.removedTracks.length === 0) {
            console.log('⚠️ Nenhuma música encontrada no backup');
            return;
        }

        // 3. Verificar se alguma música já existe
        const existingTracks = await prisma.track.findMany({
            where: {
                id: {
                    in: backupData.removedTracks.map(track => track.id)
                }
            },
            select: { id: true, songName: true, artist: true }
        });

        if (existingTracks.length > 0) {
            console.log(`⚠️ Encontradas ${existingTracks.length} músicas que já existem no banco:`);
            existingTracks.forEach(track => {
                console.log(`- ID: ${track.id} - "${track.songName}" by ${track.artist}`);
            });
            console.log('Essas músicas serão ignoradas na restauração.');
        }

        // 4. Filtrar músicas que não existem
        const tracksToRestore = backupData.removedTracks.filter(
            backupTrack => !existingTracks.some(existing => existing.id === backupTrack.id)
        );

        console.log(`🔄 Restaurando ${tracksToRestore.length} músicas...`);

        if (tracksToRestore.length === 0) {
            console.log('✅ Todas as músicas já existem no banco. Nada para restaurar.');
            return;
        }

        // 5. Restaurar as músicas
        let restoredCount = 0;
        for (const track of tracksToRestore) {
            try {
                await prisma.track.create({
                    data: {
                        id: track.id,
                        songName: track.songName,
                        artist: track.artist,
                        folder: track.folder,
                        createdAt: new Date(track.createdAt),
                        // Adicione outros campos necessários aqui
                        // Nota: Você pode precisar ajustar os campos baseado na estrutura do seu backup
                        style: 'Unknown', // Valor padrão, ajuste conforme necessário
                        previewUrl: 'https://example.com/preview.mp3', // Valor padrão
                        downloadUrl: 'https://example.com/download.mp3', // Valor padrão
                        releaseDate: new Date(track.createdAt),
                        isCommunity: false
                    }
                });
                restoredCount++;
                console.log(`✅ Restaurada: "${track.songName}" by ${track.artist}`);
            } catch (error) {
                console.error(`❌ Erro ao restaurar "${track.songName}":`, error.message);
            }
        }

        console.log(`\n✅ Restauração concluída! ${restoredCount} músicas restauradas.`);

        // 6. Verificar a restauração
        const finalCount = await prisma.track.count({
            where: {
                folder: backupData.folder
            }
        });

        console.log(`📊 Total de músicas no folder "${backupData.folder}": ${finalCount}`);

    } catch (error) {
        console.error('❌ Erro durante a restauração:', error);

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

// Verificar se foi fornecido um arquivo de backup
const backupFilename = process.argv[2];

if (!backupFilename) {
    console.error('❌ Por favor, forneça o nome do arquivo de backup como parâmetro');
    console.log('Exemplo: node scripts/restore-ibiza-sessions-2025.js backup-ibiza-sessions-2025-2025-01-22.json');
    process.exit(1);
}

// Executar o script
restoreIbizaSessions2025(backupFilename)
    .then(() => {
        console.log('\n✅ Script de restauração executado com sucesso!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script de restauração falhou:', error);
        process.exit(1);
    });
