const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixProblematicUrls() {
    try {
        console.log('🔧 Corrigindo URLs problemáticas...');

        // Buscar tracks com URLs problemáticas
        const problematicTracks = await prisma.track.findMany({
            where: {
                imageUrl: {
                    contains: 'public\\'
                }
            },
            select: {
                id: true,
                songName: true,
                imageUrl: true
            }
        });

        console.log(`📊 Encontradas ${problematicTracks.length} tracks com URLs problemáticas`);

        let fixedCount = 0;

        for (const track of problematicTracks) {
            console.log(`🔍 Track ID ${track.id} (${track.songName}):`);
            console.log(`   URL original: ${track.imageUrl}`);

            // Corrigir barra invertida para barra normal
            const fixedUrl = track.imageUrl.replace(/\\/g, '/');

            console.log(`   URL corrigida: ${fixedUrl}`);

            // Atualizar no banco de dados
            await prisma.track.update({
                where: { id: track.id },
                data: { imageUrl: fixedUrl }
            });

            fixedCount++;
            console.log(`   ✅ Corrigido!`);
        }

        console.log('\n📈 Resumo:');
        console.log(`   URLs corrigidas: ${fixedCount}`);

        if (fixedCount > 0) {
            console.log('\n✅ Correção concluída com sucesso!');
        } else {
            console.log('\nℹ️  Nenhuma URL problemática encontrada.');
        }

    } catch (error) {
        console.error('❌ Erro durante a correção:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar o script
fixProblematicUrls();
