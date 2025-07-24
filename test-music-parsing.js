// Script para testar as melhorias na análise de nomes de músicas
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

// Simular a função de parsing (para teste local)
function parseAudioFileNameAdvanced(filename) {
    const nameWithoutExt = filename.replace(/\.(mp3|wav|flac|m4a|aac|ogg)$/i, '');

    let artist = 'Unknown Artist';
    let title = nameWithoutExt;
    let version = 'Original';
    let extractedStyle = '';
    let cleanName = nameWithoutExt;

    // Estilos para detectar
    const stylePatterns = [
        'progressive house', 'future house', 'deep house', 'tech house', 'tribal house',
        'big room', 'progressive', 'trance', 'techno', 'electro', 'dubstep', 'drum bass',
        'sertanejo', 'mpb', 'forró', 'funk', 'pagode', 'bossa nova', 'axé', 'arrocha',
        'house', 'electronic', 'dance', 'edm', 'ambient', 'minimal'
    ];

    // Procurar por estilos no nome do arquivo
    const lowerFilename = nameWithoutExt.toLowerCase();
    for (const style of stylePatterns) {
        if (lowerFilename.includes(style.toLowerCase())) {
            // Capitalizar o estilo encontrado
            extractedStyle = style.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            // Remover o estilo do nome do arquivo para não aparecer no título
            const styleRegex = new RegExp(`\\s*${style.replace(/\s+/g, '\\s+')}\\s*`, 'gi');
            cleanName = nameWithoutExt.replace(styleRegex, ' ').trim();
            break;
        }
    }

    // Sufixos para detectar e remover
    const suffixPatterns = [
        /\s*\(extended mix\)/gi,
        /\s*\(radio edit\)/gi,
        /\s*\(club mix\)/gi,
        /\s*\(vocal mix\)/gi,
        /\s*\(instrumental\)/gi,
        /\s*\(dub mix\)/gi,
        /\s*\(vip mix\)/gi,
        /\s*\(acoustic\)/gi,
        /\s*\(remix\)/gi,
        /\s*\(original mix\)/gi,
        /\s*\(official\)/gi,
        /\s*\(preview\)/gi,
        /\s*\(clean\)/gi,
        /\s*\(dirty\)/gi,
        /\s*\(explicit\)/gi
    ];

    let detectedSuffix = '';

    // Extrair sufixos e versões
    for (const pattern of suffixPatterns) {
        const match = cleanName.match(pattern);
        if (match) {
            detectedSuffix = match[0].trim().replace(/[()]/g, '');
            // Capitalizar o sufixo
            detectedSuffix = detectedSuffix.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            cleanName = cleanName.replace(pattern, '').trim();
            break;
        }
    }

    // Padrão 1: Artista - Título (Versão)
    const pattern1 = cleanName.match(/^(.+?)\s*-\s*(.+?)\s*\((.+?)\).*$/);
    if (pattern1) {
        artist = pattern1[1].trim();
        title = pattern1[2].trim();
        version = pattern1[3].trim();
    }
    // Padrão 2: Artista - Título
    else if (cleanName.includes(' - ')) {
        const parts = cleanName.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();

        // Extrair versão se estiver no título
        const versionMatch = title.match(/\((.+?)\)$/);
        if (versionMatch) {
            version = versionMatch[1].trim();
            title = title.replace(/\s*\(.+?\)$/, '').trim();
        }
    }
    // Padrão 3: Artista_Título
    else if (cleanName.includes('_') && !cleanName.includes(' ')) {
        const parts = cleanName.split('_');
        artist = parts[0].trim();
        title = parts.slice(1).join(' ').trim();
    }

    // Limpar caracteres especiais
    artist = artist.replace(/[\[\]]/g, '').trim();
    title = title.replace(/[\[\]]/g, '').trim();
    version = version.replace(/[\[\]]/g, '').trim();

    // Usar sufixo detectado como versão ou manter versão existente
    const finalVersion = detectedSuffix || version || 'Original';
    const finalStyle = extractedStyle || 'Electronic'; // Fallback

    return {
        original: filename,
        artist,
        title,
        version: finalVersion,
        style: finalStyle,
        extracted: !!extractedStyle,
        suffixRemoved: !!detectedSuffix
    };
}

async function testMusicParsing() {
    console.log('🎵 Testando análise inteligente de nomes de músicas...\n');

    // Casos de teste
    const testFiles = [
        // Com estilo explícito e sufixo
        'Martin Garrix - Animals big room (Extended Mix).mp3',
        'Deadmau5 - Strobe progressive house (Radio Edit).mp3',
        'Tchami - Promesses future house (Club Mix).mp3',

        // Com estilo mas sem sufixo
        'Oliver Heldens - Gecko deep house.mp3',
        'Carl Cox - Space tech house.mp3',
        'Armin van Buuren - Shivers trance.mp3',

        // Com sufixo mas sem estilo explícito
        'David Guetta - Titanium (Extended Mix).mp3',
        'Calvin Harris - Feel So Close (Radio Edit).mp3',
        'Swedish House Mafia - Don\'t You Worry Child (VIP Mix).mp3',

        // Música brasileira
        'Gusttavo Lima - Balada sertanejo (Acoustic).mp3',
        'Caetano Veloso - Tropicália mpb.mp3',
        'Anitta - Envolver funk (Official).mp3',

        // Sem padrões especiais
        'Unknown Artist - Generic Song.mp3',
        'Artist - Title.mp3'
    ];

    console.log('📋 Resultados da análise:\n');

    testFiles.forEach((filename, index) => {
        const result = parseAudioFileNameAdvanced(filename);

        console.log(`${index + 1}. ${filename}`);
        console.log(`   🎤 Artista: ${result.artist}`);
        console.log(`   🎵 Título: ${result.title}`);
        console.log(`   📀 Versão: ${result.version}`);
        console.log(`   🎧 Estilo: ${result.style} ${result.extracted ? '(extraído da faixa)' : '(fallback)'}`);
        console.log(`   ✂️  Sufixo removido: ${result.suffixRemoved ? 'Sim' : 'Não'}`);
        console.log('');
    });

    console.log('🎯 MELHORIAS IMPLEMENTADAS:');
    console.log('   ✅ Extração de estilos escritos na faixa');
    console.log('   ✅ Remoção de sufixos como (Extended Mix), (Radio Edit)');
    console.log('   ✅ Capitalização correta dos estilos e sufixos');
    console.log('   ✅ Priorização de informações da própria faixa');
    console.log('   ✅ Detecção de duplicatas baseada em artista + título');
    console.log('\n🔄 PRÓXIMOS PASSOS:');
    console.log('   • Testar a importação real no sistema');
    console.log('   • Verificar se as duplicatas estão sendo evitadas');
    console.log('   • Confirmar que os títulos ficaram mais curtos e limpos');
}

// Executar teste
testMusicParsing();
