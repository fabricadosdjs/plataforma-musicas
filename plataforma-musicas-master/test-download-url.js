// Teste da URL de download da música DESIRE
const testUrl = "https://usc1.contabostorage.com/211285f2fbcc4760a62df1aff280735f:plataforma-de-musicas/09.08.2025/GOOM GUM - DESIRE (EXTENDED MIX).mp3";

async function testDownload() {
    try {
        console.log('🔍 Testando URL de download...');
        console.log('URL:', testUrl);

        const response = await fetch(testUrl);

        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const contentLength = response.headers.get('content-length');
            console.log(`✅ Arquivo acessível! Tamanho: ${contentLength ? Math.round(parseInt(contentLength) / 1024) + ' KB' : 'Desconhecido'}`);
        } else {
            console.log('❌ Erro ao acessar arquivo:', response.statusText);
        }

    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
    }
}

testDownload();
