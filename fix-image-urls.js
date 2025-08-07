const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixImageUrls() {
    try {
        console.log('🔧 Iniciando correção de URLs de imagem...');

        // Buscar todas as tracks com imageUrl
        const tracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                imageUrl: true
            }
        });

        console.log(`📊 Encontradas ${tracks.length} tracks para verificar`);

        let fixedCount = 0;
        let totalCount = 0;

        for (const track of tracks) {
            totalCount++;

            // Verificar se a URL tem barras duplas
            if (track.imageUrl && track.imageUrl.includes('\\\\')) {
                console.log(`🔍 Track ID ${track.id} (${track.songName}):`);
                console.log(`   URL original: ${track.imageUrl}`);

                // Corrigir barras duplas para barras simples
                const fixedUrl = track.imageUrl.replace(/\\\\/g, '/');

                console.log(`   URL corrigida: ${fixedUrl}`);

                // Atualizar no banco de dados
                await prisma.track.update({
                    where: { id: track.id },
                    data: { imageUrl: fixedUrl }
                });

                fixedCount++;
                console.log(`   ✅ Corrigido!`);
            }
        }

        console.log('\n📈 Resumo:');
        console.log(`   Total de tracks verificadas: ${totalCount}`);
        console.log(`   URLs corrigidas: ${fixedCount}`);
        console.log(`   Tracks sem problemas: ${totalCount - fixedCount}`);

        if (fixedCount > 0) {
            console.log('\n✅ Correção concluída com sucesso!');
        } else {
            console.log('\nℹ️  Nenhuma URL com barras duplas encontrada.');
        }

    } catch (error) {
        console.error('❌ Erro durante a correção:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar o script
fixImageUrls();
