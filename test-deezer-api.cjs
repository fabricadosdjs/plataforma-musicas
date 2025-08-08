// Usar fetch nativo do Node.js

console.log('🎵 Teste da API do Deezer');
console.log('==========================');

async function testAPI() {
    try {
        // Teste 1: Buscar música
        console.log('\n🔍 Testando busca de música...');
        const searchResponse = await fetch('http://localhost:3000/api/deezer-downloads?query=shape%20of%20you');

        if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            console.log('✅ Busca bem-sucedida:', searchData);

            // Teste 2: Tentar download
            console.log('\n⬇️ Testando download...');
            const downloadResponse = await fetch('http://localhost:3000/api/deezer-downloads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: 'https://www.deezer.com/track/139470659',
                    title: searchData.title,
                    artist: searchData.artist,
                    trackId: searchData.trackId,
                    quality: '128'
                })
            });

            if (downloadResponse.ok) {
                const downloadData = await downloadResponse.json();
                console.log('✅ Download bem-sucedido:', downloadData);

                // Teste 3: Verificar arquivo
                console.log('\n📁 Verificando arquivo...');
                const fileResponse = await fetch(`http://localhost:3000${downloadData.downloadUrl}`);

                if (fileResponse.ok) {
                    const fileContent = await fileResponse.text();
                    console.log('✅ Arquivo acessível!');
                    console.log('📋 Primeiras linhas:', fileContent.substring(0, 200));
                } else {
                    console.log('❌ Erro ao acessar arquivo:', fileResponse.status);
                }
            } else {
                const errorData = await downloadResponse.json();
                console.log('❌ Erro no download:', errorData);
            }
        } else {
            console.log('❌ Erro na busca:', searchResponse.status);
        }

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testAPI();
