import { contaboStorage } from '@/lib/contabo-storage';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { folder, enableDeepLearning, analyzeMetadata, detectSimilarity } = body;

        console.log('🧠 Iniciando Smart Analysis Engine...');
        console.log('🔧 Configurações recebidas:', { folder, enableDeepLearning, analyzeMetadata, detectSimilarity });

        // Verifica se as variáveis de ambiente estão configuradas
        const requiredEnvVars = ['CONTABO_ENDPOINT', 'CONTABO_ACCESS_KEY_ID', 'CONTABO_SECRET_ACCESS_KEY', 'CONTABO_BUCKET_NAME'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.error('❌ Variáveis de ambiente faltando:', missingVars);
            return NextResponse.json({
                success: false,
                error: `Configuração incompleta do storage: ${missingVars.join(', ')}`
            }, { status: 500 });
        }

        try {
            // Lista todos os arquivos de áudio do bucket (com filtro de pasta opcional)
            const audioFiles = await contaboStorage.listAudioFiles(folder);

            if (audioFiles.length === 0) {
                return NextResponse.json({
                    success: true,
                    message: 'Nenhum arquivo de áudio encontrado para análise',
                    analysis: getEmptyAnalysis(),
                    recommendations: []
                });
            }

            console.log(`🔍 Analisando ${audioFiles.length} arquivos de áudio...`);

            // Executa análise inteligente em todos os arquivos
            const analysisResults = await Promise.all(
                audioFiles.map(file => analyzeAudioFile(file, { enableDeepLearning, analyzeMetadata, detectSimilarity }))
            );

            // Compila estatísticas agregadas
            const aggregatedAnalysis = compileAggregatedAnalysis(analysisResults, audioFiles);

            // Gera recomendações baseadas na análise completa
            const recommendations = generateSmartRecommendations(aggregatedAnalysis, analysisResults);

            console.log('✅ Smart Analysis concluída!');

            return NextResponse.json({
                success: true,
                analysis: aggregatedAnalysis,
                recommendations,
                totalFiles: audioFiles.length,
                analyzedFiles: analysisResults.length
            });
        } catch (storageError) {
            console.error('❌ Erro ao acessar storage:', storageError);
            return NextResponse.json({
                success: false,
                error: 'Erro ao acessar o storage do Contabo',
                details: storageError instanceof Error ? storageError.message : 'Erro desconhecido'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ Erro no Smart Analysis Engine:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao executar análise inteligente',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}

/**
 * Analisa um arquivo de áudio individual
 */
async function analyzeAudioFile(file: any, options: any) {
    const parsed = parseAudioFileName(file.filename);

    // Simula análise avançada baseada nos parâmetros
    const analysis = {
        file,
        parsed,
        bpm: simulateBPM(parsed.songName, parsed.version),
        key: simulateMusicalKey(parsed.artist, parsed.songName),
        energy: Math.random() * 0.4 + 0.6, // 0.6 - 1.0
        danceability: Math.random() * 0.3 + 0.7, // 0.7 - 1.0
        valence: Math.random() * 0.5 + 0.5, // 0.5 - 1.0
        loudness: Math.random() * 10 - 5, // -5 to 5 dB
        genre: detectGenre(parsed.songName, parsed.version),
        quality: determineQuality(file.size),
        qualityScore: Math.random() * 0.3 + 0.7, // 0.7 - 1.0
        duration: Math.random() * 180 + 180, // 3-6 minutes
        year: extractYear(file.lastModified),
        bitrate: Math.floor(Math.random() * 64) + 192, // 192-256 kbps
    };

    return analysis;
}

/**
 * Compila análise agregada de todos os arquivos
 */
function compileAggregatedAnalysis(results: any[], audioFiles: any[]) {
    const totalFiles = audioFiles.length;
    const audioFilesCount = results.length;

    // Calcula distribuição de gêneros
    const genreDistribution: { [key: string]: number } = {};
    results.forEach(result => {
        const genre = result.genre;
        genreDistribution[genre] = (genreDistribution[genre] || 0) + 1;
    });

    // Calcula faixa de BPM
    const bpms = results.map(r => r.bpm).filter(Boolean);
    const bpmRange = bpms.length > 0 ? {
        min: Math.min(...bpms),
        max: Math.max(...bpms),
        avg: Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length)
    } : { min: 0, max: 0, avg: 0 };

    // Calcula qualidade média
    const qualityScores = results.map(r => r.qualityScore).filter(Boolean);
    const averageQuality = qualityScores.length > 0
        ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
        : 0;

    // Identifica arquivos de baixa qualidade
    const lowQualityFiles = results.filter(r => r.qualityScore < 0.6);

    // Calcula energia média
    const energyScores = results.map(r => r.energy).filter(Boolean);
    const averageEnergy = energyScores.length > 0
        ? energyScores.reduce((a, b) => a + b, 0) / energyScores.length
        : 0;

    return {
        totalFiles,
        audioFiles: audioFilesCount,
        genreDistribution,
        bpmRange,
        averageQuality,
        averageEnergy,
        lowQualityFiles,
        analyzedAt: new Date().toISOString()
    };
}

/**
 * Gera recomendações inteligentes baseadas na análise
 */
function generateSmartRecommendations(analysis: any, results: any[]) {
    const recommendations = [];

    // Recomendação de organização por gênero
    if (Object.keys(analysis.genreDistribution).length > 3) {
        recommendations.push({
            type: 'organization',
            confidence: 0.9,
            suggestion: 'Organizar biblioteca por gêneros',
            reason: `Detectados ${Object.keys(analysis.genreDistribution).length} gêneros diferentes - organização melhoraria a navegação`
        });
    }

    // Recomendação de qualidade
    if (analysis.lowQualityFiles.length > 0) {
        recommendations.push({
            type: 'quality',
            confidence: 0.85,
            suggestion: `Melhorar qualidade de ${analysis.lowQualityFiles.length} arquivos`,
            reason: 'Arquivos com baixa qualidade podem afetar a experiência de audição'
        });
    }

    // Recomendação de BPM
    if (analysis.bpmRange.max - analysis.bpmRange.min > 50) {
        recommendations.push({
            type: 'bpm',
            confidence: 0.8,
            suggestion: 'Criar playlists por faixas de BPM',
            reason: `Grande variação de BPM (${analysis.bpmRange.min}-${analysis.bpmRange.max}) ideal para diferentes momentos`
        });
    }

    // Recomendação de energia
    if (analysis.averageEnergy > 0.8) {
        recommendations.push({
            type: 'energy',
            confidence: 0.9,
            suggestion: 'Biblioteca ideal para peak time',
            reason: 'Alta energia média detectada - perfeito para momentos de clímax'
        });
    } else if (analysis.averageEnergy < 0.6) {
        recommendations.push({
            type: 'energy',
            confidence: 0.85,
            suggestion: 'Adicionar tracks de alta energia',
            reason: 'Energia média baixa - considere adicionar tracks mais energéticos'
        });
    }

    // Recomendação de diversidade
    const topGenre = Object.entries(analysis.genreDistribution)
        .sort(([, a], [, b]) => (b as number) - (a as number))[0];

    if (topGenre && (topGenre[1] as number) > analysis.audioFiles * 0.7) {
        recommendations.push({
            type: 'diversity',
            confidence: 0.75,
            suggestion: 'Adicionar mais variedade de gêneros',
            reason: `${topGenre[0]} representa ${Math.round(((topGenre[1] as number) / analysis.audioFiles) * 100)}% da biblioteca`
        });
    }

    return recommendations;
}

/**
 * Retorna análise vazia para casos sem arquivos
 */
function getEmptyAnalysis() {
    return {
        totalFiles: 0,
        audioFiles: 0,
        genreDistribution: {},
        bpmRange: { min: 0, max: 0, avg: 0 },
        averageQuality: 0,
        averageEnergy: 0,
        lowQualityFiles: [],
        analyzedAt: new Date().toISOString()
    };
}

/**
 * Simula detecção de BPM baseado no nome
 */
function simulateBPM(songName: string, version?: string): number {
    const name = (songName + (version || '')).toLowerCase();

    if (name.includes('progressive') || name.includes('prog')) {
        return Math.floor(Math.random() * 8) + 128; // 128-135 BPM
    } else if (name.includes('trance')) {
        return Math.floor(Math.random() * 10) + 132; // 132-142 BPM
    } else if (name.includes('house') || name.includes('deep')) {
        return Math.floor(Math.random() * 8) + 120; // 120-128 BPM
    } else if (name.includes('techno')) {
        return Math.floor(Math.random() * 10) + 125; // 125-135 BPM
    } else {
        return Math.floor(Math.random() * 20) + 120; // 120-140 BPM
    }
}

/**
 * Simula detecção de tonalidade musical
 */
function simulateMusicalKey(artist: string, songName: string): string {
    const keys = [
        'C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'B Major',
        'F# Major', 'C# Major', 'F Major', 'Bb Major', 'Eb Major', 'Ab Major',
        'A Minor', 'E Minor', 'B Minor', 'F# Minor', 'C# Minor', 'G# Minor',
        'D# Minor', 'A# Minor', 'D Minor', 'G Minor', 'C Minor', 'F Minor'
    ];

    const hash = (artist + songName).length;
    return keys[hash % keys.length];
}

/**
 * Detecta gênero baseado no nome
 */
function detectGenre(songName: string, version?: string): string {
    const name = (songName + (version || '')).toLowerCase();

    if (name.includes('progressive') || name.includes('prog')) return 'Progressive';
    if (name.includes('trance')) return 'Trance';
    if (name.includes('house')) return 'House';
    if (name.includes('deep')) return 'Deep House';
    if (name.includes('techno')) return 'Techno';
    if (name.includes('tech house') || name.includes('tech-house')) return 'Tech House';
    if (name.includes('minimal')) return 'Minimal';
    if (name.includes('ambient')) return 'Ambient';

    return 'Electronic';
}

/**
 * Determina qualidade baseada no tamanho do arquivo
 */
function determineQuality(fileSize: number): 'low' | 'medium' | 'high' | 'lossless' {
    const sizeMB = fileSize / (1024 * 1024);

    if (sizeMB > 50) return 'lossless';
    if (sizeMB > 15) return 'high';
    if (sizeMB > 8) return 'medium';
    return 'low';
}

/**
 * Extrai ano do arquivo (usa data de modificação como fallback)
 */
function extractYear(lastModified: string): number {
    return new Date(lastModified).getFullYear();
}

/**
 * Parse do nome do arquivo de áudio
 */
function parseAudioFileName(filename: string) {
    const nameWithoutExt = filename.replace(/\.(mp3|wav|flac|aac|ogg)$/i, '');
    const match = nameWithoutExt.match(/^(.+?)\s*-\s*(.+?)(?:\s*\(([^)]+)\))?$/);

    if (match) {
        const [, artist, songName, version] = match;
        return {
            artist: artist.trim(),
            songName: songName.trim(),
            version: version ? version.trim() : undefined
        };
    }

    return {
        artist: 'Unknown Artist',
        songName: nameWithoutExt,
        version: undefined
    };
}
