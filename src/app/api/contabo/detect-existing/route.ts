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
                version: true
            }
        });

        // Mapeia URLs existentes para verificação rápida
        const existingUrls = new Set([
            ...existingTracks.map((t: any) => t.downloadUrl),
            ...existingTracks.map((t: any) => t.previewUrl)
        ]);

        // Filtra arquivos que já estão no banco
        const existingFiles = audioFiles.filter(file =>
            existingUrls.has(file.url)
        );

        // Processa informações dos arquivos existentes
        const processedExistingFiles = existingFiles.map(file => {
            // Encontra o track correspondente no banco
            const existingTrack = existingTracks.find(track => 
                track.downloadUrl === file.url || track.previewUrl === file.url
            );

            return {
                file,
                existingTrack: existingTrack ? {
                    id: existingTrack.id,
                    songName: existingTrack.songName,
                    artist: existingTrack.artist,
                    style: existingTrack.style,
                    version: existingTrack.version
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