// Script para corrigir música brasileira mal classificada
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { MusicStyleDetector } from './src/lib/music-style-detector.js';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function fixBrazilianMusic() {
    console.log('🇧🇷 Corrigindo classificação de música brasileira...\n');

    try {
        // Artistas brasileiros conhecidos que podem estar mal classificados
        const brazilianArtists = [
            'chitãozinho', 'xororó', 'chitãozinho & xororó',
            'zezé di camargo', 'luciano', 'leonardo', 'leandro',
            'victor', 'leo', 'bruno', 'marrone', 'gusttavo lima',
            'michel teló', 'joão bosco', 'vinícius', 'caetano veloso',
            'gilberto gil', 'chico buarque', 'maria bethânia', 'gal costa',
            'djavan', 'ivan lins', 'anitta', 'ludmilla'
        ];

        // Buscar músicas que podem ser brasileiras (Electronic ou sem classificação específica)
        console.log('🔍 Buscando músicas brasileiras mal classificadas...');

        for (const artistName of brazilianArtists) {
            const tracks = await prisma.track.findMany({
                where: {
                    artist: {
                        contains: artistName,
                        mode: 'insensitive'
                    }
                }
            });

            if (tracks.length > 0) {
                console.log(`\n🎵 Encontradas ${tracks.length} música(s) de: ${artistName.toUpperCase()}`);

                for (const track of tracks) {
                    console.log(`\n   📀 Analisando: ${track.songName}`);
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

                        console.log(`      ✅ Atualizado de "${track.style}" para "${result.style}"`);
                    } else {
                        console.log(`      ✅ Estilo já correto: ${result.style}`);
                    }
                }
            }
        }

        // Também verificar músicas que contêm palavras brasileiras nos títulos
        console.log('\n🔍 Verificando músicas com palavras brasileiras nos títulos...');

        const brazilianKeywords = ['natal', 'canção', 'estrela', 'feliz', 'sino', 'belém', 'criança', 'velhinho'];

        for (const keyword of brazilianKeywords) {
            const tracks = await prisma.track.findMany({
                where: {
                    OR: [
                        {
                            songName: {
                                contains: keyword,
                                mode: 'insensitive'
                            }
                        },
                        {
                            artist: {
                                contains: keyword,
                                mode: 'insensitive'
                            }
                        }
                    ],
                    style: 'Electronic' // Só verificar as que estão como Electronic
                }
            });

            if (tracks.length > 0) {
                console.log(`\n🔍 Encontradas ${tracks.length} música(s) com palavra "${keyword}"`);

                for (const track of tracks) {
                    const result = MusicStyleDetector.detectStyle(
                        track.artist,
                        track.songName,
                        `${track.artist} - ${track.songName}.mp3`
                    );

                    if (result.style !== 'Electronic') {
                        console.log(`   📀 ${track.artist} - ${track.songName}`);
                        console.log(`      Atualizando: Electronic → ${result.style}`);

                        await prisma.track.update({
                            where: { id: track.id },
                            data: { style: result.style }
                        });
                    }
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

        console.log('\n🎉 Correção da música brasileira concluída!');

    } catch (error) {
        console.error('❌ Erro durante a correção:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar correção
fixBrazilianMusic();
