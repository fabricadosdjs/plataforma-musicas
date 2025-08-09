/**
 * Script para verificar quantas tracks não possuem imagem
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTracksImages() {
    try {
        // Total de tracks
        const totalTracks = await prisma.track.count();

        // Tracks sem imagem ou com imagem padrão/genérica
        const tracksWithoutImage = await prisma.track.count({
            where: {
                OR: [
                    { imageUrl: '' },
                    { imageUrl: { contains: 'placeholder' } },
                    { imageUrl: { contains: 'default' } },
                    { imageUrl: { contains: 'no-image' } }
                ]
            }
        });

        // Tracks com imagem
        const tracksWithImage = totalTracks - tracksWithoutImage;

        console.log('📊 === RELATÓRIO DE IMAGENS DAS TRACKS ===\n');
        console.log(`🎵 Total de tracks: ${totalTracks}`);
        console.log(`✅ Tracks com imagem: ${tracksWithImage} (${((tracksWithImage / totalTracks) * 100).toFixed(1)}%)`);
        console.log(`❌ Tracks sem imagem: ${tracksWithoutImage} (${((tracksWithoutImage / totalTracks) * 100).toFixed(1)}%)`);

        if (tracksWithoutImage > 0) {
            console.log(`\n🔧 Para atualizar as tracks sem imagem, execute:`);
            console.log(`   node update-track-images-ai.js`);
            console.log(`   ou`);
            console.log(`   node update-track-images.js`);
        } else {
            console.log(`\n🎉 Todas as tracks já possuem imagem!`);
        }

        // Mostra algumas tracks sem imagem como exemplo
        if (tracksWithoutImage > 0) {
            console.log(`\n📝 Exemplos de tracks sem imagem:`);
            const examples = await prisma.track.findMany({
                where: {
                    OR: [
                        { imageUrl: '' },
                        { imageUrl: { contains: 'placeholder' } },
                        { imageUrl: { contains: 'default' } },
                        { imageUrl: { contains: 'no-image' } }
                    ]
                },
                select: {
                    id: true,
                    artist: true,
                    songName: true,
                    style: true,
                    imageUrl: true
                },
                take: 5,
                orderBy: {
                    createdAt: 'desc'
                }
            });

            examples.forEach((track, index) => {
                console.log(`   ${index + 1}. ID ${track.id}: ${track.artist} - ${track.songName} (${track.style})`);
            });
        }

    } catch (error) {
        console.error('❌ Erro ao verificar imagens:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executa se foi chamado diretamente
checkTracksImages()
    .then(() => {
        console.log('\n✅ Verificação concluída!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro:', error);
        process.exit(1);
    });

export { checkTracksImages };
