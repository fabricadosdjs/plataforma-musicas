import { contaboStorage } from '@/lib/contabo-storage';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface ImportTrackData {
    songName: string;
    artist: string;
    style: string;
    version?: string;
    imageUrl: string;
    previewUrl: string;
    downloadUrl: string;
    releaseDate: Date | string;
    pool?: string; // Gravadora / pool
    bitrate?: number; // Bitrate em kbps
    // Metadados de IA opcionais
    aiStyle?: string;
    aiLabel?: string;
    aiConfidence?: number;
    aiCoverImage?: string;
    aiSource?: string;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const audioOnly = searchParams.get('audioOnly') !== 'false'; // Default true
        const prefix = searchParams.get('prefix') || undefined;

        console.log('🎵 Analisando arquivos para importação automática...');

        // Lista apenas arquivos de áudio do bucket
        const audioFiles = await contaboStorage.listAudioFiles(prefix);

        if (audioFiles.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Nenhum arquivo de áudio encontrado no bucket',
                files: [],
                importable: []
            });
        }

        console.log(`🔍 ${audioFiles.length} arquivos de áudio encontrados`);

        // Busca músicas já existentes no banco
        const existingTracks = await prisma.track.findMany({
            select: {
                downloadUrl: true,
                previewUrl: true,
                songName: true,
                artist: true,
                version: true
            }
        });

        // Mapeia URLs existentes para verificação rápida
        const existingUrls = new Set([
            ...existingTracks.map((t: any) => t.downloadUrl),
            ...existingTracks.map((t: any) => t.previewUrl)
        ]);

        // Cria índice para busca por nome normalizado
        const tracksByNormalizedName = new Set();
        existingTracks.forEach(track => {
            const normalizedKey = normalizeTrackName(track.artist || '', track.songName || '', track.version || undefined);
            tracksByNormalizedName.add(normalizedKey);
        });

        // Filtra arquivos que ainda não estão no banco (comparação por URL e nome)
        const importableFiles = audioFiles.filter(file => {
            // Primeiro verifica por URL exata
            if (existingUrls.has(file.url)) {
                return false;
            }

            // Depois verifica por nome normalizado
            const parsed = parseAudioFileName(file.filename);
            const normalizedKey = normalizeTrackName(parsed.artist, parsed.songName, parsed.version || undefined);
            return !tracksByNormalizedName.has(normalizedKey);
        });

        // Processa informações dos arquivos para importação
        const processedFiles = importableFiles.map(file => {
            const parsed = parseAudioFileName(file.filename);
            // Nome completo do arquivo sem extensão
            const fullName = file.filename.replace(/\.[^/.]+$/, '');
            return {
                file,
                parsed,
                importData: {
                    songName: parsed.songName,
                    artist: parsed.artist,
                    style: parsed.style || 'Electronic',
                    version: parsed.version,
                    imageUrl: generatePlaceholderImage(parsed.artist, parsed.songName),
                    previewUrl: file.url,
                    downloadUrl: file.url,
                    releaseDate: file.lastModified,
                }
            };
        });

        console.log(`✅ ${importableFiles.length} arquivos prontos para importação`);

        return NextResponse.json({
            success: true,
            totalFiles: audioFiles.length,
            existingInDatabase: audioFiles.length - importableFiles.length,
            importableCount: importableFiles.length,
            files: processedFiles
        });

    } catch (error) {
        console.error('❌ Erro ao analisar arquivos:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao analisar arquivos para importação',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { files, autoParseNames = true, aiConfidenceThreshold = 0.55 } = body;

        if (!Array.isArray(files) || files.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Lista de arquivos é obrigatória' },
                { status: 400 }
            );
        }

        console.log(`🎵 Iniciando importação de ${files.length} músicas do Contabo Storage...`);

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        for (const fileData of files) {
            try {
                const rawImportData: any = fileData.importData || fileData;

                // Mescla dados detectados de IA (se enviados no payload) dentro da estrutura
                // Frontend pode enviar detectedData: { style, label, confidence, coverImage, source }
                const detected = fileData.detectedData || rawImportData.detectedData || {};

                const importData: ImportTrackData = {
                    songName: rawImportData.songName,
                    artist: rawImportData.artist,
                    style: rawImportData.style,
                    version: rawImportData.version,
                    imageUrl: rawImportData.imageUrl,
                    previewUrl: rawImportData.previewUrl,
                    downloadUrl: rawImportData.downloadUrl,
                    releaseDate: rawImportData.releaseDate,
                    pool: rawImportData.pool,
                    aiStyle: detected.style || rawImportData.aiStyle,
                    aiLabel: detected.label || rawImportData.aiLabel,
                    aiConfidence: typeof detected.confidence === 'number' ? detected.confidence : rawImportData.aiConfidence,
                    aiCoverImage: detected.coverImage || rawImportData.aiCoverImage,
                    aiSource: detected.source || rawImportData.aiSource
                };

                // Validação básica
                if (!importData.songName || !importData.artist) {
                    results.failed++;
                    results.errors.push(`Arquivo ${fileData.file?.filename || 'desconhecido'}: Nome da música e artista são obrigatórios`);
                    continue;
                }

                // Verifica se já existe uma música com a mesma URL
                const existingTrack = await prisma.track.findFirst({
                    where: {
                        OR: [
                            { downloadUrl: importData.downloadUrl },
                            { previewUrl: importData.previewUrl }
                        ]
                    }
                });

                if (existingTrack) {
                    results.failed++;
                    results.errors.push(`Música "${importData.songName}" já existe no banco de dados`);
                    continue;
                }

                // Decide estilo e pool finais usando IA quando apropriado

                // Prioriza sempre o estilo detectado pela IA se existir e confiança >= threshold
                let finalStyle = importData.aiStyle && (importData.aiConfidence ?? 0) >= aiConfidenceThreshold
                    ? importData.aiStyle.trim()
                    : (importData.style ? importData.style.trim() : 'Electronic');

                let finalPool = importData.pool || 'Nexor Records';
                let finalImage = importData.imageUrl;

                if ((importData.aiConfidence ?? 0) >= aiConfidenceThreshold) {
                    if (importData.aiLabel) {
                        finalPool = importData.aiLabel;
                    }
                    if (importData.aiCoverImage && !isPlaceholderCover(finalImage)) {
                        finalImage = importData.aiCoverImage;
                    } else if (importData.aiCoverImage && isPlaceholderCover(finalImage)) {
                        finalImage = importData.aiCoverImage;
                    }
                } else if (!finalPool && importData.aiLabel) {
                    finalPool = importData.aiLabel;
                }

                finalPool = finalPool.trim();

                // Cria a música no banco
                const newTrack = await prisma.track.create({
                    data: {
                        songName: importData.songName.trim(),
                        artist: importData.artist.trim(),
                        style: finalStyle || 'Electronic',
                        version: importData.version || null,
                        pool: finalPool || 'Nexor Records',
                        bitrate: importData.bitrate || null,
                        imageUrl: finalImage,
                        previewUrl: importData.previewUrl,
                        downloadUrl: importData.downloadUrl,
                        releaseDate: new Date(importData.releaseDate),
                        // Campos extras poderiam ser salvos em futura migração (ex: aiConfidence)
                    }
                });

                results.success++;
                console.log(`✅ Música importada: ${newTrack.songName} - ${newTrack.artist} | Style: ${newTrack.style} | Pool: ${newTrack.pool} | Bitrate: ${newTrack.bitrate || 'N/A'} kbps`);

            } catch (error) {
                results.failed++;
                const errorMsg = `Erro ao importar ${fileData.file?.filename || 'arquivo'}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
                results.errors.push(errorMsg);
                console.error(errorMsg);
            }
        }

        console.log(`🎯 Importação concluída: ${results.success} sucessos, ${results.failed} falhas`);

        return NextResponse.json({
            success: true,
            message: `Importação concluída: ${results.success} músicas adicionadas, ${results.failed} falhas`,
            results
        });

    } catch (error) {
        console.error('❌ Erro na importação:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro durante a importação',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}

/**
 * Faz parsing inteligente do nome do arquivo de áudio
 * Formatos suportados:
 * - "Artist - Song Name.mp3"
 * - "Artist - Song Name (Version).mp3"
 * - "Artist - Song Name [Style].mp3"
 * - "Song Name.mp3" (sem artista)
 */
function parseAudioFileName(filename: string) {
    // Remove extensão
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Extrair variação (CLEAN, DIRTY, EXPLICIT, etc) ao final
    let variation = null;
    let name = nameWithoutExt;
    const variationMatch = name.match(/\((CLEAN|DIRTY|EXPLICIT|INSTRUMENTAL|RADIO EDIT|CLUB MIX)\)$/i);
    if (variationMatch) {
        variation = variationMatch[1].toUpperCase();
        name = name.replace(/\s*\((CLEAN|DIRTY|EXPLICIT|INSTRUMENTAL|RADIO EDIT|CLUB MIX)\)$/i, '').trim();
    }

    // Padrões comuns de nomenclatura
    const patterns = [
        // "Artist - Song Name (Version) [Style] [Style2] ..."
        /^(.+?)\s*-\s*(.+)$/,
        // "Song Name (Version)"
        /^(.+?)\s*(?:\(([^)]+)\))?$/
    ];

    for (const pattern of patterns) {
        const match = name.match(pattern);
        if (match) {
            if (match[2]) {
                // Tem artista - tudo após o primeiro "-" é o nome da música
                const songName = match[2].trim();
                return {
                    artist: match[1].trim(),
                    songName: songName,
                    version: variation,
                    style: null,
                    variation
                };
            } else {
                // Só tem nome da música
                const songName = match[1].trim();
                return {
                    artist: 'Artista Desconhecido',
                    songName: songName,
                    version: variation,
                    style: null,
                    variation
                };
            }
        }
    }

    // Fallback: usa o nome do arquivo como nome da música
    return {
        artist: 'Artista Desconhecido',
        songName: name,
        version: null,
        style: null,
        variation
    };
}

/**
 * Gera uma imagem placeholder para a música
 */
function generatePlaceholderImage(artist: string, songName: string): string {
    // Retorna a capa padrão da Nexor Records
    return 'https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png';
}

// Detecta se a imagem é um placeholder padrão conhecido
function isPlaceholderCover(url: string | undefined): boolean {
    if (!url) return true;
    return url.includes('via.placeholder.com') || url.includes('i.ibb.co/yB0w9yFx');
}

/**
 * Normaliza nome de track para comparação de duplicatas
 */
function normalizeTrackName(artist: string, songName: string, version?: string): string {
    // Normaliza strings para comparação (remove acentos, converte para minúsculo, remove caracteres especiais)
    const normalize = (str: string) => {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
            .replace(/\s+/g, ' ') // Normaliza espaços
            .trim();
    };

    const normalizedArtist = normalize(artist);
    const normalizedSong = normalize(songName);
    const normalizedVersion = version ? normalize(version) : '';

    return `${normalizedArtist}|${normalizedSong}|${normalizedVersion}`;
}
