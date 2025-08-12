// Teste específico para Chitãozinho & Xororó
import { MusicStyleDetector } from './src/lib/music-style-detector.js';

console.log('🎵 Testando detecção para Chitãozinho & Xororó...\n');

const chitaoTestCases = [
    {
        artist: 'CHITÃOZINHO & XORORÓ',
        title: 'CANTE A CANÇÃO',
        filename: 'CHITÃOZINHO & XORORÓ - CANTE A CANÇÃO.mp3'
    },
    {
        artist: 'CHITÃOZINHO & XORORÓ',
        title: 'NATAL DAS CRIANÇAS _ O VELHINHO _ SINO DE BELÉM',
        filename: 'CHITÃOZINHO & XORORÓ - NATAL DAS CRIANÇAS _ O VELHINHO _ SINO DE BELÉM.mp3'
    },
    {
        artist: 'CHITÃOZINHO & XORORÓ',
        title: 'NOITE FELIZ',
        filename: 'CHITÃOZINHO & XORORÓ - NOITE FELIZ.mp3'
    },
    {
        artist: 'CHITÃOZINHO & XORORÓ',
        title: 'SE UMA ESTRELA APARECER _ ADESTE FIDELIS _ QUE SEJA UM NATAL FELIZ',
        filename: 'CHITÃOZINHO & XORORÓ - SE UMA ESTRELA APARECER _ ADESTE FIDELIS _ QUE SEJA UM NATAL FELIZ.mp3'
    },
    {
        artist: 'CHITÃOZINHO & XORORÓ',
        title: 'UM SINO FELIZ',
        filename: 'CHITÃOZINHO & XORORÓ - UM SINO FELIZ.mp3'
    }
];

chitaoTestCases.forEach((test, index) => {
    console.log(`🧪 Teste ${index + 1}:`);
    console.log(`   Artista: ${test.artist}`);
    console.log(`   Música: ${test.title}`);

    const result = MusicStyleDetector.detectStyle(test.artist, test.title, test.filename);

    console.log(`   ✨ Resultado: ${result.style}`);
    console.log(`   🎯 Confiança: ${result.confidence}%`);

    if (result.style === 'Sertanejo') {
        console.log(`   ✅ SUCESSO! Detecção correta como Sertanejo\n`);
    } else {
        console.log(`   ❌ ERRO! Detectado como "${result.style}", esperado "Sertanejo"\n`);
    }
});

console.log('🎉 Teste concluído!');
