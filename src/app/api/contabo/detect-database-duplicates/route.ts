// API para detectar arquivos no storage que já existem no banco de dados
import { ContaboStorage } from '@/lib/contabo-storage';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface DatabaseDuplicate {
    storageFile: {
        key: string;
        url: string;
        size: number;
        lastModified: string;
        filename: string;
    };
    databaseTrack: {
        id: number;
        songName: string;
        artist: string;
        downloadUrl: string | null;
        previewUrl: string | null;
    };
    matchType: 'url' | 'name' | 'both';
    similarity: number;
}

// Função para normalizar nomes de tracks para comparação
function normalizeTrackName(artist: string, songName: string, version?: string): string {
    const cleanText = (text: string) => text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const parts = [cleanText(artist), cleanText(songName)];
    if (version) {
        parts.push(cleanText(version));
    }

    return parts.join(' | ');
}

// Função para calcular similaridade entre strings
function calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

// Função para extrair informações do nome do arquivo
function parseAudioFileName(filename: string): { artist: string; songName: string; version?: string } {
    const nameWithoutExt = filename.replace(/\.(mp3|wav|flac|m4a|aac|ogg)$/i, '');

    // Padrões comuns: "Artist - Song", "Artist - Song (Version)", etc.
    const patterns = [
        /^(.+?)\s*-\s*(.+?)(?:\s*\((.+?)\))?$/,
        /^(.+?)\s*_\s*(.+?)(?:\s*\((.+?)\))?$/,
        /^(.+?)\.(.+?)(?:\s*\((.+?)\))?$/
    ];

    for (const pattern of patterns) {
        const match = nameWithoutExt.match(pattern);
        if (match) {
            return {
                artist: match[1]?.trim() || 'Unknown Artist',
                songName: match[2]?.trim() || 'Unknown Song',
                version: match[3]?.trim()
            };
        }
    }

    // Se não conseguir parsear, usa o nome completo como songName
    return {
        artist: 'Unknown Artist',
        songName: nameWithoutExt.trim() || 'Unknown Song'
    };
}

export async function POST(request: NextRequest) {
    try {
        const { similarityThreshold = 0.8 } = await request.json();

        console.log('🔍 Iniciando detecção de duplicatas no banco de dados...');
        console.log(`📊 Limite de similaridade: ${similarityThreshold}`);

        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT!,
            region: process.env.CONTABO_REGION!,
            accessKeyId: process.env.CONTABO_ACCESS_KEY!,
            secretAccessKey: process.env.CONTABO_SECRET_KEY!,
            bucketName: process.env.CONTABO_BUCKET_NAME!,
        });

        // Buscar todos os arquivos de áudio do storage
        const storageFiles = await storage.listAudioFiles();
        console.log(`📁 Encontrados ${storageFiles.length} arquivos no storage`);

        // Buscar todas as tracks do banco de dados
        const databaseTracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                artist: true,
                version: true,
                downloadUrl: true,
                previewUrl: true
            }
        });
        console.log(`🗄️ Encontradas ${databaseTracks.length} tracks no banco de dados`);

        // Criar índices para busca rápida
        const urlIndex = new Set([
            ...databaseTracks.map((track: any) => track.downloadUrl),
            ...databaseTracks.map((track: any) => track.previewUrl)
        ]);

        const nameIndex = new Map<string, any[]>();
        databaseTracks.forEach((track: any) => {
            const normalizedName = normalizeTrackName(
                track.artist || '',
                track.songName || '',
                track.version || undefined
            );

            if (!nameIndex.has(normalizedName)) {
                nameIndex.set(normalizedName, []);
            }
            nameIndex.get(normalizedName)!.push(track);
        });

        // Detectar duplicatas
        const duplicates: DatabaseDuplicate[] = [];
        let exactUrlMatches = 0;
        let nameMatches = 0;
        let similarityMatches = 0;

        for (const storageFile of storageFiles) {
            let matchFound = false;

            // 1. Verificar correspondência exata por URL
            if (urlIndex.has(storageFile.url)) {
                const dbTrack = databaseTracks.find(
                    track => track.downloadUrl === storageFile.url || track.previewUrl === storageFile.url
                );

                if (dbTrack) {
                    duplicates.push({
                        storageFile: {
                            ...storageFile,
                            lastModified: storageFile.lastModified instanceof Date
                                ? storageFile.lastModified.toISOString()
                                : String(storageFile.lastModified)
                        },
                        databaseTrack: dbTrack,
                        matchType: 'url',
                        similarity: 1.0
                    });
                    exactUrlMatches++;
                    matchFound = true;
                    continue;
                }
            }

            // 2. Verificar correspondência por nome normalizado
            const parsed = parseAudioFileName(storageFile.filename);
            const storageNormalizedName = normalizeTrackName(
                parsed.artist,
                parsed.songName,
                parsed.version
            );

            if (nameIndex.has(storageNormalizedName)) {
                const matchingTracks = nameIndex.get(storageNormalizedName)!;
                duplicates.push({
                    storageFile: {
                        ...storageFile,
                        lastModified: storageFile.lastModified instanceof Date
                            ? storageFile.lastModified.toISOString()
                            : String(storageFile.lastModified)
                    },
                    databaseTrack: matchingTracks[0], // Pega o primeiro match
                    matchType: 'name',
                    similarity: 1.0
                });
                nameMatches++;
                matchFound = true;
                continue;
            }

            // 3. Verificar similaridade por nome (mais lento, mas mais preciso)
            if (!matchFound) {
                let bestMatch: any = null;
                let bestSimilarity = 0;

                for (const dbTrack of databaseTracks) {
                    const dbNormalizedName = normalizeTrackName(
                        dbTrack.artist || '',
                        dbTrack.songName || '',
                        dbTrack.version || undefined
                    );

                    const similarity = calculateSimilarity(storageNormalizedName, dbNormalizedName);

                    if (similarity >= similarityThreshold && similarity > bestSimilarity) {
                        bestMatch = dbTrack;
                        bestSimilarity = similarity;
                    }
                }

                if (bestMatch) {
                    duplicates.push({
                        storageFile: {
                            ...storageFile,
                            lastModified: storageFile.lastModified instanceof Date
                                ? storageFile.lastModified.toISOString()
                                : String(storageFile.lastModified)
                        },
                        databaseTrack: bestMatch,
                        matchType: 'name',
                        similarity: bestSimilarity
                    });
                    similarityMatches++;
                }
            }
        }

        console.log(`🎯 Resultados da detecção:`);
        console.log(`   📍 Matches exatos por URL: ${exactUrlMatches}`);
        console.log(`   📝 Matches por nome: ${nameMatches}`);
        console.log(`   🔍 Matches por similaridade: ${similarityMatches}`);
        console.log(`   📊 Total de duplicatas: ${duplicates.length}`);

        // Calcular estatísticas
        const totalStorageSize = duplicates.reduce((sum, dup: any) => sum + dup.storageFile.size, 0);

        const result = {
            success: true,
            totalStorageFiles: storageFiles.length,
            totalDatabaseTracks: databaseTracks.length,
            duplicatesFound: duplicates.length,
            duplicates,
            statistics: {
                exactUrlMatches,
                nameMatches,
                similarityMatches,
                totalSize: totalStorageSize,
                averageSimilarity: duplicates.length > 0
                    ? duplicates.reduce((sum, dup: any) => sum + dup.similarity, 0) / duplicates.length
                    : 0
            }
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('❌ Erro ao detectar duplicatas do banco:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro ao detectar duplicatas do banco de dados',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}

