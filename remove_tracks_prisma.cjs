// ============================================
// SCRIPT PRISMA PARA REMOVER TRACKS (CommonJS)
// ============================================
// Execute com: node remove_tracks_prisma.cjs

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeSpecificTracks() {
    try {
        console.log('🎵 Iniciando remoção de tracks específicas...\n');

        // 1. VERIFICAR AS TRACKS ANTES DE REMOVER
        console.log('📋 Verificando tracks existentes...');
        const tracksToRemove = await prisma.track.findMany({
            where: {
                folder: '90\'s EXTENDED & CLUB SERIES',
                OR: [
                    {
                        songName: 'BARBIE GIRL',
                        artist: 'AQUA',
                        version: 'EXTENDED VERSION'
                    },
                    {
                        songName: 'AYLA PART II',
                        artist: 'AYLA',
                        version: 'EXTENDED MIX'
                    },
                    {
                        songName: 'SEVEN DAYS AND ONE WEEK',
                        artist: '.B.E.',
                        version: 'CLUB MIX'
                    }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                version: true,
                folder: true
            }
        });

        if (tracksToRemove.length === 0) {
            console.log('✅ Nenhuma track encontrada para remover');
            return;
        }

        console.log(`📊 Encontradas ${tracksToRemove.length} tracks para remover:`);
        tracksToRemove.forEach(track => {
            console.log(`   - ${track.artist} - ${track.songName} (${track.version})`);
        });

        // 2. VERIFICAR DOWNLOADS E LIKES RELACIONADOS
        console.log('\n📥 Verificando downloads e likes relacionados...');
        const trackIds = tracksToRemove.map(t => t.id);

        const downloadCount = await prisma.download.count({
            where: { trackId: { in: trackIds } }
        });

        const likeCount = await prisma.like.count({
            where: { trackId: { in: trackIds } }
        });

        console.log(`   Downloads relacionados: ${downloadCount}`);
        console.log(`   Likes relacionados: ${likeCount}`);

        // 3. REMOVER DOWNLOADS (CASCADE)
        if (downloadCount > 0) {
            console.log('\n🗑️ Removendo downloads relacionados...');
            await prisma.download.deleteMany({
                where: { trackId: { in: trackIds } }
            });
            console.log('✅ Downloads removidos');
        }

        // 4. REMOVER LIKES (CASCADE)
        if (likeCount > 0) {
            console.log('\n❤️ Removendo likes relacionados...');
            await prisma.like.deleteMany({
                where: { trackId: { in: trackIds } }
            });
            console.log('✅ Likes removidos');
        }

        // 5. REMOVER AS TRACKS PRINCIPAIS
        console.log('\n🎵 Removendo tracks principais...');
        const deleteResult = await prisma.track.deleteMany({
            where: {
                folder: '90\'s EXTENDED & CLUB SERIES',
                OR: [
                    {
                        songName: 'BARBIE GIRL',
                        artist: 'AQUA',
                        version: 'EXTENDED VERSION'
                    },
                    {
                        songName: 'AYLA PART II',
                        artist: 'AYLA',
                        version: 'EXTENDED MIX'
                    },
                    {
                        songName: 'SEVEN DAYS AND ONE WEEK',
                        artist: '.B.E.',
                        version: 'CLUB MIX'
                    }
                ]
            }
        });

        console.log(`✅ ${deleteResult.count} tracks removidas com sucesso!`);

        // 6. VERIFICAR SE AS REMOÇÕES FORAM BEM-SUCEDIDAS
        console.log('\n🔍 Verificando integridade...');
        const remainingTracks = await prisma.track.findMany({
            where: {
                folder: '90\'s EXTENDED & CLUB SERIES',
                OR: [
                    {
                        songName: 'BARBIE GIRL',
                        artist: 'AQUA',
                        version: 'EXTENDED VERSION'
                    },
                    {
                        songName: 'AYLA PART II',
                        artist: 'AYLA',
                        version: 'EXTENDED MIX'
                    },
                    {
                        songName: 'SEVEN DAYS AND ONE WEEK',
                        artist: '.B.E.',
                        version: 'CLUB MIX'
                    }
                ]
            }
        });

        if (remainingTracks.length === 0) {
            console.log('✅ Verificação: Todas as tracks foram removidas com sucesso!');
        } else {
            console.log(`⚠️ Verificação: Ainda existem ${remainingTracks.length} tracks`);
        }

        // 7. VERIFICAR TOTAL DE TRACKS RESTANTES NO FOLDER
        const totalRemaining = await prisma.track.count({
            where: { folder: '90\'s EXTENDED & CLUB SERIES' }
        });

        console.log(`\n📁 Total de tracks restantes no folder: ${totalRemaining}`);

    } catch (error) {
        console.error('❌ Erro durante a remoção:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// EXECUTAR O SCRIPT
removeSpecificTracks()
    .then(() => {
        console.log('\n🎉 Script executado com sucesso!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Erro na execução:', error);
        process.exit(1);
    });



