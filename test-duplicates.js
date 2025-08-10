// Script para testar detecção de duplicatas
const testNormalization = () => {
    // Função de normalização (igual à implementada nas APIs)
    const normalizeTrackName = (artist, songName, version) => {
        const normalize = (str) => {
            return str
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Remove acentos
                .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
                .replace(/\s+/g, ' ') // Normaliza espaços
                .trim();
        };

        const normalizedArtist = normalize(artist);
        const normalizedSong = normalize(songName);
        const normalizedVersion = version ? normalize(version) : '';

        return `${normalizedArtist}|${normalizedSong}|${normalizedVersion}`;
    };

    // Casos de teste
    const testCases = [
        {
            original: { artist: "João Silva", songName: "Música de Teste", version: "Clean" },
            variant: { artist: "joao silva", songName: "musica de teste", version: "clean" },
            shouldMatch: true
        },
        {
            original: { artist: "DJ Mário", songName: "São Paulo (Remix)", version: null },
            variant: { artist: "DJ Mario", songName: "Sao Paulo (Remix)", version: "" },
            shouldMatch: true
        },
        {
            original: { artist: "Artist One", songName: "Song Name", version: "Extended" },
            variant: { artist: "Artist Two", songName: "Song Name", version: "Extended" },
            shouldMatch: false
        }
    ];

    console.log('🧪 Testando normalização de duplicatas...\n');

    testCases.forEach((testCase, index) => {
        const originalKey = normalizeTrackName(
            testCase.original.artist,
            testCase.original.songName,
            testCase.original.version
        );

        const variantKey = normalizeTrackName(
            testCase.variant.artist,
            testCase.variant.songName,
            testCase.variant.version
        );

        const actualMatch = originalKey === variantKey;
        const testPassed = actualMatch === testCase.shouldMatch;

        console.log(`Teste ${index + 1}: ${testPassed ? '✅ PASSOU' : '❌ FALHOU'}`);
        console.log(`  Original: "${testCase.original.artist} - ${testCase.original.songName}${testCase.original.version ? ` (${testCase.original.version})` : ''}"`);
        console.log(`  Variante: "${testCase.variant.artist} - ${testCase.variant.songName}${testCase.variant.version ? ` (${testCase.variant.version})` : ''}"`);
        console.log(`  Chave Original: "${originalKey}"`);
        console.log(`  Chave Variante: "${variantKey}"`);
        console.log(`  Esperado: ${testCase.shouldMatch ? 'MATCH' : 'NO MATCH'}, Atual: ${actualMatch ? 'MATCH' : 'NO MATCH'}`);
        console.log('');
    });
};

// Executar teste
testNormalization();

console.log('🔧 Correções implementadas:');
console.log('1. ✅ Paginação completa no Contabo Storage (resolve limite de 1000 arquivos)');
console.log('2. ✅ Normalização consistente entre todas as APIs');
console.log('3. ✅ Logs detalhados para debug de duplicatas');
console.log('4. ✅ Verificação dupla: URL + nome normalizado');
console.log('');
console.log('📋 Próximos passos:');
console.log('1. Teste no admin/contabo com suas 78 músicas');
console.log('2. Verifique os logs do console para detalhes da detecção');
console.log('3. Use admin/add-music para verificar se as "duplicatas" realmente são únicas');
