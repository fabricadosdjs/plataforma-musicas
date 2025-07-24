// API para importação inteligente com busca de metadados e integração Spotify
import { ContaboStorage } from '@/lib/contabo-storage';
import { MusicStyleDetector } from '@/lib/music-style-detector';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


interface TrackMetadata {
    artist: string;
    title: string;
    style: string;
    version: string;
    year?: number;
    bpm?: number;
    key?: string;
    genre?: string;
    confidence: number;
    spotifyData?: {
        spotifyId: string;
        album: string;
        releaseDate: string;
        imageUrl: string | null;
        previewUrl: string | null;
        spotifyUrl: string;
        popularity: number;
        durationMs: number;
    };
}

interface SpotifyMetadata {
    spotifyId: string;
    title: string;
    artist: string;
    album: string;
    releaseDate: string;
    imageUrl: string | null;
    previewUrl: string | null;
    spotifyUrl: string;
    popularity: number;
    durationMs: number;
}

// Função para buscar metadados online (simulação - você pode integrar com APIs reais)
async function fetchMetadataFromInternet(artist: string, title: string): Promise<Partial<TrackMetadata>> {
    try {
        // Simulação de busca de metadados (substitua por APIs reais como Last.fm, Discogs, etc.)
        const mockResponse = await simulateMetadataAPI(artist, title);
        return mockResponse;
    } catch (error) {
        console.log('Erro ao buscar metadados online:', error);
        return {};
    }
}

