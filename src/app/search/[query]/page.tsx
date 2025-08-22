"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Search, X, Filter, Music, ArrowLeft, Sparkles } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import FiltersModal from '@/components/music/FiltersModal';
import { MusicList } from '@/components/music/MusicList';
import { useAppContext } from '@/context/AppContext';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { Track } from '@/types/track';

const SearchPage = () => {
    const params = useParams();
    const query = params?.query ? decodeURIComponent(params.query as string) : '';

    // Verificar se há uma query válida
    if (!query) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-4">Query de busca inválida</h1>
                        <button
                            onClick={() => window.open('/new', '_blank')}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                            Voltar para /new
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // Estados principais
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(query);
    const [showFiltersModal, setShowFiltersModal] = useState(false);

    // Estados de filtros
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [selectedArtist, setSelectedArtist] = useState('all');
    const [selectedPool, setSelectedPool] = useState('all');
    const [selectedVersion, setSelectedVersion] = useState('all');
    const [selectedDateRange, setSelectedDateRange] = useState('all');

    // Estados de interação
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);
    const [likedTrackIds, setLikedTrackIds] = useState<number[]>([]);

    // Estados para paginação
    const [hasMoreTracks, setHasMoreTracks] = useState(false);
    const [totalTracksCount, setTotalTracksCount] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Hooks
    const { data: session } = useSession();
    const { showAlert } = useAppContext();
    const { currentTrack, isPlaying, playTrack } = useGlobalPlayer();

    // Dados filtrados
    const filteredTracks = useMemo(() => {
        let filtered = tracks;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(track =>
                track.songName.toLowerCase().includes(query) ||
                track.artist.toLowerCase().includes(query) ||
                track.style.toLowerCase().includes(query) ||
                (track.pool && track.pool.toLowerCase().includes(query))
            );
        }

        if (selectedGenre !== 'all') {
            filtered = filtered.filter(track => track.style === selectedGenre);
        }
        if (selectedArtist !== 'all') {
            filtered = filtered.filter(track => track.artist === selectedArtist);
        }
        if (selectedPool !== 'all') {
            filtered = filtered.filter(track => track.pool === selectedPool);
        }
        if (selectedVersion !== 'all') {
            filtered = filtered.filter(track => track.version === selectedVersion);
        }

        return filtered;
    }, [tracks, searchQuery, selectedGenre, selectedArtist, selectedPool, selectedVersion]);

    const hasActiveFilters = selectedGenre !== 'all' || selectedArtist !== 'all' ||
        selectedPool !== 'all' || selectedVersion !== 'all';

    // Funções de manipulação
    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleClearFilters = () => {
        setSelectedGenre('all');
        setSelectedArtist('all');
        setSelectedPool('all');
        setSelectedVersion('all');
        setSelectedDateRange('all');
    };

    const handleBackToNew = () => {
        window.open('/new', '_blank');
    };

    // Função para carregar mais músicas
    const loadMoreTracks = async () => {
        if (isLoadingMore || !hasMoreTracks) return;

        try {
            setIsLoadingMore(true);
            const nextPage = Math.ceil(tracks.length / 50) + 1;
            const response = await fetch(`/api/tracks?limit=50&page=${nextPage}&search=${encodeURIComponent(query)}`);

            if (response.ok) {
                const data = await response.json();
                const newTracks = Array.isArray(data.tracks) ? data.tracks : [];
                setTracks(prev => [...prev, ...newTracks]);
                setHasMoreTracks(data.hasMore || false);
            }
        } catch (error) {
            console.error('Erro ao carregar mais músicas:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Carregar dados de busca
    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/tracks?search=${encodeURIComponent(query)}&limit=50&page=1`);

                if (response.ok) {
                    const data = await response.json();
                    const tracksData = Array.isArray(data.tracks) ? data.tracks : [];
                    setTracks(tracksData);
                    setTotalTracksCount(data.totalCount || 0);
                    setHasMoreTracks(data.hasMore || false);
                }
            } catch (error) {
                console.error('Erro ao buscar músicas:', error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchSearchResults();
        }
    }, [query]);

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                {/* Header da busca */}
                <div className="max-w-5xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-6 sm:py-8 md:py-12">
                    <div className="text-center mb-6 sm:mb-8 md:mb-12">
                        {/* Botão voltar */}
                        <button
                            onClick={handleBackToNew}
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm">Voltar para /new</span>
                        </button>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Resultados da Busca
                            </span>
                        </h1>

                        <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
                            Buscando por: <span className="text-purple-400 font-semibold">"{query}"</span>
                        </p>
                    </div>

                    {/* Barra de pesquisa */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
                        <div className="flex-1 w-full sm:max-w-lg lg:max-w-xl">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Nova busca..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/60 backdrop-blur-xl border border-gray-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Botão de filtros */}
                        <button
                            onClick={() => setShowFiltersModal(true)}
                            className={`w-full sm:w-auto px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${hasActiveFilters
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/25'
                                : 'bg-gray-800/60 text-gray-300 border border-gray-700/50 hover:bg-gray-700/60 hover:text-white'
                                }`}
                        >
                            <Filter className="h-4 w-4" />
                            <span className="text-sm">Filtros</span>
                            {hasActiveFilters && (
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            )}
                        </button>
                    </div>

                    {/* Estatísticas da busca */}
                    {!loading && (
                        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800/50 rounded-lg p-4 mb-6 text-center">
                            <p className="text-sm sm:text-base text-gray-300">
                                <span className="text-purple-400 font-semibold">{filteredTracks.length}</span>
                                {filteredTracks.length === 1 ? ' música encontrada' : ' músicas encontradas'}
                                de <span className="text-purple-400 font-semibold">{totalTracksCount}</span> total
                            </p>
                        </div>
                    )}
                </div>

                {/* Lista de Músicas */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full mb-4">
                            <div className="w-full h-full border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-lg font-medium text-gray-400">Buscando músicas...</p>
                    </div>
                ) : filteredTracks.length > 0 ? (
                    <>
                        <div className="max-w-5xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6">
                            <MusicList
                                tracks={filteredTracks}
                                downloadedTrackIds={downloadedTrackIds}
                                setDownloadedTrackIds={setDownloadedTrackIds}
                                itemsPerPage={4}
                            />
                        </div>

                        {/* Botão para carregar mais músicas */}
                        {hasMoreTracks && (
                            <div className="text-center py-8">
                                <button
                                    onClick={loadMoreTracks}
                                    disabled={isLoadingMore}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50"
                                >
                                    {isLoadingMore ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Carregando mais músicas...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 inline mr-2 group-hover:rotate-12 transition-transform" />
                                            Carregar mais músicas
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Music className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Nenhuma música encontrada para "{query}"
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Tente usar termos diferentes ou ajustar os filtros
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={handleClearSearch}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300"
                            >
                                Limpar Busca
                            </button>
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-300"
                            >
                                Limpar Filtros
                            </button>
                        </div>
                    </div>
                )}

                {/* Modal de Filtros */}
                <FiltersModal
                    isOpen={showFiltersModal}
                    onClose={() => setShowFiltersModal(false)}
                    genres={Array.from(new Set(tracks.map(t => t.style).filter(Boolean))).sort()}
                    artists={Array.from(new Set(tracks.map(t => t.artist).filter(Boolean))).sort()}
                    versions={Array.from(new Set(tracks.map(t => t.version).filter((v): v is string => Boolean(v)))).sort()}
                    pools={Array.from(new Set(tracks.map(t => t.pool).filter((p): p is string => Boolean(p)))).sort()}
                    monthOptions={[]}
                    selectedGenre={selectedGenre}
                    selectedArtist={selectedArtist}
                    selectedDateRange={selectedDateRange}
                    selectedVersion={selectedVersion}
                    selectedMonth={'all'}
                    selectedPool={selectedPool}
                    onGenreChange={setSelectedGenre}
                    onArtistChange={setSelectedArtist}
                    onDateRangeChange={setSelectedDateRange}
                    onVersionChange={setSelectedVersion}
                    onMonthChange={() => { }}
                    onPoolChange={setSelectedPool}
                    onApplyFilters={() => setShowFiltersModal(false)}
                    onClearFilters={handleClearFilters}
                    isLoading={loading}
                    hasActiveFilters={hasActiveFilters}
                />
            </div>
        </MainLayout>
    );
};

export default SearchPage;
