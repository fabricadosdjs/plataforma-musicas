// Script para investigar arquivos da pasta 09.08.2025
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function investigateFolder() {
    try {
        console.log('🔍 Investigando pasta 09.08.2025...\n');

        // 1. Buscar músicas no banco que são da pasta 09.08.2025
        const folderTracks = await prisma.track.findMany({
            where: {
                downloadUrl: {
                    contains: '09.08.2025'
                }
            },
            select: {
                id: true,
                songName: true,
                artist: true,
                downloadUrl: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`📊 Músicas da pasta 09.08.2025 no banco: ${folderTracks.length}`);

        if (folderTracks.length > 0) {
            console.log('\n🎵 Primeiras 10 músicas:');
            folderTracks.slice(0, 10).forEach((track, index) => {
                const filename = track.downloadUrl.split('/').pop();
                console.log(`${index + 1}. ${track.artist} - ${track.songName}`);
                console.log(`   Arquivo: ${filename}`);
                console.log(`   Importado: ${track.createdAt}`);
                console.log('');
            });
        }

        // 2. Simular chamada para API para ver o que retorna
        console.log('📡 Simulando chamada da API...');
        const response = await fetch('http://localhost:3000/api/contabo/import?prefix=09.08.2025');

        if (response.ok) {
            const data = await response.json();
            console.log('📈 Resposta da API:');
            console.log(`  Total de arquivos: ${data.totalFiles || 0}`);
            console.log(`  Existentes no banco: ${data.existingInDatabase || 0}`);
            console.log(`  Prontos para importação: ${data.importableCount || 0}`);

            if (data.files && data.files.length > 0) {
                console.log('\n🔍 Arquivos detectados como "para importar":');
                data.files.slice(0, 5).forEach((file, index) => {
                    console.log(`${index + 1}. ${file.parsed?.artist} - ${file.parsed?.songName}`);
                    console.log(`   Arquivo: ${file.file?.filename}`);
                    console.log(`   URL: ${file.file?.url}`);
                    console.log('');
                });
            }
        } else {
            console.log('❌ Erro na API:', response.status, response.statusText);
        }

        await prisma.$disconnect();

    } catch (error) {
        console.error('❌ Erro:', error);
        await prisma.$disconnect();
    }
}

investigateFolder();
