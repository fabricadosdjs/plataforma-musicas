// Sistema inteligente de detecção de estilos musicais com IA avançada
export interface StyleDetectionResult {
    style: string;
    confidence: number;
    subgenre?: string;
    bpm?: number;
    key?: string;
    mood?: string;
    label?: string;
    era?: string;
    energy?: number;
    complexity?: number;
}

// Export all style names for use in dropdowns, etc.
export function getAllStyleNames(): string[] {
    return Object.keys(MusicStyleDetector["stylePatterns"]);
}

export class MusicStyleDetector {
    private static readonly stylePatterns: Record<string, {
        keywords: string[];
        artists: string[];
        bpmRange: [number, number];
        patterns: RegExp;
        energy: number;
        complexity: number;
        era: string[];
        labels: string[];
        subgenres: string[];
        mood: string[];
    }> = {
            // Big Room House e Festival
            'Big Room': {
                keywords: ['big room', 'festival', 'mainstage', 'drop', 'anthem', 'massive', 'stadium', 'euphoric', 'uplifting', 'mainstream'],
                artists: ['martin garrix', 'hardwell', 'dimitri vegas', 'like mike', 'w&w', 'blasterjaxx', 'mattn', 'martin solveig', 'nickey romero', 'bassjackers'],
                bpmRange: [128, 132],
                patterns: /\b(big.?room|festival|mainstage|anthem|massive|stadium|euphoric|uplifting)\b/i,
                energy: 9,
                complexity: 7,
                era: ['2010-2015', '2015-2020', '2020+'],
                labels: ['spinnin records', 'revealed recordings', 'musical freedom', 'armada music'],
                subgenres: ['Festival House', 'Mainstage', 'Euphoric House'],
                mood: ['energetic', 'uplifting', 'euphoric', 'powerful']
            },
            'Future': {
                keywords: ['future house', 'future', 'groove', 'funky', 'deep', 'underground', 'jackin', 'bassline', 'melodic'],
                artists: ['tchami', 'oliver heldens', 'don diablo', 'noel holler', 'brooks', 'curbi', 'marten hørger', 'mike williams', 'julian jordan'],
                bpmRange: [124, 128],
                patterns: /\b(future.?house|future|groove|funky|jackin|bassline|melodic)\b/i,
                energy: 8,
                complexity: 8,
                era: ['2014-2018', '2018-2022', '2022+'],
                labels: ['spinnin records', 'future house music', 'hexagon', 'musical freedom'],
                subgenres: ['Jackin House', 'Melodic House', 'Bassline House'],
                mood: ['groovy', 'funky', 'melodic', 'sophisticated']
            },
            'Progressive': {
                keywords: ['progressive', 'melodic', 'epic', 'uplifting', 'emotional', 'cinematic', 'atmospheric', 'journey', 'build'],
                artists: ['deadmau5', 'eric prydz', 'above beyond', 'armin', 'lane 8', 'yotto', 'marnage', 'rahul', 'solarstone', 'john o\'callaghan'],
                bpmRange: [128, 132],
                patterns: /\b(progressive|melodic|epic|uplifting|cinematic|atmospheric|journey|build)\b/i,
                energy: 7,
                complexity: 9,
                era: ['2000-2010', '2010-2020', '2020+'],
                labels: ['anjunabeats', 'armada music', 'black hole recordings', 'perfecto records'],
                subgenres: ['Melodic Progressive', 'Uplifting Progressive', 'Atmospheric Progressive'],
                mood: ['emotional', 'uplifting', 'atmospheric', 'journey-like']
            },
            'Tech House': {
                keywords: ['tech house', 'tech', 'minimal', 'groove', 'underground', 'club', 'percussive', 'rhythmic', 'tribal'],
                artists: ['carl cox', 'jamie jones', 'hot since 82', 'fisher', 'patrick topping', 'mau p', 'dennis cruz', 'cuartero', 'latmun'],
                bpmRange: [125, 130],
                patterns: /\b(tech.?house|tech|minimal|groove|underground|percussive|rhythmic|tribal)\b/i,
                energy: 8,
                complexity: 8,
                era: ['2000-2010', '2010-2020', '2020+'],
                labels: ['hot creations', 'drumcode', 'truesoul', 'defected'],
                subgenres: ['Minimal Tech House', 'Tribal Tech House', 'Groovy Tech House'],
                mood: ['groovy', 'rhythmic', 'underground', 'club-ready']
            },
            'Deep House': {
                keywords: ['deep', 'soulful', 'underground', 'jazzy', 'warm', 'smooth', 'atmospheric', 'chill', 'laid-back'],
                artists: ['kerri chandler', 'maya jane coles', 'disclosure', 'duke dumont', 'lane 8', 'ben bohmer', 'nora en pure', 'kaskade'],
                bpmRange: [120, 125],
                patterns: /\b(deep|soulful|underground|jazzy|smooth|atmospheric|chill|laid-back)\b/i,
                energy: 6,
                complexity: 7,
                era: ['1990-2000', '2000-2010', '2010-2020', '2020+'],
                labels: ['defected', 'strictly rhythm', 'nervous records', 'anjunadeep'],
                subgenres: ['Soulful Deep House', 'Atmospheric Deep House', 'Jazzy Deep House'],
                mood: ['smooth', 'atmospheric', 'chill', 'soulful']
            },
            'Electro': {
                keywords: ['electro', 'dirty', 'aggressive', 'energy', 'club', 'banger', 'hard', 'powerful', 'intense'],
                artists: ['david guetta', 'tiesto', 'afrojack', 'steve aoki', 'diplo', 'skrillex', 'knife party', 'zomboy'],
                bpmRange: [128, 132],
                patterns: /\b(electro|dirty|aggressive|banger|hard|powerful|intense)\b/i,
                energy: 9,
                complexity: 6,
                era: ['2000-2010', '2010-2015', '2015-2020'],
                labels: ['spinnin records', 'musical freedom', 'big beat records', 'ultra records'],
                subgenres: ['Dirty Electro', 'Hard Electro', 'Club Electro'],
                mood: ['aggressive', 'energetic', 'powerful', 'intense']
            },
            'Bass House': {
                keywords: ['bass house', 'bass', 'wobbly', 'heavy', 'underground', 'dirty', 'gritty', 'dark', 'intense'],
                artists: ['ac slater', 'jauz', 'ephwurd', 'malaa', 'confession', 'joyryde', 'habstrakt', 'ghastly'],
                bpmRange: [125, 130],
                patterns: /\b(bass.?house|wobbly|heavy.?bass|gritty|dark|intense)\b/i,
                energy: 9,
                complexity: 7,
                era: ['2015-2020', '2020+'],
                labels: ['night bass', 'confession', 'dirtybird', 'circus records'],
                subgenres: ['Wobbly Bass House', 'Dark Bass House', 'Gritty Bass House'],
                mood: ['dark', 'intense', 'gritty', 'underground']
            },
            'R&B': {
                keywords: ['rnb', 'r&b', 'soul', 'smooth', 'vocal', 'urban', 'neo soul', 'contemporary', 'smooth'],
                artists: ['masego', 'mary j blige', 'mary j.', 'émilie rachel', 'martina budde', 'sza', 'summer walker', 'h.e.r.'],
                bpmRange: [90, 110],
                patterns: /\b(rnb|r.?b|soul|smooth|urban|neo.?soul|contemporary)\b/i,
                energy: 5,
                complexity: 6,
                era: ['1990-2000', '2000-2010', '2010-2020', '2020+'],
                labels: ['def jam', 'bad boy records', 'roc-a-fella', 'top dawg entertainment'],
                subgenres: ['Contemporary R&B', 'Neo Soul', 'Alternative R&B'],
                mood: ['smooth', 'soulful', 'emotional', 'laid-back']
            },
            'Hip Hop': {
                keywords: ['hip hop', 'rap', 'urban', 'trap', 'street', 'work that', 'club', 'beats', 'flow'],
                artists: ['mary j blige', 'mavado', 'mary j.', 'drake', 'kendrick lamar', 'j. cole', 'travis scott'],
                bpmRange: [70, 90],
                patterns: /\b(hip.?hop|rap|urban|street|work.?that|beats|flow)\b/i,
                energy: 7,
                complexity: 8,
                era: ['1990-2000', '2000-2010', '2010-2020', '2020+'],
                labels: ['def jam', 'bad boy records', 'roc-a-fella', 'top dawg entertainment'],
                subgenres: ['Trap', 'Conscious Hip Hop', 'Alternative Hip Hop'],
                mood: ['street', 'urban', 'confident', 'powerful']
            },
            'Dance': {
                keywords: ['dance', 'pop', 'radio', 'mainstream', 'vocal', 'commercial', 'hello', 'club', 'catchy'],
                artists: ['calvin harris', 'david guetta', 'the chainsmokers', 'martin solveig', 'zedd', 'marshmello', 'avicii'],
                bpmRange: [128, 132],
                patterns: /\b(dance|pop|radio|mainstream|commercial|hello|catchy)\b/i,
                energy: 8,
                complexity: 5,
                era: ['2000-2010', '2010-2020', '2020+'],
                labels: ['spinnin records', 'ultra records', 'big beat records', 'columbia records'],
                subgenres: ['Pop Dance', 'Commercial Dance', 'Vocal Dance'],
                mood: ['catchy', 'energetic', 'mainstream', 'uplifting']
            },
            'Club': {
                keywords: ['club', 'dance', 'floor', 'party', 'night', 'energy', 'banger', 'floor-filler'],
                artists: ['matonik', 'mashbit', 'alto moon', 'david guetta', 'tiesto', 'afrojack'],
                bpmRange: [125, 130],
                patterns: /\b(club|dance|floor|party|night|banger|floor-filler)\b/i,
                energy: 9,
                complexity: 6,
                era: ['2000-2010', '2010-2020', '2020+'],
                labels: ['spinnin records', 'musical freedom', 'ultra records'],
                subgenres: ['Club Bangers', 'Floor Fillers', 'Party Anthems'],
                mood: ['energetic', 'party', 'club-ready', 'floor-filling']
            },
            'Tropical': {
                keywords: ['tropical', 'summer', 'chill', 'relaxed', 'island', 'beach', 'felicidad', 'breeze', 'calm'],
                artists: ['kygo', 'thomas jack', 'matoma', 'klingande', 'robin schulz', 'martina budde', 'sam feldt'],
                bpmRange: [100, 120],
                patterns: /\b(tropical|summer|chill|relaxed|island|beach|breeze|calm)\b/i,
                energy: 5,
                complexity: 6,
                era: ['2014-2018', '2018-2022', '2022+'],
                labels: ['ultra records', 'spinnin records', 'sony music'],
                subgenres: ['Tropical House', 'Summer Vibes', 'Chill Tropical'],
                mood: ['chill', 'relaxed', 'summer', 'tropical']
            }
        };

