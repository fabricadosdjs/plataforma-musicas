/**
 * Script simples para aplicar uma imagem específica em todas as tracks
 * Versão rápida e direta
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// URL da imagem que será aplicada
const IMAGE_URL = 'https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png';

async function updateAllTrackImages() {
    try {
        console.log('🖼️ Atualizando todas as tracks com a imagem especificada...\n');
        console.log(`📎 URL da imagem: ${IMAGE_URL}\n`);

        // Conta o total de tracks
        const totalTracks = await prisma.track.count();
        console.log(`📊 Total de tracks no banco: ${totalTracks}`);

        if (totalTracks === 0) {
            console.log('❌ Nenhuma track encontrada no banco de dados!');
            return;
        }

        // Atualiza todas as tracks de uma vez
        console.log('🔄 Executando atualização em massa...');

        const result = await prisma.track.updateMany({
            data: {
                imageUrl: IMAGE_URL
            }
        });

        console.log('\n📈 === RESULTADO ===');
        console.log(`✅ Tracks atualizadas: ${result.count}`);
        console.log(`📊 Total no banco: ${totalTracks}`);

        if (result.count === totalTracks) {
            console.log('🎉 Todas as tracks foram atualizadas com sucesso!');
        } else {
            console.log(`⚠️ Algumas tracks podem não ter sido atualizadas`);
        }

        console.log(`\n🖼️ Todas as tracks agora usam a imagem:`);
        console.log(`   ${IMAGE_URL}`);

    } catch (error) {
        console.error('❌ Erro ao atualizar imagens:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executa se foi chamado diretamente
updateAllTrackImages()
    .then(() => {
        console.log('\n✅ Script finalizado!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });

export { updateAllTrackImages };
