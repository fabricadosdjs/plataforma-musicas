// Script para detectar problema de encoding em URLs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testUrlEncoding() {
    try {
        console.log('🔍 Testando encoding de URLs...\n');

        // Buscar algumas músicas recentes com caracteres especiais
        const tracksWithSpecialChars = await prisma.track.findMany({
            where: {
                OR: [
                    { downloadUrl: { contains: "'" } },
                    { downloadUrl: { contains: "&" } },
                    { downloadUrl: { contains: "," } },
                    { downloadUrl: { contains: "╠" } },
                ]
            },
            select: {
                songName: true,
                artist: true,
                downloadUrl: true,
            },
            take: 5
        });

        console.log('📊 Músicas com caracteres especiais nas URLs:');
        tracksWithSpecialChars.forEach((track, index) => {
            console.log(`${index + 1}. ${track.artist} - ${track.songName}`);
            console.log(`   URL original: ${track.downloadUrl}`);

            // Extrair apenas o filename da URL
            const filename = track.downloadUrl.split('/').pop();
            console.log(`   Filename: ${filename}`);

            // Mostrar como deveria ser encoded
            const encodedFilename = encodeURIComponent(filename);
            console.log(`   Encoded: ${encodedFilename}`);

            // Comparar
            const isSame = filename === encodedFilename;
            console.log(`   Precisa encoding: ${!isSame ? '✅ SIM' : '❌ NÃO'}`);
            console.log('');
        });

        // Testar se o problema é encoding vs caracteres normalizados
        console.log('🧪 Teste de normalização:');
        if (tracksWithSpecialChars.length > 0) {
            const testTrack = tracksWithSpecialChars[0];
            const originalFilename = testTrack.downloadUrl.split('/').pop();

            // Normalizar como fazemos na detecção
            const normalize = (str) => {
                return str
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
                    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
                    .replace(/\s+/g, ' ') // Normaliza espaços
                    .trim();
            };

            console.log(`Original: ${originalFilename}`);
            console.log(`Normalizado: ${normalize(originalFilename)}`);
        }

        await prisma.$disconnect();

    } catch (error) {
        console.error('❌ Erro:', error);
        await prisma.$disconnect();
    }
}

testUrlEncoding();
