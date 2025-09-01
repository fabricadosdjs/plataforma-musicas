"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import { useDownloadsCache } from '@/hooks/useDownloadsCache';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useToastContext } from '@/context/ToastContext';
import { 
    Play, 
    Pause, 
    Shuffle, 
    Plus, 
    Download, 
    Search, 
    ChevronDown,
    Clock,
    Heart
} from 'lucide-react';

// Tipagem para os dados
type Artist = {
    name: string;
};

type GenreTrack = {
    id: number;
    title: string;
    artists: Artist[];
    album: string;
    dateAdded: string;
    duration: string;
    style?: string;
    pool?: string;
    imageUrl?: string;
    downloadUrl?: string;
    previewUrl?: string;
};

type GenreInfo = {
    name: string;
    imageUrl: string;
    trackCount: number;
    totalDuration: string;
    totalDownloads: number;
    totalLikes: number;
    uniqueArtists: number;
    description: string;
};

// Função para gerar imagem de gênero baseada no nome
const getGenreImage = (genreName: string): string => {
    const genreImages: { [key: string]: string } = {
        'house': 'https://i.scdn.co/image/ab67706f000000025974966c944a530776535560',
        'techno': 'https://i.scdn.co/image/ab67706f00000002e8b066f70c206551210d902b',
        'funk': 'https://i.scdn.co/image/ab67706f00000002b7caf9b5c6e14ef0e7e7a96e',
        'eletronica': 'https://i.scdn.co/image/ab67706f00000002e8b066f70c206551210d902b',
        'sertanejo': 'https://i.scdn.co/image/ab67706f00000002a27c4ca4c9e8c5b8f9b8c9c8',
        'trap': 'https://i.scdn.co/image/ab67706f00000002c8b444df094279e70d0ed856',
        'hip hop': 'https://i.scdn.co/image/ab67706f00000002c8b444df094279e70d0ed856',
        'pop': 'https://i.scdn.co/image/ab67706f00000002f0b0d73c0e6d8f5f8b0e0a8b',
        'rock': 'https://i.scdn.co/image/ab67706f00000002e3e3e3e3e3e3e3e3e3e3e3e3'
    };
    
    return genreImages[genreName.toLowerCase()] || 'https://i.scdn.co/image/ab67706f00000002b7caf9b5c6e14ef0e7e7a96e';
};

// Função para calcular duração total
const calculateTotalDuration = (tracks: GenreTrack[]): string => {
    const totalSeconds = tracks.reduce((acc, track) => {
        const [minutes, seconds] = track.duration.split(':').map(Number);
        return acc + (minutes * 60) + seconds;
    }, 0);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
};

// Função para gerar descrição do gênero
const generateGenreDescription = (genreName: string, stats: any): string => {
    if (!stats || stats.totalTracks === 0) {
        return `Descubra o melhor do ${genreName}. Uma seleção especial de músicas para você curtir.`;
    }

    const { totalTracks, totalDownloads, uniqueArtists } = stats;
    return `Uma coleção com ${totalTracks} música${totalTracks !== 1 ? 's' : ''} de ${uniqueArtists} artista${uniqueArtists !== 1 ? 's' : ''} diferentes. ${totalDownloads > 0 ? `Já foram realizados ${totalDownloads} downloads.` : ''} Perfeito para quem ama ${genreName}.`;
};

// --- FUNÇÕES DE MANIPULAÇÃO ---
const handlePlayPause = (
    isPlaying: boolean, 
    setIsPlaying: (playing: boolean) => void, 
    tracks: GenreTrack[], 
    playTrack: (track: any) => void
) => {
    console.log(isPlaying ? 'Pausando a playlist...' : 'Iniciando a reprodução...');
    
    if (!isPlaying && tracks.length > 0) {
        const firstTrack = tracks[0];
        if (firstTrack.previewUrl || firstTrack.downloadUrl) {
            playTrack({
                id: firstTrack.id,
                songName: firstTrack.title,
                artist: firstTrack.artists.map(a => a.name).join(', '),
                imageUrl: firstTrack.imageUrl,
                previewUrl: firstTrack.previewUrl || firstTrack.downloadUrl
            });
        }
    }
    setIsPlaying(!isPlaying);
};

