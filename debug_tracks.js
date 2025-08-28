// ============================================
// SCRIPT PARA DEBUGAR DADOS DAS TRACKS
// ============================================
// Execute com: node debug_tracks.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function debugTracks() {
    try {
        console.log('🔍 Debugando dados das tracks...\n');

        // BUSCAR AS TRACKS ESPECÍFICAS COM TODOS OS DADOS
        const aquaTrack = await prisma.track.findFirst({
            where: {
                songName: { contains: 'BARBIE GIRL' },
                artist: { contains: 'AQUA' }
            }
        });

        const aylaTrack = await prisma.track.findFirst({
            where: {
                songName: { contains: 'AYLA PART II' },
                artist: { contains: 'AYLA' }
            }
        });

        const beTrack = await prisma.track.findFirst({
            where: {
                songName: { contains: 'SEVEN DAYS AND ONE WEEK' },
                artist: { contains: 'B.B.E' }
            }
        });

        console.log('🎵 TRACK AQUA:');
        if (aquaTrack) {
            console.log(`   ID: ${aquaTrack.id}`);
            console.log(`   Song Name: "${aquaTrack.songName}" (length: ${aquaTrack.songName.length})`);
            console.log(`   Artist: "${aquaTrack.artist}" (length: ${aquaTrack.artist.length})`);
            console.log(`   Version: "${aquaTrack.version}" (length: ${aquaTrack.version.length})`);
            console.log(`   Folder: "${aquaTrack.folder}" (length: ${aquaTrack.folder.length})`);
            console.log(`   Song Name bytes: [${Array.from(aquaTrack.songName).map(c => c.charCodeAt(0))}]`);
            console.log(`   Artist bytes: [${Array.from(aquaTrack.artist).map(c => c.charCodeAt(0))}]`);
            console.log(`   Version bytes: [${Array.from(aquaTrack.version).map(c => c.charCodeAt(0))}]`);
        } else {
            console.log('   ❌ Não encontrada');
        }

        console.log('\n🎵 TRACK AYLA:');
        if (aylaTrack) {
            console.log(`   ID: ${aylaTrack.id}`);
            console.log(`   Song Name: "${aylaTrack.songName}" (length: ${aylaTrack.songName.length})`);
            console.log(`   Artist: "${aylaTrack.artist}" (length: ${aylaTrack.artist.length})`);
            console.log(`   Version: "${aylaTrack.version}" (length: ${aylaTrack.version.length})`);
            console.log(`   Folder: "${aylaTrack.folder}" (length: ${aylaTrack.folder.length})`);
            console.log(`   Song Name bytes: [${Array.from(aylaTrack.songName).map(c => c.charCodeAt(0))}]`);
            console.log(`   Artist bytes: [${Array.from(aylaTrack.artist).map(c => c.charCodeAt(0))}]`);
            console.log(`   Version bytes: [${Array.from(aylaTrack.version).map(c => c.charCodeAt(0))}]`);
        } else {
            console.log('   ❌ Não encontrada');
        }

        console.log('\n🎵 TRACK B.B.E:');
        if (beTrack) {
            console.log(`   ID: ${beTrack.id}`);
            console.log(`   Song Name: "${beTrack.songName}" (length: ${beTrack.songName.length})`);
            console.log(`   Artist: "${beTrack.artist}" (length: ${beTrack.artist.length})`);
            console.log(`   Version: "${beTrack.version}" (length: ${beTrack.version.length})`);
            console.log(`   Folder: "${beTrack.folder}" (length: ${beTrack.folder.length})`);
            console.log(`   Song Name bytes: [${Array.from(beTrack.songName).map(c => c.charCodeAt(0))}]`);
            console.log(`   Artist bytes: [${Array.from(beTrack.artist).map(c => c.charCodeAt(0))}]`);
            console.log(`   Version bytes: [${Array.from(beTrack.version).map(c => c.charCodeAt(0))}]`);
        } else {
            console.log('   ❌ Não encontrada');
        }

        // TESTAR A QUERY EXATA DO SCRIPT DE REMOÇÃO
        console.log('\n🔍 Testando query exata do script de remoção...');
        const testQuery = await prisma.track.findMany({
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
                        artist: 'B.B.E.',
                        version: 'CLUB MIX'
                    }
                ]
            }
        });

        console.log(`\n📊 Resultado da query: ${testQuery.length} tracks encontradas`);
        testQuery.forEach(track => {
            console.log(`   - ${track.artist} - ${track.songName} (${track.version})`);
        });

    } catch (error) {
        console.error('❌ Erro durante o debug:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// EXECUTAR O SCRIPT
debugTracks()
    .then(() => {
        console.log('\n🎉 Debug concluído!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Erro na execução:', error);
        process.exit(1);
    });



