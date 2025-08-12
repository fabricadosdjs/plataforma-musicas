// Script para testar a correção de URLs
console.log('🧪 Testando correção de URLs...\n');

// Simular URLs que podem ter problemas
const testUrls = [
    'https://usc1.contabostorage.com/bucket/BRIAN SMITH, KOJO FUNDS - PARANOID.mp3',
    'https://usc1.contabostorage.com/bucket/CALVIN HARRIS, CLEMENTINE DOUGLAS - BLESSINGS.mp3',
    'https://usc1.contabostorage.com/bucket/CAMILO FRANCO, URMET K, GURI & EIDER - SONG.mp3'
];

// Função para gerar variações de URL (como implementada)
function generateUrlVariants(url) {
    const variants = [];

    // 1. URL original
    variants.push(url);

    // 2. URL com decode
    try {
        const decoded = decodeURIComponent(url);
        if (decoded !== url) variants.push(decoded);
    } catch (e) { }

    // 3. URL com encode do filename
    try {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        const encoded = encodeURIComponent(filename);
        if (encoded !== filename) {
            const encodedUrl = [...parts.slice(0, -1), encoded].join('/');
            variants.push(encodedUrl);
        }
    } catch (e) { }

    return [...new Set(variants)];
}

testUrls.forEach((url, index) => {
    console.log(`🔗 Teste ${index + 1}:`);
    console.log(`Original: ${url}`);

    const variants = generateUrlVariants(url);
    variants.forEach((variant, i) => {
        console.log(`  Variação ${i + 1}: ${variant}`);
    });

    console.log(`  Total de variações: ${variants.length}`);
    console.log('');
});

console.log('✅ Agora o sistema vai testar múltiplas variações de URL para detectar duplicatas!');
console.log('🚀 Teste no /admin/contabo para ver a diferença!');
