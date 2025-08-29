// ============================================
// SCRIPT PARA VERIFICAR TRACKS NO BANCO
// ============================================
// Execute com: node check_tracks.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkTracks() {
    try {
        console.log('🔍 Verificando tracks no banco de dados...\n');

        // 1. VERIFICAR TODAS AS TRACKS DO FOLDER 90's EXTENDED & CLUB SERIES
        console.log('📁 Verificando folder: 90\'s EXTENDED & CLUB SERIES');
        const folderTracks = await prisma.track.findMany({
            where: { folder: '90\'s EXTENDED & CLUB SERIES' },
            select: {
                id: true,
                songName: true,
                artist: true,
                version: true,
                folder: true
            }
        });

        console.log(`📊 Total de tracks no folder: ${folderTracks.length}`);
        
        if (folderTracks.length > 0) {
            console.log('\n🎵 Tracks encontradas:');
            folderTracks.forEach(track => {
                console.log(`   - ${track.artist} - ${track.songName} (${track.version})`);
            });
        }

        // 2. BUSCAR POR NOMES ESPECÍFICOS (IGNORANDO FOLDER)
        console.log('\n🔍 Buscando por nomes específicos...');
        
        const aquaTracks = await prisma.track.findMany({
            where: { 
                OR: [
                    { songName: { contains: 'BARBIE GIRL' } },
                    { songName: { contains: 'Barbie Girl' } }
                ]
            },
            select: { id: true, songName: true, artist: true, version: true, folder: true }
        });

        const aylaTracks = await prisma.track.findMany({
            where: { 
                OR: [
                    { songName: { contains: 'AYLA PART II' } },
                    { songName: { contains: 'Ayla Part II' } }
                ]
            },
            select: { id: true, songName: true, artist: true, version: true, folder: true }
        });

        const beTracks = await prisma.track.findMany({
            where: { 
                OR: [
                    { songName: { contains: 'SEVEN DAYS AND ONE WEEK' } },
                    { songName: { contains: 'Seven Days and One Week' } }
                ]
            },
            select: { id: true, songName: true, artist: true, version: true, folder: true }
        });

        console.log(`\n🎵 Tracks AQUA encontradas: ${aquaTracks.length}`);
        aquaTracks.forEach(track => {
            console.log(`   - ${track.artist} - ${track.songName} (${track.version}) - Folder: ${track.folder}`);
        });

        console.log(`\n🎵 Tracks AYLA encontradas: ${aylaTracks.length}`);
        aylaTracks.forEach(track => {
            console.log(`   - ${track.artist} - ${track.songName} (${track.version}) - Folder: ${track.folder}`);
        });

        console.log(`\n🎵 Tracks .B.E. encontradas: ${beTracks.length}`);
        beTracks.forEach(track => {
            console.log(`   - ${track.artist} - ${track.songName} (${track.version}) - Folder: ${track.folder}`);
        });

        // 3. VERIFICAR TODOS OS FOLDERS EXISTENTES
        console.log('\n📂 Verificando todos os folders...');
        const allFolders = await prisma.track.groupBy({
            by: ['folder'],
            _count: { folder: true }
        });

        console.log('📁 Folders encontrados:');
        allFolders.forEach(folder => {
            console.log(`   - ${folder.folder}: ${folder._count.folder} tracks`);
        });

    } catch (error) {
        console.error('❌ Erro durante a verificação:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// EXECUTAR O SCRIPT
checkTracks()
    .then(() => {
        console.log('\n🎉 Verificação concluída!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Erro na execução:', error);
        process.exit(1);
    });





