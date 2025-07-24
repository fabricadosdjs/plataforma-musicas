// Script para testar o detector inteligente de estilos
import dotenv from 'dotenv';
import { MusicStyleDetector } from './src/lib/music-style-detector.js';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

async function testMusicStyleDetector() {
    console.log('🧠 Testando Detector Inteligente de Estilos...\n');

    // Exemplos de músicas reais do seu bucket
    const testTracks = [
        { artist: 'DV', title: 'LA DOLCE VITA', filename: 'DV - LA DOLCE VITA (DJ IL CUBANO).mp3' },
        { artist: 'FOURTEEN 14', title: 'ALL I HAVE TO DO IS DREAM', filename: 'FOURTEEN 14 - ALL I HAVE TO DO IS DREAM (BROKEN NEEDLE MIX).mp3' },
        { artist: 'KARMA', title: 'RECI MI NE', filename: 'KARMA - RECI MI NE (ALBUM VERSION).mp3' },
        { artist: 'LIA DE BAHIA', title: 'PARLA CHE MI AMA', filename: 'LIA DE BAHIA - PARLA CHE MI AMA (LOVING MIX).mp3' },
        { artist: 'MASTRO G', title: 'THE PUPPET (PINOCCHIO)', filename: 'MASTRO G - THE PUPPET (PINOCCHIO) (ORIGINAL LEGNO MIX).mp3' },
        { artist: 'PINOCCHIO', title: 'MON COEUR FAIT BOOM BOOM', filename: 'PINOCCHIO - MON COEUR FAIT BOOM BOOM.mp3' },
        { artist: 'SUPERCAR', title: 'TONITE', filename: 'SUPERCAR - TONITE (EXTENDED MIX).mp3' },
        { artist: 'THE SOUNDLOVERS', title: 'ALL DAY ALL NIGHT', filename: 'THE SOUNDLOVERS - ALL DAY ALL NIGHT (PIZZA MIX).mp3' },

        // Exemplos adicionais para testar diferentes estilos
        { artist: 'Carl Cox', title: 'Space Is The Place', filename: 'Carl Cox - Space Is The Place (Techno Mix).mp3' },
        { artist: 'Armin van Buuren', title: 'Communication', filename: 'Armin van Buuren - Communication (Trance Mix).mp3' },
        { artist: 'Skrillex', title: 'Bangarang', filename: 'Skrillex - Bangarang (Dubstep Mix).mp3' },
        { artist: 'Netsky', title: 'Come Alive', filename: 'Netsky - Come Alive (Liquid DnB Mix).mp3' },
        { artist: 'Daft Punk', title: 'One More Time', filename: 'Daft Punk - One More Time (French House).mp3' }
    ];

    console.log('🎵 Analisando estilos musicais:\n');

    testTracks.forEach((track, index) => {
        const detection = MusicStyleDetector.detectStyle(track.artist, track.title, track.filename);
        const version = MusicStyleDetector.detectVersion(track.title, track.filename);

        console.log(`${index + 1}. ${track.artist} - ${track.title}`);
        console.log(`   📁 Arquivo: ${track.filename}`);
        console.log(`   🎭 Estilo: ${detection.style} (${Math.round(detection.confidence * 100)}% confiança)`);
        console.log(`   🎵 Versão: ${version}`);
        console.log(`   🥁 BPM: ${detection.bpm || 'N/A'}`);
        console.log(`   🎹 Tonalidade: ${detection.key || 'N/A'}`);
        console.log(`   😊 Mood: ${detection.mood || 'N/A'}`);
        console.log('');
    });

    // Estatísticas
    const styles = testTracks.map(track =>
        MusicStyleDetector.detectStyle(track.artist, track.title, track.filename).style
    );

    const styleCount = styles.reduce((acc, style) => {
        acc[style] = (acc[style] || 0) + 1;
        return acc;
    }, {});

    console.log('📊 Estatísticas de Estilos Detectados:');
    Object.entries(styleCount)
        .sort(([, a], [, b]) => b - a)
        .forEach(([style, count]) => {
            console.log(`   ${style}: ${count} música${count > 1 ? 's' : ''}`);
        });

    console.log('\n🎉 Teste do Detector Inteligente concluído!');
    console.log('💡 Agora execute: npm run contabo:smart para testar a importação completa');
}

testMusicStyleDetector();
