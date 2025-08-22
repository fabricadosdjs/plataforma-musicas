const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Script de backup antes de corrigir artistas desconhecidos
 * 
 * Este script cria um backup completo de todas as músicas que serão afetadas
 * pela correção de artistas, garantindo que possamos reverter as mudanças se necessário.
 */

async function createBackup() {
    console.log('💾 CRIANDO BACKUP DE SEGURANÇA...\n');

    try {
        // Valores inválidos que serão corrigidos
        const invalidArtistValues = [
            'Artista Desconhecido',
            'Artista Desconhecido',
            'Unknown Artist',
            'N/A',
            'Unknown',
            'Desconhecido',
            'Não Informado',
            'Sem Informação',
            'TBD',
            'To Be Determined'
        ];

        // 1. Buscar todas as músicas que serão afetadas
        console.log('🔍 Buscando músicas que serão corrigidas...');

        const tracksToBeFixed = await prisma.track.findMany({
            where: {
                OR: [
                    { artist: { in: invalidArtistValues } },
                    { artist: null },
                    { artist: '' }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true,
                downloadUrl: true,
                imageUrl: true,
                releaseDate: true,
                createdAt: true,
                updatedAt: true,
                isCommunity: true,
                uploadedBy: true,
                version: true,
                __v: true
            }
        });

        console.log(`📊 Encontradas ${tracksToBeFixed.length} músicas para backup\n`);

        if (tracksToBeFixed.length === 0) {
            console.log('✅ Nenhuma música precisa de backup!');
            return;
        }

        // 2. Criar diretório de backup se não existir
        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
            console.log('📁 Diretório de backup criado');
        }

        // 3. Gerar nome do arquivo de backup com timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `backup-artists-before-fix-${timestamp}.json`;
        const backupPath = path.join(backupDir, backupFileName);

        // 4. Criar dados do backup
        const backupData = {
            metadata: {
                timestamp: new Date().toISOString(),
                description: 'Backup antes da correção de artistas desconhecidos',
                totalTracks: tracksToBeFixed.length,
                script: 'backup-before-fix.js',
                version: '1.0.0'
            },
            tracks: tracksToBeFixed,
            summary: {
                byArtist: {},
                byStyle: {},
                byPool: {}
            }
        };

        // 5. Gerar estatísticas do backup
        tracksToBeFixed.forEach(track => {
            // Por artista
            const artist = track.artist || 'NULL/VAZIO';
            backupData.summary.byArtist[artist] = (backupData.summary.byArtist[artist] || 0) + 1;

            // Por estilo
            if (track.style) {
                backupData.summary.byStyle[track.style] = (backupData.summary.byStyle[track.style] || 0) + 1;
            }

            // Por pool
            if (track.pool) {
                backupData.summary.byPool[track.pool] = (backupData.summary.byPool[track.pool] || 0) + 1;
            }
        });

        // 6. Salvar backup
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

        console.log('✅ BACKUP CRIADO COM SUCESSO!');
        console.log(`📁 Arquivo: ${backupPath}`);
        console.log(`📊 Total de músicas: ${tracksToBeFixed.length}`);
        console.log('');

        // 7. Exibir resumo do backup
        console.log('📋 RESUMO DO BACKUP:');
        console.log('='.repeat(40));

        console.log('🎵 POR ARTISTA:');
        Object.entries(backupData.summary.byArtist)
            .sort(([, a], [, b]) => b - a)
            .forEach(([artist, count]) => {
                console.log(`   "${artist}": ${count} músicas`);
            });

        console.log('');

        if (Object.keys(backupData.summary.byStyle).length > 0) {
            console.log('🎼 POR ESTILO:');
            Object.entries(backupData.summary.byStyle)
                .sort(([, a], [, b]) => b - a)
                .forEach(([style, count]) => {
                    console.log(`   "${style}": ${count} músicas`);
                });
            console.log('');
        }

        if (Object.keys(backupData.summary.byPool).length > 0) {
            console.log('🏢 POR POOL:');
            Object.entries(backupData.summary.byPool)
                .sort(([, a], [, b]) => b - a)
                .forEach(([pool, count]) => {
                    console.log(`   "${pool}": ${count} músicas`);
                });
            console.log('');
        }

        // 8. Criar script de restauração
        const restoreScriptPath = path.join(backupDir, `restore-${timestamp}.js`);
        const restoreScript = `const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreFromBackup() {
    try {
        console.log('🔄 RESTAURANDO DADOS DO BACKUP...\\n');
        
        // Carregar backup
        const backupPath = '${backupPath}';
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        
        console.log(\`📊 Restaurando \${backupData.tracks.length} músicas...\\n\`);
        
        let restoredCount = 0;
        let failedCount = 0;
        
        for (const track of backupData.tracks) {
            try {
                await prisma.track.update({
                    where: { id: track.id },
                    data: {
                        artist: track.artist,
                        songName: track.songName,
                        style: track.style,
                        pool: track.pool,
                        downloadUrl: track.downloadUrl,
                        imageUrl: track.imageUrl,
                        releaseDate: track.releaseDate,
                        isCommunity: track.isCommunity,
                        uploadedBy: track.uploadedBy,
                        version: track.version,
                        __v: track.__v
                    }
                });
                
                console.log(\`✅ Restaurado ID \${track.id}: "\${track.artist || 'NULL'}"\`);
                restoredCount++;
                
            } catch (error) {
                console.log(\`❌ Erro ao restaurar ID \${track.id}: \${error.message}\`);
                failedCount++;
            }
        }
        
        console.log('\\n📋 RESUMO DA RESTAURAÇÃO:');
        console.log('=' .repeat(40));
        console.log(\`✅ Restauradas: \${restoredCount}\`);
        console.log(\`❌ Falhas: \${failedCount}\`);
        console.log(\`📊 Total: \${backupData.tracks.length}\`);
        
    } catch (error) {
        console.error('💥 Erro durante restauração:', error);
    } finally {
        await prisma.$disconnect();
    }
}

restoreFromBackup();
`;

        fs.writeFileSync(restoreScriptPath, restoreScript);
        console.log('📜 Script de restauração criado:');
        console.log(`   ${restoreScriptPath}`);
        console.log('');

        // 9. Instruções de uso
        console.log('📖 INSTRUÇÕES DE USO:');
        console.log('='.repeat(40));
        console.log('1. ✅ Backup criado com sucesso');
        console.log('2. 🚀 Agora você pode executar o script de correção');
        console.log('3. 🔄 Se precisar reverter, use o script de restauração');
        console.log('');
        console.log('⚠️  IMPORTANTE: Mantenha este backup em local seguro!');

    } catch (error) {
        console.error('💥 Erro ao criar backup:', error);
        throw error;
    }
}

// Função para executar o script
async function main() {
    try {
        console.log('💾 SCRIPT DE BACKUP DE SEGURANÇA');
        console.log('='.repeat(50));
        console.log('Este script cria um backup antes de corrigir artistas desconhecidos.');
        console.log('Execute este script ANTES de executar o script de correção!\n');

        // Verificar conexão com banco
        await prisma.$connect();
        console.log('✅ Conectado ao banco de dados\n');

        // Criar backup
        await createBackup();

        console.log('\n🎉 Backup criado com sucesso!');
        console.log('Agora você pode executar o script de correção com segurança.');

    } catch (error) {
        console.error('💥 Erro fatal:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        console.log('🔌 Desconectado do banco de dados');
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = { createBackup };
