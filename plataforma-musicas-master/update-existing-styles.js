// Script para atualizar estilos das músicas existentes com detector melhorado
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { MusicStyleDetector } from './src/lib/music-style-detector.js';

dotenv.config({ path: '.env.local' });
const prisma = new PrismaClient();

async function updateExistingStyles() {
    console.log('🎨 Atualizando estilos das músicas existentes...\n');

    try {
        // Buscar músicas com estilo "Electronic" genérico
        const electronicTracks = await prisma.track.findMany({
            where: { style: 'Electronic' }
        });

        console.log(`📁 Encontradas ${electronicTracks.length} músicas com estilo "Electronic" genérico`);

        if (electronicTracks.length === 0) {
            console.log('✅ Nenhuma música genérica encontrada!');
            return;
        }

        let updatedCount = 0;
        let improvedCount = 0;

        for (const track of electronicTracks) {
            console.log(`\\n🔍 Analisando: ${track.artist} - ${track.songName}`);

            // Detectar novo estilo
            const styleResult = MusicStyleDetector.detectStyle(track.artist, track.songName);

            console.log(`   Estilo atual: ${track.style}`);
            console.log(`   Novo estilo: ${styleResult.style} (${(styleResult.confidence * 100).toFixed(1)}%)`);

            // Atualizar se o novo estilo for diferente e com boa confiança
            if (styleResult.style !== 'Electronic' && styleResult.confidence > 0.4) {
                await prisma.track.update({
                    where: { id: track.id },
                    data: { style: styleResult.style }
                });

                console.log(`   ✅ Atualizado para: ${styleResult.style}`);
                updatedCount++;
                improvedCount++;
            } else if (styleResult.style !== 'Electronic') {
                console.log(`   ⚠️  Novo estilo encontrado mas confiança baixa: ${styleResult.style}`);
                updatedCount++;
            } else {
                console.log(`   ➡️  Mantendo como Electronic (sem padrão específico detectado)`);
            }
        }

        console.log(`\\n🎉 Atualização concluída!`);
        console.log(`✅ ${improvedCount} músicas atualizadas com estilos específicos`);
        console.log(`⚠️  ${updatedCount - improvedCount} músicas analisadas mas mantidas como Electronic`);
        console.log(`📊 ${electronicTracks.length - updatedCount} músicas não analisadas`);

        // Estatísticas finais
        console.log(`\\n📊 Estatísticas finais:`);
        const finalStats = await prisma.track.groupBy({
            by: ['style'],
            _count: true
        });

        finalStats.forEach(stat => {
            console.log(`   ${stat.style}: ${stat._count} músicas`);
        });

        // Mostrar algumas músicas que foram atualizadas
        if (improvedCount > 0) {
            console.log(`\\n🎵 Algumas músicas atualizadas:`);
            const updatedTracks = await prisma.track.findMany({
                where: {
                    AND: [
                        { style: { not: 'Electronic' } },
                        { updatedAt: { gte: new Date(Date.now() - 60000) } } // Últimos 60 segundos
                    ]
                },
                take: 5,
                orderBy: { updatedAt: 'desc' }
            });

            updatedTracks.forEach((track, index) => {
                console.log(`   ${index + 1}. ${track.artist} - ${track.songName} → ${track.style}`);
            });
        }

    } catch (error) {
        console.error('❌ Erro durante a atualização:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateExistingStyles();
