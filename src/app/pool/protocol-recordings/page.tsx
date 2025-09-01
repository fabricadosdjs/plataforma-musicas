"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import MusicList from '@/components/music/MusicList';
import { Track } from '@/types/track';
import { Download, Heart, Play, TrendingUp, Users, Calendar, Music } from 'lucide-react';

export default function ProtocolRecordingsPage() {
    const poolName = "Protocol Recordings";
    const [tracks, setTracks] = useState<Track[]>([]);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        totalPlays: 0,
        uniqueArtists: 0,
        uniqueGenres: 0,
        latestRelease: null as Date | null
    });

    useEffect(() => {
        const saved = localStorage.getItem('downloadedTrackIds');
        if (saved) {
            try { setDownloadedTrackIds(JSON.parse(saved)); } catch { }
        }
    }, []);

    const handleDownloadedTrackIdsChange = (newIds: number[] | ((prev: number[]) => number[])) => {
        if (typeof newIds === 'function') {
            setDownloadedTrackIds(newIds);
        } else {
            setDownloadedTrackIds(newIds);
        }
        localStorage.setItem('downloadedTrackIds', JSON.stringify(typeof newIds === 'function' ? newIds(downloadedTrackIds) : newIds));
    };

    useEffect(() => {
        const fetchPoolTracks = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/tracks/pool/${encodeURIComponent(poolName)}`);
                if (response.ok) {
                    const data = await response.json();
                    const tracksData = Array.isArray(data.tracks) ? data.tracks : [];
                    setTracks(tracksData);
                    setFilteredTracks(tracksData);

                    // Calcular estatísticas
                    if (tracksData.length > 0) {
                        const uniqueArtists = new Set(tracksData.map((t: Track) => t.artist)).size;
                        const uniqueGenres = new Set(tracksData.map((t: Track) => t.style)).size;
                        const latestRelease = new Date(Math.max(...tracksData.map((t: Track) => new Date(t.releaseDate).getTime())));

                        setStats({
                            totalDownloads: 0, // Campo não existe no modelo Track
                            totalLikes: 0, // Campo não existe no modelo Track
                            totalPlays: 0, // Campo não existe no modelo Track
                            uniqueArtists,
                            uniqueGenres,
                            latestRelease
                        });
                    }
                } else {
                    setTracks([]);
                    setFilteredTracks([]);
                }
            } catch (e) {
                setTracks([]);
                setFilteredTracks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPoolTracks();
    }, []);

    // Processar filtros da URL (hash)
    useEffect(() => {
        const hash = window.location.hash;
        const genreMatch = hash.match(/genre=([^&]+)/);

        if (genreMatch) {
            const genre = decodeURIComponent(genreMatch[1]);
            setSelectedGenre(genre);
        } else {
            setSelectedGenre(null);
        }
    }, []);

    // Filtrar tracks baseado no gênero selecionado
    useEffect(() => {
        if (selectedGenre) {
            const filtered = tracks.filter(track => track.style === selectedGenre);
            setFilteredTracks(filtered);
        } else {
            setFilteredTracks(tracks);
        }
    }, [selectedGenre, tracks]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-black">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-amber-400 text-lg">Carregando músicas da pool...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-black text-white">
                {/* Hero Section */}
                <div className="relative z-10 bg-gradient-to-r from-slate-900 via-neutral-900 to-zinc-900 border-b border-gray-700/40 shadow-2xl">
                    <div className="container mx-auto px-4 py-16">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-700 to-gray-600 rounded-3xl shadow-2xl mb-6">
                                <span className="text-white text-5xl">🏷️</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-gray-200 via-gray-300 to-gray-100 bg-clip-text text-transparent mb-6">
                                {poolName}
                            </h1>
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent mx-auto w-48 mb-6"></div>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                Explore todas as músicas da label {poolName} disponíveis na plataforma.
                            </p>
                            <div className="mt-8">
                                <span className="inline-block bg-gradient-to-r from-gray-700/40 to-gray-600/40 text-gray-200 px-6 py-3 rounded-full text-lg font-semibold border border-gray-500/50 shadow-lg">
                                    {tracks.length} músicas disponíveis
                                    {selectedGenre && (
                                        <span className="ml-2 text-amber-400">
                                            • {filteredTracks.length} do estilo {selectedGenre}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards de Estatísticas */}
                <div className="relative z-[9988] -mt-8 mb-8">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            {/* Total de Músicas */}
                            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Music className="h-6 w-6 text-blue-400" />
                                </div>
                                <div className="text-blue-400 font-bold text-2xl">{tracks.length}</div>
                                <div className="text-blue-300 text-sm">Músicas</div>
                            </div>

                            {/* Total de Downloads */}
                            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300">
                                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Download className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="text-green-400 font-bold text-2xl">{stats.totalDownloads.toLocaleString()}</div>
                                <div className="text-green-300 text-sm">Downloads</div>
                            </div>

                            {/* Total de Likes */}
                            <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300">
                                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Heart className="h-6 w-6 text-pink-400" />
                                </div>
                                <div className="text-pink-400 font-bold text-2xl">{stats.totalLikes.toLocaleString()}</div>
                                <div className="text-pink-300 text-sm">Likes</div>
                            </div>

                            {/* Total de Plays */}
                            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Play className="h-6 w-6 text-purple-400" />
                                </div>
                                <div className="text-purple-400 font-bold text-2xl">{stats.totalPlays.toLocaleString()}</div>
                                <div className="text-purple-300 text-sm">Plays</div>
                            </div>

                            {/* Artistas Únicos */}
                            <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Users className="h-6 w-6 text-amber-400" />
                                </div>
                                <div className="text-amber-400 font-bold text-2xl">{stats.uniqueArtists}</div>
                                <div className="text-amber-300 text-sm">Artistas</div>
                            </div>

                            {/* Gêneros Únicos */}
                            <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300">
                                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <TrendingUp className="h-6 w-6 text-indigo-400" />
                                </div>
                                <div className="text-indigo-400 font-bold text-2xl">{stats.uniqueGenres}</div>
                                <div className="text-indigo-300 text-sm">Gêneros</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top 5 Músicas */}
                {tracks.length > 0 && (
                    <div className="relative z-[9987] mb-8">
                        <div className="container mx-auto px-4">
                            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">🔥</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Top 5 Mais Populares</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                    {tracks.slice(0, 5).map((track, index) => (
                                        <div key={track.id} className="bg-gray-800/50 rounded-xl p-3 sm:p-4 hover:bg-gray-700/50 transition-all duration-300 group">
                                            {/* Posição */}
                                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                <span className="text-lg sm:text-2xl font-bold text-gray-400">#{index + 1}</span>
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">{index + 1}</span>
                                                </div>
                                            </div>

                                            {/* Capa da música */}
                                            <div className="relative mb-2 sm:mb-3">
                                                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-700">
                                                    {track.imageUrl && track.imageUrl !== '' && track.imageUrl !== 'undefined' ? (
                                                        <img
                                                            src={track.imageUrl}
                                                            alt={`${track.artist} - ${track.songName}`}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                                                            <span className="text-white text-2xl sm:text-3xl">🎵</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Informações da música */}
                                            <div className="text-center">
                                                <h3 className="font-bold text-white text-xs sm:text-sm mb-1 line-clamp-2 group-hover:text-yellow-300 transition-colors">
                                                    {track.songName}
                                                </h3>
                                                <p className="text-gray-300 text-xs mb-1 sm:mb-2">{track.artist}</p>
                                                <p className="text-gray-400 text-xs">{track.style}</p>
                                            </div>

                                            {/* Estatísticas */}
                                            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-600/30">
                                                <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
                                                    <div className="text-center">
                                                        <div className="text-green-400 font-bold">{track.downloadCount || 0}</div>
                                                        <div className="text-gray-500">Downloads</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-pink-400 font-bold">{track.likeCount || 0}</div>
                                                        <div className="text-gray-500">Likes</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-blue-400 font-bold">0</div>
                                                        <div className="text-gray-500">Plays</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de Músicas */}
                <div className="relative z-[9989]">
                    <div className="container mx-auto px-4 py-6">
                        <MusicList
                            tracks={filteredTracks}
                            downloadedTrackIds={downloadedTrackIds}
                            setDownloadedTrackIds={handleDownloadedTrackIdsChange}
                            showDate={true}
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
