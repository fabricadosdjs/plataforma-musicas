// Script para atualizar os estilos dos novos artistas no banco
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { MusicStyleDetector } from './src/lib/music-style-detector.js';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function updateNewArtists() {
    console.log('🎵 Atualizando estilos dos novos artistas...\n');

    try {
        // Buscar as músicas específicas
        const targetSongs = [
            'MARLON HOFFSTADT & DJ DADDY TRANCE',
            'MARNAGE X RAHUL'
        ];

        for (const artistName of targetSongs) {
            console.log(`🔍 Buscando músicas de: ${artistName}`);

            const tracks = await prisma.track.findMany({
                where: {
                    artist: {
                        contains: artistName,
                        mode: 'insensitive'
                    }
                }
            });

            console.log(`   📊 Encontradas ${tracks.length} música(s)`);

            for (const track of tracks) {
                console.log(`\n   🎵 Analisando: ${track.songName}`);
                console.log(`      Artista: ${track.artist}`);
                console.log(`      Estilo atual: ${track.style}`);

                // Detectar novo estilo
                const result = MusicStyleDetector.detectStyle(
                    track.artist,
                    track.songName,
                    `${track.artist} - ${track.songName}.mp3`
                );

                if (result.style !== track.style) {
                    console.log(`      ✨ Novo estilo detectado: ${result.style} (confiança: ${result.confidence}%)`);

                    // Atualizar no banco
                    await prisma.track.update({
                        where: { id: track.id },
                        data: { style: result.style }
                    });

                    console.log(`      ✅ Atualizado com sucesso!`);
                } else {
                    console.log(`      ✅ Estilo já correto: ${result.style}`);
                }
            }
        }

        console.log('\n📈 Verificando estatísticas atualizadas...');

        // Mostrar estatísticas atualizadas
        const styleStats = await prisma.track.groupBy({
            by: ['style'],
            _count: { style: true },
            orderBy: { _count: { style: 'desc' } }
        });

        console.log('\n📊 Estatísticas por estilo:');
        for (const stat of styleStats) {
            console.log(`   ${stat.style}: ${stat._count.style} música(s)`);
        }

        console.log('\n🎉 Atualização concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante a atualização:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar atualização
updateNewArtists();
