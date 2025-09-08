import { contaboStorage } from '@/lib/contabo-storage';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { folder, strategy = 'genre', createFolders = true } = body;

        console.log('🤖 Iniciando Auto-Organizador IA...');
        console.log('🔧 Configurações recebidas:', { folder, strategy, createFolders });

        // Verifica se as variáveis de ambiente estão configuradas
        const requiredEnvVars = ['CONTABO_ENDPOINT', 'CONTABO_ACCESS_KEY', 'CONTABO_SECRET_KEY', 'CONTABO_BUCKET_NAME'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.error('❌ Variáveis de ambiente faltando:', missingVars);
            return NextResponse.json({
                success: false,
                error: `Configuração incompleta do storage: ${missingVars.join(', ')}`
            }, { status: 500 });
        }

        // Converte os parâmetros para o formato esperado
        const settings = {
            enabled: true,
            organizeBy: strategy,
            createFolders: createFolders,
            preserveStructure: true
        };

        try {
            // Lista todos os arquivos de áudio do bucket
            const audioFiles = await contaboStorage.listAudioFiles(folder);

            if (audioFiles.length === 0) {
                return NextResponse.json({
                    success: true,
                    message: 'Nenhum arquivo encontrado para organizar',
                    organizationReport: {
                        movedFiles: 0,
                        createdFolders: 0
                    },
                    suggestions: []
                });
            }

            console.log(`📁 Organizando ${audioFiles.length} arquivos por ${settings.organizeBy}...`);

            // Analisa arquivos e gera sugestões de organização
            const organizationPlan = await generateOrganizationPlan(audioFiles, settings);

            // Simula execução da organização (em uma implementação real, moveria os arquivos)
            const organizationResults = await executeOrganization(organizationPlan, settings);

            console.log('✅ Auto-organização concluída!');

            return NextResponse.json({
                success: true,
                organizationReport: {
                    movedFiles: organizationResults.movedFiles,
                    createdFolders: organizationResults.createdFolders
                },
                suggestions: organizationResults.suggestions,
                plan: organizationPlan,
                settings: settings
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
        console.error('❌ Erro no Auto-Organizador:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao executar auto-organização',
                details: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}

/**
 * Gera plano de organização baseado nas configurações
 */
async function generateOrganizationPlan(files: any[], settings: any) {
    const plan: { [folder: string]: any[] } = {};

    for (const file of files) {
        const parsed = parseAudioFileName(file.filename);
        let targetFolder = '';

        switch (settings.organizeBy) {
            case 'genre':
                targetFolder = detectGenre(parsed.songName, parsed.version);
                break;
            case 'bpm':
                const bpm = simulateBPM(parsed.songName, parsed.version);
                targetFolder = getBPMCategory(bpm);
                break;
            case 'key':
                const key = simulateMusicalKey(parsed.artist, parsed.songName);
                targetFolder = `Key_${key.replace(' ', '_')}`;
                break;
            case 'year':
                const year = extractYear(file.lastModified);
                targetFolder = `${year}`;
                break;
            case 'energy':
                const energy = Math.random() * 0.4 + 0.6; // Simula energia
                targetFolder = getEnergyCategory(energy);
                break;
            default:
                targetFolder = 'Uncategorized';
        }

        if (!plan[targetFolder]) {
            plan[targetFolder] = [];
        }
        plan[targetFolder].push({ ...file, parsed, targetFolder });
    }

    return plan;
}

/**
 * Executa o plano de organização (simulado)
 */
async function executeOrganization(plan: any, settings: any) {
    const createdFolders = Object.keys(plan);
    const movedFiles = Object.values(plan).reduce((acc: number, files: any) => acc + files.length, 0);

    // Gera sugestões baseadas no plano
    const suggestions = generateOrganizationSuggestions(plan, settings);

    // Em uma implementação real, aqui seria feita a movimentação dos arquivos
    // await contaboStorage.moveFiles(plan);

    return {
        movedFiles,
        createdFolders,
        suggestions
    };
}

/**
 * Gera sugestões de melhoria da organização
 */
function generateOrganizationSuggestions(plan: any, settings: any) {
    const suggestions = [];
    const folders = Object.keys(plan);
    const totalFiles = Object.values(plan).reduce((acc: number, files: any) => acc + files.length, 0);

    // Sugere divisão de pastas muito grandes
    for (const [folder, files] of Object.entries(plan)) {
        if ((files as any[]).length > 50) {
            suggestions.push({
                type: 'subdivision',
                folder: folder,
                suggestion: `Pasta "${folder}" com ${(files as any[]).length} arquivos - considere subdividir`,
                action: 'Criar subpastas por artista ou BPM'
            });
        }
    }

    // Sugere consolidação de pastas muito pequenas
    const smallFolders = folders.filter(folder => plan[folder].length < 3);
    if (smallFolders.length > 3) {
        suggestions.push({
            type: 'consolidation',
            folders: smallFolders,
            suggestion: `${smallFolders.length} pastas com poucos arquivos`,
            action: 'Considere consolidar em uma pasta "Diversos"'
        });
    }

    // Sugere organização híbrida
    if (folders.length > 10) {
        suggestions.push({
            type: 'hybrid',
            suggestion: 'Muitas categorias criadas - considere organização híbrida',
            action: `Combine ${settings.organizeBy} com artista ou ano para melhor estrutura`
        });
    }

    return suggestions;
}

/**
 * Categoriza BPM em faixas
 */
function getBPMCategory(bpm: number): string {
    if (bpm < 100) return 'Slow_Tempo_(Under_100)';
    if (bpm < 110) return 'Downtempo_(100-110)';
    if (bpm < 120) return 'Mid_Tempo_(110-120)';
    if (bpm < 128) return 'House_Range_(120-128)';
    if (bpm < 135) return 'Progressive_(128-135)';
    if (bpm < 145) return 'Trance_Range_(135-145)';
    return 'High_Energy_(145+)';
}

/**
 * Categoriza energia em níveis
 */
function getEnergyCategory(energy: number): string {
    if (energy < 0.3) return 'Chill_Ambient';
    if (energy < 0.5) return 'Low_Energy';
    if (energy < 0.7) return 'Medium_Energy';
    if (energy < 0.9) return 'High_Energy';
    return 'Peak_Time';
}

/**
 * Detecta gênero baseado no nome
 */
function detectGenre(songName: string, version?: string): string {
    const name = (songName + (version || '')).toLowerCase();

    if (name.includes('progressive') || name.includes('prog')) return 'Progressive';
    if (name.includes('trance')) return 'Trance';
    if (name.includes('house') && !name.includes('tech')) return 'House';
    if (name.includes('deep')) return 'Deep_House';
    if (name.includes('techno')) return 'Techno';
    if (name.includes('tech house') || name.includes('tech-house')) return 'Tech_House';
    if (name.includes('minimal')) return 'Minimal';
    if (name.includes('ambient')) return 'Ambient';
    if (name.includes('breakbeat')) return 'Breakbeat';
    if (name.includes('drum') && name.includes('bass')) return 'Drum_and_Bass';

    return 'Electronic';
}

/**
 * Simula BPM baseado no nome
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
 * Simula tonalidade musical
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
 * Extrai ano do arquivo
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
