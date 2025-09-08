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

        // Define pasta problemática para debug
        const problematicFolder = 'albuns/Plus Soda Music/Ibiza Sessions 2025';

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

        // Busca músicas já existentes no banco com mais campos para comparação
        const existingTracks = await prisma.track.findMany({
            select: {
                id: true,
                downloadUrl: true,
                previewUrl: true,
                songName: true,
                artist: true,
                version: true,
                filename: true
            }
        });

        console.log(`🔍 DEBUG: Encontrados ${existingTracks.length} tracks no banco de dados`);

        // Log de alguns exemplos para debug
        if (existingTracks.length > 0) {
            console.log(`🔍 DEBUG: Primeiros 3 tracks no banco:`, existingTracks.slice(0, 3).map((t: any) => ({
                id: t.id,
                artist: t.artist,
                songName: t.songName,
                filename: t.filename,
                hasFilename: !!t.filename
            })));
        }

        console.log(`📊 ${existingTracks.length} músicas já existem no banco de dados`);

        // Mapeia URLs existentes para verificação rápida
        const existingUrls = new Set([
            ...existingTracks.map((t: any) => t.downloadUrl),
            ...existingTracks.map((t: any) => t.previewUrl)
        ]);

        // Cria índice para busca por nome normalizado
        const tracksByNormalizedName = new Set();
        existingTracks.forEach((track: any) => {
            const normalizedKey = normalizeTrackName(track.artist || '', track.songName || '', track.version || undefined);
            tracksByNormalizedName.add(normalizedKey);
        });

        // Cria índice para busca por nome de arquivo
        const existingFilenames = new Set(
            existingTracks
                .map((t: any) => t.filename)
                .filter(Boolean)
                .map((filename: any) => filename.toLowerCase())
        );

        // Cria índice para busca por artista + música (sem versão)
        const tracksByArtistSong = new Set();
        existingTracks.forEach((track: any) => {
            const key = `${track.artist?.toLowerCase().trim()}|${track.songName?.toLowerCase().trim()}`;
            tracksByArtistSong.add(key);
        });

        console.log(`🔍 DEBUG: Índices criados:`);
        console.log(`  - URLs únicas: ${existingUrls.size}`);
        console.log(`  - Filenames únicos: ${existingFilenames.size}`);
        console.log(`  - Nomes normalizados únicos: ${tracksByNormalizedName.size}`);
        console.log(`  - Artista+Música únicos: ${tracksByArtistSong.size}`);

        // Filtra arquivos que ainda não estão no banco (comparação por URL, nome e filename)
        const importableFiles = audioFiles.filter((file: any) => {
            console.log(`🔍 Verificando arquivo: ${file.filename}`);

            // 1. Verifica por URL exata (mais confiável)
            if (existingUrls.has(file.url)) {
                console.log(`🚫 Arquivo já existe por URL: ${file.filename}`);
                return false;
            }

            // 2. Verifica por nome de arquivo exato
            if (existingFilenames.has(file.filename.toLowerCase())) {
                console.log(`🚫 Arquivo já existe por nome: ${file.filename}`);
                return false;
            }

            // 3. Verifica por nome normalizado (artista + música + versão)
            const parsed = parseAudioFileName(file.filename);
            const normalizedKey = normalizeTrackName(parsed.artist, parsed.songName, parsed.version || undefined);

            if (tracksByNormalizedName.has(normalizedKey)) {
                console.log(`🚫 Arquivo já existe por nome normalizado: ${file.filename} -> ${normalizedKey}`);
                return false;
            }

            // 4. Verifica por artista + música (sem versão) - mais flexível
            const artistSongKey = `${parsed.artist.toLowerCase().trim()}|${parsed.songName.toLowerCase().trim()}`;
            if (tracksByArtistSong.has(artistSongKey)) {
                console.log(`🚫 Arquivo já existe por artista+música: ${file.filename} -> ${artistSongKey}`);
                return false;
            }

            console.log(`✅ Arquivo disponível para importação: ${file.filename}`);
            return true;
        });

        // Logs de debug para entender o que está acontecendo
        console.log(`🔍 DEBUG: ${existingTracks.length} tracks no banco`);
        console.log(`🔍 DEBUG: ${existingFilenames.size} filenames únicos no banco`);
        console.log(`🔍 DEBUG: ${tracksByNormalizedName.size} nomes normalizados únicos no banco`);
        console.log(`🔍 DEBUG: ${audioFiles.length} arquivos no storage`);
        console.log(`🔍 DEBUG: ${importableFiles.length} arquivos para importar`);

        // Log de alguns exemplos para debug
        if (existingTracks.length > 0) {
            console.log(`🔍 DEBUG: Exemplo de track no banco:`, {
                artist: existingTracks[0].artist,
                songName: existingTracks[0].songName,
                filename: existingTracks[0].filename,
                downloadUrl: existingTracks[0].downloadUrl?.substring(0, 100) + '...'
            });
        }

        if (audioFiles.length > 0) {
            console.log(`🔍 DEBUG: Exemplo de arquivo no storage:`, {
                filename: audioFiles[0].filename,
                url: audioFiles[0].url.substring(0, 100) + '...'
            });
        }

        // Log detalhado de comparação
        console.log(`🔍 DEBUG: Comparando arquivos do storage com tracks do banco:`);
        audioFiles.slice(0, 10).forEach((file: any, index: any) => {
            const parsed = parseAudioFileName(file.filename);
            const normalizedKey = normalizeTrackName(parsed.artist, parsed.songName, parsed.version || undefined);
            const artistSongKey = `${parsed.artist.toLowerCase().trim()}|${parsed.songName.toLowerCase().trim()}`;

            console.log(`  ${index + 1}. ${file.filename}:`);
            console.log(`     URL no storage: ${file.url.substring(0, 80)}...`);
            console.log(`     Parsed: ${parsed.artist} - ${parsed.songName} (${parsed.version || 'sem versão'})`);
            console.log(`     Normalized: ${normalizedKey}`);
            console.log(`     Artist+Song: ${artistSongKey}`);
            console.log(`     Existe por URL: ${existingUrls.has(file.url)}`);
            console.log(`     Existe por filename: ${existingFilenames.has(file.filename.toLowerCase())}`);
            console.log(`     Existe por nome normalizado: ${tracksByNormalizedName.has(normalizedKey)}`);
            console.log(`     Existe por artista+música: ${tracksByArtistSong.has(artistSongKey)}`);
        });

        // Log específico para a pasta problemática
        const problematicFiles = audioFiles.filter((file: any) => file.key.startsWith(problematicFolder));
        const problematicTracks = existingTracks.filter((track: any) =>
            track.filename && track.filename.startsWith(problematicFolder)
        );

        if (problematicFiles.length > 0) {
            console.log(`🔍 DEBUG ESPECÍFICO - Pasta: ${problematicFolder}`);
            console.log(`  Arquivos no storage: ${problematicFiles.length}`);
            console.log(`  Tracks no banco: ${problematicTracks.length}`);

            console.log(`  Primeiros 5 arquivos no storage:`);
            problematicFiles.slice(0, 5).forEach((file: any, index: any) => {
                console.log(`    ${index + 1}. ${file.filename} (${file.key})`);
            });

            console.log(`  Primeiros 5 tracks no banco:`);
            problematicTracks.slice(0, 5).forEach((track: any, index: any) => {
                console.log(`    ${index + 1}. ${track.filename} | ${track.artist} - ${track.songName}`);
            });

            // Verifica correspondência
            problematicFiles.forEach((file: any) => {
                const parsed = parseAudioFileName(file.filename);
                const artistSongKey = `${parsed.artist.toLowerCase().trim()}|${parsed.songName.toLowerCase().trim()}`;

                const matchingTrack = problematicTracks.find((track: any) => {
                    const trackKey = `${track.artist?.toLowerCase().trim()}|${track.songName?.toLowerCase().trim()}`;
                    return trackKey === artistSongKey;
                });

                if (matchingTrack) {
                    console.log(`    ✅ ${file.filename} <-> ${matchingTrack.filename}`);
                } else {
                    console.log(`    ❌ ${file.filename} - NÃO ENCONTRADO NO BANCO`);
                }
            });
        }

        // Processa informações dos arquivos para importação
        const processedFiles = await Promise.all(importableFiles.map(async (file: any) => {
            const parsed = parseAudioFileName(file.filename);
            // Nome completo do arquivo sem extensão
            const fullName = file.filename.replace(/\.[^/.]+$/, '');

            // Gerar URL assinada para acesso seguro
            const signedUrl = await contaboStorage.getSecureUrl(file.key, 3600); // 1 hora de validade

            return {
                file: {
                    ...file,
                    url: signedUrl // Substitui a URL pública pela URL assinada
                },
                parsed,
                importData: {
                    songName: parsed.songName,
                    artist: parsed.artist,
                    style: parsed.style || 'Electronic',
                    version: parsed.version,
                    imageUrl: generatePlaceholderImage(parsed.artist, parsed.songName),
                    previewUrl: signedUrl,
                    downloadUrl: signedUrl,
                    releaseDate: file.lastModified,
                }
            };
        }));

        console.log(`✅ ${importableFiles.length} arquivos prontos para importação`);
        console.log(`📊 Resumo: ${audioFiles.length} total, ${audioFiles.length - importableFiles.length} já existem, ${importableFiles.length} para importar`);

        // Validação final dos dados
        const finalStats = {
            totalFiles: audioFiles.length,
            existingInDatabase: audioFiles.length - importableFiles.length,
            importableCount: importableFiles.length,
            processedFilesCount: processedFiles.length
        };

        console.log(`🔍 VALIDAÇÃO FINAL:`);
        console.log(`  Total no storage: ${finalStats.totalFiles}`);
        console.log(`  Detectados como existentes: ${finalStats.existingInDatabase}`);
        console.log(`  Para importar: ${finalStats.importableCount}`);
        console.log(`  Arquivos processados: ${finalStats.processedFilesCount}`);
        console.log(`  Diferença: ${finalStats.totalFiles - finalStats.existingInDatabase - finalStats.importableCount}`);

        if (finalStats.totalFiles !== finalStats.existingInDatabase + finalStats.importableCount) {
            console.warn(`⚠️ ATENÇÃO: Soma não confere! ${finalStats.totalFiles} ≠ ${finalStats.existingInDatabase} + ${finalStats.importableCount}`);
        }

        // Validação específica para pasta problemática
        const problematicFilesInStorage = audioFiles.filter((file: any) => file.key.startsWith(problematicFolder));
        const problematicTracksInDB = existingTracks.filter((track: any) =>
            track.filename && track.filename.startsWith(problematicFolder)
        );

        console.log(`🔍 VALIDAÇÃO ESPECÍFICA - Pasta: ${problematicFolder}`);
        console.log(`  Arquivos no storage: ${problematicFilesInStorage.length}`);
        console.log(`  Tracks no banco: ${problematicTracksInDB.length}`);
        console.log(`  Arquivos para importar (calculado): ${importableFiles.filter((file: any) => file.key.startsWith(problematicFolder)).length}`);

        if (problematicFilesInStorage.length !== problematicTracksInDB.length) {
            console.warn(`⚠️ PROBLEMA DETECTADO: Pasta ${problematicFolder} tem ${problematicFilesInStorage.length} no storage mas ${problematicTracksInDB.length} no banco!`);
        }

        return NextResponse.json({
            success: true,
            ...finalStats,
            files: processedFiles,
            // Adiciona informações sobre pastas para melhor visualização
            folders: await getFolderStatus(audioFiles, existingTracks, problematicFolder)
        });

    } catch (error) {
        console.error('❌ Erro ao analisar arquivos:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao analisar arquivos para importação',
                details: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
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
                        filename: fileData.file?.filename || null, // Salva o nome do arquivo original
                        // Campos extras poderiam ser salvos em futura migração (ex: aiConfidence)
                    }
                });

                results.success++;
                console.log(`✅ Música importada: ${newTrack.songName} - ${newTrack.artist} | Style: ${newTrack.style} | Pool: ${newTrack.pool} | Bitrate: ${newTrack.bitrate || 'N/A'} kbps`);

            } catch (error) {
                results.failed++;
                const errorMsg = `Erro ao importar ${fileData.file?.filename || 'arquivo'}: ${error instanceof Error ? (error as Error).message : 'Erro desconhecido'}`;
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
                details: error instanceof Error ? (error as Error).message : 'Erro desconhecido'
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
                const result = {
                    artist: match[1].trim(),
                    songName: songName,
                    version: variation,
                    style: null,
                    variation
                };
                console.log(`🔍 parseAudioFileName: "${filename}" -> ${JSON.stringify(result)}`);
                return result;
            } else {
                // Só tem nome da música
                const songName = match[1].trim();
                const result = {
                    artist: 'Artista Desconhecido',
                    songName: songName,
                    version: variation,
                    style: null,
                    variation
                };
                console.log(`🔍 parseAudioFileName: "${filename}" -> ${JSON.stringify(result)}`);
                return result;
            }
        }
    }

    // Fallback: usa o nome do arquivo como nome da música
    const result = {
        artist: 'Artista Desconhecido',
        songName: name,
        version: null,
        style: null,
        variation
    };
    console.log(`🔍 parseAudioFileName: "${filename}" -> ${JSON.stringify(result)} (fallback)`);
    return result;
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

