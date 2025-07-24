"use client";

import { Track } from '@/types/track';
import { useEffect } from 'react';

interface MusicStructuredDataProps {
    track: Track;
    isPlaying?: boolean;
    position?: number; // posição na playlist
    playlistName?: string;
}

export default function MusicStructuredData({
    track,
    isPlaying = false,
    position,
    playlistName
}: MusicStructuredDataProps) {
    useEffect(() => {
        // Criar dados estruturados para a música
        const musicSchema: any = {
            "@context": "https://schema.org",
            "@type": "MusicRecording",
            "name": track.songName,
            "byArtist": {
                "@type": "MusicGroup",
                "name": track.artist
            },
            "genre": track.style,
            "image": track.imageUrl,
            "audio": {
                "@type": "AudioObject",
                "contentUrl": track.previewUrl,
                "encodingFormat": "audio/mpeg"
            },
            "datePublished": track.releaseDate,
            "url": `https://dj-pool.netlify.app/track/${track.id}`,
            "description": `${track.songName} por ${track.artist} - ${track.style} ${track.version}`,
            "keywords": `${track.artist}, ${track.songName}, ${track.style}, ${track.version}, DJ, música eletrônica`,
            "additionalProperty": [
                {
                    "@type": "PropertyValue",
                    "name": "Version",
                    "value": track.version
                },
                {
                    "@type": "PropertyValue",
                    "name": "Style",
                    "value": track.style
                }
            ]
        };

        // Se faz parte de uma playlist, adicionar essa informação
        if (playlistName && position) {
            musicSchema.inPlaylist = {
                "@type": "MusicPlaylist",
                "name": playlistName,
                "position": position
            };
        }

        // Adicionar ou atualizar o script JSON-LD
        const existingScript = document.getElementById('music-structured-data');
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = 'music-structured-data';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(musicSchema);
        document.head.appendChild(script);

        // Cleanup quando o componente for desmontado
        return () => {
            const scriptToRemove = document.getElementById('music-structured-data');
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
        };
    }, [track, isPlaying, position, playlistName]);

    // Este componente não renderiza nada visível
    return null;
}
