// API para detectar novos arquivos automaticamente
import { ContaboStorage } from '@/lib/contabo-storage';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest) {
    try {
        const storage = new ContaboStorage({
            endpoint: process.env.CONTABO_ENDPOINT!,
            region: process.env.CONTABO_REGION!,
            accessKeyId: process.env.CONTABO_ACCESS_KEY!,
            secretAccessKey: process.env.CONTABO_SECRET_KEY!,
            bucketName: process.env.CONTABO_BUCKET_NAME!,
        });

        // Buscar arquivos de áudio do Contabo
        const audioFiles = await storage.listAudioFiles();

        // Verificar quais já existem no banco
        const existingTracks = await prisma.track.findMany({
            select: {
                previewUrl: true,
                downloadUrl: true,
                songName: true,
                artist: true,
                createdAt: true
            }
        });

        const existingUrls = new Set([
            ...existingTracks.map(track => track.previewUrl),
            ...existingTracks.map(track => track.downloadUrl)
        ]);

        // Filtrar apenas arquivos novos
        const newFiles = audioFiles.filter(file => !existingUrls.has(file.url));

        // Análise prévia dos arquivos novos
        const previewTracks = newFiles.map(file => {
            const nameWithoutExt = file.filename.replace(/\.(mp3|wav|flac|m4a|aac|ogg)$/i, '');

            // Extrair variação (CLEAN, DIRTY, EXPLICIT, etc) ao final
            let variation = null;
            let name = nameWithoutExt;
            const variationMatch = name.match(/\((CLEAN|DIRTY|EXPLICIT|INSTRUMENTAL|RADIO EDIT|CLUB MIX)\)$/i);
            if (variationMatch) {
                variation = variationMatch[1].toUpperCase();
                name = name.replace(/\s*\((CLEAN|DIRTY|EXPLICIT|INSTRUMENTAL|RADIO EDIT|CLUB MIX)\)$/i, '').trim();
            }

            let artist = 'Artista Desconhecido';
            let title = name;
            let version = 'Original';

            // Análise básica do nome
            if (name.includes(' - ')) {
                const parts = name.split(' - ');
                artist = parts[0].trim();
                title = parts.slice(1).join(' - ').trim();

                // Extrair versão
                const versionMatch = title.match(/\((.+?)\)$/);
                if (versionMatch) {
                    version = versionMatch[1].trim();
                    title = title.replace(/\s*\(.+?\)$/, '').trim();
                }
            }

            // Se houver variação, adiciona ao version
            const finalVersion = variation ? `${version} - ${variation}` : version;

            return {
                filename: file.filename,
                size: file.size,
                lastModified: file.lastModified,
                url: file.url,
                preview: {
                    artist: artist.replace(/[\[\]]/g, '').trim(),
                    title: title.replace(/[\[\]]/g, '').trim(),
                    version: finalVersion.replace(/[\[\]]/g, '').trim()
                }
            };
        });

        return NextResponse.json({
            success: true,
            totalFiles: audioFiles.length,
            existingFiles: audioFiles.length - newFiles.length,
            newFiles: newFiles.length,
            newTracks: previewTracks,
            lastUpdate: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao detectar novos arquivos:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro ao detectar novos arquivos',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}

