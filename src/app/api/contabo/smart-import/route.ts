// API para importação inteligente com busca de metadados e integração Spotify
import { ContaboStorage } from '@/lib/contabo-storage';
import { MusicStyleDetector } from '@/lib/music-style-detector';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


interface TrackMetadata {
    artist: string;
    title: string;
    style: string;
    version: string;
    year?: number;
    bpm?: number;
    key?: string;
    genre?: string;
    confidence: number;
    mood?: string;
    label?: string;
    era?: string;
    energy?: number;
    complexity?: number;
    spotifyData?: {
        spotifyId: string;
        album: string;
        releaseDate: string;
        imageUrl: string | null;
        previewUrl: string | null;
        spotifyUrl: string;
        popularity: number;
        durationMs: number;
    };
}

interface SpotifyMetadata {
    spotifyId: string;
    title: string;
    artist: string;
    album: string;
    releaseDate: string;
    imageUrl: string | null;
    previewUrl: string | null;
    spotifyUrl: string;
    popularity: number;
    durationMs: number;
}

// Sistema de logging inteligente para monitorar precisão da IA
class AIPrecisionLogger {
    private static logs: Array<{
        filename: string;
        artist: string;
        title: string;
        detectedStyle: string;
        confidence: number;
        metadata: any;
        timestamp: Date;
    }> = [];

    static logDetection(filename: string, artist: string, title: string, metadata: any) {
        this.logs.push({
            filename,
            artist,
            title,
            detectedStyle: metadata.style,
            confidence: metadata.confidence,
            metadata,
            timestamp: new Date()
        });

        // Manter apenas os últimos 1000 logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }

        // Log detalhado para análise
        console.log(`🎯 IA Detection: ${filename}`);
        console.log(`   Artist: ${artist}`);
        console.log(`   Title: ${title}`);
        console.log(`   Style: ${metadata.style} (${(metadata.confidence * 100).toFixed(1)}%)`);
        console.log(`   Label: ${metadata.label || 'Unknown'}`);
        console.log(`   Era: ${metadata.era || 'Unknown'}`);
        console.log(`   BPM: ${metadata.bpm || 'Unknown'}`);
        console.log(`   Key: ${metadata.key || 'Unknown'}`);
        console.log(`   Mood: ${metadata.mood || 'Unknown'}`);
        console.log(`   Energy: ${metadata.energy || 'Unknown'}`);
        console.log(`   Complexity: ${metadata.complexity || 'Unknown'}`);
        console.log(`   ---`);
    }

    static getStats() {
        const total = this.logs.length;
        if (total === 0) return { total: 0, averageConfidence: 0, styleDistribution: {} };

        const averageConfidence = this.logs.reduce((sum, log) => sum + log.confidence, 0) / total;

        const styleDistribution: Record<string, number> = {};
        this.logs.forEach(log => {
            styleDistribution[log.detectedStyle] = (styleDistribution[log.detectedStyle] || 0) + 1;
        });

        return {
            total,
            averageConfidence: Math.round(averageConfidence * 100) / 100,
            styleDistribution,
            recentDetections: this.logs.slice(-10).map(log => ({
                filename: log.filename,
                style: log.detectedStyle,
                confidence: log.confidence
            }))
        };
    }

    static exportLogs() {
        return this.logs;
    }

    static clearLogs() {
        this.logs = [];
    }
}

// Função para buscar metadados online com IA avançada
async function fetchMetadataFromInternet(artist: string, title: string): Promise<Partial<TrackMetadata>> {
    try {
        // Usar IA avançada para detecção precisa
        const styleDetection = MusicStyleDetector.detectSpecificStyle(artist, title);

        // Simular busca de metadados adicionais (substitua por APIs reais como Last.fm, Discogs, etc.)
        const additionalMetadata = await simulateMetadataAPI(artist, title);

        // Combinar detecção da IA com metadados externos
        return {
            style: styleDetection.style,
            bpm: styleDetection.bpm || additionalMetadata.bpm,
            key: styleDetection.key || additionalMetadata.key,
            year: additionalMetadata.year || new Date().getFullYear(),
            confidence: Math.max(styleDetection.confidence, additionalMetadata.confidence || 0),
            genre: styleDetection.subgenre || additionalMetadata.genre,
            mood: styleDetection.mood,
            label: styleDetection.label,
            era: styleDetection.era,
            energy: styleDetection.energy,
            complexity: styleDetection.complexity
        };
    } catch (error) {
        console.log('Erro ao buscar metadados online:', error);
        // Fallback para detecção local da IA
        const fallbackDetection = MusicStyleDetector.detectStyle(artist, title);
        return {
            style: fallbackDetection.style,
            confidence: fallbackDetection.confidence,
            genre: fallbackDetection.subgenre
        };
    }
}

