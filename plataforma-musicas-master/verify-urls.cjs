const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyUrls() {
    try {
        console.log('🔍 Verificando URLs específicas...');

        // Buscar tracks com URLs que contêm 'public'
        const tracksWithPublic = await prisma.track.findMany({
            where: {
                imageUrl: {
                    contains: 'public'
                }
            },
            select: {
                id: true,
                songName: true,
                imageUrl: true
            }
        });

        console.log(`📊 Tracks com 'public' na URL: ${tracksWithPublic.length}`);

        for (const track of tracksWithPublic) {
            console.log(`   ID ${track.id}: ${track.imageUrl}`);
        }

        // Buscar tracks com barra invertida
        const tracksWithBackslash = await prisma.track.findMany({
            where: {
                imageUrl: {
                    contains: '\\'
                }
            },
            select: {
                id: true,
                songName: true,
                imageUrl: true
            }
        });

        console.log(`\n📊 Tracks com barra invertida: ${tracksWithBackslash.length}`);

        for (const track of tracksWithBackslash) {
            console.log(`   ID ${track.id}: ${track.imageUrl}`);
        }

        // Buscar tracks que começam com 'public'
        const tracksStartingWithPublic = await prisma.track.findMany({
            where: {
                imageUrl: {
                    startsWith: 'public'
                }
            },
            select: {
                id: true,
                songName: true,
                imageUrl: true
            }
        });

        console.log(`\n📊 Tracks que começam com 'public': ${tracksStartingWithPublic.length}`);

        for (const track of tracksStartingWithPublic) {
            console.log(`   ID ${track.id}: ${track.imageUrl}`);
        }

    } catch (error) {
        console.error('❌ Erro durante a verificação:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar o script
verifyUrls();
