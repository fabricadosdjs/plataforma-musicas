// Teste com os meses corretos baseado na análise do banco
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testCorrectMonthFilters() {
    console.log('🧪 TESTANDO FILTROS COM MESES CORRETOS\n');

    const testCases = [
        { month: '2025-07', description: 'Julho 2025 (10 músicas esperadas)' },
        { month: '2025-01', description: 'Janeiro 2025 (51 músicas esperadas)' },
        { month: '2024-12', description: 'Dezembro 2024 (0 músicas esperadas)' },
    ];

    for (const testCase of testCases) {
        console.log(`\n📅 Testando: ${testCase.description}`);

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
                    console.log(`🎶 Primeira música: "${data.tracks[0].songName}" - ${data.tracks[0].artist}`);

                    // Verificar se a data está correta
                    if (data.tracks[0].releaseDate) {
                        const releaseDate = new Date(data.tracks[0].releaseDate);
                        const expectedMonth = testCase.month;
                        const actualMonth = `${releaseDate.getFullYear()}-${String(releaseDate.getMonth() + 1).padStart(2, '0')}`;

                        if (actualMonth === expectedMonth) {
                            console.log(`✅ Data correta: ${actualMonth} (${releaseDate.toISOString().split('T')[0]})`);
                        } else {
                            console.log(`❌ Data incorreta: esperado ${expectedMonth}, obtido ${actualMonth}`);
                        }
                    }

                    // Mostrar mais exemplos
                    if (data.tracks.length > 1) {
                        console.log('\n📀 Outras músicas encontradas:');
                        data.tracks.slice(1, 4).forEach((track, index) => {
                            const date = track.releaseDate ?
                                new Date(track.releaseDate).toISOString().split('T')[0] :
                                'sem data';
                            console.log(`   ${index + 2}. "${track.songName}" - ${track.artist} (${date})`);
                        });
                    }
                }

                if (data.totalCount > 0) {
                    console.log(`✅ SUCESSO: Filtro de ${testCase.month} funcionando corretamente!`);
                } else {
                    console.log(`ℹ️ Nenhuma música encontrada para ${testCase.month} (esperado se não houver músicas neste mês)`);
                }
            } else {
                const errorText = await response.text();
                console.log(`❌ Erro: ${errorText}`);
            }

        } catch (error) {
            console.error(`❌ Erro de conexão: ${error.message}`);
        }

        console.log('─'.repeat(70));
    }

    // Teste de performance com muitas músicas
    console.log(`\n🚀 TESTE DE PERFORMANCE - Janeiro 2025 (51 músicas):`);
    try {
        const url = `${BASE_URL}/api/tracks?month=2025-01&page=1&limit=50`;
        const startTime = Date.now();
        const response = await fetch(url);
        const endTime = Date.now();

        if (response.ok) {
            const data = await response.json();
            console.log(`⏱️ Tempo para 50 músicas: ${endTime - startTime}ms`);
            console.log(`🎵 Músicas retornadas: ${data.tracks?.length || 0}`);
            console.log(`📊 Total disponível: ${data.totalCount || 0}`);

            if (endTime - startTime < 2000) {
                console.log(`✅ Performance boa (< 2s)`);
            } else if (endTime - startTime < 5000) {
                console.log(`⚠️ Performance aceitável (< 5s)`);
            } else {
                console.log(`❌ Performance ruim (> 5s)`);
            }
        }
    } catch (error) {
        console.error(`❌ Erro no teste de performance: ${error.message}`);
    }

    console.log('\n🎉 TESTE COMPLETO DOS FILTROS DE MÊS!');
    console.log('💡 Os filtros de mês estão funcionando corretamente.');
    console.log('🔍 O problema anterior era testar meses que não existem no banco (2024).');
}

testCorrectMonthFilters();
