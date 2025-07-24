// src/app/api/spotify/search/route.ts
import { spotifyAPI } from '@/lib/spotify';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const artist = searchParams.get('artist');
        const title = searchParams.get('title');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!query && (!artist || !title)) {
            return NextResponse.json({
                error: 'Query ou artist+title são obrigatórios'
            }, { status: 400 });
        }

        let results;

        if (artist && title) {
            // Busca específica por artista e título
            const track = await spotifyAPI.searchByArtistAndTitle(artist, title);
            results = track ? [track] : [];
        } else if (query) {
            // Busca geral
            results = await spotifyAPI.searchTrack(query, limit);
        }

        // Extrair metadados para facilitar uso
        const tracks = results!.map(track => ({
            ...spotifyAPI.extractMetadata(track),
            rawData: track
        }));

        return NextResponse.json({
            success: true,
            tracks,
            total: tracks.length
        });

    } catch (error) {
        console.error('[SPOTIFY_SEARCH_ERROR]', error);
        return NextResponse.json({
            error: 'Erro ao buscar no Spotify: ' + (error as Error).message,
            success: false
        }, { status: 500 });
    }
}
