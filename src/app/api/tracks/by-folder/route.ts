import { NextRequest, NextResponse } from 'next/server';
import { ContaboStorage } from '@/lib/contabo-storage';

// Função para criar instância do storage
function createStorage() {
    return new ContaboStorage({
        endpoint: process.env.CONTABO_ENDPOINT!,
        region: process.env.CONTABO_REGION!,
        accessKeyId: process.env.CONTABO_ACCESS_KEY!,
        secretAccessKey: process.env.CONTABO_SECRET_KEY!,
        bucketName: process.env.CONTABO_BUCKET_NAME!,
    });
}

// Função para analisar o nome do arquivo e extrair informações
function analyzeFileName(filename: string) {
    // Remove a extensão
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Padrões comuns de nomenclatura de música
    const patterns = [
        // "Artist - Song Name (Version)"
        /^(.+?)\s*-\s*(.+?)\s*\((.+?)\)$/,
        // "Artist - Song Name"
        /^(.+?)\s*-\s*(.+?)$/,
        // "Song Name (Artist)"
        /^(.+?)\s*\((.+?)\)$/,
        // "Artist - Song Name [Version]"
        /^(.+?)\s*-\s*(.+?)\s*\[(.+?)\]$/,
    ];

    for (const pattern of patterns) {
        const match = nameWithoutExt.match(pattern);
        if (match) {
            if (pattern.source.includes('\\(') && match.length === 4) {
                // Padrão com versão
                return {
                    artist: match[1].trim(),
                    songName: match[2].trim(),
                    version: match[3].trim()
                };
            } else if (match.length === 3) {
                // Padrão sem versão
                return {
                    artist: match[1].trim(),
                    songName: match[2].trim(),
                    version: undefined
                };
            }
        }
    }

    // Se não conseguir analisar, usar o nome completo como título
    return {
        artist: 'Artista Desconhecido',
        songName: nameWithoutExt,
        version: undefined
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const folder = searchParams.get('folder');
        const limit = parseInt(searchParams.get('limit') || '1000');

        if (!folder) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Parâmetro folder é obrigatório',
                    tracks: []
                },
                { status: 400 }
            );
        }

        console.log(`🔍 Buscando músicas da pasta: ${folder}`);

        const storage = createStorage();

        // Buscar arquivos da pasta específica
        const files = await storage.listAudioFiles(folder + '/');

        // Converter arquivos do storage em formato de tracks
        const tracks = files.slice(0, limit).map((file, index) => {
            const analysis = analyzeFileName(file.filename);

            return {
                id: index + 1, // ID temporário baseado no índice
                songName: analysis.songName,
                artist: analysis.artist,
                style: 'Unknown', // Será determinado posteriormente
                version: analysis.version,
                pool: 'Storage', // Indica que vem do storage
                folder: folder,
                imageUrl: null,
                previewUrl: file.url,
                downloadUrl: file.url,
                releaseDate: file.lastModified.toISOString().split('T')[0],
                createdAt: file.lastModified.toISOString(),
                updatedAt: file.lastModified.toISOString(),
                // Informações adicionais do storage
                storageKey: file.key,
                fileSize: file.size,
                isFromStorage: true
            };
        });

        console.log(`✅ ${tracks.length} músicas encontradas na pasta ${folder}`);

        return NextResponse.json({
            success: true,
            tracks,
            folder,
            count: tracks.length
        });

    } catch (error) {
        console.error('Error fetching tracks by storage folder:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao conectar com o storage',
                tracks: []
            },
            { status: 500 }
        );
    }
}