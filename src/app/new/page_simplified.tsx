// Versão simplificada da página new com lista simples de resultados
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Search, X, Filter, Download, Music, Heart, Check, Play, Pause } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import NewFooter from '@/components/layout/NewFooter';
import FiltersModal from '@/components/music/FiltersModal';
import { useAppContext } from '@/context/AppContext';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { Track } from '@/types/track';

const NewPage = () => {
    // Estados básicos
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
    const [showFiltersModal, setShowFiltersModal] = useState(false);

    // Estados de filtros
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [selectedArtist, setSelectedArtist] = useState('all');
    const [selectedPool, setSelectedPool] = useState('all');
    const [selectedVersion, setSelectedVersion] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedDateRange, setSelectedDateRange] = useState('all');

    // Estados de interação
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<string[]>([]);
    const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
    const [downloadQueue, setDownloadQueue] = useState<string[]>([]);
    const [zipProgress, setZipProgress] = useState(0);

    // Hooks
    const { data: session } = useSession();
    const { showAlert } = useAppContext();
    const { currentTrack, isPlaying, playTrack } = useGlobalPlayer();

    // Dados derivados
    const filteredTracks = useMemo(() => {
        let filtered = tracks;

        // Aplicar pesquisa
        if (appliedSearchQuery) {
            const query = appliedSearchQuery.toLowerCase();
            filtered = filtered.filter(track =>
                track.title.toLowerCase().includes(query) ||
                track.artist.toLowerCase().includes(query) ||
                track.style.toLowerCase().includes(query) ||
                track.pool.toLowerCase().includes(query)
            );
        }

        // Aplicar filtros
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
    }, [tracks, appliedSearchQuery, selectedGenre, selectedArtist, selectedPool, selectedVersion]);

    const hasActiveFilters = selectedGenre !== 'all' || selectedArtist !== 'all' || selectedPool !== 'all' || selectedVersion !== 'all';

    // Funções auxiliares
    const handleSearchSubmit = () => {
        setAppliedSearchQuery(searchQuery);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setAppliedSearchQuery('');
    };

    const handleClearFilters = () => {
        setSelectedGenre('all');
        setSelectedArtist('all');
        setSelectedPool('all');
        setSelectedVersion('all');
        setSelectedMonth('all');
        setSelectedDateRange('all');
    };

    const handleStyleClick = (style: string | undefined) => {
        if (style) {
            setSelectedGenre(style);
            setAppliedSearchQuery('');
        }
    };

    const handlePoolClick = (pool: string | undefined) => {
        if (pool) {
            setSelectedPool(pool);
            setAppliedSearchQuery('');
        }
    };

    const handleLikeToggle = (trackId: string) => {
        setLikedTrackIds(prev =>
            prev.includes(trackId)
                ? prev.filter(id => id !== trackId)
                : [...prev, trackId]
        );
    };

    const handleDownload = (track: Track) => {
        // Implementar lógica de download
        console.log('Downloading track:', track.title);
    };

    const downloadAllTracks = (tracksToDownload: Track[]) => {
        // Implementar lógica de download em lote
        console.log('Downloading all tracks:', tracksToDownload.length);
    };

    const downloadNewTracks = (tracksToDownload: Track[]) => {
        const newTracks = tracksToDownload.filter(track => !downloadedTrackIds.includes(track.id));
        console.log('Downloading new tracks:', newTracks.length);
    };

    // Carregar dados
    useEffect(() => {
        const fetchTracks = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/tracks');
                if (response.ok) {
                    const data = await response.json();
                    setTracks(data);
                } else {
                    console.error('Erro ao carregar músicas');
                }
            } catch (error) {
                console.error('Erro ao carregar músicas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, []);

    // Renderização
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] text-white">
            {/* Header */}
            <Header />

            {/* Barra de Busca e Filtros */}
            <div className="relative z-[9997] bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border-b border-gray-800/50" style={{ marginTop: '76px' }}>
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                            <div className="relative">
                                <span className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar músicas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                    className="w-full min-w-[120px] sm:min-w-0 pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-4 text-sm sm:text-base bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-gray-600/50 transition-all duration-300 font-sans"
                                />
                                <button
                                    onClick={handleSearchSubmit}
                                    disabled={!searchQuery.trim()}
                                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-xl p-2 flex items-center justify-center transition-all duration-300 shadow-lg disabled:bg-gray-700 disabled:cursor-not-allowed"
                                    style={{ height: '32px', width: '32px' }}
                                    title="Buscar"
                                >
                                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                                {searchQuery && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="absolute right-10 sm:right-14 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-white transition-colors"
                                        style={{ zIndex: 2 }}
                                        title="Limpar busca"
                                    >
                                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Botão de Filtros para Mobile */}
                        <button
                            onClick={() => setShowFiltersModal(true)}
                            className="flex items-center gap-2 px-4 py-2 sm:py-4 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-2xl transition-all duration-300 shadow-lg font-sans"
                            title="Abrir filtros"
                        >
                            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">Filtros</span>
                        </button>
                    </div>

                    {/* Botão de Limpar Filtros */}
                    {hasActiveFilters && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleClearFilters}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 bg-red-600/20 backdrop-blur-xl border border-red-600/30 text-red-400 hover:bg-red-600/30 hover:border-red-600/50 hover:text-red-300 font-sans"
                                title="Limpar todos os filtros"
                            >
                                <X className="h-4 w-4" />
                                <span className="hidden sm:inline">Limpar Filtros</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="container mx-auto px-4 py-8" style={{ paddingTop: '2rem' }}>
                {/* Layout Principal */}
                <div className="flex flex-col gap-8">
                    {/* Conteúdo Principal */}
                    <div className="w-full">
                        {/* Header de Pesquisa - Mostrar quando há pesquisa ativa */}
                        {appliedSearchQuery && (
                            <div className="mb-8 p-6 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl border border-blue-500/30">
                                <div className="text-center">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                        🔍 Resultados da Pesquisa
                                    </h2>
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <Search className="h-6 w-6 text-blue-400" />
                                        <span className="text-lg text-gray-200">
                                            Pesquisando por: <span className="text-blue-300 font-semibold">"{appliedSearchQuery}"</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-center gap-4 text-sm">
                                        <span className="text-gray-300">
                                            {filteredTracks.length} {filteredTracks.length === 1 ? 'música encontrada' : 'músicas encontradas'}
                                        </span>
                                        {tracks.length !== filteredTracks.length && (
                                            <span className="text-gray-400">
                                                de {tracks.length} total
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Renderização condicional baseada em filtros ativos ou pesquisa */}
                        {(hasActiveFilters || appliedSearchQuery) ? (
                            // Lista de músicas filtradas/pesquisadas
                            <div className="space-y-6">
                                <div className="mb-6">
                                    <h2 className="text-lg sm:text-xl font-bold text-white mb-2 font-sans">
                                        {appliedSearchQuery ? '🔍 Resultados da Pesquisa' : '🎵 Músicas Encontradas com Filtros'}
                                    </h2>
                                    <p className="text-gray-400 text-sm font-sans">
                                        {filteredTracks.length} {filteredTracks.length === 1 ? 'música encontrada' : 'músicas encontradas'}
                                        {appliedSearchQuery && tracks.length !== filteredTracks.length && ` de ${tracks.length} total`}
                                    </p>
                                </div>

                                {/* Lista simples de todas as músicas filtradas/pesquisadas */}
                                <div className="space-y-3">
                                    {filteredTracks.map((track) => (
                                        <div key={track.id} className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 hover:bg-gray-700/40 transition-all duration-300">
                                            <div className="flex items-center space-x-4">
                                                {/* Imagem do álbum */}
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-red-500/30">
                                                        {track.imageUrl ? (
                                                            <Image
                                                                src={track.imageUrl}
                                                                alt={`Capa de ${track.title}`}
                                                                width={80}
                                                                height={80}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                                                                <Music className="h-8 w-8 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Overlay de play/pause */}
                                                    <div className="absolute inset-0 bg-red-900/60 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                                        <button
                                                            onClick={() => playTrack(track)}
                                                            className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-300"
                                                        >
                                                            {currentTrack?.id === track.id && isPlaying ? (
                                                                <Pause className="h-6 w-6 text-white" />
                                                            ) : (
                                                                <Play className="h-6 w-6 text-white" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Informações da música */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white font-semibold text-sm sm:text-base mb-1 truncate">
                                                        {track.title}
                                                    </h3>
                                                    <p className="text-gray-300 text-sm mb-2 truncate">
                                                        {track.artist}
                                                    </p>

                                                    {/* Estilos e Pool/Label clicáveis */}
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        <button
                                                            onClick={() => handleStyleClick(track.style)}
                                                            className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors duration-200"
                                                        >
                                                            {track.style}
                                                        </button>
                                                        <button
                                                            onClick={() => handlePoolClick(track.pool)}
                                                            className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 transition-colors duration-200"
                                                        >
                                                            {track.pool}
                                                        </button>
                                                    </div>

                                                    {/* Data de lançamento */}
                                                    {track.releaseDate && (
                                                        <div className="text-gray-400 text-xs">
                                                            Lançado em: {new Date(track.releaseDate).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Botões de ação */}
                                                <div className="flex flex-col items-end space-y-2">
                                                    {/* Botão de like */}
                                                    <button
                                                        onClick={() => handleLikeToggle(track.id)}
                                                        className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${likedTrackIds.includes(track.id)
                                                            ? 'bg-gradient-to-br from-red-500/30 to-red-600/40 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/20'
                                                            : 'bg-gradient-to-br from-gray-600/30 to-gray-700/40 text-gray-400 border border-gray-600/50 hover:from-gray-500/40 hover:to-gray-600/50 hover:text-gray-300 shadow-lg shadow-gray-600/20 hover:shadow-xl hover:shadow-gray-600/30'
                                                            }`}
                                                        title={likedTrackIds.includes(track.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                                    >
                                                        <Heart className="h-4 w-4" />
                                                    </button>

                                                    {/* Botão de download */}
                                                    <button
                                                        onClick={() => handleDownload(track)}
                                                        disabled={downloadedTrackIds.includes(track.id)}
                                                        className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${downloadedTrackIds.includes(track.id)
                                                            ? 'bg-gradient-to-br from-green-500/30 to-green-600/40 text-green-400 border border-green-500/50 cursor-not-allowed shadow-lg shadow-green-500/20'
                                                            : 'bg-gradient-to-br from-blue-500/30 to-blue-600/40 text-blue-400 border border-blue-500/50 hover:from-blue-500/40 hover:to-blue-600/50 hover:text-blue-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30'
                                                            }`}
                                                        title={downloadedTrackIds.includes(track.id) ? 'Já baixada' : 'Baixar música'}
                                                    >
                                                        {downloadedTrackIds.includes(track.id) ? (
                                                            <Check className="h-4 w-4" />
                                                        ) : (
                                                            <Download className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Conteúdo padrão quando não há filtros ou pesquisa
                            <div className="text-center py-12">
                                <h1 className="text-3xl font-bold text-white mb-4">
                                    🎵 Bem-vindo à plataforma!
                                </h1>
                                <p className="text-gray-300 text-lg">
                                    Use a barra de pesquisa acima para encontrar suas músicas favoritas
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Filtros */}
            <FiltersModal
                isOpen={showFiltersModal}
                onClose={() => setShowFiltersModal(false)}
                genres={[]}
                artists={[]}
                versions={[]}
                pools={[]}
                monthOptions={[]}
                selectedGenre={selectedGenre}
                selectedArtist={selectedArtist}
                selectedDateRange={selectedDateRange}
                selectedVersion={selectedVersion}
                selectedMonth={selectedMonth}
                selectedPool={selectedPool}
                onGenreChange={setSelectedGenre}
                onArtistChange={setSelectedArtist}
                onDateRangeChange={() => { }}
                onVersionChange={setSelectedVersion}
                onMonthChange={setSelectedMonth}
                onPoolChange={setSelectedPool}
                onApplyFilters={() => { }}
                onClearFilters={handleClearFilters}
                isLoading={loading}
                hasActiveFilters={hasActiveFilters}
            />
        </div>
    );
};

export default NewPage;

