// Validação do JSON de músicas
const jsonData = `[
  {
    "songName": "La Dolce Vita",
    "artist": "DV (DJ Il Cubano)",
    "style": "Electronic",
    "version": "DJ Il Cubano",
    "imageUrl": "https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png",
    "previewUrl": "https://files.catbox.moe/txq9xi.mp3",
    "downloadUrl": "https://files.catbox.moe/txq9xi.mp3",
    "releaseDate": "2025-07-22"
  }
]`;

try {
    const parsed = JSON.parse(jsonData);
    console.log('✅ JSON válido!');
    console.log('📊 Dados:', parsed[0]);
} catch (error) {
    console.log('❌ JSON inválido:', error.message);
}
