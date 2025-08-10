const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkNullFields() {
    try {
        console.log('🔍 Verificando campos nulos ou vazios...');

        // Buscar tracks com songName ou artist nulos/vazios
        const problematicTracks = await prisma.track.findMany({
            where: {
                OR: [
                    { songName: null },
                    { songName: '' },
                    { artist: null },
                    { artist: '' },
                    { songName: 'undefined' },
                    { artist: 'undefined' }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                releaseDate: true
            }
        });

        console.log(`📊 Encontradas ${problematicTracks.length} músicas com problemas:`);

        if (problematicTracks.length > 0) {
            problematicTracks.forEach(track => {
                console.log(`ID: ${track.id}, Song: "${track.songName}", Artist: "${track.artist}"`);
            });
        }

        // Estatísticas gerais
        const totalTracks = await prisma.track.count();
        console.log(`\n📈 Total de músicas: ${totalTracks}`);

        const nullSongName = await prisma.track.count({
            where: {
                OR: [
                    { songName: null },
                    { songName: '' },
                    { songName: 'undefined' }
                ]
            }
        });

        const nullArtist = await prisma.track.count({
            where: {
                OR: [
                    { artist: null },
                    { artist: '' },
                    { artist: 'undefined' }
                ]
            }
        });

        console.log(`❌ Músicas com songName problemático: ${nullSongName}`);
        console.log(`❌ Músicas com artist problemático: ${nullArtist}`);

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkNullFields();
