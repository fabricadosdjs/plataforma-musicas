// src/app/api/tracks/check-duplicates/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        console.log('🔍 API /tracks/check-duplicates chamada');

        const body = await req.json();

        if (!Array.isArray(body)) {
            return new NextResponse('Dados devem ser um array de músicas', { status: 400 });
        }

        const tracks = body;

        // Buscar todas as músicas existentes no banco
        const existingTracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                artist: true,
                previewUrl: true,
                downloadUrl: true,
                style: true,
                version: true,
                pool: true,
            }
        });

        // Criar sets para verificação rápida
        const existingUrls = new Set([
            ...existingTracks.map(track => track.previewUrl),
            ...existingTracks.map(track => track.downloadUrl)
        ]);

        const existingSongs = new Set(
            existingTracks.map(track => `${track.artist} - ${track.songName}`.toLowerCase())
        );

        // Verificar duplicatas
        const results: any = {
            totalChecked: tracks.length,
            duplicates: [],
            unique: [],
            summary: {
                total: tracks.length,
                duplicates: 0,
                unique: 0
            }
        };

        for (const track of tracks) {
            const songKey = `${track.artist} - ${track.songName}`.toLowerCase();
            const isDuplicateUrl = existingUrls.has(track.previewUrl) || existingUrls.has(track.downloadUrl);
            const isDuplicateSong = existingSongs.has(songKey);

            if (isDuplicateUrl || isDuplicateSong) {
                results.duplicates.push({
                    track,
                    reason: isDuplicateUrl ? 'URL duplicada' : 'Música já existe',
                    existingTrack: existingTracks.find(existing =>
                        existing.previewUrl === track.previewUrl ||
                        existing.downloadUrl === track.downloadUrl ||
                        `${existing.artist} - ${existing.songName}`.toLowerCase() === songKey
                    )
                });
                results.summary.duplicates++;
            } else {
                results.unique.push(track);
                results.summary.unique++;
            }
        }

        console.log(`📊 Resumo da verificação: ${results.summary.total} total, ${results.summary.unique} únicas, ${results.summary.duplicates} duplicadas`);

        return NextResponse.json({
            success: true,
            ...results
        });

    } catch (error) {
        console.error("[CHECK_DUPLICATES_ERROR]", error);
        return new NextResponse("Erro Interno do Servidor", { status: 500 });
    }
} 