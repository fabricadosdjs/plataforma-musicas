// Script para analisar datas das músicas no banco
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeDates() {
    console.log('📊 ANALISANDO DATAS DAS MÚSICAS NO BANCO\n');

    try {
        // Buscar todas as músicas com suas datas
        const tracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                artist: true,
                releaseDate: true,
                createdAt: true
            },
            orderBy: {
                releaseDate: 'desc'
            }
        });

        console.log(`🎵 Total de músicas: ${tracks.length}\n`);

        // Agrupar por mês-ano
        const monthGroups = {};
        const monthCounts = {};

        tracks.forEach(track => {
            const releaseDate = track.releaseDate;
            const createdAt = track.createdAt;

            let monthKey = 'sem-data';

            if (releaseDate) {
                const date = new Date(releaseDate);
                monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else if (createdAt) {
                const date = new Date(createdAt);
                monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')} (criação)`;
            }

            if (!monthGroups[monthKey]) {
                monthGroups[monthKey] = [];
                monthCounts[monthKey] = 0;
            }

            monthGroups[monthKey].push(track);
            monthCounts[monthKey]++;
        });

        // Mostrar estatísticas por mês
        console.log('📅 MÚSICAS POR MÊS:\n');

        const sortedMonths = Object.keys(monthCounts).sort().reverse();

        sortedMonths.forEach(monthKey => {
            console.log(`${monthKey}: ${monthCounts[monthKey]} músicas`);

            // Mostrar algumas músicas como exemplo
            if (monthGroups[monthKey].length > 0) {
                const examples = monthGroups[monthKey].slice(0, 3);
                examples.forEach(track => {
                    const dateStr = track.releaseDate ?
                        new Date(track.releaseDate).toISOString().split('T')[0] :
                        'sem data';
                    console.log(`   📀 "${track.songName}" - ${track.artist} (${dateStr})`);
                });

                if (monthGroups[monthKey].length > 3) {
                    console.log(`   ... e mais ${monthGroups[monthKey].length - 3} músicas`);
                }
            }
            console.log('');
        });

        // Verificar problemas com datas
        const withoutReleaseDate = tracks.filter(t => !t.releaseDate);
        const withReleaseDate = tracks.filter(t => t.releaseDate);

        console.log(`\n📈 ESTATÍSTICAS:`);
        console.log(`✅ Com data de lançamento: ${withReleaseDate.length}`);
        console.log(`❌ Sem data de lançamento: ${withoutReleaseDate.length}`);

        if (withReleaseDate.length > 0) {
            const dates = withReleaseDate.map(t => new Date(t.releaseDate));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));

            console.log(`📅 Data mais antiga: ${minDate.toISOString().split('T')[0]}`);
            console.log(`📅 Data mais recente: ${maxDate.toISOString().split('T')[0]}`);
        }

        // Sugerir meses para teste
        console.log(`\n💡 MESES SUGERIDOS PARA TESTE:`);
        sortedMonths.slice(0, 5).forEach(month => {
            if (monthCounts[month] > 0 && !month.includes('sem-data')) {
                console.log(`   🧪 month=${month} (${monthCounts[month]} músicas)`);
            }
        });

    } catch (error) {
        console.error('❌ Erro ao analisar datas:', error);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeDates();