    // Sistema de pontuação inteligente para detecção de estilos
    private static calculateStyleScore(
        artist: string,
        title: string,
        filename: string,
        style: string
    ): number {
        const pattern = this.stylePatterns[style];
        if (!pattern) return 0;

        let score = 0;
        const text = `${artist} ${title} ${filename}`.toLowerCase();

        // Pontuação por palavras-chave (peso: 3)
        for (const keyword of pattern.keywords) {
            if (text.includes(keyword.toLowerCase())) {
                score += 3;
            }
        }

        // Pontuação por artista (peso: 5)
        for (const styleArtist of pattern.artists) {
            if (artist.toLowerCase().includes(styleArtist.toLowerCase()) ||
                styleArtist.toLowerCase().includes(artist.toLowerCase())) {
                score += 5;
                break;
            }
        }

        // Pontuação por padrões regex (peso: 4)
        if (pattern.patterns.test(text)) {
            score += 4;
        }

        // Pontuação por contexto musical
        const musicalContext = this.analyzeMusicalContext(text);
        if (musicalContext.style === style) {
            score += 2;
        }

        // Pontuação por era e labels
        const metadata = this.extractMetadata(artist, title, filename);
        if (pattern.era.some(era => metadata.era?.includes(era))) {
            score += 1;
        }
        if (pattern.labels.some(label => metadata.label?.toLowerCase().includes(label.toLowerCase()))) {
            score += 2;
        }

        return score;
    }