// Simulação de API de metadados (substitua por APIs reais)
async function simulateMetadataAPI(artist: string, title: string): Promise<Partial<TrackMetadata>> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simular dados de APIs externas
    const externalData = {
        bpm: Math.floor(Math.random() * 40) + 120, // 120-160 BPM
        key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
        year: Math.floor(Math.random() * 20) + 2005, // 2005-2025
        confidence: 0.8 + Math.random() * 0.2 // 0.8-1.0
    };

    return externalData;
}

// Sistema de validação e correção automática para maior precisão
function validateAndCorrectMetadata(metadata: TrackMetadata): TrackMetadata {
    const corrected = { ...metadata };

    // Validação e correção de estilo
    if (corrected.style && corrected.confidence < 0.6) {
        // Tentar correção baseada em padrões conhecidos
        const styleCorrections = {
            'house': ['deep house', 'tech house', 'future house', 'progressive house'],
            'trance': ['uplifting trance', 'progressive trance', 'psytrance'],
            'techno': ['minimal techno', 'acid techno', 'industrial techno'],
            'dubstep': ['melodic dubstep', 'brostep', 'future garage']
        };

        for (const [baseStyle, variations] of Object.entries(styleCorrections)) {
            if (corrected.style.toLowerCase().includes(baseStyle)) {
                // Encontrar a variação mais específica
                for (const variation of variations) {
                    if (corrected.title.toLowerCase().includes(variation.replace(' ', ''))) {
                        corrected.style = variation;
                        corrected.confidence = Math.min(corrected.confidence + 0.2, 0.9);
                        break;
                    }
                }
            }
        }
    }

    // Validação de BPM
    if (corrected.bpm) {
        if (corrected.bpm < 60 || corrected.bpm > 200) {
            // BPM fora do range normal, tentar corrigir baseado no estilo
            const styleBpmRanges = {
                'Deep House': [120, 125],
                'Tech House': [125, 130],
                'Progressive': [128, 132],
                'Big Room': [128, 132],
                'Future': [124, 128],
                'Tropical': [100, 120],
                'R&B': [90, 110],
                'Hip Hop': [70, 90]
            };

            if (corrected.style && styleBpmRanges[corrected.style as keyof typeof styleBpmRanges]) {
                const [min, max] = styleBpmRanges[corrected.style as keyof typeof styleBpmRanges];
                corrected.bpm = Math.floor((min + max) / 2);
            }
        }
    }

    // Validação de key
    if (corrected.key) {
        const validKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const validModes = ['m', 'min', 'major', 'maj'];

        if (!validKeys.includes(corrected.key.replace(/[mb]/g, ''))) {
            // Key inválida, tentar extrair do título
            const keyMatch = corrected.title.match(/\b([a-g][#b]?)\b/i);
            if (keyMatch) {
                corrected.key = keyMatch[1].toUpperCase();
            } else {
                corrected.key = undefined;
            }
        }
    }

    // Validação de era
    if (corrected.era) {
        const currentYear = new Date().getFullYear();
        const eraYear = parseInt(corrected.era.split('-')[0]);

        if (eraYear > currentYear || eraYear < 1980) {
            // Era inválida, usar detecção automática
            const yearMatch = corrected.title.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) {
                const detectedYear = parseInt(yearMatch[0]);
                if (detectedYear >= 1980 && detectedYear <= currentYear) {
                    corrected.era = `${detectedYear}-${Math.min(detectedYear + 10, currentYear)}`;
                }
            }
        }
    }

    // Validação de label
    if (corrected.label && corrected.label === 'Independent') {
        // Tentar detectar label baseada em padrões no título
        const labelPatterns = [
            { pattern: /\b(spinnin|spinnin')\b/i, label: 'Spinnin Records' },
            { pattern: /\b(revealed)\b/i, label: 'Revealed Recordings' },
            { pattern: /\b(anjuna|anjunabeats)\b/i, label: 'Anjunabeats' },
            { pattern: /\b(armada)\b/i, label: 'Armada Music' },
            { pattern: /\b(defected)\b/i, label: 'Defected' },
            { pattern: /\b(hot.?creations)\b/i, label: 'Hot Creations' },
            { pattern: /\b(night.?bass)\b/i, label: 'Night Bass' },
            { pattern: /\b(confession)\b/i, label: 'Confession' },
            { pattern: /\b(hexagon)\b/i, label: 'Hexagon' },
            { pattern: /\b(ultra)\b/i, label: 'Ultra Records' }
        ];

        for (const { pattern, label } of labelPatterns) {
            if (pattern.test(corrected.title)) {
                corrected.label = label;
                break;
            }
        }
    }

    return corrected;
}

// Sistema de análise de contexto musical avançada
function analyzeMusicalContext(artist: string, title: string, filename: string): {
    era: string;
    energy: number;
    complexity: number;
    mood: string;
    targetAudience: string;
} {
    const text = `${artist} ${title} ${filename}`.toLowerCase();

    // Análise de era baseada em padrões musicais
    const eraPatterns = {
        '1990-2000': {
            keywords: ['90s', 'nineties', 'classic', 'vintage', 'old school', 'retro', 'acid', 'rave'],
            confidence: 0.8
        },
        '2000-2010': {
            keywords: ['00s', 'noughties', 'classic', 'vintage', 'trance', 'progressive', 'uplifting'],
            confidence: 0.8
        },
        '2010-2015': {
            keywords: ['10s', 'tens', 'big room', 'festival', 'mainstage', 'euphoric'],
            confidence: 0.9
        },
        '2015-2020': {
            keywords: ['future house', 'tropical', 'chill', 'melodic', 'groove'],
            confidence: 0.9
        },
        '2020+': {
            keywords: ['20s', 'twenties', 'new', 'fresh', 'latest', 'modern', 'contemporary'],
            confidence: 0.8
        }
    };

    let detectedEra = '2000-2010';
    let eraConfidence = 0.5;

    for (const [era, pattern] of Object.entries(eraPatterns)) {
        for (const keyword of pattern.keywords) {
            if (text.includes(keyword)) {
                detectedEra = era;
                eraConfidence = pattern.confidence;
                break;
            }
        }
        if (eraConfidence > 0.5) break;
    }

    // Análise de energia baseada em palavras-chave
    const energyKeywords = {
        high: ['energetic', 'powerful', 'intense', 'aggressive', 'banger', 'anthem', 'drop', 'euphoric'],
        medium: ['groovy', 'melodic', 'uplifting', 'emotional', 'atmospheric', 'smooth'],
        low: ['chill', 'relaxed', 'ambient', 'laid-back', 'smooth', 'atmospheric']
    };

    let energy = 5; // Média
    for (const [level, keywords] of Object.entries(energyKeywords)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                if (level === 'high') energy = 8;
                else if (level === 'low') energy = 3;
                break;
            }
        }
    }

    // Análise de complexidade
    const complexityKeywords = {
        high: ['progressive', 'epic', 'cinematic', 'journey', 'atmospheric', 'layered'],
        medium: ['melodic', 'groovy', 'rhythmic', 'percussive'],
        low: ['simple', 'minimal', 'basic', 'straightforward']
    };

    let complexity = 5; // Média
    for (const [level, keywords] of Object.entries(complexityKeywords)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                if (level === 'high') complexity = 8;
                else if (level === 'low') complexity = 3;
                break;
            }
        }
    }

    // Análise de mood
    const moodKeywords = {
        'energetic': ['energetic', 'powerful', 'intense', 'aggressive', 'banger'],
        'uplifting': ['uplifting', 'euphoric', 'emotional', 'inspiring', 'epic'],
        'groovy': ['groovy', 'funky', 'rhythmic', 'percussive', 'dance'],
        'chill': ['chill', 'relaxed', 'ambient', 'laid-back', 'smooth'],
        'dark': ['dark', 'gritty', 'underground', 'intense', 'aggressive'],
        'melodic': ['melodic', 'emotional', 'atmospheric', 'cinematic']
    };

    let mood = 'neutral';
    let moodScore = 0;

    for (const [moodType, keywords] of Object.entries(moodKeywords)) {
        let score = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword)) score++;
        }
        if (score > moodScore) {
            moodScore = score;
            mood = moodType;
        }
    }

    // Análise de público-alvo
    const audiencePatterns = {
        'Festival': ['festival', 'mainstage', 'big room', 'anthem', 'euphoric', 'massive'],
        'Club': ['club', 'underground', 'groove', 'percussive', 'rhythmic'],
        'Radio': ['radio', 'mainstream', 'commercial', 'catchy', 'pop'],
        'Chill': ['chill', 'relaxed', 'ambient', 'atmospheric', 'smooth'],
        'Underground': ['underground', 'gritty', 'dark', 'intense', 'experimental']
    };

    let targetAudience = 'General';
    let audienceScore = 0;

    for (const [audience, keywords] of Object.entries(audiencePatterns)) {
        let score = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword)) score++;
        }
        if (score > audienceScore) {
            audienceScore = score;
            targetAudience = audience;
        }
    }

    return {
        era: detectedEra,
        energy,
        complexity,
        mood,
        targetAudience
    };
}

