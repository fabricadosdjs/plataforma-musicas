const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

console.log('🎵 Testando Download Real do Deezer');
console.log('==================================');

// ARL configurado
const arl = '048bf08a0ad1e6f2cac6a80cea2aeab3c001e355054391fb196b388ecc19c6e72b1c790a2803788084ae8132a9f28b69704ab230c6450bb7fdd1d186fb51e7349bf536d4116e0c12d8f0e888c8c42f8f01953cddf587eca8b4f257396915225e';

// Função para gerar chave Blowfish (baseada no Deemix)
function generateBlowfishKey(trackId) {
    const md5 = crypto.createHash('md5').update(trackId.toString(), 'ascii').digest('hex');

    let key = '';
    for (let i = 0; i < 16; i++) {
        const charCode = md5.charCodeAt(i) ^ md5.charCodeAt(i + 16) ^ "g4el58wc0zvf9na1".charCodeAt(i);
        key += String.fromCharCode(charCode);
    }

    return key;
}

// Função para decriptar chunk usando Blowfish
function decryptChunk(chunk, key) {
    try {
        // Verificar se Blowfish está disponível
        if (crypto.getCiphers().includes('bf-cbc')) {
            const decipher = crypto.createDecipheriv('bf-cbc', key, Buffer.from([0, 1, 2, 3, 4, 5, 6, 7]));
            decipher.setAutoPadding(false);
            return Buffer.concat([decipher.update(chunk), decipher.final()]);
        } else {
            console.log('⚠️ Blowfish não disponível, usando AES como fallback');
            const decipher = crypto.createDecipheriv('aes-128-cbc', key, Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]));
            decipher.setAutoPadding(false);
            return Buffer.concat([decipher.update(chunk), decipher.final()]);
        }
    } catch (error) {
        console.error('❌ Erro na decriptação:', error.message);
        return chunk;
    }
}

// Função para testar download
async function testDownload() {
    const trackId = '3437249631'; // ID da música de teste
    const quality = '128';

    console.log(`🎵 Testando download da música ${trackId}`);

    // Primeiro, obter informações da música
    try {
        const response = await fetch(`https://api.deezer.com/track/${trackId}`);
        const trackData = await response.json();

        if (trackData.error) {
            console.error('❌ Erro ao obter dados da música:', trackData.error);
            return;
        }

        console.log('📡 Informações da música:');
        console.log(`   Título: ${trackData.title}`);
        console.log(`   Artista: ${trackData.artist.name}`);
        console.log(`   MD5: ${trackData.md5_image}`);

        // Gerar URL de download
        const md5Image = trackData.md5_image;
        const downloadUrl = `https://e-cdns-proxy-${md5Image.substring(0, 1)}.dzcdn.net/mobile/1/${trackId}`;

        console.log(`🔗 URL de download: ${downloadUrl}`);

        // Testar download
        await downloadFile(downloadUrl, `test_${trackId}.mp3`);

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

// Função para fazer download
function downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
        console.log('📥 Iniciando download...');

        const file = fs.createWriteStream(filePath);
        let downloadedBytes = 0;
        let totalBytes = 0;
        let buffer = Buffer.alloc(0);

        const headers = {
            'Cookie': `arl=${arl}; premium=1; sid=1`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': 'https://www.deezer.com/',
            'Origin': 'https://www.deezer.com'
        };

        const request = https.get(url, { headers, timeout: 30000 }, (response) => {
            console.log(`📊 Status: ${response.statusCode} ${response.statusMessage}`);

            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }

            totalBytes = parseInt(response.headers['content-length'] || '0');
            console.log(`📏 Tamanho: ${totalBytes} bytes`);

            // Verificar se é stream criptografado
            const isMobileStream = url.includes('/mobile/');
            let blowfishKey = null;

            if (isMobileStream) {
                const trackIdMatch = url.match(/\/(\d+)/);
                if (trackIdMatch) {
                    const trackId = trackIdMatch[1];
                    blowfishKey = generateBlowfishKey(trackId);
                    console.log('🔐 Stream criptografado detectado');
                }
            }

            response.on('data', (chunk) => {
                downloadedBytes += chunk.length;

                if (isMobileStream && blowfishKey) {
                    buffer = Buffer.concat([buffer, chunk]);

                    while (buffer.length >= 6144) {
                        const block = buffer.slice(0, 6144);
                        buffer = buffer.slice(6144);

                        const decryptedBlock = decryptChunk(block, blowfishKey);
                        file.write(decryptedBlock);
                    }
                } else {
                    file.write(chunk);
                }

                if (totalBytes > 0) {
                    const progress = Math.round((downloadedBytes / totalBytes) * 100);
                    console.log(`📈 Progresso: ${progress}% (${downloadedBytes}/${totalBytes} bytes)`);
                }
            });

            response.on('end', () => {
                if (isMobileStream && blowfishKey && buffer.length > 0) {
                    if (buffer.length >= 2048) {
                        const decryptedBlock = decryptChunk(buffer, blowfishKey);
                        file.write(decryptedBlock);
                    } else {
                        file.write(buffer);
                    }
                }

                file.end();
                console.log(`✅ Download concluído: ${downloadedBytes} bytes`);
                resolve();
            });

            file.on('error', (err) => {
                console.error('❌ Erro ao escrever arquivo:', err.message);
                fs.unlink(filePath, () => { });
                reject(err);
            });
        });

        request.on('error', (err) => {
            console.error('❌ Erro na requisição:', err.message);
            reject(err);
        });

        request.on('timeout', () => {
            console.error('⏰ Timeout na requisição');
            request.destroy();
            reject(new Error('Timeout na requisição'));
        });

        request.setTimeout(30000);
    });
}

// Executar teste
testDownload().then(() => {
    console.log('🎉 Teste concluído!');
}).catch((error) => {
    console.error('❌ Teste falhou:', error.message);
});
