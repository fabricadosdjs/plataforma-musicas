// Script para debugar as datas de lançamento
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugReleaseDates() {
  try {
    console.log('🔍 Verificando datas de lançamento das músicas...\n');
    
    const tracks = await prisma.track.findMany({
      select: {
        id: true,
        songName: true,
        artist: true,
        releaseDate: true,
        createdAt: true,
      },
      orderBy: [
        { releaseDate: 'desc' }
      ],
      take: 20, // Primeiras 20 músicas
    });

    console.log(`📊 Encontradas ${tracks.length} músicas:\n`);
    
    tracks.forEach((track, index) => {
      const releaseDate = track.releaseDate ? new Date(track.releaseDate) : null;
      const createdAt = new Date(track.createdAt);
      
      console.log(`${index + 1}. ${track.songName} - ${track.artist}`);
      console.log(`   ID: ${track.id}`);
      console.log(`   Release Date: ${track.releaseDate} (${releaseDate ? releaseDate.toLocaleDateString('pt-BR') : 'NULO'})`);
      console.log(`   Created At: ${createdAt.toLocaleDateString('pt-BR')}`);
      console.log(`   Diferença: ${releaseDate ? Math.floor((createdAt - releaseDate) / (1000 * 60 * 60 * 24)) : 'N/A'} dias`);
      console.log('');
    });

    // Verificar se há músicas sem releaseDate
    const tracksWithoutReleaseDate = await prisma.track.count({
      where: {
        releaseDate: null
      }
    });

    console.log(`⚠️  Músicas sem releaseDate: ${tracksWithoutReleaseDate}`);

    // Verificar distribuição por data
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    const todayTracks = tracks.filter(track => {
      if (!track.releaseDate) return false;
      const trackDate = new Date(track.releaseDate);
      const trackDateOnly = new Date(trackDate.getFullYear(), trackDate.getMonth(), trackDate.getDate());
      return trackDateOnly.getTime() === todayOnly.getTime();
    });

    const yesterdayTracks = tracks.filter(track => {
      if (!track.releaseDate) return false;
      const trackDate = new Date(track.releaseDate);
      const trackDateOnly = new Date(trackDate.getFullYear(), trackDate.getMonth(), trackDate.getDate());
      return trackDateOnly.getTime() === yesterdayOnly.getTime();
    });

    console.log(`📅 Músicas de hoje: ${todayTracks.length}`);
    console.log(`📅 Músicas de ontem: ${yesterdayTracks.length}`);

  } catch (error) {
    console.error('❌ Erro ao debugar datas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugReleaseDates();