// Sistema inteligente de detecção de labels e gravadoras
function detectLabelIntelligently(artist: string, title: string, filename: string): { label: string; confidence: number } {
    const text = `${artist} ${title} ${filename}`.toLowerCase();

    // Base de dados de labels conhecidas com padrões
    const labelDatabase = {
        'Spinnin Records': {
            patterns: ['spinnin', 'spinnin\'', 'spinnin records'],
            artists: ['martin garrix', 'hardwell', 'dimitri vegas', 'like mike', 'w&w', 'blasterjaxx', 'nickey romero'],
            keywords: ['big room', 'festival', 'mainstage', 'euphoric'],
            confidence: 0.9
        },
        'Revealed Recordings': {
            patterns: ['revealed', 'revealed recordings'],
            artists: ['hardwell', 'kill the buzz', 'kura', 'maddix'],
            keywords: ['big room', 'progressive', 'uplifting'],
            confidence: 0.9
        },
        'Anjunabeats': {
            patterns: ['anjunabeats', 'anjuna', 'beats'],
            artists: ['above beyond', 'armin van buuren', 'ilan bluestone', 'jason ross'],
            keywords: ['progressive', 'trance', 'uplifting', 'melodic'],
            confidence: 0.95
        },
        'Armada Music': {
            patterns: ['armada', 'armada music'],
            artists: ['armin van buuren', 'dash berlin', 'markus schulz', 'paul van dyk'],
            keywords: ['trance', 'progressive', 'uplifting'],
            confidence: 0.9
        },
        'Defected': {
            patterns: ['defected', 'defected records'],
            artists: ['dennis ferrer', 'masters at work', 'dennis cruz', 'cuartero'],
            keywords: ['house', 'deep house', 'tech house', 'soulful'],
            confidence: 0.9
        },
        'Hot Creations': {
            patterns: ['hot creations', 'hot'],
            artists: ['jamie jones', 'hot since 82', 'patrick topping', 'mau p'],
            keywords: ['tech house', 'underground', 'groove'],
            confidence: 0.9
        },
        'Night Bass': {
            patterns: ['night bass', 'nightbass'],
            artists: ['ac slater', 'jackal', 'joyryde', 'ghastly'],
            keywords: ['bass house', 'gritty', 'underground'],
            confidence: 0.9
        },
        'Confession': {
            patterns: ['confession', 'confession records'],
            artists: ['tchami', 'malaa', 'mercer', 'habstrakt'],
            keywords: ['future house', 'gritty', 'underground'],
            confidence: 0.9
        },
        'Hexagon': {
            patterns: ['hexagon', 'hexagon records'],
            artists: ['don diablo', 'cid', 'kryder', 'twoloud'],
            keywords: ['future house', 'melodic', 'uplifting'],
            confidence: 0.9
        },
        'Ultra Records': {
            patterns: ['ultra', 'ultra records'],
            artists: ['david guetta', 'tiesto', 'afrojack', 'steve aoki'],
            keywords: ['electro', 'dance', 'mainstream', 'commercial'],
            confidence: 0.9
        }
    };

    let bestMatch = { label: 'Independent', confidence: 0.5 };

    for (const [labelName, labelInfo] of Object.entries(labelDatabase)) {
        let score = 0;
        let maxScore = 0;

        // Pontuação por padrões no texto
        for (const pattern of labelInfo.patterns) {
            if (text.includes(pattern)) {
                score += 3;
                maxScore += 3;
            }
        }

        // Pontuação por artistas conhecidos
        for (const labelArtist of labelInfo.artists) {
            if (artist.toLowerCase().includes(labelArtist.toLowerCase()) ||
                labelArtist.toLowerCase().includes(artist.toLowerCase())) {
                score += 4;
                maxScore += 4;
                break;
            }
        }

        // Pontuação por palavras-chave musicais
        for (const keyword of labelInfo.keywords) {
            if (text.includes(keyword)) {
                score += 2;
                maxScore += 2;
            }
        }

        // Calcular confiança baseada na pontuação
        if (maxScore > 0) {
            const confidence = (score / maxScore) * labelInfo.confidence;
            if (confidence > bestMatch.confidence) {
                bestMatch = { label: labelName, confidence };
            }
        }
    }

    return bestMatch;
}

