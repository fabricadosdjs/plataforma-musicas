// script para restaurar dados do backup (seed)
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreFromBackup(backupFilePath) {
    try {
        console.log('🔄 Iniciando restauração do backup...');
        console.log(`📁 Arquivo: ${backupFilePath}`);

        // Ler dados do backup
        const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
        console.log(`📅 Backup criado em: ${backupData.timestamp}`);

        // Restaurar tracks primeiro (sem dependências)
        console.log(`🎵 Restaurando ${backupData.tracks.length} tracks...`);
        for (const track of backupData.tracks) {
            await prisma.track.upsert({
                where: { id: track.id },
                update: {
                    songName: track.songName,
                    artist: track.artist,
                    style: track.style,
                    version: track.version,
                    imageUrl: track.imageUrl,
                    previewUrl: track.previewUrl,
                    downloadUrl: track.downloadUrl,
                    releaseDate: new Date(track.releaseDate),
                    updatedAt: track.updatedAt ? new Date(track.updatedAt) : new Date(),
                },
                create: {
                    id: track.id,
                    songName: track.songName,
                    artist: track.artist,
                    style: track.style,
                    version: track.version,
                    imageUrl: track.imageUrl,
                    previewUrl: track.previewUrl,
                    downloadUrl: track.downloadUrl,
                    releaseDate: new Date(track.releaseDate),
                    createdAt: track.createdAt ? new Date(track.createdAt) : new Date(),
                    updatedAt: track.updatedAt ? new Date(track.updatedAt) : new Date(),
                }
            });
        }

        // Restaurar usuários
        console.log(`👥 Restaurando ${backupData.users.length} usuários...`);
        for (const user of backupData.users) {
            await prisma.user.upsert({
                where: { id: user.id },
                update: {
                    name: user.name,
                    whatsapp: user.whatsapp,
                    email: user.email,
                    password: user.password || null,
                    valor: user.valor ? parseFloat(user.valor) : null,
                    vencimento: user.vencimento ? new Date(user.vencimento) : null,
                    dataPagamento: user.dataPagamento ? new Date(user.dataPagamento) : null,
                    status: user.status,
                    deemix: user.deemix,
                    is_vip: user.is_vip,
                    dailyDownloadCount: user.dailyDownloadCount || 0,
                    lastDownloadReset: user.lastDownloadReset ? new Date(user.lastDownloadReset) : null,
                    // Novos campos (com valores padrão se não existirem no backup)
                    weeklyPackRequests: user.weeklyPackRequests || 0,
                    weeklyPlaylistDownloads: user.weeklyPlaylistDownloads || 0,
                    lastWeekReset: user.lastWeekReset ? new Date(user.lastWeekReset) : null,
                    customBenefits: user.customBenefits || null,
                    updatedAt: new Date(),
                },
                create: {
                    id: user.id,
                    name: user.name,
                    whatsapp: user.whatsapp,
                    email: user.email,
                    password: user.password || null,
                    valor: user.valor ? parseFloat(user.valor) : null,
                    vencimento: user.vencimento ? new Date(user.vencimento) : null,
                    dataPagamento: user.dataPagamento ? new Date(user.dataPagamento) : null,
                    status: user.status,
                    deemix: user.deemix,
                    is_vip: user.is_vip,
                    dailyDownloadCount: user.dailyDownloadCount || 0,
                    lastDownloadReset: user.lastDownloadReset ? new Date(user.lastDownloadReset) : null,
                    weeklyPackRequests: user.weeklyPackRequests || 0,
                    weeklyPlaylistDownloads: user.weeklyPlaylistDownloads || 0,
                    lastWeekReset: user.lastWeekReset ? new Date(user.lastWeekReset) : null,
                    customBenefits: user.customBenefits || null,
                    createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                    updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
                }
            });
        }

        // Restaurar likes
        console.log(`❤️ Restaurando ${backupData.likes.length} likes...`);
        for (const like of backupData.likes) {
            try {
                await prisma.like.upsert({
                    where: {
                        unique_user_track: {
                            userId: like.userId,
                            trackId: like.trackId
                        }
                    },
                    update: {
                        createdAt: like.createdAt ? new Date(like.createdAt) : new Date(),
                    },
                    create: {
                        id: like.id,
                        userId: like.userId,
                        trackId: like.trackId,
                        createdAt: like.createdAt ? new Date(like.createdAt) : new Date(),
                    }
                });
            } catch (error) {
                console.warn(`⚠️ Erro ao restaurar like ${like.id}:`, error.message);
            }
        }

        // Restaurar downloads
        console.log(`⬇️ Restaurando ${backupData.downloads.length} downloads...`);
        for (const download of backupData.downloads) {
            try {
                await prisma.download.upsert({
                    where: {
                        unique_user_track_download: {
                            userId: download.userId,
                            trackId: download.trackId
                        }
                    },
                    update: {
                        createdAt: download.createdAt ? new Date(download.createdAt) : new Date(),
                        downloadedAt: download.downloadedAt ? new Date(download.downloadedAt) : new Date(),
                        nextAllowedDownload: download.nextAllowedDownload ? new Date(download.nextAllowedDownload) : null,
                    },
                    create: {
                        id: download.id,
                        userId: download.userId,
                        trackId: download.trackId,
                        createdAt: download.createdAt ? new Date(download.createdAt) : new Date(),
                        downloadedAt: download.downloadedAt ? new Date(download.downloadedAt) : new Date(),
                        nextAllowedDownload: download.nextAllowedDownload ? new Date(download.nextAllowedDownload) : null,
                    }
                });
            } catch (error) {
                console.warn(`⚠️ Erro ao restaurar download ${download.id}:`, error.message);
            }
        }

        console.log('✅ Restauração concluída com sucesso!');
        console.log('📊 Dados restaurados:');
        console.log(`   - ${backupData.users.length} usuários`);
        console.log(`   - ${backupData.tracks.length} tracks`);
        console.log(`   - ${backupData.likes.length} likes`);
        console.log(`   - ${backupData.downloads.length} downloads`);

    } catch (error) {
        console.error('❌ Erro ao restaurar backup:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Função para listar backups disponíveis
function listBackups() {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
        console.log('❌ Diretório de backups não encontrado');
        return [];
    }

    const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.json'))
        .map(file => ({
            name: file,
            path: path.join(backupDir, file),
            date: fs.statSync(path.join(backupDir, file)).mtime
        }))
        .sort((a, b) => b.date - a.date);

    return files;
}

// Função para restaurar o backup mais recente
async function restoreLatestBackup() {
    const backups = listBackups();
    if (backups.length === 0) {
        console.log('❌ Nenhum backup encontrado');
        return;
    }

    const latestBackup = backups[0];
    console.log(`🔄 Usando backup mais recente: ${latestBackup.name}`);
    await restoreFromBackup(latestBackup.path);
}

if (require.main === module) {
    const backupFile = process.argv[2];
    if (backupFile) {
        restoreFromBackup(backupFile);
    } else {
        restoreLatestBackup();
    }
}

module.exports = { restoreFromBackup, restoreLatestBackup, listBackups };
