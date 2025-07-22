// script para fazer backup dos dados do banco
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
    try {
        console.log('🔄 Iniciando backup do banco de dados...');

        // Backup dos usuários
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        console.log(`👥 Fazendo backup de ${users.length} usuários...`);

        // Backup das tracks
        const tracks = await prisma.track.findMany({
            orderBy: { createdAt: 'desc' }
        });
        console.log(`🎵 Fazendo backup de ${tracks.length} tracks...`);

        // Backup dos likes
        const likes = await prisma.like.findMany({
            orderBy: { createdAt: 'desc' }
        });
        console.log(`❤️ Fazendo backup de ${likes.length} likes...`);

        // Backup dos downloads
        const downloads = await prisma.download.findMany({
            orderBy: { createdAt: 'desc' }
        });
        console.log(`⬇️ Fazendo backup de ${downloads.length} downloads...`);

        // Criar objeto de backup
        const backupData = {
            timestamp: new Date().toISOString(),
            users: users.map(user => ({
                ...user,
                valor: user.valor ? user.valor.toString() : null,
                vencimento: user.vencimento ? user.vencimento.toISOString() : null,
                dataPagamento: user.dataPagamento ? user.dataPagamento.toISOString() : null,
                lastDownloadReset: user.lastDownloadReset ? user.lastDownloadReset.toISOString() : null,
                createdAt: user.createdAt ? user.createdAt.toISOString() : null,
                updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
            })),
            tracks: tracks.map(track => ({
                ...track,
                releaseDate: track.releaseDate.toISOString(),
                createdAt: track.createdAt ? track.createdAt.toISOString() : null,
                updatedAt: track.updatedAt ? track.updatedAt.toISOString() : null,
            })),
            likes: likes.map(like => ({
                ...like,
                createdAt: like.createdAt ? like.createdAt.toISOString() : null,
            })),
            downloads: downloads.map(download => ({
                ...download,
                createdAt: download.createdAt ? download.createdAt.toISOString() : null,
                downloadedAt: download.downloadedAt ? download.downloadedAt.toISOString() : null,
                nextAllowedDownload: download.nextAllowedDownload ? download.nextAllowedDownload.toISOString() : null,
            }))
        };

        // Salvar backup em arquivo
        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        const backupFileName = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
        const backupPath = path.join(backupDir, backupFileName);

        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

        console.log('✅ Backup criado com sucesso!');
        console.log(`📁 Arquivo: ${backupPath}`);
        console.log(`📊 Estatísticas do backup:`);
        console.log(`   - ${backupData.users.length} usuários`);
        console.log(`   - ${backupData.tracks.length} tracks`);
        console.log(`   - ${backupData.likes.length} likes`);
        console.log(`   - ${backupData.downloads.length} downloads`);

        return backupPath;
    } catch (error) {
        console.error('❌ Erro ao fazer backup:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    backupDatabase();
}

module.exports = { backupDatabase };
