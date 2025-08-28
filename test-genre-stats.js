// Script de teste para verificar estatísticas de gênero
const testGenreStats = async () => {
    console.log('🧪 Testando API de estatísticas de gênero...\n');

    // Testar com diferentes gêneros
    const genres = ['house', 'techno', 'progressive house', 'tech house'];

    for (const genre of genres) {
        try {
            console.log(`📊 Testando gênero: ${genre}`);

            const response = await fetch(`/api/tracks/genre/${encodeURIComponent(genre)}/stats`);
            const stats = await response.json();

            console.log(`   ✅ Total de músicas: ${stats.totalTracks}`);
            console.log(`   ✅ Downloads únicos: ${stats.totalDownloads}`);
            console.log(`   ✅ Likes únicos: ${stats.totalLikes}`);
            console.log(`   ✅ Plays únicos: ${stats.totalPlays}`);
            console.log(`   ✅ Artistas únicos: ${stats.uniqueArtists}`);
            console.log(`   ✅ Pools únicos: ${stats.uniquePools}`);

            // Verificar lógica
            if (stats.totalDownloads > stats.totalTracks) {
                console.log(`   ❌ ERRO: Downloads (${stats.totalDownloads}) > Músicas (${stats.totalTracks})`);
            } else {
                console.log(`   ✅ Downloads válidos: ${stats.totalDownloads} ≤ ${stats.totalTracks}`);
            }

            if (stats.totalLikes > stats.totalTracks) {
                console.log(`   ❌ ERRO: Likes (${stats.totalLikes}) > Músicas (${stats.totalTracks})`);
            } else {
                console.log(`   ✅ Likes válidos: ${stats.totalLikes} ≤ ${stats.totalTracks}`);
            }

            if (stats.totalPlays > stats.totalTracks) {
                console.log(`   ❌ ERRO: Plays (${stats.totalPlays}) > Músicas (${stats.totalTracks})`);
            } else {
                console.log(`   ✅ Plays válidos: ${stats.totalPlays} ≤ ${stats.totalTracks}`);
            }

            console.log('');

        } catch (error) {
            console.log(`   ❌ Erro ao testar ${genre}:`, error.message);
        }
    }

    console.log('🎯 Teste concluído!');
};

// Executar teste se estiver no browser
if (typeof window !== 'undefined') {
    // Aguardar um pouco para a página carregar
    setTimeout(() => {
        testGenreStats();
    }, 2000);
} else {
    console.log('Este script deve ser executado no browser');
}

