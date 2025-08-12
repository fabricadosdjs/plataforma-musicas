// Script para comparar formatos de URL
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function compareUrls() {
    try {
        console.log('🔍 Comparando formatos de URL...\n');

        // Pegar algumas URLs do banco
        const dbTracks = await prisma.track.findMany({
            select: {
                songName: true,
                artist: true,
                downloadUrl: true,
            },
            take: 5
        });

        console.log('📊 URLs no banco de dados:');
        dbTracks.forEach((track, index) => {
            console.log(`${index + 1}. ${track.artist} - ${track.songName}`);
            console.log(`   URL: ${track.downloadUrl}`);
            console.log('');
        });

        // Simular como as URLs são geradas pelo Contabo Storage
        console.log('🔗 Como as URLs são geradas pelo Contabo Storage:');
        console.log('Base URL: https://usc1.contabostorage.com/211285f2fbcc4760a62df1aff280735f:plataforma-de-musicas/');
        console.log('');

        // Extrair padrões dos arquivos
        console.log('📁 Padrões de pastas detectados:');
        const folderPatterns = new Set();
        dbTracks.forEach(track => {
            if (track.downloadUrl) {
                const match = track.downloadUrl.match(/plataforma-de-musicas\/([^\/]+)\//);
                if (match) {
                    folderPatterns.add(match[1]);
                }
            }
        });

        folderPatterns.forEach(pattern => {
            console.log(`  - ${pattern}`);
        });

        // Verificar caracteres especiais que podem causar problemas
        console.log('\n🔍 Verificando caracteres especiais em URLs:');
        const specialChars = new Set();
        dbTracks.forEach(track => {
            if (track.downloadUrl) {
                const filename = track.downloadUrl.split('/').pop();
                const matches = filename.match(/[^a-zA-Z0-9\s\-\.\(\)]/g);
                if (matches) {
                    matches.forEach(char => specialChars.add(char));
                }
            }
        });

        if (specialChars.size > 0) {
            console.log('Caracteres especiais encontrados:', Array.from(specialChars).join(', '));
        } else {
            console.log('Nenhum caracter especial encontrado');
        }

        await prisma.$disconnect();

    } catch (error) {
        console.error('❌ Erro:', error);
        await prisma.$disconnect();
    }
}

compareUrls();
