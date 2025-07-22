// Teste do JSON de músicas
const musicsData = [
    {
        "songName": "La Dolce Vita",
        "artist": "DV (DJ Il Cubano)",
        "style": "Electronic",
        "version": "DJ Il Cubano",
        "imageUrl": "https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png",
        "previewUrl": "https://files.catbox.moe/txq9xi.mp3",
        "downloadUrl": "https://files.catbox.moe/txq9xi.mp3",
        "releaseDate": "2025-07-22"
    },
    {
        "songName": "All I Have To Do Is Dream",
        "artist": "Fourteen 14",
        "style": "Electronic",
        "version": "Broken Needle Mix",
        "imageUrl": "https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png",
        "previewUrl": "https://files.catbox.moe/mv6cr1.mp3",
        "downloadUrl": "https://files.catbox.moe/mv6cr1.mp3",
        "releaseDate": "2025-07-22"
    },
    {
        "songName": "Reci Mi Ne",
        "artist": "Karma",
        "style": "Electronic",
        "version": "Album Version",
        "imageUrl": "https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png",
        "previewUrl": "https://files.catbox.moe/qcxl2g.mp3",
        "downloadUrl": "https://files.catbox.moe/qcxl2g.mp3",
        "releaseDate": "2025-07-22"
    }
];

async function testMusicUpload() {
    try {
        console.log('🎵 Testando upload de músicas...');
        console.log(`📊 Total de músicas: ${musicsData.length}`);

        // Simular a requisição para a API
        const response = await fetch('http://localhost:3000/api/tracks/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(musicsData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Sucesso:', result.message);
        } else {
            const error = await response.text();
            console.log('❌ Erro:', error);
        }
    } catch (error) {
        console.error('💥 Erro de rede:', error);
    }
}

// Verificar se JSON está válido
console.log('🔍 Verificando estrutura do JSON...');
musicsData.forEach((track, index) => {
    const required = ['songName', 'artist', 'style', 'version', 'imageUrl', 'previewUrl', 'downloadUrl', 'releaseDate'];
    const missing = required.filter(field => !track[field]);

    if (missing.length > 0) {
        console.log(`❌ Música ${index + 1} (${track.songName}) tem campos faltando: ${missing.join(', ')}`);
    } else {
        console.log(`✅ Música ${index + 1} (${track.songName}) - Todos os campos OK`);
    }
});

console.log('\n🚀 Para testar o upload, rode: npm run dev e depois execute este script');
console.log('📝 Ou copie o JSON abaixo para a interface admin/add-music:');
console.log('\n' + JSON.stringify(musicsData, null, 2));
