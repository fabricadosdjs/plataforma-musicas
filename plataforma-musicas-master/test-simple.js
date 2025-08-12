console.log('🔍 Teste simples iniciado');

// Simular uma requisição para a API
async function testAPI() {
  try {
    console.log('🔍 Fazendo requisição para /api/tracks...');
    
    const response = await fetch('http://localhost:3000/api/tracks');
    console.log('🔍 Status da resposta:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🔍 Dados recebidos:', {
        tracksCount: data.tracks?.length || 0,
        totalCount: data.totalCount || 0,
        hasError: !!data.error
      });
    } else {
      console.log('🔍 Erro na resposta:', response.statusText);
    }
  } catch (error) {
    console.error('🔍 Erro na requisição:', error.message);
  }
}

testAPI(); 