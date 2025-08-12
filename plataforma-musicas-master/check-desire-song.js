import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDesireSong() {
    try {
        console.log('🔍 Procurando pela música DESIRE...');

        // Buscar músicas que contenham "DESIRE" no nome
        const desireTracks = await prisma.track.findMany({
            where: {
                OR: [
                    { songName: { contains: 'DESIRE', mode: 'insensitive' } },
                    { artist: { contains: 'GOOM GUM', mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                downloadUrl: true,
                imageUrl: true,
                style: true,
                releaseDate: true
            }
        });

        console.log(`📊 Encontradas ${desireTracks.length} músicas:`);

        desireTracks.forEach((track, index) => {
            console.log(`\n${index + 1}. ID: ${track.id}`);
            console.log(`   Song Name: "${track.songName}"`);
            console.log(`   Artist: "${track.artist}"`);
            console.log(`   Download URL: "${track.downloadUrl}"`);
            console.log(`   Style: "${track.style}"`);
            console.log(`   Release Date: "${track.releaseDate}"`);
        });

        // Buscar músicas com campos nulos ou vazios
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
                downloadUrl: true
            },
            take: 10
        });

        if (problematicTracks.length > 0) {
            console.log(`\n❌ Músicas com problemas encontradas (${problematicTracks.length}):`);
            problematicTracks.forEach((track, index) => {
                console.log(`   ${index + 1}. ID: ${track.id}, Song: "${track.songName}", Artist: "${track.artist}"`);
            });
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDesireSong();
