const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImageUrls() {
    try {
        console.log('🔍 Verificando URLs de imagem no banco de dados...');

        // Buscar todas as tracks com imageUrl
        const tracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                imageUrl: true
            },
            take: 20 // Limitar para não sobrecarregar o console
        });

        console.log(`📊 Mostrando as primeiras ${tracks.length} tracks:`);
        console.log('');

        for (const track of tracks) {
            console.log(`Track ID ${track.id} (${track.songName}):`);
            console.log(`   imageUrl: ${track.imageUrl}`);
            console.log(`   Tipo: ${typeof track.imageUrl}`);
            console.log(`   Comprimento: ${track.imageUrl?.length || 0}`);
            console.log(`   Contém 'public': ${track.imageUrl?.includes('public') || false}`);
            console.log(`   Contém '\\\\': ${track.imageUrl?.includes('\\\\') || false}`);
            console.log(`   Contém '//': ${track.imageUrl?.includes('//') || false}`);
            console.log('');
        }

        // Verificar se há URLs problemáticas
        const problematicTracks = await prisma.track.findMany({
            where: {
                OR: [
                    { imageUrl: { contains: 'public\\\\' } },
                    { imageUrl: { contains: '\\\\' } },
                    { imageUrl: { startsWith: 'public' } }
                ]
            },
            select: {
                id: true,
                songName: true,
                imageUrl: true
            }
        });

        console.log(`🚨 Tracks com URLs problemáticas: ${problematicTracks.length}`);

        if (problematicTracks.length > 0) {
            console.log('\n📋 URLs problemáticas encontradas:');
            for (const track of problematicTracks) {
                console.log(`   ID ${track.id}: ${track.imageUrl}`);
            }
        }

    } catch (error) {
        console.error('❌ Erro durante a verificação:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar o script
checkImageUrls();