    // Análise de contexto musical avançada
    private static analyzeMusicalContext(text: string): { style: string; confidence: number } {
        const contextPatterns = {
            'Electronic': /\b(electronic|edm|dance|club|house|techno|trance|dubstep)\b/i,
            'Urban': /\b(hip.?hop|rap|rnb|r&b|trap|urban|street)\b/i,
            'Pop': /\b(pop|mainstream|radio|commercial|catchy|melodic)\b/i,
            'Rock': /\b(rock|guitar|band|live|acoustic|electric)\b/i,
            'Latin': /\b(latin|reggaeton|salsa|merengue|bachata|tropical)\b/i
        };

        for (const [style, pattern] of Object.entries(contextPatterns)) {
            if (pattern.test(text)) {
                return { style, confidence: 0.8 };
            }
        }

        return { style: 'Electronic', confidence: 0.5 };
    }

    // Extração de metadados avançada
    private static extractMetadata(artist: string, title: string, filename: string): {
        era?: string;
        label?: string;
        bpm?: number;
        key?: string;
    } {
        const text = `${artist} ${title} ${filename}`.toLowerCase();

        // Detecção de era
        const eraPatterns = {
            '1990-2000': /\b(90s|nineties|classic|vintage|old.?school)\b/i,
            '2000-2010': /\b(00s|noughties|classic|vintage)\b/i,
            '2010-2020': /\b(10s|tens|modern|contemporary)\b/i,
            '2020+': /\b(20s|twenties|new|fresh|latest)\b/i
        };

        let detectedEra: string | undefined;
        for (const [era, pattern] of Object.entries(eraPatterns)) {
            if (pattern.test(text)) {
                detectedEra = era;
                break;
            }
        }

        // Detecção de labels/gravadoras
        const labelPatterns = [
            'spinnin records', 'revealed recordings', 'musical freedom', 'armada music',
            'anjunabeats', 'defected', 'hot creations', 'night bass', 'confession',
            'ultra records', 'columbia records', 'def jam', 'bad boy records'
        ];

        let detectedLabel: string | undefined;
        for (const label of labelPatterns) {
            if (text.includes(label.toLowerCase())) {
                detectedLabel = label;
                break;
            }
        }

        // Detecção de BPM e Key (se disponível no nome)
        const bpmMatch = text.match(/\b(\d{2,3})\s*bpm\b/i);
        const keyMatch = text.match(/\b([a-g][#b]?m?)\b/i);

        return {
            era: detectedEra,
            label: detectedLabel,
            bpm: bpmMatch ? parseInt(bpmMatch[1]) : undefined,
            key: keyMatch ? keyMatch[1].toUpperCase() : undefined
        };
    }

    // Detecção principal com IA avançada
    static detectStyle(artist: string, title: string, filename?: string): StyleDetectionResult {
        const fullText = `${artist} ${title} ${filename || ''}`.toLowerCase();

        // Sistema de pontuação para cada estilo
        const styleScores: Array<{ style: string; score: number }> = [];

        for (const style of Object.keys(this.stylePatterns)) {
            const score = this.calculateStyleScore(artist, title, filename || '', style);
            if (score > 0) {
                styleScores.push({ style, score });
            }
        }

        // Ordenar por pontuação
        styleScores.sort((a, b) => b.score - a.score);

        if (styleScores.length === 0) {
            // Fallback para análise de contexto
            const context = this.analyzeMusicalContext(fullText);
            return {
                style: context.style,
                confidence: context.confidence,
                subgenre: 'General',
                mood: 'Neutral'
            };
        }

        const topStyle = styleScores[0];
        const pattern = this.stylePatterns[topStyle.style];

        // Calcular confiança baseada na pontuação
        const maxPossibleScore = 15; // Pontuação máxima teórica
        const confidence = Math.min(topStyle.score / maxPossibleScore, 1.0);

        // Detectar subgênero baseado na pontuação
        let subgenre = pattern.subgenres[0];
        if (styleScores.length > 1) {
            const secondStyle = styleScores[1];
            if (secondStyle.score > topStyle.score * 0.7) {
                subgenre = `${topStyle.style} / ${secondStyle.style}`;
            }
        }

        // Extrair metadados adicionais
        const metadata = this.extractMetadata(artist, title, filename || '');

        return {
            style: topStyle.style,
            confidence: confidence,
            subgenre: subgenre,
            bpm: metadata.bpm || pattern.bpmRange[0],
            key: metadata.key,
            mood: pattern.mood[0],
            label: metadata.label,
            era: metadata.era,
            energy: pattern.energy,
            complexity: pattern.complexity
        };
    }

    // Detecção de estilo específico com alta precisão
    static detectSpecificStyle(artist: string, title: string, filename?: string): StyleDetectionResult {
        const result = this.detectStyle(artist, title, filename);

        // Aplicar regras específicas para maior precisão
        if (result.confidence < 0.6) {
            // Análise mais profunda para casos de baixa confiança
            const deepAnalysis = this.performDeepAnalysis(artist, title, filename);
            if (deepAnalysis.confidence > result.confidence) {
                return deepAnalysis;
            }
        }

        return result;
    }

    // Análise profunda para casos complexos
    private static performDeepAnalysis(artist: string, title: string, filename?: string): StyleDetectionResult {
        const text = `${artist} ${title} ${filename || ''}`.toLowerCase();

        // Análise de padrões musicais específicos
        const musicalPatterns = {
            'Progressive': /\b(build|drop|breakdown|uplift|journey|epic)\b/i,
            'Tech House': /\b(percussion|rhythm|groove|tribal|minimal)\b/i,
            'Deep House': /\b(soul|jazz|atmospheric|warm|smooth)\b/i,
            'Future': /\b(jackin|bassline|melodic|groove|funky)\b/i
        };

        for (const [style, pattern] of Object.entries(musicalPatterns)) {
            if (pattern.test(text)) {
                return {
                    style: style,
                    confidence: 0.75,
                    subgenre: `${style} (Deep Analysis)`,
                    mood: 'Sophisticated'
                };
            }
        }

        // Fallback para análise de contexto
        return this.detectStyle(artist, title, filename);
    }
}
