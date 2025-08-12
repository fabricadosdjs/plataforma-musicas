const https = require('https');
const fs = require('fs');
const path = require('path');

// ARL configurado
const DEEZER_ARL = '048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e';

console.log('🎵 Teste Simples do Download do Deezer');
console.log('=====================================');

async function testDownload() {
    try {
        // Teste 1: Buscar música
        console.log('\n🔍 Testando busca de música...');
        const searchResponse = await fetch('https://api.deezer.com/search?q=shape%20of%20you&limit=1');
        const searchData = await searchResponse.json();

        if (searchData.data && searchData.data.length > 0) {
            const track = searchData.data[0];
            console.log('✅ Música encontrada:', track.title, '-', track.artist.name);
            console.log('📋 Track ID:', track.id);

            // Teste 2: Tentar download
            console.log('\n⬇️ Testando download...');

            const downloadUrl = `https://e-cdns-proxy-${track.md5_image.substring(0, 1)}.dzcdn.net/mobile/1/${track.id}`;
            console.log('🔗 URL de download:', downloadUrl);

            const headers = {
                'Cookie': `arl=${DEEZER_ARL}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            };

            // Verificar se a URL é acessível
            const checkResponse = await fetch(downloadUrl, {
                method: 'HEAD',
                headers
            });

            console.log('📊 Status da verificação:', checkResponse.status);
            console.log('📋 Headers da resposta:', Object.fromEntries(checkResponse.headers.entries()));

            if (checkResponse.ok) {
                console.log('✅ URL de download acessível!');

                // Tentar download real
                const downloadResponse = await fetch(downloadUrl, {
                    headers
                });

                if (downloadResponse.ok) {
                    console.log('✅ Download iniciado com sucesso!');
                    console.log('📊 Tamanho do arquivo:', downloadResponse.headers.get('content-length'), 'bytes');
                } else {
                    console.log('❌ Erro no download:', downloadResponse.status);
                }
            } else {
                console.log('❌ URL de download não acessível');
            }

        } else {
            console.log('❌ Nenhuma música encontrada');
        }

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

testDownload();
