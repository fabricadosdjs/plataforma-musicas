// Investigar a música problemática
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigateProblematicTrack() {
    console.log('🔍 INVESTIGANDO MÚSICA PROBLEMÁTICA\n');

    try {
        // Buscar a música específica
        const track = await prisma.track.findFirst({
            where: {
                songName: {
                    contains: "CRAZY IN LOVE VS. WE CAN MAKE IT BETTER",
                    mode: 'insensitive'
                }
            }
        });

        if (track) {
            console.log('📀 MÚSICA ENCONTRADA:');
            console.log(`   ID: ${track.id}`);
            console.log(`   Nome: "${track.songName}"`);
            console.log(`   Artista: ${track.artist}`);
            console.log(`   Data de lançamento: ${track.releaseDate}`);
            console.log(`   Criado em: ${track.createdAt}`);

            const releaseDate = new Date(track.releaseDate);
            const year = releaseDate.getFullYear();
            const month = releaseDate.getMonth() + 1;
            const day = releaseDate.getDate();

            console.log(`\n📅 ANÁLISE DA DATA:`);
            console.log(`   Ano: ${year}`);
            console.log(`   Mês: ${month}`);
            console.log(`   Dia: ${day}`);
            console.log(`   Formato YYYY-MM: ${year}-${String(month).padStart(2, '0')}`);

            // Testar se deveria aparecer no filtro de janeiro 2025
            const jan2025Start = new Date(2025, 0, 1); // Janeiro = mês 0
            const jan2025End = new Date(2025, 1, 1);
            jan2025End.setMilliseconds(-1);

            console.log(`\n🧪 TESTE DO FILTRO JANEIRO 2025:`);
            console.log(`   Início: ${jan2025Start.toISOString()}`);
            console.log(`   Fim: ${jan2025End.toISOString()}`);
            console.log(`   Data da música: ${track.releaseDate.toISOString()}`);

            const isInRange = track.releaseDate >= jan2025Start && track.releaseDate <= jan2025End;
            console.log(`   Deveria aparecer? ${isInRange ? '✅ SIM' : '❌ NÃO'}`);

            if (!isInRange) {
                console.log(`\n❗ PROBLEMA IDENTIFICADO:`);
                console.log(`   A música tem data ${track.releaseDate.toISOString().split('T')[0]}`);
                console.log(`   Mas está aparecendo no filtro de janeiro 2025`);
                console.log(`   Isso indica um bug no filtro da API`);
            }
        } else {
            console.log('❌ Música não encontrada');
        }

        // Verificar todas as músicas de dezembro 2024
        console.log(`\n🗓️ TODAS AS MÚSICAS DE DEZEMBRO 2024:`);
        const dec2024Start = new Date(2024, 11, 1); // Dezembro = mês 11
        const dec2024End = new Date(2025, 0, 1);
        dec2024End.setMilliseconds(-1);

        const dec2024Tracks = await prisma.track.findMany({
            where: {
                releaseDate: {
                    gte: dec2024Start,
                    lte: dec2024End
                }
            },
            orderBy: {
                releaseDate: 'desc'
            }
        });

        console.log(`   Encontradas: ${dec2024Tracks.length} músicas`);
        dec2024Tracks.forEach((track, index) => {
            console.log(`   ${index + 1}. "${track.songName}" - ${track.artist} (${track.releaseDate.toISOString().split('T')[0]})`);
        });

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

investigateProblematicTrack();
