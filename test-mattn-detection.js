// Teste específico para a música MATTN & NOEL HOLLER
import { MusicStyleDetector } from './src/lib/music-style-detector.js';

function testSpecificTrack() {
    console.log('🎵 Testando detecção inteligente de estilo...\n');

    // Música específica mencionada
    const track = {
        artist: 'MATTN & NOEL HOLLER VS. ROGER',
        title: 'CRAZY IN LOVE VS. WE CAN MAKE IT BETTER (MARK ANTHONY MASHUP)',
        version: 'CLEAN'
    };

    console.log(`🎧 Música: ${track.title}`);
    console.log(`🎤 Artista: ${track.artist}`);
    console.log(`📀 Versão: ${track.version}`);

    // Testar detecção de estilo
    const styleResult = MusicStyleDetector.detectStyle(track.artist, track.title);
    console.log(`\\n🎨 Resultado da detecção:`);
    console.log(`   Estilo: ${styleResult.style}`);
    console.log(`   Confiança: ${(styleResult.confidence * 100).toFixed(1)}%`);
    if (styleResult.bpm) console.log(`   BPM: ${styleResult.bpm}`);
    if (styleResult.key) console.log(`   Tom: ${styleResult.key}`);
    if (styleResult.mood) console.log(`   Mood: ${styleResult.mood}`);
    if (styleResult.subgenre) console.log(`   Subgênero: ${styleResult.subgenre}`);

    // Testar detecção de versão
    const versionResult = MusicStyleDetector.detectVersion(track.title);
    console.log(`\\n🔄 Versão detectada: ${versionResult}`);

    // Análise adicional
    console.log(`\\n🔍 Análise adicional:`);

    // Verificar artistas específicos
    if (track.artist.toLowerCase().includes('mattn')) {
        console.log(`   ✅ MATTN detectado - conhecido por Big Room House e Festival music`);
    }
    if (track.artist.toLowerCase().includes('noel holler')) {
        console.log(`   ✅ NOEL HOLLER detectado - conhecido por Future House`);
    }
    if (track.title.toLowerCase().includes('mashup')) {
        console.log(`   ✅ MASHUP detectado - combinação de múltiplas faixas`);
    }
    if (track.title.toLowerCase().includes('vs')) {
        console.log(`   ✅ Formato "VS" detectado - típico de mashups e remixes`);
    }
    if (track.version.toLowerCase().includes('clean')) {
        console.log(`   ✅ Versão CLEAN detectada - sem conteúdo explícito`);
    }

    console.log(`\\n💡 Conclusão:`);
    if (styleResult.style === 'Electronic') {
        console.log(`   ❌ Ainda foi detectado como "Electronic" genérico`);
        console.log(`   🔧 Sugestão: Deveria ser "Mashup" ou "Big Room House"`);
    } else {
        console.log(`   ✅ Estilo específico detectado com sucesso!`);
    }

    // Testar outros exemplos para comparação
    console.log(`\\n🔄 Testando outros exemplos para comparação:`);

    const examples = [
        { artist: 'Martin Garrix', title: 'Animals' },
        { artist: 'MATTN', title: 'Café' },
        { artist: 'Noel Holler', title: 'Future House Track' },
        { artist: 'Mark Anthony', title: 'Festival Mashup' }
    ];

    examples.forEach(ex => {
        const result = MusicStyleDetector.detectStyle(ex.artist, ex.title);
        console.log(`   ${ex.artist} - ${ex.title}: ${result.style} (${(result.confidence * 100).toFixed(1)}%)`);
    });
}

testSpecificTrack();
