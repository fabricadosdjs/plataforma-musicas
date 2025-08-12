// Script para corrigir URLs que contêm BEATPORT/09.08.2025/ no banco de dados
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBeatportUrls() {
    console.log('🔧 Iniciando correção de URLs com pasta BEATPORT...');

    try {
        // Buscar todas as músicas que têm BEATPORT no caminho
        const tracksWithBeatport = await prisma.track.findMany({
            where: {
                OR: [
                    {
                        downloadUrl: {
                            contains: 'BEATPORT/'
                        }
                    },
                    {
                        previewUrl: {
                            contains: 'BEATPORT/'
                        }
                    }
                ]
            }
        });

        console.log(`📊 Encontradas ${tracksWithBeatport.length} músicas com URLs incorretas`);

        if (tracksWithBeatport.length === 0) {
            console.log('✅ Nenhuma música encontrada com URLs incorretas');
            return;
        }

        let fixedCount = 0;
        let errorCount = 0;

        for (const track of tracksWithBeatport) {
            try {
                console.log(`\n🎵 Corrigindo: ${track.artist} - ${track.songName}`);
                console.log(`   URL atual: ${track.downloadUrl}`);

                // Corrigir downloadUrl
                let newDownloadUrl = track.downloadUrl;
                if (newDownloadUrl.includes('BEATPORT/')) {
                    newDownloadUrl = newDownloadUrl.replace(/BEATPORT\/([^\/]+\/)/g, '$1');
                }

                // Corrigir previewUrl
                let newPreviewUrl = track.previewUrl;
                if (newPreviewUrl.includes('BEATPORT/')) {
                    newPreviewUrl = newPreviewUrl.replace(/BEATPORT\/([^\/]+\/)/g, '$1');
                }

                console.log(`   URL nova: ${newDownloadUrl}`);

                // Atualizar no banco de dados
                await prisma.track.update({
                    where: { id: track.id },
                    data: {
                        downloadUrl: newDownloadUrl,
                        previewUrl: newPreviewUrl,
                        updatedAt: new Date()
                    }
                });

                fixedCount++;
                console.log(`   ✅ URL corrigida`);

            } catch (error) {
                errorCount++;
                console.error(`   ❌ Erro ao corrigir música ${track.id}:`, error.message);
            }
        }

        console.log(`\n📈 Resumo da correção:`);
        console.log(`   ✅ URLs corrigidas: ${fixedCount}`);
        console.log(`   ❌ Erros: ${errorCount}`);
        console.log(`   📊 Total processado: ${tracksWithBeatport.length}`);

        if (fixedCount > 0) {
            console.log('\n🎉 Correção concluída com sucesso!');
            console.log('💡 As músicas agora devem tocar e baixar corretamente.');
        }

    } catch (error) {
        console.error('❌ Erro durante a correção:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar o script
fixBeatportUrls().catch(console.error);
