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
    releaseDate: Date;
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
                artist: true
            }
        });

        // Mapeia URLs existentes para verificação rápida
        const existingUrls = new Set([
            ...existingTracks.map((t: any) => t.downloadUrl),
            ...existingTracks.map((t: any) => t.previewUrl)
        ]);

        // Filtra arquivos que ainda não estão no banco
        const importableFiles = audioFiles.filter(file =>
            !existingUrls.has(file.url)
        );

        // Processa informações dos arquivos para importação
        const processedFiles = importableFiles.map(file => {
            const parsed = parseAudioFileName(file.filename);
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
        const { files, autoParseNames = true } = body;

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
                const importData: ImportTrackData = fileData.importData || fileData;

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

                // Cria a música no banco
                const newTrack = await prisma.track.create({
                    data: {
                        songName: importData.songName.trim(),
                        artist: importData.artist.trim(),
                        style: importData.style || 'Electronic',
                        version: importData.version || null,
                        imageUrl: importData.imageUrl,
                        previewUrl: importData.previewUrl,
                        downloadUrl: importData.downloadUrl,
                        releaseDate: new Date(importData.releaseDate)
                    }
                });

                results.success++;
                console.log(`✅ Música importada: ${newTrack.songName} - ${newTrack.artist}`);

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
        // "Artist - Song Name (Version) [Style]"
        /^(.+?)\s*-\s*(.+?)\s*(?:\(([^)]+)\))?\s*(?:\[([^\]]+)\])?$/,
        // "Artist - Song Name"
        /^(.+?)\s*-\s*(.+)$/,
        // "Song Name (Version)"
        /^(.+?)\s*(?:\(([^)]+)\))?$/
    ];

    for (const pattern of patterns) {
        const match = name.match(pattern);
        if (match) {
            if (match[2]) {
                // Tem artista
                let songName = match[2].trim();
                const version = match[3]?.trim() || null;
                
                // Adiciona parênteses ao nome da música se houver versão
                if (version) {
                    songName = `${songName} (${version})`;
                }
                
                return {
                    artist: match[1].trim(),
                    songName: songName,
                    version: version,
                    style: match[4]?.trim() || null,
                    variation
                };
            } else {
                // Só tem nome da música
                let songName = match[1].trim();
                const version = match[2]?.trim() || null;
                
                // Adiciona parênteses ao nome da música se houver versão
                if (version) {
                    songName = `${songName} (${version})`;
                }
                
                return {
                    artist: 'Artista Desconhecido',
                    songName: songName,
                    version: version,
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
    const initials = artist.substring(0, 2).toUpperCase();
    const colors = ['4f46e5', '7c3aed', 'db2777', 'dc2626', 'ea580c', '059669', '0891b2'];
    const colorIndex = (artist.length + songName.length) % colors.length;
    const color = colors[colorIndex];

    return `https://placehold.co/300x300/${color}/ffffff?text=${encodeURIComponent(initials)}`;
}