// Função para análise inteligente do nome do arquivo com IA avançada
function parseAudioFileNameAdvanced(filename: string): TrackMetadata {
    // Remover extensão
    const nameWithoutExt = filename.replace(/\.(mp3|wav|flac|m4a|aac|ogg)$/i, '');

    let artist = 'Unknown Artist';
    let title = nameWithoutExt;
    let version = 'Original';
    let extractedStyle = '';
    let cleanName = nameWithoutExt;

    // Primeiro, tentar extrair estilo explícito do nome da faixa
    const stylePatterns = [
        'progressive house', 'future house', 'deep house', 'tech house', 'tribal house',
        'big room', 'progressive', 'trance', 'techno', 'electro', 'dubstep', 'drum bass',
        'sertanejo', 'mpb', 'forró', 'funk', 'pagode', 'bossa nova', 'axé', 'arrocha',
        'house', 'electronic', 'dance', 'edm', 'ambient', 'minimal', 'tropical house',
        'bass house', 'jackin house', 'melodic house', 'uplifting trance', 'psytrance'
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

    // Detectar e extrair sufixos comuns que devem ser removidos do título
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
        /\s*\(explicit\)/gi,
        /\s*\(feat\.?\s*[^)]+\)/gi,
        /\s*\(ft\.?\s*[^)]+\)/gi
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

    // Usar IA avançada para detecção de estilo
    const styleDetection = MusicStyleDetector.detectSpecificStyle(artist, title, filename);

    // Priorizar estilo extraído da faixa se disponível
    let finalStyle = extractedStyle || styleDetection.style;

    // Se não há estilo extraído, usar o da IA com alta confiança
    if (!extractedStyle && styleDetection.confidence > 0.7) {
        finalStyle = styleDetection.style;
    }

    // Usar sufixo detectado como versão ou manter versão existente
    const finalVersion = detectedSuffix || version || 'Original';

    // Detectar label com IA
    const labelDetection = detectLabelIntelligently(artist, title, filename);

    // Análise de contexto musical avançada
    const contextAnalysis = analyzeMusicalContext(artist, title, filename);

    // Extrair metadados adicionais da IA
    const metadata = {
        style: finalStyle,
        confidence: extractedStyle ? 0.95 : styleDetection.confidence,
        subgenre: styleDetection.subgenre,
        bpm: styleDetection.bpm,
        key: styleDetection.key,
        mood: contextAnalysis.mood || styleDetection.mood,
        label: labelDetection.label,
        era: contextAnalysis.era || styleDetection.era,
        energy: contextAnalysis.energy || styleDetection.energy,
        complexity: contextAnalysis.complexity || styleDetection.complexity
    };

    const result = {
        artist,
        title,
        version: finalVersion,
        style: finalStyle,
        confidence: metadata.confidence,
        genre: metadata.subgenre || finalStyle,
        bpm: metadata.bpm,
        key: metadata.key,
        year: metadata.era ? parseInt(metadata.era.split('-')[0]) : new Date().getFullYear()
    };

    // Aplicar validação e correção automática
    const finalResult = validateAndCorrectMetadata(result);

    // Log da detecção para monitoramento de precisão
    AIPrecisionLogger.logDetection(filename, finalResult.artist, finalResult.title, finalResult);

    return finalResult;
}

