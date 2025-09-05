import { Playlist } from '@/types/spotify-playlist';

// Dados mockados para a playlist
export const mockPlaylist: Playlist = {
    id: '123',
    title: 'Top 50 Semanal',
    description: 'As 50 músicas mais tocadas desta semana',
    author: 'Nexor Records',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
    totalTracks: 50,
    totalDuration: '2h 45m',
    createdAt: '2024-01-15',
    isPublic: true,
    isFeatured: true,
    tracks: [
        {
            id: '1',
            title: 'Midnight City',
            artists: ['M83'],
            album: 'Hurry Up, We\'re Dreaming',
            duration: '4:03',
            addedAt: '2024-01-15',
            coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center',
            previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        {
            id: '2',
            title: 'Strobe',
            artists: ['Deadmau5'],
            album: 'For Lack of a Better Name',
            duration: '10:37',
            addedAt: '2024-01-14',
            coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center',
            previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        {
            id: '3',
            title: 'One More Time',
            artists: ['Daft Punk'],
            album: 'Discovery',
            duration: '5:20',
            addedAt: '2024-01-13',
            coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center',
            previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        {
            id: '4',
            title: 'Levels',
            artists: ['Avicii'],
            album: 'True',
            duration: '3:19',
            addedAt: '2024-01-12',
            coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center',
            previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        {
            id: '5',
            title: 'Titanium',
            artists: ['David Guetta', 'Sia'],
            album: 'Nothing but the Beat',
            duration: '4:05',
            addedAt: '2024-01-11',
            coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center',
            previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        {
            id: '6',
            title: 'Clarity',
            artists: ['Zedd', 'Foxes'],
            album: 'Clarity',
            duration: '4:31',
            addedAt: '2024-01-10',
            coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center',
            previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        {
            id: '7',
            title: 'Animals',
            artists: ['Martin Garrix'],
            album: 'Gold Skies',
            duration: '3:11',
            addedAt: '2024-01-09',
            coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center',
            previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        {
            id: '8',
            title: 'Wake Me Up',
            artists: ['Avicii', 'Aloe Blacc'],
            album: 'True',
            duration: '4:09',
            addedAt: '2024-01-08',
            coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center',
            previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        {
            id: '9',
            title: 'Fade Into Darkness',
            artists: ['Avicii'],
            album: 'True',
            duration: '3:12',
            addedAt: '2024-01-07',
            coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center',
            previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        {
            id: '10',
            title: 'Scary Monsters and Nice Sprites',
            artists: ['Skrillex'],
            album: 'Scary Monsters and Nice Sprites',
            duration: '4:03',
            addedAt: '2024-01-06',
            coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center',
            previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        }
    ]
};

// Função para buscar playlist (mock por enquanto)
export const getPlaylist = async (id: string): Promise<Playlist> => {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockPlaylist;
};



