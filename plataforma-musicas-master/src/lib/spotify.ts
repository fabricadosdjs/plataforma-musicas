// src/lib/spotify.ts
const SPOTIFY_CLIENT_ID = 'b5e0b0c2c8fc429f9a72589ffe9f79a7';
const SPOTIFY_CLIENT_SECRET = '124f8a3cc54347eeafbd900d1eee7917';

interface SpotifyTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{
        id: string;
        name: string;
    }>;
    album: {
        id: string;
        name: string;
        images: Array<{
            url: string;
            height: number;
            width: number;
        }>;
        release_date: string;
    };
    preview_url: string | null;
    external_urls: {
        spotify: string;
    };
    popularity: number;
    duration_ms: number;
}

interface SpotifySearchResponse {
    tracks: {
        items: SpotifyTrack[];
        total: number;
    };
}

class SpotifyAPI {
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    private async getAccessToken(): Promise<string> {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            throw new Error('Failed to get Spotify access token');
        }

        const data: SpotifyTokenResponse = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer

        return this.accessToken;
    }

    async searchTrack(query: string, limit: number = 10): Promise<SpotifyTrack[]> {
        const token = await this.getAccessToken();

        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to search Spotify');
        }

        const data: SpotifySearchResponse = await response.json();
        return data.tracks.items;
    }

    async searchByArtistAndTitle(artist: string, title: string): Promise<SpotifyTrack | null> {
        const query = `artist:"${artist}" track:"${title}"`;
        const results = await this.searchTrack(query, 1);
        return results.length > 0 ? results[0] : null;
    }

    extractMetadata(track: SpotifyTrack) {
        return {
            spotifyId: track.id,
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            releaseDate: track.album.release_date,
            imageUrl: track.album.images[0]?.url || null,
            previewUrl: track.preview_url,
            spotifyUrl: track.external_urls.spotify,
            popularity: track.popularity,
            durationMs: track.duration_ms
        };
    }
}

export const spotifyAPI = new SpotifyAPI();
export type { SpotifyTrack };