// Simulação de API de metadados (substitua por APIs reais)
async function simulateMetadataAPI(artist: string, title: string): Promise<Partial<TrackMetadata>> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 100));

    // Usar o detector inteligente
    const styleDetection = MusicStyleDetector.detectStyle(artist, title);

    return {
        style: styleDetection.style,
        bpm: styleDetection.bpm,
        key: styleDetection.key,
        year: new Date().getFullYear(),
        confidence: styleDetection.confidence,
        genre: styleDetection.subgenre
    };
}// Função para análise inteligente do nome do arquivo
function parseAudioFileNameAdvanced(filename: string): TrackMetadata {
    // Remover extensão
    const nameWithoutExt = filename.replace(/\.(mp3|wav|flac|m4a|aac|ogg)$/i, '');

    let artist = 'Unknown Artist';
    let title = nameWithoutExt;
    let version = 'Original';
    let extractedStyle = '';
    let cleanName = nameWithoutExt;

    // Primeiro, tentar extrair estilo explícito do nome da faixa
    const stylePatterns = [
        'progressive house', 'future house', 'deep house', 'tech house', 'tribal house',
        'big room', 'progressive', 'trance', 'techno', 'electro', 'dubstep', 'drum bass',
        'sertanejo', 'mpb', 'forró', 'funk', 'pagode', 'bossa nova', 'axé', 'arrocha',
        'house', 'electronic', 'dance', 'edm', 'ambient', 'minimal'
    ];

    // Procurar por estilos no nome do arquivo
    const lowerFilename = nameWithoutExt.toLowerCase();
    for (const style of stylePatterns) {
        if (lowerFilename.includes(style.toLowerCase())) {
            // Capitalizar o estilo encontrado
            extractedStyle = style.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            // Remover o estilo do nome do arquivo para não aparecer no título
            const styleRegex = new RegExp(`\\s*${style.replace(/\s+/g, '\\s+')}\\s*`, 'gi');
            cleanName = nameWithoutExt.replace(styleRegex, ' ').trim();
            break;
        }
    }

    // Detectar e extrair sufixos comuns que devem ser removidos do título
    const suffixPatterns = [
        /\s*\(extended mix\)/gi,
        /\s*\(radio edit\)/gi,
        /\s*\(club mix\)/gi,
        /\s*\(vocal mix\)/gi,
        /\s*\(instrumental\)/gi,
        /\s*\(dub mix\)/gi,
        /\s*\(vip mix\)/gi,
        /\s*\(acoustic\)/gi,
        /\s*\(remix\)/gi,
        /\s*\(original mix\)/gi,
        /\s*\(official\)/gi,
        /\s*\(preview\)/gi,
        /\s*\(clean\)/gi,
        /\s*\(dirty\)/gi,
        /\s*\(explicit\)/gi
    ];

    let detectedSuffix = '';

    // Extrair sufixos e versões
    for (const pattern of suffixPatterns) {
        const match = cleanName.match(pattern);
        if (match) {
            detectedSuffix = match[0].trim().replace(/[()]/g, '');
            // Capitalizar o sufixo
            detectedSuffix = detectedSuffix.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            cleanName = cleanName.replace(pattern, '').trim();
            break;
        }
    }

    // Padrão 1: Artista - Título (Versão)
    const pattern1 = cleanName.match(/^(.+?)\s*-\s*(.+?)\s*\((.+?)\).*$/);
    if (pattern1) {
        artist = pattern1[1].trim();
        title = pattern1[2].trim();
        version = pattern1[3].trim();
    }
    // Padrão 2: Artista - Título
    else if (cleanName.includes(' - ')) {
        const parts = cleanName.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();

        // Extrair versão se estiver no título
        const versionMatch = title.match(/\((.+?)\)$/);
        if (versionMatch) {
            version = versionMatch[1].trim();
            title = title.replace(/\s*\(.+?\)$/, '').trim();
        }
    }
    // Padrão 3: Artista_Título
    else if (cleanName.includes('_') && !cleanName.includes(' ')) {
        const parts = cleanName.split('_');
        artist = parts[0].trim();
        title = parts.slice(1).join(' ').trim();
    }

    // Limpar caracteres especiais
    artist = artist.replace(/[\[\]]/g, '').trim();
    title = title.replace(/[\[\]]/g, '').trim();
    version = version.replace(/[\[\]]/g, '').trim();

    // Usar estilo extraído da faixa ou detector inteligente como fallback
    let finalStyle = extractedStyle;
    if (!finalStyle) {
        const styleDetection = MusicStyleDetector.detectStyle(artist, title, filename);
        finalStyle = styleDetection.style;
    }

    // Usar sufixo detectado como versão ou manter versão existente
    const finalVersion = detectedSuffix || version || 'Original';

    return {
        artist,
        title,
        version: finalVersion,
        style: finalStyle,
        confidence: extractedStyle ? 1.0 : 0.7, // Alta confiança se extraído da faixa
        genre: finalStyle
    };
} export async function POST(request: NextRequest) {
    try {
        // Obter dados do corpo da requisição
        const body = await request.json().catch(() => ({}));
        const importDate = body.importDate ? new Date(body.importDate) : new Date();
        const tracksWithSpotify = body.tracks || [];
        const useSpotifyMetadata = body.useSpotifyMetadata || false;

        console.log(`📅 Data de importação definida como: ${importDate.toLocaleDateString()}`);
        console.log(`🎵 Usar metadados do Spotify: ${useSpotifyMetadata}`);
        console.log(`📝 Tracks com dados Spotify: ${tracksWithSpotify.length}`);

        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT!,
            region: process.env.CONTABO_REGION!,
            accessKeyId: process.env.CONTABO_ACCESS_KEY!,
            secretAccessKey: process.env.CONTABO_SECRET_KEY!,
            bucketName: process.env.CONTABO_BUCKET_NAME!,
        });

        console.log('🔍 Iniciando importação inteligente...');

        let filesToProcess;

        // Se recebeu tracks específicos, usar esses
        if (tracksWithSpotify.length > 0) {
            // Usar tracks fornecidos pela interface
            filesToProcess = tracksWithSpotify.map((track: any) => ({
                filename: track.filename,
                url: track.url,
                size: track.size,
                lastModified: track.lastModified,
                spotifyMetadata: track.spotifyMetadata
            }));
            console.log(`📁 Processando ${filesToProcess.length} tracks selecionados`);
        } else {
            // Buscar arquivos de áudio do Contabo (comportamento original)
            const audioFiles = await storage.listAudioFiles();
            console.log(`📁 Encontrados ${audioFiles.length} arquivos no Contabo`);

            // Verificar quais já existem no banco
            const existingTracks = await prisma.track.findMany({
                select: {
                    previewUrl: true,
                    downloadUrl: true,
                    songName: true,
                    artist: true
                }
            });

            const existingUrls = new Set([
                ...existingTracks.map(track => track.previewUrl),
                ...existingTracks.map(track => track.downloadUrl)
            ]);

            // Filtrar apenas arquivos novos
            filesToProcess = audioFiles.filter(file => !existingUrls.has(file.url));
            console.log(`⭐ Novos arquivos para processar: ${filesToProcess.length}`);
        }
        const audioFiles = await storage.listAudioFiles();
        console.log(`📁 Encontrados ${audioFiles.length} arquivos no Contabo`);

        // Verificar quais já existem no banco
        const existingTracks = await prisma.track.findMany({
            select: {
                previewUrl: true,
                downloadUrl: true,
                songName: true,
                artist: true
            }
        });

        const existingUrls = new Set([
            ...existingTracks.map(track => track.previewUrl),
            ...existingTracks.map(track => track.downloadUrl)
        ]);

        // Filtrar apenas arquivos novos
        const newFiles = audioFiles.filter(file => !existingUrls.has(file.url));
        console.log(`⭐ Novos arquivos para processar: ${newFiles.length}`);

        if (filesToProcess.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Nenhum arquivo novo encontrado',
                imported: 0,
                total: tracksWithSpotify.length || 0
            });
        }

        // Processar cada arquivo com análise inteligente
        const processedTracks = [];

        for (const file of filesToProcess) {
            console.log(`🎵 Processando: ${file.filename}`);

            // Análise local do nome do arquivo
            const localMetadata = parseAudioFileNameAdvanced(file.filename);

            let finalMetadata: TrackMetadata;

            // Se tem dados do Spotify, usar esses dados
            if (useSpotifyMetadata && file.spotifyMetadata) {
                console.log(`🎵 Usando metadados do Spotify para: ${file.filename}`);

                finalMetadata = {
                    artist: file.spotifyMetadata.artist,
                    title: file.spotifyMetadata.title,
                    style: localMetadata.style, // Manter detecção local do estilo
                    version: localMetadata.version,
                    confidence: 0.9, // Alta confiança para dados do Spotify
                    spotifyData: {
                        spotifyId: file.spotifyMetadata.spotifyId,
                        album: file.spotifyMetadata.album,
                        releaseDate: file.spotifyMetadata.releaseDate,
                        imageUrl: file.spotifyMetadata.imageUrl,
                        previewUrl: file.spotifyMetadata.previewUrl,
                        spotifyUrl: file.spotifyMetadata.spotifyUrl,
                        popularity: file.spotifyMetadata.popularity,
                        durationMs: file.spotifyMetadata.durationMs
                    }
                };
            } else {
                // Usar análise local + busca online (comportamento original)
                const onlineMetadata = await fetchMetadataFromInternet(
                    localMetadata.artist,
                    localMetadata.title
                );

                // Combinar metadados com prioridade para dados online quando disponíveis
                finalMetadata = {
                    ...localMetadata,
                    ...onlineMetadata,
                    confidence: Math.max(localMetadata.confidence, onlineMetadata.confidence || 0)
                };
            }

            processedTracks.push({
                file,
                metadata: finalMetadata
            });
        }

        // Importar para o banco de dados
        const importedTracks = [];
        const duplicatesFound = [];

        for (const { file, metadata } of processedTracks) {
            try {
                // Verificar se já existe uma música com o mesmo artista e título
                const existingTrack = await prisma.track.findFirst({
                    where: {
                        AND: [
                            {
                                artist: {
                                    equals: metadata.artist,
                                    mode: 'insensitive'
                                }
                            },
                            {
                                songName: {
                                    equals: metadata.title,
                                    mode: 'insensitive'
                                }
                            }
                        ]
                    }
                });

                if (existingTrack) {
                    console.log(`🔄 Duplicata encontrada: ${metadata.artist} - ${metadata.title} (já existe como ID: ${existingTrack.id})`);
                    duplicatesFound.push({
                        filename: file.filename,
                        artist: metadata.artist,
                        title: metadata.title,
                        existingId: existingTrack.id
                    });
                    continue; // Pular esta música e não importar
                }

                const track = await prisma.track.create({
                    data: {
                        songName: metadata.title,
                        artist: metadata.artist,
                        style: metadata.style,
                        version: metadata.version || 'Original',
                        previewUrl: file.url,
                        downloadUrl: file.url,
                        imageUrl: metadata.spotifyData?.imageUrl ||
                            `https://via.placeholder.com/300x300/1a1a1a/white?text=${encodeURIComponent(metadata.artist)}`,
                        releaseDate: metadata.spotifyData?.releaseDate ?
                            new Date(metadata.spotifyData.releaseDate) : importDate,
                        createdAt: importDate,
                        updatedAt: new Date()
                    }
                });

                importedTracks.push({
                    ...track,
                    confidence: metadata.confidence
                });

                console.log(`✅ Importado: ${metadata.artist} - ${metadata.title} (${metadata.style})`);

            } catch (error) {
                console.error(`❌ Erro ao importar ${file.filename}:`, error);
            }
        }

        // Estatísticas finais
        const totalTracks = await prisma.track.count();
        const styleStats = await prisma.track.groupBy({
            by: ['style'],
            _count: true
        });

        return NextResponse.json({
            success: true,
            message: `Importação concluída! ${importedTracks.length} músicas adicionadas${duplicatesFound.length > 0 ? `, ${duplicatesFound.length} duplicatas ignoradas` : ''}`,
            imported: importedTracks.length,
            duplicates: duplicatesFound.length,
            total: audioFiles.length,
            newTracks: importedTracks,
            duplicatesFound: duplicatesFound,
            statistics: {
                totalInDatabase: totalTracks,
                byStyle: styleStats
            }
        });

    } catch (error) {
        console.error('Erro na importação inteligente:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}
