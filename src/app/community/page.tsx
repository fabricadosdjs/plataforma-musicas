// src/app/community/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Download, Heart, Play, Pause, Music, TrendingUp, Clock, Star, Users, Upload, Calendar, Award, Zap, Eye, Download as DownloadIcon, Heart as HeartIcon, Play as PlayIcon } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useDownloadExtensionDetector } from '@/hooks/useDownloadExtensionDetector';
import { useToast } from '@/hooks/useToast';
import MusicTable from '@/components/music/MusicTable';
import Header from '@/components/layout/Header';
import FiltersModal from '@/components/music/FiltersModal';
import { useMusicPageTitle } from '@/hooks/useDynamicTitle';
import { Track } from '@/types/track';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Target, Globe } from 'lucide-react';

function CommunityPageContent() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { hasExtension, detectedExtensions } = useDownloadExtensionDetector();
    const { showToast } = useToast();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [tracksByDate, setTracksByDate] = useState<{ [date: string]: Track[] }>({});
    const [sortedDates, setSortedDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [stats, setStats] = useState({
        totalTracks: 0,
        totalArtists: 0,
        totalDownloads: 0,
        totalLikes: 0,
        totalPlays: 0,
        recentUploads: 0
    });

    const handleDownloadTracks = async (tracksToDownload: Track[]) => {
        if (!tracksToDownload || tracksToDownload.length === 0) return;
        setDownloading(true);
        for (const track of tracksToDownload) {
            if (track.downloadUrl) {
                const link = document.createElement('a');
                link.href = track.downloadUrl;
                link.download = `${track.artist} - ${track.songName}.mp3`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                await new Promise(res => setTimeout(res, 200));
            }
        }
        setDownloading(false);
    };

    const [searchLoading, setSearchLoading] = useState(false);
    const [genres, setGenres] = useState<string[]>([]);
    const [artists, setArtists] = useState<string[]>([]);
    const [versions, setVersions] = useState<string[]>([]);
    const [pools, setPools] = useState<string[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [selectedArtist, setSelectedArtist] = useState('all');
    const [selectedDateRange, setSelectedDateRange] = useState('all');
    const [selectedVersion, setSelectedVersion] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedPool, setSelectedPool] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const [showFiltersModal, setShowFiltersModal] = useState(false);

    // Paginação de datas (dias): 7 tabelas por página
    const TABLES_PER_PAGE = 7;
    const [daysPage, setDaysPage] = useState(0);
    const totalDays = sortedDates.length;
    const totalDayPages = Math.ceil(totalDays / TABLES_PER_PAGE);
    const pagedDates = sortedDates.slice(daysPage * TABLES_PER_PAGE, (daysPage + 1) * TABLES_PER_PAGE);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00');
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();
        if (isToday) return 'Hoje';
        if (isYesterday) return 'Ontem';
        return date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/tracks/community/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchFilters = async () => {
        try {
            const response = await fetch('/api/tracks/filters');
            if (response.ok) {
                const data = await response.json();
                setGenres(data.genres || []);
                setArtists(data.artists || []);
                setVersions(data.versions || []);
                setPools(data.pools || []);
            }
        } catch (error) {
            console.error('Error fetching filters:', error);
        }
    };

    const fetchCommunityTracks = async (resetPage = false) => {
        try {
            setSearchLoading(true);
            const params = new URLSearchParams();

            // Filtros específicos para comunidade
            if (selectedGenre !== 'all') params.append('genre', selectedGenre);
            if (selectedArtist !== 'all') params.append('artist', selectedArtist);
            if (selectedDateRange !== 'all') params.append('dateRange', selectedDateRange);
            if (selectedVersion !== 'all') params.append('version', selectedVersion);
            if (selectedMonth !== 'all') params.append('month', selectedMonth);
            if (selectedPool !== 'all') params.append('pool', selectedPool);
            if (searchQuery.trim()) params.append('search', searchQuery.trim());

            // Parâmetro específico para músicas da comunidade
            params.append('community', 'true');

            const response = await fetch(`/api/tracks/community?${params}`);
            const data = await response.json();
            if (response.ok) {
                setTracks(data.tracks || []);
                setTracksByDate(data.tracksByDate || []);
                setSortedDates(data.sortedDates || []);
                setTotalPages(1);
                setTotalCount(data.totalCount || data.total || 0);
                if (loading) {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Error fetching community tracks:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    // Carregar dados iniciais
    useEffect(() => {
        // Carregar filtros disponíveis
        fetchFilters();
        fetchStats();

        // Verificar se há filtros na URL
        const urlSearch = searchParams.get('search');
        const urlGenre = searchParams.get('genre');
        const urlArtist = searchParams.get('artist');
        const urlDateRange = searchParams.get('dateRange');
        const urlVersion = searchParams.get('version');
        const urlMonth = searchParams.get('month');
        const urlPool = searchParams.get('pool');

        // Só aplicar filtros se eles existirem na URL
        if (urlSearch || urlGenre || urlArtist || urlDateRange || urlVersion || urlMonth || urlPool) {
            setSearchQuery(urlSearch || '');
            setSelectedGenre(urlGenre || 'all');
            setSelectedArtist(urlArtist || 'all');
            setSelectedDateRange(urlDateRange || 'all');
            setSelectedVersion(urlVersion || 'all');
            setSelectedMonth(urlMonth || 'all');
            setSelectedPool(urlPool || 'all');
        } else {
            // Se não há filtros na URL, garantir que todos os filtros estejam limpos
            setSearchQuery('');
            setSelectedGenre('all');
            setSelectedArtist('all');
            setSelectedDateRange('all');
            setSelectedVersion('all');
            setSelectedMonth('all');
            setSelectedPool('all');
        }

        fetchCommunityTracks(false);
    }, [searchParams]);

    useEffect(() => {
        fetchCommunityTracks(true);
    }, [searchQuery]);

    const updateURL = (newFilters: any = {}) => {
        const params = new URLSearchParams();
        const filters = {
            page: newFilters.page || currentPage,
            genre: newFilters.genre || selectedGenre,
            artist: newFilters.artist || selectedArtist,
            search: newFilters.search || searchQuery,
            month: newFilters.month || selectedMonth,
            dateRange: newFilters.dateRange || selectedDateRange,
            version: newFilters.version || selectedVersion,
        };
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== '' && value !== 1) {
                params.set(key, value.toString());
            }
        });
        const newURL = params.toString() ? `/community?${params.toString()}` : '/community';
        router.push(newURL, { scroll: false });
    };

    const handleApplyFilters = () => {
        setShowFiltersModal(false);
        handleSearch();
    };

    const handleClearFilters = () => {
        setSelectedGenre('all');
        setSelectedArtist('all');
        setSelectedDateRange('all');
        setSelectedVersion('all');
        setSelectedMonth('all');
        setSelectedPool('all');
        setSearchQuery('');
        // Limpar a URL também
        router.push('/community', { scroll: false });
        // Aguardar um pouco antes de buscar para garantir que a URL foi limpa
        setTimeout(() => {
            fetchCommunityTracks(true);
        }, 100);
    };

    const handleSearch = () => { setCurrentPage(1); updateURL({ page: 1 }); fetchCommunityTracks(true); };

    const hasActiveFilters = Boolean(
        (selectedGenre && selectedGenre !== 'all') ||
        (selectedArtist && selectedArtist !== 'all') ||
        (selectedDateRange && selectedDateRange !== 'all') ||
        (selectedVersion && selectedVersion !== 'all') ||
        (selectedMonth && selectedMonth !== 'all') ||
        (selectedPool && selectedPool !== 'all') ||
        searchQuery
    );

    const handlePageChange = (newPage: number) => { setCurrentPage(newPage); updateURL({ page: newPage }); setTimeout(() => { fetchCommunityTracks(); }, 100); };

    const generateMonthOptions = () => {
        const options = []; const currentDate = new Date();
        for (let i = 0; i < 24; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const year = date.getFullYear(); const month = date.getMonth() + 1;
            const value = `${year}-${String(month).padStart(2, '0')}`;
            const label = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
            options.push({ value, label });
        }
        return options;
    };

    const monthOptions = generateMonthOptions();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <Header />
            <main className="container mx-auto px-4 py-8 pt-20">
                {/* Hero Section */}
                <div className="mb-12">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30">
                            <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <div className="text-left">
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Comunidade
                                </h1>
                                <p className="text-gray-300 text-lg">Músicas enviadas pelos DJs da comunidade</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-600 rounded-lg">
                                        <Music className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300">Total de Músicas</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.totalTracks.toLocaleString()}</div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300">Artistas</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.totalArtists.toLocaleString()}</div>
                            </div>

                            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-600 rounded-lg">
                                        <DownloadIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300">Downloads</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.totalDownloads.toLocaleString()}</div>
                            </div>

                            <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 backdrop-blur-sm rounded-xl p-6 border border-pink-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-pink-600 rounded-lg">
                                        <HeartIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-300">Curtidas</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.totalLikes.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    {!session && (
                        <div className="w-full flex items-center justify-center py-4 px-6 mb-6 rounded-xl shadow-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-500 rounded-full">
                                    <Eye className="h-5 w-5 text-yellow-900" />
                                </div>
                                <div className="text-center">
                                    <p className="text-yellow-100 font-semibold text-sm">
                                        Atenção: Usuários sem plano não podem ouvir, baixar ou curtir músicas. Apenas a navegação no catálogo está disponível.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Search and Filters Section */}
                <div className="mb-8 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        {/* Search Bar */}
                        <div className="flex-1 w-full">
                            <form onSubmit={handleSearch} className="relative">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar músicas da comunidade..."
                                        className="w-full bg-gray-800/80 rounded-xl px-12 py-4 border border-gray-700 focus:border-purple-500 transition-all duration-200 text-white placeholder-gray-400 text-sm backdrop-blur-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                    >
                                        <ArrowRight className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Filters Button */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFiltersModal(true)}
                                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white rounded-xl transition-all duration-200 border border-gray-600 hover:border-gray-500 shadow-lg"
                            >
                                <Filter className={`h-5 w-5 ${hasActiveFilters ? 'text-purple-400' : 'text-gray-300'}`} />
                                <span className="font-medium">Filtros</span>
                                {hasActiveFilters && (
                                    <span className="flex h-2 w-2 rounded-full bg-purple-500 ring-2 ring-gray-800"></span>
                                )}
                            </button>

                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-200 border border-red-600 hover:border-red-500 shadow-lg"
                                >
                                    <span className="font-medium">Limpar</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Active Filters Indicator */}
                    {hasActiveFilters && (
                        <div className="mt-4 flex items-center justify-center space-x-2 text-purple-400 bg-purple-500/10 rounded-lg py-2">
                            <Filter className="h-4 w-4" />
                            <span className="text-sm font-medium">Filtros ativos aplicados</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="text-center">
                            <div className="relative mb-6">
                                <div className="w-24 h-24 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                                <Users className="h-10 w-10 text-purple-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Carregando Músicas da Comunidade</h3>
                            <p className="text-gray-400">Aguarde enquanto buscamos as faixas enviadas pelos DJs...</p>
                        </div>
                    </div>
                ) : tracks.length === 0 ? (
                    <div className="text-center py-32">
                        <div className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl inline-block mb-8 border border-gray-600/30">
                            <Users className="h-20 w-20 text-gray-400 mx-auto" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4">Nenhuma música da comunidade encontrada</h3>
                        <p className="text-gray-400 mb-8 text-lg">Tente ajustar seus filtros ou fazer uma nova busca.</p>
                        <button
                            onClick={handleClearFilters}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                ) : (
                    <>
                        {sortedDates.length > 0 ? (
                            <div className="space-y-8">
                                {pagedDates.map((date) => (
                                    <div key={date} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"></div>
                                                    <h2 className="text-2xl md:text-3xl font-bold text-white capitalize">{formatDate(date)}</h2>
                                                </div>
                                                <div className="hidden md:flex items-center gap-2 text-gray-400">
                                                    <Music className="h-4 w-4" />
                                                    <span className="text-sm">{tracksByDate[date]?.length || 0} músicas</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                                            <MusicTable tracks={tracksByDate[date] || []} onDownload={handleDownloadTracks} isDownloading={downloading} />
                                        </div>
                                    </div>
                                ))}

                                {/* Paginação de dias */}
                                {totalDayPages > 1 && (
                                    <div className="flex flex-col md:flex-row items-center justify-between mt-8 p-6 bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm rounded-xl border border-white/10">
                                        <div className="text-gray-300 mb-4 md:mb-0">
                                            <span className="text-sm">Exibindo dias {daysPage + 1} de {totalDayPages}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setDaysPage(daysPage - 1)}
                                                disabled={daysPage === 0 || searchLoading}
                                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/50 hover:to-gray-500/50 disabled:bg-gray-800/50 disabled:opacity-50 text-white rounded-lg transition-all duration-200 border border-gray-600/30"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                <span>Anterior</span>
                                            </button>
                                            <div className="flex items-center space-x-1">
                                                {Array.from({ length: Math.min(5, totalDayPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalDayPages <= 5) pageNum = i;
                                                    else if (daysPage < 2) pageNum = i;
                                                    else if (daysPage >= totalDayPages - 2) pageNum = totalDayPages - 5 + i;
                                                    else pageNum = daysPage - 2 + i;
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setDaysPage(pageNum)}
                                                            disabled={pageNum === daysPage || searchLoading}
                                                            className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${pageNum === daysPage
                                                                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                                                                    : 'bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/50 hover:to-gray-500/50 text-gray-300 disabled:opacity-50'
                                                                }`}
                                                        >
                                                            {pageNum + 1}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                onClick={() => setDaysPage(daysPage + 1)}
                                                disabled={daysPage === totalDayPages - 1 || searchLoading}
                                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/50 hover:to-gray-500/50 disabled:bg-gray-800/50 disabled:opacity-50 text-white rounded-lg transition-all duration-200 border border-gray-600/30"
                                            >
                                                <span>Próximo</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-32">
                                <div className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl inline-block mb-8 border border-gray-600/30">
                                    <Users className="h-20 w-20 text-gray-400 mx-auto" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4">Nenhuma música da comunidade encontrada</h3>
                                <p className="text-gray-400 mb-8 text-lg">Não há músicas da comunidade disponíveis para os filtros selecionados.</p>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg"
                                >
                                    Limpar Filtros
                                </button>
                            </div>
                        )}
                    </>
                )}

                {showFiltersModal && (
                    <FiltersModal
                        isOpen={showFiltersModal}
                        onClose={() => setShowFiltersModal(false)}
                        genres={genres}
                        artists={artists}
                        versions={versions}
                        pools={pools}
                        monthOptions={monthOptions}
                        selectedGenre={selectedGenre}
                        selectedArtist={selectedArtist}
                        selectedDateRange={selectedDateRange}
                        selectedVersion={selectedVersion}
                        selectedMonth={selectedMonth}
                        selectedPool={selectedPool}
                        onGenreChange={setSelectedGenre}
                        onArtistChange={setSelectedArtist}
                        onDateRangeChange={setSelectedDateRange}
                        onVersionChange={setSelectedVersion}
                        onMonthChange={setSelectedMonth}
                        onPoolChange={setSelectedPool}
                        onApplyFilters={handleApplyFilters}
                        onClearFilters={handleClearFilters}
                        isLoading={loading}
                        hasActiveFilters={hasActiveFilters}
                    />
                )}
            </main>
        </div>
    );
}

export default function CommunityPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Carregando Comunidade...</p>
                </div>
            </div>
        }>
            <CommunityPageContent />
        </Suspense>
    );
} 