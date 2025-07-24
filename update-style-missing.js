// Script para preencher o campo 'style' das músicas sem gênero usando Spotify
// Execute com: node update-style-missing.js

import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const SPOTIFY_CLIENT_ID = 'b5e0b0c2c8fc429f9a72589ffe9f79a7';
const SPOTIFY_CLIENT_SECRET = '124f8a3cc54347eeafbd900d1eee7917';

async function getSpotifyToken() {
    const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
    return response.data.access_token;
}

async function fetchArtistGenre(songName, artist, token) {
    const q = encodeURIComponent(`${songName} ${artist}`);
    const url = `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`;
    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const item = response.data.tracks.items[0];
    if (!item) return '';
    try {
        const artistId = item.artists[0]?.id;
        if (artistId) {
            const artistUrl = `https://api.spotify.com/v1/artists/${artistId}`;
            const artistResp = await axios.get(artistUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return artistResp.data.genres?.[0] || '';
        }
    } catch (err) {
        return '';
    }
    return '';
}

async function main() {
    const token = await getSpotifyToken();
    // Buscar apenas músicas sem style ou com style vazio
    const tracks = await prisma.track.findMany({
        where: {
            style: ''
        }
    });
    let updated = 0;
    let notFound = 0;
    for (const track of tracks) {
        const genre = await fetchArtistGenre(track.songName, track.artist, token);
        if (!genre) {
            console.log(`Gênero não encontrado: ${track.songName} - ${track.artist}`);
            notFound++;
            continue;
        }
        await prisma.track.update({
            where: { id: track.id },
            data: { style: genre }
        });
        updated++;
        console.log(`Atualizado: ${track.songName} - ${track.artist} | Gênero: ${genre}`);
    }
    console.log(`Total de músicas atualizadas: ${updated}`);
    console.log(`Total sem gênero encontrado: ${notFound}`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
