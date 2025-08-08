const https = require('https');
const fs = require('fs');

// ARL de teste (substitua por um ARL válido)
const TEST_ARL = process.env.DEEZER_ARL || 'your-arl-here';

// Função para testar busca de música
async function testSearch() {
    try {
        console.log('🔍 Testando busca de música...');

        const response = await fetch('https://api.deezer.com/search?q=shape%20of%20you&limit=1');
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            const track = data.data[0];
            console.log('✅ Música encontrada:');
            console.log(`   Título: ${track.title}`);
            console.log(`   Artista: ${track.artist.name}`);
            console.log(`   ID: ${track.id}`);
            console.log(`   Duração: ${track.duration}s`);
            return track;
        } else {
            console.log('❌ Nenhuma música encontrada');
            return null;
        }
    } catch (error) {
        console.error('❌ Erro na busca:', error);
        return null;
    }
}

// Função para testar obtenção de URL de download
async function testDownloadUrl(trackId) {
    try {
        console.log(`🔗 Testando obtenção de URL para track ${trackId}...`);

        const apiUrl = `https://api.deezer.com/track/${trackId}`;
        const response = await fetch(apiUrl);
        const trackData = await response.json();

        if (trackData.error) {
            console.error('❌ Erro ao obter dados da música:', trackData.error);
            return null;
        }

        console.log('✅ Dados da música obtidos:');
        console.log(`   MD5 Image: ${trackData.md5_image}`);
        console.log(`   Título: ${trackData.title}`);

        // Construir URL de download
        const downloadUrl = `https://e-cdns-proxy-${trackData.md5_image.substring(0, 1)}.dzcdn.net/mobile/1/${trackId}`;

        const headers = {
            'Cookie': `arl=${TEST_ARL}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };

        console.log(`🔗 URL de download: ${downloadUrl}`);
        console.log(`🍪 Headers: ${JSON.stringify(headers, null, 2)}`);

        // Testar acesso à URL
        const checkResponse = await fetch(downloadUrl, {
            method: 'HEAD',
            headers
        });

        console.log(`📡 Status da resposta: ${checkResponse.status}`);
        console.log(`📋 Headers da resposta:`, Object.fromEntries(checkResponse.headers.entries()));

        if (checkResponse.ok) {
            console.log('✅ URL de download acessível!');
            return { url: downloadUrl, headers };
        } else {
            console.log('❌ URL de download não acessível');
            return null;
        }

    } catch (error) {
        console.error('❌ Erro ao testar URL de download:', error);
        return null;
    }
}

// Função para testar download real
async function testDownload(downloadInfo, fileName) {
    if (!downloadInfo) {
        console.log('❌ Informações de download não disponíveis');
        return;
    }

    try {
        console.log(`📥 Testando download para ${fileName}...`);

        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(fileName);

            https.get(downloadInfo.url, { headers: downloadInfo.headers }, (response) => {
                console.log(`📡 Status do download: ${response.statusCode}`);
                console.log(`📋 Headers do download:`, Object.fromEntries(response.headers.entries()));

                if (response.statusCode !== 200) {
                    console.error(`❌ Erro HTTP: ${response.statusCode}`);
                    reject(new Error(`HTTP ${response.statusCode}`));
                    return;
                }

                let downloadedBytes = 0;
                response.on('data', (chunk) => {
                    downloadedBytes += chunk.length;
                    console.log(`📊 Baixados: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB`);
                });

                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(fileName);
                    console.log(`✅ Download concluído!`);
                    console.log(`📁 Arquivo: ${fileName}`);
                    console.log(`📏 Tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
                    resolve(true);
                });

                file.on('error', (err) => {
                    fs.unlink(fileName, () => { });
                    console.error('❌ Erro no arquivo:', err);
                    reject(err);
                });
            }).on('error', (err) => {
                console.error('❌ Erro na requisição:', err);
                reject(err);
            });
        });

    } catch (error) {
        console.error('❌ Erro no download:', error);
        return false;
    }
}

// Função principal
async function main() {
    console.log('🎵 Teste do Deezer Downloader');
    console.log('================================');

    if (TEST_ARL === 'your-arl-here') {
        console.log('⚠️  ARL não configurado. Configure a variável DEEZER_ARL');
        console.log('💡 Para obter um ARL válido:');
        console.log('   1. Acesse https://www.deezer.com');
        console.log('   2. Faça login na sua conta');
        console.log('   3. Abra o DevTools (F12)');
        console.log('   4. Vá para Application > Cookies');
        console.log('   5. Copie o valor do cookie "arl"');
        return;
    }

    console.log(`🔑 ARL configurado: ${TEST_ARL.substring(0, 10)}...`);

    // Teste 1: Buscar música
    const track = await testSearch();
    if (!track) {
        console.log('❌ Falha na busca. Abortando teste.');
        return;
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 2: Obter URL de download
    const downloadInfo = await testDownloadUrl(track.id);
    if (!downloadInfo) {
        console.log('❌ Falha na obtenção da URL. Abortando teste.');
        return;
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Teste 3: Download real
    const fileName = `test-download-${track.id}.mp3`;
    const downloadSuccess = await testDownload(downloadInfo, fileName);

    if (downloadSuccess) {
        console.log('\n🎉 Teste concluído com sucesso!');
        console.log(`📁 Arquivo salvo como: ${fileName}`);
    } else {
        console.log('\n❌ Teste falhou!');
    }
}

// Executar teste
main().catch(console.error);
