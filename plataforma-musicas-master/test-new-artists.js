// Teste específico para os novos artistas detectados
import { MusicStyleDetector } from './src/lib/music-style-detector.js';

console.log('🎵 Testando detecção para novos artistas...\n');

const testCases = [
    {
        artist: 'MARLON HOFFSTADT & DJ DADDY TRANCE',
        title: "IT'S THAT TIME",
        filename: "MARLON HOFFSTADT & DJ DADDY TRANCE - IT'S THAT TIME (EXTENDED VERSION) (CLEAN).mp3",
        expected: 'Trance'
    },
    {
        artist: 'MARNAGE X RAHUL',
        title: 'FLOW',
        filename: 'MARNAGE X RAHUL - FLOW (EXTENDED MIX) (CLEAN).mp3',
        expected: 'Progressive House'
    }
];

testCases.forEach((test, index) => {
    console.log(`🧪 Teste ${index + 1}:`);
    console.log(`   Artista: ${test.artist}`);
    console.log(`   Música: ${test.title}`);
    console.log(`   Arquivo: ${test.filename}`);

    const result = MusicStyleDetector.detectStyle(test.artist, test.title, test.filename);

    console.log(`   ✨ Resultado: ${result.style}`);
    console.log(`   🎯 Confiança: ${result.confidence}%`);
    console.log(`   📊 Esperado: ${test.expected}`);

    if (result.style === test.expected) {
        console.log(`   ✅ SUCESSO! Detecção correta\n`);
    } else {
        console.log(`   ❌ ERRO! Esperado "${test.expected}", obtido "${result.style}"\n`);
    }
});

console.log('🎉 Teste concluído!');
