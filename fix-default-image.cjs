const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateDefaultImage() {
    try {
        console.log('🔍 Atualizando imagem padrão...');

        const newImageUrl = 'https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png';

        // Atualizar todas as tracks que têm a imagem placeholder antiga
        const updateResult = await prisma.track.updateMany({
            where: {
                imageUrl: 'https://via.placeholder.com/300x300?text=Music'
            },
            data: {
                imageUrl: newImageUrl
            }
        });

        console.log(`✅ ${updateResult.count} tracks atualizadas com nova imagem padrão`);

        // Verificar se há outras imagens que precisam ser atualizadas
        const tracksWithOldImages = await prisma.track.findMany({
            where: {
                imageUrl: {
                    contains: 'via.placeholder.com'
                }
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                imageUrl: true
            },
            take: 5
        });

        if (tracksWithOldImages.length > 0) {
            console.log(`\n⚠️  ${tracksWithOldImages.length} tracks ainda com imagens placeholder:`);
            for (const track of tracksWithOldImages) {
                console.log(`   Track ID ${track.id}: ${track.songName} - ${track.artist}`);
                console.log(`   URL atual: ${track.imageUrl}`);
            }

            // Atualizar todas as imagens placeholder restantes
            const updatePlaceholderResult = await prisma.track.updateMany({
                where: {
                    imageUrl: {
                        contains: 'via.placeholder.com'
                    }
                },
                data: {
                    imageUrl: newImageUrl
                }
            });

            console.log(`✅ ${updatePlaceholderResult.count} tracks adicionais atualizadas`);
        }

        console.log('\n🎵 Nova imagem padrão aplicada com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante a atualização:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar o script
updateDefaultImage();
