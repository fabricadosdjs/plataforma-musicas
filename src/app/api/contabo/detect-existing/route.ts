import { contaboStorage } from '@/lib/contabo-storage';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const prefix = searchParams.get('prefix') || undefined;

        console.log('🔍 Detectando arquivos que já existem no banco de dados...');

        // Lista todos os arquivos de áudio do bucket
        const audioFiles = await contaboStorage.listAudioFiles(prefix);

        if (audioFiles.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Nenhum arquivo de áudio encontrado no bucket',
                existingFiles: [],
                totalFiles: 0
            });
        }

        console.log(`🔍 ${audioFiles.length} arquivos de áudio encontrados`);

        // Busca músicas já existentes no banco
        const existingTracks = await prisma.track.findMany({
            select: {
                id: true,
                downloadUrl: true,
                previewUrl: true,
                songName: true,
                artist: true,
                style: true,
                version: true,
                filename: true
            }
        });

        // Mapeia URLs existentes para verificação rápida
        const existingUrls = new Set([
            ...existingTracks.map((t: any) => t.downloadUrl),
            ...existingTracks.map((t: any) => t.previewUrl)
        ]);

        // Cria índice para busca por nome de arquivo
        const existingFilenames = new Set(
            existingTracks
                .map((t: any) => t.filename)
                .filter(Boolean)
                .map((filename: any) => filename.toLowerCase())
        );

        // Cria índice para busca por nome normalizado
        const tracksByNormalizedName = new Map();
        existingTracks.forEach((track: any) => {
            const normalizedKey = normalizeTrackName(track.artist || '', track.songName || '', track.version || undefined);
            if (!tracksByNormalizedName.has(normalizedKey)) {
                tracksByNormalizedName.set(normalizedKey, []);
            }
            tracksByNormalizedName.get(normalizedKey).push(track);
        });

        // Filtra arquivos que já estão no banco (comparação por URL, filename ou nome normalizado)
        const existingFiles = audioFiles.filter((file: any) => {
            // 1. Verifica por URL exata (mais confiável)
            if (existingUrls.has(file.url)) {
                console.log(`🚫 Arquivo já existe por URL: ${file.filename}`);
                return true;
            }

            // 2. Verifica por nome de arquivo exato
            if (existingFilenames.has(file.filename.toLowerCase())) {
                console.log(`🚫 Arquivo já existe por nome: ${file.filename}`);
                return true;
            }

            // 3. Verifica por nome normalizado (artista + música + versão)
            const parsed = parseAudioFileName(file.filename);
            const normalizedKey = normalizeTrackName(parsed.artist, parsed.songName, parsed.version);

            if (tracksByNormalizedName.has(normalizedKey)) {
                console.log(`🚫 Arquivo já existe por nome normalizado: ${file.filename} -> ${normalizedKey}`);
                return true;
            }

            console.log(`✅ Arquivo não existe no banco: ${file.filename}`);
            return false;
        });

        // Processa informações dos arquivos existentes
        const processedExistingFiles = existingFiles.map((file: any) => {
            // Encontra o track correspondente no banco (primeiro por URL, depois por nome)
            let existingTrack = existingTracks.find((track: any) =>
                track.downloadUrl === file.url || track.previewUrl === file.url
            );

            // Se não encontrou por URL, busca por nome normalizado
            if (!existingTrack) {
                const parsed = parseAudioFileName(file.filename);
                const normalizedKey = normalizeTrackName(parsed.artist, parsed.songName, parsed.version);
                const matchingTracks = tracksByNormalizedName.get(normalizedKey);
                if (matchingTracks && matchingTracks.length > 0) {
                    existingTrack = matchingTracks[0]; // Pega o primeiro match
                }
            }

            return {
                file,
                existingTrack: existingTrack ? {
                    id: existingTrack.id,
                    songName: existingTrack.songName,
                    artist: existingTrack.artist,
                    style: existingTrack.style,
                    version: existingTrack.version,
                    filename: existingTrack.filename
                } : null,
                parsed: parseAudioFileName(file.filename)
            };
        });

        console.log(`✅ ${existingFiles.length} arquivos já existem no banco de dados`);

        return NextResponse.json({
            success: true,
            totalFiles: audioFiles.length,
            existingCount: existingFiles.length,
            existingFiles: processedExistingFiles
        });

    } catch (error) {
        console.error('❌ Erro ao detectar arquivos existentes:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao detectar arquivos existentes',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    }
}

function parseAudioFileName(filename: string) {
    // Remove extensão
    const nameWithoutExt = filename.replace(/\.(mp3|wav|flac|aac|ogg)$/i, '');

    // Padrão: "Artist - Song Name (Version)" ou "Artist - Song Name"
    const match = nameWithoutExt.match(/^(.+?)\s*-\s*(.+?)(?:\s*\(([^)]+)\))?$/);

    if (match) {
        const [, artist, songName, version] = match;
        return {
            artist: artist.trim(),
            songName: songName.trim(),
            version: version ? version.trim() : undefined
        };
    }

    // Se não conseguir fazer o parse, retorna o nome original
    return {
        artist: 'Unknown Artist',
        songName: nameWithoutExt,
        version: undefined
    };
}

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