/**
 * Analisa o status das pastas para mostrar quais têm arquivos não importados
 */
async function getFolderStatus(audioFiles: any[], existingTracks: any[], problematicFolder?: string) {
    const folderStats: { [key: string]: any } = {};

    console.log(`🔍 getFolderStatus: Analisando ${audioFiles.length} arquivos e ${existingTracks.length} tracks existentes`);

    // Agrupa arquivos por pasta
    audioFiles.forEach((file: any) => {
        const folderPath = file.key.split('/').slice(0, -1).join('/') || 'root';

        if (!folderStats[folderPath]) {
            folderStats[folderPath] = {
                totalFiles: 0,
                existingFiles: 0,
                importableFiles: 0,
                importPercentage: 0,
                status: 'unknown'
            };
        }

        folderStats[folderPath].totalFiles++;
    });

    console.log(`🔍 getFolderStatus: Pastas encontradas:`, Object.keys(folderStats));

    // Verifica quantos arquivos de cada pasta já existem no banco
    existingTracks.forEach((track: any) => {
        if (track.filename) {
            const folderPath = track.filename.split('/').slice(0, -1).join('/') || 'root';

            if (folderStats[folderPath]) {
                folderStats[folderPath].existingFiles++;
            } else {
                console.log(`🔍 getFolderStatus: Track com pasta não encontrada: ${track.filename} -> pasta: ${folderPath}`);
            }
        } else {
            // Se não tem filename, tenta extrair da URL
            if (track.downloadUrl) {
                try {
                    const url = new URL(track.downloadUrl);
                    const pathParts = url.pathname.split('/');
                    if (pathParts.length > 1) {
                        const folderPath = pathParts.slice(0, -1).join('/');
                        if (folderStats[folderPath]) {
                            folderStats[folderPath].existingFiles++;
                            console.log(`🔍 getFolderStatus: Track sem filename, usando URL: ${track.downloadUrl} -> pasta: ${folderPath}`);
                        }
                    }
                } catch (e) {
                    console.log(`🔍 getFolderStatus: Erro ao processar URL: ${track.downloadUrl}`);
                }
            }
        }
    });

    // Log específico para pasta problemática
    if (problematicFolder && folderStats[problematicFolder]) {
        const stats = folderStats[problematicFolder];
        console.log(`🔍 getFolderStatus: Pasta problemática ${problematicFolder}:`);
        console.log(`  Total no storage: ${stats.totalFiles}`);
        console.log(`  Existente no banco: ${stats.existingFiles}`);
        console.log(`  Para importar: ${stats.importableFiles}`);
        console.log(`  Porcentagem: ${stats.importPercentage?.toFixed(1)}%`);

        // Verifica se há tracks no banco para essa pasta
        const tracksInFolder = existingTracks.filter((track: any) =>
            track.filename && track.filename.startsWith(problematicFolder)
        );
        console.log(`  Tracks encontrados no banco para esta pasta: ${tracksInFolder.length}`);

        if (tracksInFolder.length > 0) {
            console.log(`  Exemplos de tracks no banco:`);
            tracksInFolder.slice(0, 3).forEach((track: any) => {
                console.log(`    - ${track.filename} | ${track.artist} - ${track.songName}`);
            });
        }
    }

    // Log detalhado de cada pasta
    console.log(`🔍 getFolderStatus: Estatísticas finais das pastas:`);
    Object.entries(folderStats).forEach(([folderPath, stats]: [any, any]) => {
        console.log(`  ${folderPath}:`);
        console.log(`    Total no storage: ${stats.totalFiles}`);
        console.log(`    Existente no banco: ${stats.existingFiles}`);
        console.log(`    Para importar: ${stats.importableFiles}`);
        console.log(`    Porcentagem: ${stats.importPercentage?.toFixed(1)}%`);
        console.log(`    Status: ${stats.status}`);
    });

    // Calcula estatísticas e status de cada pasta
    Object.keys(folderStats).forEach((folderPath: any) => {
        const stats = folderStats[folderPath];
        stats.importableFiles = stats.totalFiles - stats.existingFiles;
        stats.importPercentage = stats.totalFiles > 0 ? (stats.existingFiles / stats.totalFiles) * 100 : 0;

        console.log(`🔍 getFolderStatus: Pasta ${folderPath}: ${stats.existingFiles}/${stats.totalFiles} (${stats.importPercentage.toFixed(1)}%)`);

        // Define status da pasta
        if (stats.importPercentage >= 90) {
            stats.status = 'completed'; // Verde: pasta quase toda importada
        } else if (stats.importPercentage >= 50) {
            stats.status = 'partial'; // Amarelo: pasta parcialmente importada
        } else if (stats.importPercentage > 0) {
            stats.status = 'started'; // Laranja: pasta começou a ser importada
        } else {
            stats.status = 'pending'; // Vermelho: pasta não foi importada
        }
    });

    return folderStats;
}
