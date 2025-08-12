// Teste final definitivo dos filtros de mês
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function finalMonthFilterTest() {
    console.log('🎯 TESTE FINAL DEFINITIVO DOS FILTROS DE MÊS\n');

    const testCases = [
        { month: '2025-07', description: 'Julho 2025', expected: 10 },
        { month: '2025-01', description: 'Janeiro 2025', expected: 51 },
        { month: '2024-12', description: 'Dezembro 2024', expected: 0 },
        { month: '2023-01', description: 'Janeiro 2023', expected: 0 },
    ];

    let totalTests = 0;
    let passedTests = 0;

    for (const testCase of testCases) {
        totalTests++;
        console.log(`\n📅 Teste ${totalTests}: ${testCase.description}`);

        try {
            const url = `${BASE_URL}/api/tracks?month=${testCase.month}&page=1&limit=20`;

            const startTime = Date.now();
            const response = await fetch(url);
            const endTime = Date.now();

            if (response.ok) {
                const data = await response.json();
                const foundCount = data.tracks?.length || 0;
                const totalCount = data.totalCount || data.total || 0;

                console.log(`   ⏱️ Tempo: ${endTime - startTime}ms`);
                console.log(`   📊 Encontradas: ${foundCount} músicas`);
                console.log(`   📈 Total: ${totalCount} músicas`);

                // Verificar se o resultado bate com o esperado
                const countMatches = totalCount === testCase.expected;

                if (countMatches) {
                    console.log(`   ✅ PASSOU: Total correto (${totalCount})`);
                    passedTests++;

                    // Verificar algumas datas se houver músicas
                    if (data.tracks && data.tracks.length > 0) {
                        let allDatesCorrect = true;

                        data.tracks.slice(0, 3).forEach((track, index) => {
                            // A API retorna releaseDate como string no formato YYYY-MM-DD
                            const dateString = track.releaseDate;
                            const expectedPrefix = testCase.month;

                            if (!dateString.startsWith(expectedPrefix)) {
                                allDatesCorrect = false;
                                console.log(`   ❌ Data incorreta na música ${index + 1}: ${dateString} (esperado: ${expectedPrefix}-XX)`);
                            }
                        });

                        if (allDatesCorrect) {
                            console.log(`   ✅ Todas as datas estão corretas`);
                        }

                        // Mostrar algumas músicas como exemplo
                        console.log(`   🎵 Exemplos:`);
                        data.tracks.slice(0, 2).forEach((track, index) => {
                            console.log(`      ${index + 1}. "${track.songName}" - ${track.artist} (${track.releaseDate})`);
                        });
                    }

                } else {
                    console.log(`   ❌ FALHOU: Esperado ${testCase.expected}, obtido ${totalCount}`);

                    // Mostrar algumas músicas para debug
                    if (data.tracks && data.tracks.length > 0) {
                        console.log(`   🔍 Músicas encontradas:`);
                        data.tracks.slice(0, 3).forEach((track, index) => {
                            console.log(`      ${index + 1}. "${track.songName}" - ${track.artist} (${track.releaseDate})`);
                        });
                    }
                }

            } else {
                const errorText = await response.text();
                console.log(`   ❌ Erro HTTP ${response.status}: ${errorText}`);
            }

        } catch (error) {
            console.log(`   ❌ Erro de conexão: ${error.message}`);
        }

        console.log('─'.repeat(60));
    }

    // Relatório final
    console.log(`\n🏁 RELATÓRIO FINAL:`);
    console.log(`   📊 Testes executados: ${totalTests}`);
    console.log(`   ✅ Testes passaram: ${passedTests}`);
    console.log(`   ❌ Testes falharam: ${totalTests - passedTests}`);
    console.log(`   📈 Taxa de sucesso: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests === totalTests) {
        console.log(`\n🎉 TODOS OS TESTES PASSARAM!`);
        console.log(`💡 Os filtros de mês estão funcionando perfeitamente.`);
        console.log(`🚀 O sistema está pronto para uso com filtros em tempo real.`);
    } else {
        console.log(`\n⚠️ Alguns testes falharam. Verificar implementação.`);
    }

    // Teste de performance final
    console.log(`\n🚀 TESTE DE PERFORMANCE FINAL:`);
    try {
        const url = `${BASE_URL}/api/tracks?month=2025-01&page=1&limit=51`;
        const startTime = Date.now();
        const response = await fetch(url);
        const endTime = Date.now();

        if (response.ok) {
            const data = await response.json();
            const time = endTime - startTime;

            console.log(`   ⏱️ Tempo para carregar 51 músicas: ${time}ms`);
            console.log(`   📊 Performance: ${time < 1000 ? '🚀 Excelente' : time < 2000 ? '✅ Boa' : time < 5000 ? '⚠️ Aceitável' : '❌ Lenta'}`);
        }
    } catch (error) {
        console.log(`   ❌ Erro no teste de performance: ${error.message}`);
    }
}

finalMonthFilterTest();
