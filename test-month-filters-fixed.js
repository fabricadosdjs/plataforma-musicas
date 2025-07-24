// Teste específico dos filtros de mês corrigidos
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testMonthFilters() {
    console.log('🗓️ TESTANDO FILTROS DE MÊS CORRIGIDOS\n');

    // Primeiro, descobrir que meses existem no banco
    console.log('📊 Descobrindo meses disponíveis...');
    try {
        const response = await fetch(`${BASE_URL}/api/tracks?limit=100`);
        const data = await response.json();

        if (data.tracks) {
            const months = new Set();
            data.tracks.forEach(track => {
                if (track.releaseDate) {
                    const date = new Date(track.releaseDate);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    months.add(monthKey);
                }
            });

            const sortedMonths = Array.from(months).sort().reverse();
            console.log('📅 Meses encontrados:', sortedMonths);

            // Testar os primeiros 3 meses
            const testMonths = sortedMonths.slice(0, 3);

            for (const month of testMonths) {
                console.log(`\n🧪 Testando filtro para ${month}:`);

                const filterResponse = await fetch(`${BASE_URL}/api/tracks?month=${month}&limit=10`);
                const filterData = await filterResponse.json();

                if (filterResponse.ok) {
                    console.log(`   ✅ Encontradas: ${filterData.tracks?.length || 0} músicas`);
                    console.log(`   📊 Total: ${filterData.totalCount || filterData.total || 0}`);

                    if (filterData.tracks && filterData.tracks.length > 0) {
                        // Verificar se as datas estão corretas
                        let allCorrect = true;
                        filterData.tracks.slice(0, 3).forEach((track, index) => {
                            const trackDate = new Date(track.releaseDate);
                            const trackMonth = `${trackDate.getFullYear()}-${String(trackDate.getMonth() + 1).padStart(2, '0')}`;

                            if (trackMonth === month) {
                                console.log(`   ✅ Música ${index + 1}: "${track.songName}" - ${track.releaseDate}`);
                            } else {
                                console.log(`   ❌ Música ${index + 1}: "${track.songName}" - Data incorreta: ${track.releaseDate} (esperado: ${month})`);
                                allCorrect = false;
                            }
                        });

                        if (allCorrect) {
                            console.log(`   🎉 Filtro de ${month} funcionando perfeitamente!`);
                        }
                    }
                } else {
                    console.log(`   ❌ Erro: ${filterData.error}`);
                }
            }

            // Teste com mês inexistente
            console.log(`\n🧪 Testando mês inexistente (2020-01):`);
            const emptyResponse = await fetch(`${BASE_URL}/api/tracks?month=2020-01&limit=10`);
            const emptyData = await emptyResponse.json();

            if (emptyResponse.ok) {
                const count = emptyData.tracks?.length || 0;
                console.log(`   ${count === 0 ? '✅' : '❌'} Resultado correto: ${count} músicas (esperado: 0)`);
            }

        } else {
            console.log('❌ Erro ao buscar músicas iniciais');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }

    console.log('\n🏁 TESTE DE FILTROS DE MÊS CONCLUÍDO!');
}

testMonthFilters();
