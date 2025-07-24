// Script para atualizar metadados reais das músicas no banco de dados
// Exemplo: busca informações reais de cada música pelo nome/artista usando uma API externa
// Execute com: node update-metadata.js

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

async function fetchSpotifyMetadata(songName, artist, token) {
    const q = encodeURIComponent(`${songName} ${artist}`);
    const url = `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`;
    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const item = response.data.tracks.items[0];
    if (!item) return null;

    // Buscar gêneros do artista principal
    let style = '';
    try {
        const artistId = item.artists[0]?.id;
        if (artistId) {
            const artistUrl = `https://api.spotify.com/v1/artists/${artistId}`;
            const artistResp = await axios.get(artistUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            style = artistResp.data.genres?.[0] || '';
        }
    } catch (err) {
        style = '';
    }

    return {
        songName: item.name,
        artist: item.artists.map(a => a.name).join(', '),
        style,
        version: item.album.name,
        imageUrl: item.album.images?.[0]?.url || '',
        releaseDate: item.album.release_date
    };
}

async function main() {
    const token = await getSpotifyToken();
    const tracks = await prisma.track.findMany();
    let updated = 0;

    for (const track of tracks) {
        const meta = await fetchSpotifyMetadata(track.songName, track.artist, token);
        if (!meta) {
            console.log(`Não encontrado no Spotify: ${track.songName} - ${track.artist}`);
            continue;
        }
        await prisma.track.update({
            where: { id: track.id },
            data: {
                songName: meta.songName,
                artist: meta.artist,
                style: meta.style,
                version: meta.version,
                imageUrl: meta.imageUrl,
                releaseDate: new Date(meta.releaseDate),
            }
        });
        updated++;
        console.log(`Atualizado: ${meta.songName} - ${meta.artist}`);
    }

    console.log(`Total de músicas atualizadas: ${updated}`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