const handleShuffle = (tracks: GenreTrack[], setTracks: (tracks: GenreTrack[]) => void) => {
    console.log('Embaralhando as músicas...');
    const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5);
    setTracks(shuffledTracks);
};

const handleAddToLibrary = (genreName: string, showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void) => {
    console.log('Adicionando à sua biblioteca...');
    showToast(`Gênero ${genreName} adicionado à sua biblioteca!`, 'success');
};

const handleDownload = (tracks: GenreTrack[], showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void) => {
    console.log('Iniciando o download...');
    showToast(`Iniciando download de ${tracks.length} música(s)...`, 'info');
};

const handleSearch = (
    query: string, 
    originalTracks: GenreTrack[], 
    setDisplayedTracks: (tracks: GenreTrack[]) => void
) => {
    if (!query) {
        setDisplayedTracks(originalTracks);
        return;
    }
    
    const lowercasedQuery = query.toLowerCase();
    const filteredTracks = originalTracks.filter(
        (track) =>
            track.title.toLowerCase().includes(lowercasedQuery) ||
            track.artists.some((artist) => artist.name.toLowerCase().includes(lowercasedQuery)) ||
            track.album.toLowerCase().includes(lowercasedQuery)
    );
    setDisplayedTracks(filteredTracks);
};

// --- COMPONENTES ---
const GenreHeader = ({ genreInfo }: { genreInfo: GenreInfo }) => {
    return (
        <div className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-6 p-6 bg-gradient-to-b from-blue-600 to-blue-800">
            <div className="w-60 h-60 rounded-lg shadow-2xl overflow-hidden flex-shrink-0">
                <img 
                    src={genreInfo.imageUrl} 
                    alt={genreInfo.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="text-white">
                <p className="text-sm font-medium uppercase tracking-widest mb-2">Playlist</p>
                <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-4 leading-none">
                    {genreInfo.name}
                </h1>
                <p className="text-gray-200 mb-4 max-w-2xl leading-relaxed">
                    {genreInfo.description}
                </p>
                <div className="flex items-center space-x-1 text-sm">
                    <span className="font-semibold">Plataforma de Músicas</span>
                    <span>•</span>
                    <span>{genreInfo.trackCount.toLocaleString()} música{genreInfo.trackCount !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{genreInfo.totalDuration}</span>
                </div>
            </div>
        </div>
    );
};

const ActionToolbar = ({ 
    isPlaying, 
    setIsPlaying, 
    tracks, 
    setTracks, 
    genreName, 
    showToast,
    playTrack,
    searchQuery,
    setSearchQuery,
    originalTracks,
    setDisplayedTracks,
    sortBy,
    setSortBy
}: {
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    tracks: GenreTrack[];
    setTracks: (tracks: GenreTrack[]) => void;
    genreName: string;
    showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
    playTrack: (track: any) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    originalTracks: GenreTrack[];
    setDisplayedTracks: (tracks: GenreTrack[]) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}) => {
    return (
        <div className="px-6 py-4 bg-gradient-to-b from-blue-800/20 to-transparent">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Botões de ação principais */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => handlePlayPause(isPlaying, setIsPlaying, tracks, playTrack)}
                        className="w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6 text-black" />
                        ) : (
                            <Play className="w-6 h-6 text-black ml-1" />
                        )}
                    </button>

                    <button
                        onClick={() => handleShuffle(tracks, setTracks)}
                        className="w-8 h-8 text-gray-300 hover:text-white transition-colors"
                    >
                        <Shuffle className="w-full h-full" />
                    </button>

                    <button
                        onClick={() => handleAddToLibrary(genreName, showToast)}
                        className="w-8 h-8 text-gray-300 hover:text-white transition-colors"
                    >
                        <Plus className="w-full h-full" />
                    </button>

                    <button
                        onClick={() => handleDownload(tracks, showToast)}
                        className="w-8 h-8 text-gray-300 hover:text-white transition-colors"
                    >
                        <Download className="w-full h-full" />
                    </button>
                </div>

                {/* Controles de filtro e busca */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Campo de busca */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar nas músicas..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                handleSearch(e.target.value, originalTracks, setDisplayedTracks);
                            }}
                            className="bg-white/10 border border-white/20 rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 w-64"
                        />
                    </div>

                    {/* Menu de ordenação */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none cursor-pointer pr-8"
                        >
                            <option value="recent" className="bg-gray-800">Mais recentes</option>
                            <option value="title" className="bg-gray-800">Título</option>
                            <option value="artist" className="bg-gray-800">Artista</option>
                            <option value="album" className="bg-gray-800">Álbum</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const TrackRow = ({ track, index, onPlayTrack, downloadedIds }: { 
    track: GenreTrack; 
    index: number; 
    onPlayTrack: (track: any) => void;
    downloadedIds: Set<number>;
}) => {
    const handlePlay = () => {
        onPlayTrack({
            id: track.id,
            songName: track.title,
            artist: track.artists.map(a => a.name).join(', '),
            imageUrl: track.imageUrl,
            previewUrl: track.previewUrl || track.downloadUrl
        });
    };

    return (
        <div className="grid grid-cols-[16px_1fr_1fr_1fr_1fr_60px] gap-4 px-6 py-2 text-sm text-gray-300 hover:bg-white/10 rounded group items-center">
            {/* Número/Play button */}
            <div className="flex items-center justify-center">
                <span className="group-hover:hidden text-gray-400">{index + 1}</span>
                <button 
                    onClick={handlePlay}
                    className="hidden group-hover:flex items-center justify-center"
                >
                    <Play className="w-4 h-4 text-white" />
                </button>
            </div>

            {/* Título e artista */}
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded overflow-hidden bg-gray-600 flex-shrink-0">
                    {track.imageUrl ? (
                        <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                                {track.title.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-white font-medium truncate">{track.title}</p>
                    <p className="text-gray-400 text-xs truncate">
                        {track.artists.map(a => a.name).join(', ')}
                    </p>
                </div>
            </div>

            {/* Álbum */}
            <div className="truncate">
                <span className="text-gray-400">{track.album || track.pool || 'Single'}</span>
            </div>

            {/* Data de adição */}
            <div className="truncate">
                <span className="text-gray-400">{track.dateAdded}</span>
            </div>

            {/* Like e Duração */}
            <div className="flex items-center justify-between">
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-4 h-4 text-gray-400 hover:text-green-500" />
                </button>
                <span className="text-gray-400">{track.duration}</span>
            </div>

            {/* Download status */}
            <div className="flex items-center justify-center">
                {downloadedIds.has(track.id) && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
            </div>
        </div>
    );
};

const TrackTable = ({ tracks, onPlayTrack, downloadedIds }: { 
    tracks: GenreTrack[]; 
    onPlayTrack: (track: any) => void;
    downloadedIds: Set<number>;
}) => {
    return (
        <div className="px-0">
            {/* Cabeçalho da tabela */}
            <div className="grid grid-cols-[16px_1fr_1fr_1fr_1fr_60px] gap-4 px-6 py-2 text-xs text-gray-400 border-b border-white/10 sticky top-0 bg-gray-900">
                <div>#</div>
                <div>TÍTULO</div>
                <div>ÁLBUM</div>
                <div>ADICIONADA EM</div>
                <div className="flex items-center justify-between">
                    <span>CURTIR</span>
                    <Clock className="w-4 h-4" />
                </div>
                <div></div>
            </div>

            {/* Lista de músicas */}
            <div className="pb-6">
                {tracks.map((track, index) => (
                    <TrackRow 
                        key={track.id} 
                        track={track} 
                        index={index} 
                        onPlayTrack={onPlayTrack}
                        downloadedIds={downloadedIds}
                    />
                ))}
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function GenrePage() {
    const params = useParams();
    const genreName = params?.genreName as string;
    const decodedGenreName = decodeURIComponent(genreName);
    const { showToast } = useToastContext();
    const { data: session } = useSession();
    const downloadsCache = useDownloadsCache();
    const { currentTrack, playTrack } = useGlobalPlayer();

    // Estados
    const [tracks, setTracks] = useState<GenreTrack[]>([]);
    const [displayedTracks, setDisplayedTracks] = useState<GenreTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        totalPlays: 0,
        uniqueArtists: 0,
        uniquePools: 0,
        totalTracks: 0
    });

    // Buscar dados do gênero
    useEffect(() => {
        const fetchGenreData = async () => {
            setLoading(true);
            try {
                // Buscar tracks
                const tracksResponse = await fetch(`/api/tracks/genre/${encodeURIComponent(decodedGenreName)}`);
                if (tracksResponse.ok) {
                    const tracksData = await tracksResponse.json();
                    
                    // Converter para formato esperado
                    const convertedTracks: GenreTrack[] = tracksData.tracks.map((track: any) => ({
                        id: track.id,
                        title: track.songName,
                        artists: [{ name: track.artist }],
                        album: track.pool || 'Single',
                        dateAdded: new Date(track.createdAt).toLocaleDateString('pt-BR'),
                        duration: '3:30', // Duração padrão - você pode calcular a real se tiver o arquivo
                        style: track.style,
                        pool: track.pool,
                        imageUrl: track.imageUrl,
                        downloadUrl: track.downloadUrl,
                        previewUrl: track.previewUrl
                    }));

                    setTracks(convertedTracks);
                    setDisplayedTracks(convertedTracks);
                }

                // Buscar estatísticas
                const statsResponse = await fetch(`/api/tracks/genre/${encodeURIComponent(decodedGenreName)}/stats`);
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData);
                }
            } catch (error) {
                console.error('Erro ao buscar dados do gênero:', error);
                showToast('Erro ao carregar dados do gênero', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (decodedGenreName) {
            fetchGenreData();
        }
    }, [decodedGenreName, showToast]);

    // Ordenar tracks baseado na seleção
    useEffect(() => {
        const sortedTracks = [...displayedTracks].sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'artist':
                    return a.artists[0].name.localeCompare(b.artists[0].name);
                case 'album':
                    return a.album.localeCompare(b.album);
                case 'recent':
                default:
                    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
            }
        });
        
        if (JSON.stringify(sortedTracks) !== JSON.stringify(displayedTracks)) {
            setDisplayedTracks(sortedTracks);
        }
    }, [sortBy, displayedTracks]);

    // Criar informações do gênero
    const genreInfo: GenreInfo = {
        name: decodedGenreName,
        imageUrl: getGenreImage(decodedGenreName),
        trackCount: tracks.length,
        totalDuration: calculateTotalDuration(tracks),
        totalDownloads: stats.totalDownloads,
        totalLikes: stats.totalLikes,
        uniqueArtists: stats.uniqueArtists,
        description: generateGenreDescription(decodedGenreName, stats)
    };

    const handlePlayTrack = (track: any) => {
        playTrack(track);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Header />
                <div className="flex items-center justify-center h-64">
                    <div className="text-white text-lg">Carregando...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <Header />
            
            {/* Header do gênero */}
            <GenreHeader genreInfo={genreInfo} />

            {/* Toolbar de ações */}
            <ActionToolbar
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                tracks={displayedTracks}
                setTracks={setDisplayedTracks}
                genreName={decodedGenreName}
                showToast={showToast}
                playTrack={handlePlayTrack}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                originalTracks={tracks}
                setDisplayedTracks={setDisplayedTracks}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            {/* Tabela de músicas */}
            {displayedTracks.length > 0 ? (
                <TrackTable 
                    tracks={displayedTracks} 
                    onPlayTrack={handlePlayTrack}
                    downloadedIds={new Set(downloadsCache.downloadedTrackIds)}
                />
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-6xl mb-4">🎵</div>
                    <h3 className="text-xl font-semibold mb-2">Nenhuma música encontrada</h3>
                    <p className="text-gray-400">
                        {searchQuery ? 'Tente uma busca diferente' : 'Ainda não há músicas neste gênero'}
                    </p>
                </div>
            )}
        </div>
    );
}
