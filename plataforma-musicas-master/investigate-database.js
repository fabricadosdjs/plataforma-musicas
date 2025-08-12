// Script para investigar dados no banco vs arquivos do Contabo
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function investigateDatabase() {
    try {
        console.log('🔍 Investigando base de dados...\n');

        // Buscar todas as músicas no banco
        const allTracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                artist: true,
                downloadUrl: true,
                previewUrl: true,
                version: true,
                pool: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`📊 Total de músicas no banco: ${allTracks.length}`);

        // Mostrar as últimas 10 importadas
        console.log('\n🕒 Últimas 10 músicas importadas:');
        allTracks.slice(0, 10).forEach((track, index) => {
            console.log(`${index + 1}. ${track.artist} - ${track.songName}`);
            console.log(`   URL Download: ${track.downloadUrl}`);
            console.log(`   URL Preview: ${track.previewUrl}`);
            console.log(`   Pool: ${track.pool}`);
            console.log(`   Data: ${track.createdAt}`);
            console.log('');
        });

        // Analisar padrões de URL
        const urlPatterns = {};
        allTracks.forEach(track => {
            if (track.downloadUrl) {
                const domain = track.downloadUrl.match(/https?:\/\/([^\/]+)/)?.[1] || 'unknown';
                urlPatterns[domain] = (urlPatterns[domain] || 0) + 1;
            }
        });

        console.log('🌐 Padrões de URL encontrados:');
        Object.entries(urlPatterns).forEach(([domain, count]) => {
            console.log(`  ${domain}: ${count} músicas`);
        });

        // Verificar se há URLs do Contabo
        const contaboUrls = allTracks.filter(track =>
            track.downloadUrl?.includes('contabostorage.com') ||
            track.previewUrl?.includes('contabostorage.com')
        );

        console.log(`\n☁️ Músicas com URLs do Contabo Storage: ${contaboUrls.length}`);

        if (contaboUrls.length > 0) {
            console.log('Primeiras 5:');
            contaboUrls.slice(0, 5).forEach((track, index) => {
                console.log(`${index + 1}. ${track.artist} - ${track.songName}`);
                console.log(`   URL: ${track.downloadUrl || track.previewUrl}`);
            });
        }

        await prisma.$disconnect();

    } catch (error) {
        console.error('❌ Erro:', error);
        await prisma.$disconnect();
    }
}

investigateDatabase();
