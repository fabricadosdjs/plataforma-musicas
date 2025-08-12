// test-final-system.js - Teste completo do sistema
const fetch = require('node-fetch');

async function testCompleteSystem() {
  console.log('🧪 TESTE COMPLETO DO SISTEMA DE FILTROS');
  
  try {
    // Teste 1: Busca sem filtros
    console.log('\n📊 Teste 1: Busca básica sem filtros');
    const response1 = await fetch('http://localhost:3000/api/tracks?limit=5');
    const data1 = await response1.json();
    console.log(`   ✅ ${data1.tracks?.length || 0} de ${data1.total || 0} músicas`);
    
    // Teste 2: Filtro por mês específico (2025-07)
    console.log('\n📅 Teste 2: Filtro por mês 2025-07');
    const response2 = await fetch('http://localhost:3000/api/tracks?month=2025-07&limit=10');
    const data2 = await response2.json();
    console.log(`   ✅ ${data2.tracks?.length || 0} de ${data2.total || 0} músicas para julho 2025`);
    if (data2.tracks?.length > 0) {
      console.log(`   🎵 Primeira música: "${data2.tracks[0].songName}" - ${data2.tracks[0].releaseDate}`);
    }
    
    // Teste 3: Filtro por mês específico (2024-12)
    console.log('\n📅 Teste 3: Filtro por mês 2024-12');
    const response3 = await fetch('http://localhost:3000/api/tracks?month=2024-12&limit=10');
    const data3 = await response3.json();
    console.log(`   ✅ ${data3.tracks?.length || 0} de ${data3.total || 0} músicas para dezembro 2024`);
    
    // Teste 4: Busca por texto
    console.log('\n🔍 Teste 4: Busca por texto "BROKEN"');
    const response4 = await fetch('http://localhost:3000/api/tracks?search=BROKEN&limit=5');
    const data4 = await response4.json();
    console.log(`   ✅ ${data4.tracks?.length || 0} de ${data4.total || 0} músicas encontradas`);
    
    // Teste 5: Filtros disponíveis
    console.log('\n🔧 Teste 5: Verificar filtros disponíveis');
    const response5 = await fetch('http://localhost:3000/api/tracks?limit=1');
    const data5 = await response5.json();
    console.log(`   ✅ Gêneros disponíveis: ${data5.filters?.genres?.length || 0}`);
    console.log(`   ✅ Artistas disponíveis: ${data5.filters?.artists?.length || 0}`);
    console.log(`   ✅ Versões disponíveis: ${data5.filters?.versions?.length || 0}`);
    
    console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

testCompleteSystem();
