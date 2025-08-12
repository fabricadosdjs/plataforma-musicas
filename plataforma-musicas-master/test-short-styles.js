// Teste rápido da detecção com nomes mais curtos
import { MusicStyleDetector } from './src/lib/music-style-detector.js';

console.log('✂️ Testando detecção com nomes mais curtos...\n');

const testCases = [
    {
        artist: 'CHITÃOZINHO & XORORÓ',
        title: 'CANTE A CANÇÃO'
    },
    {
        artist: 'MARLON HOFFSTADT & DJ DADDY TRANCE',
        title: "IT'S THAT TIME"
    },
    {
        artist: 'MARNAGE X RAHUL',
        title: 'FLOW'
    },
    {
        artist: 'MATTN & NOEL HOLLER VS. ROGER',
        title: 'M - CRAZY IN LOVE VS. WE CAN MAKE IT BETTER'
    }
];

testCases.forEach((test, index) => {
    console.log(`🧪 Teste ${index + 1}:`);
    console.log(`   Artista: ${test.artist}`);
    console.log(`   Música: ${test.title}`);

    const result = MusicStyleDetector.detectStyle(test.artist, test.title);

    console.log(`   ✨ Estilo: ${result.style} (${result.style.length} chars)`);
    console.log(`   🎯 Confiança: ${result.confidence}%\n`);
});

console.log('🎉 Teste concluído!');
