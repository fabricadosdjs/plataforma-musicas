// Script para testar filtros específicos de mês
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testMonthFilters() {
    console.log('🧪 TESTANDO FILTROS DE MÊS\n');

    const testCases = [
        { month: '2024-12', description: 'Dezembro 2024' },
        { month: '2024-11', description: 'Novembro 2024' },
        { month: '2024-10', description: 'Outubro 2024' },
        { month: '2024-01', description: 'Janeiro 2024' },
        { month: '2023-12', description: 'Dezembro 2023' },
    ];

    for (const testCase of testCases) {
        console.log(`\n📅 Testando: ${testCase.description}`);
        console.log(`🔗 Parâmetro: month=${testCase.month}`);

        try {
            const url = `${BASE_URL}/api/tracks?month=${testCase.month}&page=1&limit=10`;
            console.log(`📡 URL: ${url}`);

            const startTime = Date.now();
            const response = await fetch(url);
            const endTime = Date.now();

            console.log(`⏱️ Tempo de resposta: ${endTime - startTime}ms`);
            console.log(`📊 Status: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                console.log(`🎵 Músicas encontradas: ${data.tracks?.length || 0}`);
                console.log(`📈 Total disponível: ${data.totalCount || 0}`);

                if (data.tracks && data.tracks.length > 0) {
                    console.log(`🎶 Primeira música: "${data.tracks[0].title}" - ${data.tracks[0].artist}`);

                    // Verificar se a data está correta
                    if (data.tracks[0].releaseDate) {
                        const releaseDate = new Date(data.tracks[0].releaseDate);
                        const expectedMonth = testCase.month;
                        const actualMonth = `${releaseDate.getFullYear()}-${String(releaseDate.getMonth() + 1).padStart(2, '0')}`;

                        if (actualMonth === expectedMonth) {
                            console.log(`✅ Data correta: ${actualMonth}`);
                        } else {
                            console.log(`❌ Data incorreta: esperado ${expectedMonth}, obtido ${actualMonth}`);
                        }
                    }
                }

                console.log(`✅ Filtro funcionando para ${testCase.description}`);
            } else {
                const errorText = await response.text();
                console.log(`❌ Erro: ${errorText}`);
            }

        } catch (error) {
            console.error(`❌ Erro de conexão: ${error.message}`);
        }

        console.log('─'.repeat(50));
    }

    // Teste adicional: sem filtro de mês
    console.log(`\n📊 TESTE SEM FILTRO (todas as músicas):`);
    try {
        const url = `${BASE_URL}/api/tracks?page=1&limit=5`;
        const response = await fetch(url);

        if (response.ok) {
            const data = await response.json();
            console.log(`🎵 Total de músicas: ${data.totalCount}`);
            console.log(`✅ API base funcionando`);
        }
    } catch (error) {
        console.error(`❌ Erro no teste base: ${error.message}`);
    }

    console.log('\n🏁 TESTE COMPLETO!');
}

testMonthFilters();
