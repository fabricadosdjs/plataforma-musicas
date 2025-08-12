"use client";

interface MusicStructuredDataProps {
    track: {
        id: number;
        songName: string;
        artist: string;
        style: string;
        imageUrl: string;
        downloadUrl: string;
        releaseDate: string;
        duration?: number;
    };
    url: string;
}

export default function MusicStructuredData({ track, url }: MusicStructuredDataProps) {
    const fullUrl = `https://djpools.nexorrecords.com.br${url}`;
    const fullImage = track.imageUrl.startsWith('http') ? track.imageUrl : `https://djpools.nexorrecords.com.br${track.imageUrl}`;

    const musicSchema = {
        "@context": "https://schema.org",
        "@type": "MusicRecording",
        "name": track.songName,
        "description": `${track.songName} por ${track.artist} - ${track.style}`,
        "image": fullImage,
        "url": fullUrl,
        "byArtist": {
            "@type": "MusicGroup",
            "name": track.artist
        },
        "genre": track.style,
        "datePublished": track.releaseDate,
        "duration": track.duration ? `PT${Math.floor(track.duration / 60)}M${track.duration % 60}S` : undefined,
        "inAlbum": {
            "@type": "MusicAlbum",
            "name": "Nexor Records Pools",
            "byArtist": {
                "@type": "MusicGroup",
                "name": "Nexor Records"
            }
        },
        "publisher": {
            "@type": "Organization",
            "name": "Nexor Records",
            "url": "https://djpools.nexorrecords.com.br"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(musicSchema)
            }}
        />
    );
}
