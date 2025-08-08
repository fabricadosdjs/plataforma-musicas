const https = require('https');

// ARL configurado
const TEST_ARL = '048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e';

async function testARL() {
    console.log('🎵 Teste do ARL do Deezer');
    console.log('==========================');
    console.log(`🔑 ARL configurado: ${TEST_ARL.substring(0, 20)}...`);
    console.log('📋 Qualidade: 128 kbps');

    try {
        // Teste 1: Buscar música
        console.log('\n🔍 Testando busca de música...');
        const response = await fetch('https://api.deezer.com/search?q=shape%20of%20you&limit=1');
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            const track = data.data[0];
            console.log('✅ Música encontrada:');
            console.log(`   Título: ${track.title}`);
            console.log(`   Artista: ${track.artist.name}`);
            console.log(`   ID: ${track.id}`);

            // Teste 2: Verificar acesso com ARL
            console.log('\n🔗 Testando acesso com ARL...');
            const downloadUrl = `https://e-cdns-proxy-${track.md5_image.substring(0, 1)}.dzcdn.net/mobile/1/${track.id}`;

            const headers = {
                'Cookie': `arl=${TEST_ARL}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            };

            const checkResponse = await fetch(downloadUrl, {
                method: 'HEAD',
                headers
            });

            console.log(`📡 Status da resposta: ${checkResponse.status}`);

            if (checkResponse.ok) {
                console.log('✅ ARL válido! Acesso permitido.');
                console.log('🎉 O Deezer Downloader está funcionando corretamente!');
            } else {
                console.log('❌ ARL inválido ou expirado.');
                console.log('💡 Verifique se o ARL está correto e atualizado.');
            }

        } else {
            console.log('❌ Nenhuma música encontrada');
        }

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

// Executar teste
testARL().catch(console.error);