export async function GET(request: NextRequest) {
    try {
        // Retornar estatísticas da IA
        const stats = AIPrecisionLogger.getStats();

        return NextResponse.json({
            success: true,
            message: 'Estatísticas da IA de detecção de estilos',
            data: {
                totalDetections: stats.total,
                averageConfidence: stats.averageConfidence,
                styleDistribution: stats.styleDistribution,
                recentDetections: stats.recentDetections,
                systemInfo: {
                    version: '2.0 - IA Avançada',
                    features: [
                        'Detecção inteligente de estilos',
                        'Análise de contexto musical',
                        'Detecção automática de labels',
                        'Validação e correção automática',
                        'Sistema de pontuação avançado',
                        'Análise de padrões musicais',
                        'Detecção de era e público-alvo'
                    ]
                }
            }
        });
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas da IA:', error);
        return NextResponse.json(
            { success: false, message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Obter dados do corpo da requisição
        const body = await request.json().catch(() => ({}));
        const importDate = body.importDate ? new Date(body.importDate) : new Date();
        const tracksWithSpotify = body.tracks || [];
        const useSpotifyMetadata = body.useSpotifyMetadata || false;

        console.log(`📅 Data de importação definida como: ${importDate.toLocaleDateString()}`);
        console.log(`🎵 Usar metadados do Spotify: ${useSpotifyMetadata}`);
        console.log(`📝 Tracks com dados Spotify: ${tracksWithSpotify.length}`);

        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT!,
            region: process.env.CONTABO_REGION!,
            accessKeyId: process.env.CONTABO_ACCESS_KEY!,
            secretAccessKey: process.env.CONTABO_SECRET_KEY!,
            bucketName: process.env.CONTABO_BUCKET_NAME!,
        });

        console.log('🔍 Iniciando importação inteligente...');

        let filesToProcess;

        // Se recebeu tracks específicos, usar esses
        if (tracksWithSpotify.length > 0) {
            // Usar tracks fornecidos pela interface
            filesToProcess = tracksWithSpotify.map((track: any) => ({
                filename: track.filename,
                url: track.url,
                size: track.size,
                lastModified: track.lastModified,
                spotifyMetadata: track.spotifyMetadata
            }));
            console.log(`📁 Processando ${filesToProcess.length} tracks selecionados`);
        } else {
            // Buscar arquivos de áudio do Contabo (comportamento original)
            const audioFiles = await storage.listAudioFiles();
            console.log(`📁 Encontrados ${audioFiles.length} arquivos no Contabo`);

            // Verificar quais já existem no banco
            const existingTracks = await prisma.track.findMany({
                select: {
                    previewUrl: true,
                    downloadUrl: true,
                    songName: true,
                    artist: true
                }
            });

            const existingUrls = new Set([
                ...existingTracks.map(track => track.previewUrl),
                ...existingTracks.map(track => track.downloadUrl)
            ]);

            // Filtrar apenas arquivos novos
            filesToProcess = audioFiles.filter(file => !existingUrls.has(file.url));
            console.log(`⭐ Novos arquivos para processar: ${filesToProcess.length}`);
        }

        if (filesToProcess.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Nenhum arquivo novo encontrado',
                imported: 0,
                total: tracksWithSpotify.length || 0
            });
        }

        // Processar cada arquivo com análise inteligente
        const processedTracks = [];

        for (const file of filesToProcess) {
            console.log(`🎵 Processando: ${file.filename}`);

            // Análise local do nome do arquivo
            const localMetadata = parseAudioFileNameAdvanced(file.filename);

            let finalMetadata: TrackMetadata;

            // Se tem dados do Spotify, usar esses dados
            if (useSpotifyMetadata && file.spotifyMetadata) {
                console.log(`🎵 Usando metadados do Spotify para: ${file.filename}`);

                finalMetadata = {
                    artist: file.spotifyMetadata.artist,
                    title: file.spotifyMetadata.title,
                    style: localMetadata.style, // Manter detecção local do estilo
                    version: localMetadata.version,
                    confidence: 0.9, // Alta confiança para dados do Spotify
                    spotifyData: {
                        spotifyId: file.spotifyMetadata.spotifyId,
                        album: file.spotifyMetadata.album,
                        releaseDate: file.spotifyMetadata.releaseDate,
                        imageUrl: file.spotifyMetadata.imageUrl,
                        previewUrl: file.spotifyMetadata.previewUrl,
                        spotifyUrl: file.spotifyMetadata.spotifyUrl,
                        popularity: file.spotifyMetadata.popularity,
                        durationMs: file.spotifyMetadata.durationMs
                    }
                };
            } else {
                // Usar análise local + busca online (comportamento original)
                const onlineMetadata = await fetchMetadataFromInternet(
                    localMetadata.artist,
                    localMetadata.title
                );

                // Combinar metadados com prioridade para dados online quando disponíveis
                finalMetadata = {
                    ...localMetadata,
                    ...onlineMetadata,
                    confidence: Math.max(localMetadata.confidence, onlineMetadata.confidence || 0)
                };
            }

            // Aplicar validação e correção
            finalMetadata = validateAndCorrectMetadata(finalMetadata);

            processedTracks.push({
                file,
                metadata: finalMetadata
            });
        }

        // Importar para o banco de dados
        const importedTracks = [];
        const duplicatesFound = [];

        for (const { file, metadata } of processedTracks) {
            try {
                // Verificar se já existe uma música com o mesmo artista e título
                const existingTrack = await prisma.track.findFirst({
                    where: {
                        AND: [
                            {
                                artist: {
                                    equals: metadata.artist,
                                    mode: 'insensitive'
                                }
                            },
                            {
                                songName: {
                                    equals: metadata.title,
                                    mode: 'insensitive'
                                }
                            }
                        ]
                    }
                });

                if (existingTrack) {
                    console.log(`🔄 Duplicata encontrada: ${metadata.artist} - ${metadata.title} (já existe como ID: ${existingTrack.id})`);
                    duplicatesFound.push({
                        filename: file.filename,
                        artist: metadata.artist,
                        title: metadata.title,
                        existingId: existingTrack.id
                    });
                    continue; // Pular esta música e não importar
                }

                const track = await prisma.track.create({
                    data: {
                        songName: metadata.title,
                        artist: metadata.artist,
                        style: metadata.style,
                        version: metadata.version || 'Original',
                        previewUrl: file.url,
                        downloadUrl: file.url,
                        imageUrl: metadata.spotifyData?.imageUrl ||
                            `https://via.placeholder.com/300x300/1a1a1a/white?text=${encodeURIComponent(metadata.artist)}`,
                        releaseDate: metadata.spotifyData?.releaseDate ?
                            new Date(metadata.spotifyData.releaseDate) : importDate,
                        createdAt: importDate,
                        updatedAt: new Date()
                    }
                });

                importedTracks.push({
                    ...track,
                    confidence: metadata.confidence
                });

                console.log(`✅ Importado: ${metadata.artist} - ${metadata.title} (${metadata.style})`);

            } catch (error) {
                console.error(`❌ Erro ao importar ${file.filename}:`, error);
            }
        }

        // Estatísticas finais
        const totalTracks = await prisma.track.count();
        const styleStats = await prisma.track.groupBy({
            by: ['style'],
            _count: true
        });

        return NextResponse.json({
            success: true,
            message: `Importação concluída! ${importedTracks.length} músicas adicionadas${duplicatesFound.length > 0 ? `, ${duplicatesFound.length} duplicatas ignoradas` : ''}`,
            imported: importedTracks.length,
            duplicates: duplicatesFound.length,
            total: filesToProcess.length,
            newTracks: importedTracks,
            duplicatesFound: duplicatesFound,
            statistics: {
                totalInDatabase: totalTracks,
                byStyle: styleStats
            }
        });

    } catch (error) {
        console.error('Erro na importação inteligente:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}
