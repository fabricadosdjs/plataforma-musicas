"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Filter, Users, TrendingUp, Heart, Download, Play, Upload, Star, X, Crown, ChevronLeft, ChevronRight, Music } from 'lucide-react';
import { Track } from '@/types/track';
import MainLayout from '@/components/layout/MainLayout';
import { MusicList } from '@/components/music/MusicList';
import FooterSpacer from '@/components/layout/FooterSpacer';
import FiltersModal from '@/components/music/FiltersModal';
import { useToastContext } from '@/context/ToastContext';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import Image from 'next/image';

// Função para obter informações sobre a comunidade baseada em dados reais
const getCommunityInfo = (stats: any): string => {
    if (!stats || stats.totalTracks === 0) {
        return 'A comunidade ainda não possui músicas enviadas. Seja o primeiro a compartilhar sua produção!';
    }

    const totalTracks = stats.totalTracks || 0;
    const totalDownloads = stats.totalDownloads || 0;
    const totalLikes = stats.totalLikes || 0;
    const activeUsers = stats.activeUsers || 0;

    let description = `Nossa comunidade é composta por ${activeUsers} usuários ativos que compartilharam ${totalTracks} música${totalTracks !== 1 ? 's' : ''} únicas. `;

    if (totalDownloads > 0) {
        description += `Essas músicas já foram baixadas ${totalDownloads} vez${totalDownloads !== 1 ? 'es' : ''}. `;
    }

    if (totalLikes > 0) {
        description += `Receberam ${totalLikes} curtida${totalLikes !== 1 ? 's' : ''} dos membros. `;
    }

    description += `Cada música representa a criatividade e talento de nossos DJs e produtores.`;

    return description;
};

export default function CommunityPage() {
    const { data: session } = useSession();
    const { showToast } = useToastContext();
    const { playTrack, isPlaying, currentTrack } = useGlobalPlayer();

    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [hasActiveFilters, setHasActiveFilters] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Estado para estatísticas da comunidade
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        activeUsers: 0,
        communityScore: 0,
        totalTracks: 0
    });

    // Estados para filtros
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [selectedArtist, setSelectedArtist] = useState('all');
    const [selectedDateRange, setSelectedDateRange] = useState('all');
    const [selectedVersion, setSelectedVersion] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedPool, setSelectedPool] = useState('all');

    // Estados para paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Estados para fila de downloads
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);

    // Estados para filtros disponíveis
    const [genres, setGenres] = useState<string[]>([]);
    const [artists, setArtists] = useState<string[]>([]);
    const [versions, setVersions] = useState<string[]>([]);
    const [pools, setPools] = useState<string[]>([]);

    // Estados para carrossel
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Slides do carrossel
    const slides = [
        {
            id: 1,
            title: "Upload Comunitário",
            artist: "DJs da Comunidade",
            image: "https://i.ibb.co/Vm1xPqt/slide1.jpg",
            link: "/community",
            badge: "COMUNIDADE",
        },
        {
            id: 2,
            title: "Trending da Semana",
            artist: "Músicas Mais Populares",
            image: "https://i.ibb.co/ZfDzHn9/slide2.jpg",
            link: "/community",
            badge: "TRENDING",
        },
        {
            id: 3,
            title: "Curadoria Premium",
            artist: "Seleção Especializada",
            image: "https://i.ibb.co/4sfx2D4/slide3.jpg",
            link: "/community",
            badge: "PREMIUM",
        },
    ];

    // Carregar IDs das músicas baixadas do localStorage
    useEffect(() => {
        const saved = localStorage.getItem('downloadedTrackIds');
        if (saved) {
            try {
                setDownloadedTrackIds(JSON.parse(saved));
            } catch (error) {
                console.error('Erro ao carregar músicas baixadas:', error);
            }
        }
    }, []);

    // Autoplay do carrossel
    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length, isHovered]);

    // Função para buscar músicas da comunidade
    const fetchCommunityTracks = useCallback(async (resetPage = false) => {
        try {
            setLoading(true);
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
                setTotalPages(data.totalPages || 1);
                setTotalCount(data.totalCount || 0);

                // Calcular estatísticas da comunidade
                const totalDownloads = data.tracks.reduce((sum: number, track: Track) => sum + (track.downloadCount || 0), 0);
                const totalLikes = data.tracks.reduce((sum: number, track: Track) => sum + (track.likeCount || 0), 0);
                const communityScore = Math.round((totalDownloads * 0.6) + (totalLikes * 0.4));

                setStats(prevStats => ({
                    ...prevStats,
                    totalDownloads,
                    totalLikes,
                    communityScore,
                    totalTracks: data.tracks.length
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar músicas da comunidade:', error);
            showToast('❌ Erro ao carregar músicas da comunidade', 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedGenre, selectedArtist, selectedDateRange, selectedVersion, selectedMonth, selectedPool, searchQuery, showToast]);

    // Função para buscar filtros disponíveis
    const fetchFilters = useCallback(async () => {
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
            console.error('Erro ao buscar filtros:', error);
        }
    }, []);

    // Buscar usuários ativos do banco de dados
    const fetchActiveUsers = async () => {
        try {
            const response = await fetch('/api/stats/active-users-today');
            if (response.ok) {
                const data = await response.json();
                setStats(prevStats => ({
                    ...prevStats,
                    activeUsers: data.activeUsersToday || 0
                }));
            }
        } catch (error) {
            console.error('Error fetching active users:', error);
        }
    };

    // Carregar dados iniciais
    useEffect(() => {
        fetchFilters();
        fetchCommunityTracks();
        fetchActiveUsers();
    }, []);

    // Função para realizar busca
    const performSearch = async (query: string) => {
        if (!query.trim()) return;

        try {
            setSearchLoading(true);
            const response = await fetch(`/api/tracks/search?q=${encodeURIComponent(query)}`);

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.tracks || []);
                setAppliedSearchQuery(query);
                setHasSearched(true);

                // Atualizar URL com a pesquisa
                const searchParams = new URLSearchParams(window.location.search);
                searchParams.set('q', query);
                const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
                window.history.pushState({}, '', newUrl);
            } else {
                setSearchResults([]);
                setAppliedSearchQuery(query);
                setHasSearched(true);
                showToast('Erro ao buscar músicas', 'error');
            }
        } catch (error) {
            console.error('Erro na busca:', error);
            setSearchResults([]);
            setAppliedSearchQuery(query);
            setHasSearched(true);
            showToast('Erro ao buscar músicas', 'error');
        } finally {
            setSearchLoading(false);
        }
    };

    // Função para limpar busca
    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setAppliedSearchQuery('');
        setHasSearched(false);

        // Limpar URL da pesquisa
        const newUrl = window.location.pathname;
        window.history.pushState({}, '', newUrl);
    };

    // Função para aplicar filtros
    const handleApplyFilters = () => {
        setShowFiltersModal(false);
        setCurrentPage(1);
        fetchCommunityTracks(true);
    };

    // Função para limpar filtros
    const handleClearFilters = () => {
        setSelectedGenre('all');
        setSelectedArtist('all');
        setSelectedDateRange('all');
        setSelectedVersion('all');
        setSelectedMonth('all');
        setSelectedPool('all');
        setSearchQuery('');
        setAppliedSearchQuery('');
        setHasActiveFilters(false);
        setCurrentPage(1);
        fetchCommunityTracks(true);
        showToast('🧹 Filtros e pesquisa limpos!', 'success');
    };

    // Função para mudar filtros
    const handleGenreChange = (genre: string) => {
        setSelectedGenre(genre);
        setHasActiveFilters(true);
    };

    const handleArtistChange = (artist: string) => {
        setSelectedArtist(artist);
        setHasActiveFilters(true);
    };

    const handleDateRangeChange = (dateRange: string) => {
        setSelectedDateRange(dateRange);
        setHasActiveFilters(true);
    };

    const handleVersionChange = (version: string) => {
        setSelectedVersion(version);
        setHasActiveFilters(true);
    };

    const handleMonthChange = (month: string) => {
        setSelectedMonth(month);
        setHasActiveFilters(true);
    };

    const handlePoolChange = (pool: string) => {
        setSelectedPool(pool);
        setHasActiveFilters(true);
    };

    // Função para atualizar IDs de tracks baixados
    const handleDownloadedTrackIdsChange = (newIds: number[] | ((prev: number[]) => number[])) => {
        if (typeof newIds === 'function') {
            setDownloadedTrackIds(newIds);
        } else {
            setDownloadedTrackIds(newIds);
        }
        localStorage.setItem('downloadedTrackIds', JSON.stringify(typeof newIds === 'function' ? newIds(downloadedTrackIds) : newIds));
    };

    // Determinar quais músicas mostrar
    const displayTracks = useMemo(() => {
        if (hasSearched) {
            return searchResults;
        }
        return tracks;
    }, [hasSearched, searchResults, tracks]);

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#121212] overflow-x-hidden">
                {/* CARROUSEL "COMUNIDADE DOS VIPS" - Mobile First */}
                <div className="w-full max-w-6xl mx-auto mt-4 sm:mt-8 mb-8 sm:mb-12 px-3 sm:px-6 md:px-8 lg:pl-6 lg:pr-16 xl:pl-8 xl:pr-20 2xl:pl-10 2xl:pr-24 transition-all duration-300">
                    {/* Header do carrousel - Mobile First */}
                    <div className="flex items-center justify-between mb-4 sm:mb-8">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                            <h2 className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                                COMUNIDADE DOS VIPS
                            </h2>
                        </div>

                        {/* Controles de navegação - Mobile First */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)}
                                className="p-2 sm:p-3 bg-[#181818]/80 hover:bg-[#282828]/90 rounded-lg sm:rounded-xl text-white transition-all duration-300 backdrop-blur-md border border-[#282828]/50 hover:border-[#3e3e3e]/70 hover:shadow-lg hover:shadow-[#1db954]/20 group"
                                title="Slide anterior"
                            >
                                <ChevronLeft size={18} className="sm:w-[22px] sm:h-[22px] group-hover:scale-110 transition-transform duration-200" />
                            </button>
                            <button
                                onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
                                className="p-2 sm:p-3 bg-[#181818]/80 hover:bg-[#282828]/90 rounded-lg sm:rounded-xl text-white transition-all duration-300 backdrop-blur-md border border-[#282828]/50 hover:border-[#3e3e3e]/70 hover:shadow-lg hover:shadow-[#1db954]/20 group"
                                title="Próximo slide"
                            >
                                <ChevronRight size={18} className="sm:w-[22px] sm:h-[22px] group-hover:scale-110 transition-transform duration-200" />
                            </button>
                        </div>
                    </div>

                    {/* Container do carrousel - Mobile First */}
                    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#181818] border border-[#282828] shadow-2xl">
                        {/* Slides container */}
                        <div
                            className="flex transition-transform duration-700 ease-out"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {slides.map((slide) => (
                                <div key={slide.id} className="w-full flex-shrink-0">
                                    {/* Mobile: Layout ultra-compacto sem overflow */}
                                    <div className="block sm:hidden">
                                        <div className="relative h-32 sm:h-40 overflow-hidden group">
                                            {/* Background image com overlay */}
                                            <div className="absolute inset-0">
                                                <Image
                                                    src={slide.image}
                                                    alt={slide.title}
                                                    fill
                                                    className="object-cover opacity-60 group-hover:opacity-80 transition-all duration-500"
                                                    priority={currentSlide === slide.id - 1}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                            </div>

                                            {/* Conteúdo mobile ultra-compacto */}
                                            <div className="relative z-10 h-full flex flex-col justify-end p-2 sm:p-3">
                                                {/* Badge no topo */}
                                                <div className="absolute top-2 right-2">
                                                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg backdrop-blur-md border border-green-400/30">
                                                        {slide.badge}
                                                    </span>
                                                </div>

                                                {/* Informações da música */}
                                                <div className="text-white">
                                                    <h3 className="text-sm sm:text-base font-bold mb-1 line-clamp-1">
                                                        {slide.title}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-[#b3b3b3] line-clamp-1">
                                                        {slide.artist}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop: Layout completo */}
                                    <div className="hidden sm:block">
                                        <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden group">
                                            {/* Background image com overlay */}
                                            <div className="absolute inset-0">
                                                <Image
                                                    src={slide.image}
                                                    alt={slide.title}
                                                    fill
                                                    className="object-cover opacity-60 group-hover:opacity-80 transition-all duration-500"
                                                    priority={currentSlide === slide.id - 1}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                            </div>

                                            {/* Conteúdo desktop */}
                                            <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-6 md:p-8">
                                                {/* Badge no topo */}
                                                <div className="absolute top-4 right-4">
                                                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg backdrop-blur-md border border-green-400/30">
                                                        {slide.badge}
                                                    </span>
                                                </div>

                                                {/* Informações da música */}
                                                <div className="text-white">
                                                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                                                        {slide.title}
                                                    </h3>
                                                    <p className="text-lg sm:text-xl text-[#b3b3b3] mb-4">
                                                        {slide.artist}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Indicadores de slide */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-[#1db954] w-6' : 'bg-white/50 hover:bg-white/75'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* SEÇÃO DE ESTATÍSTICAS DA COMUNIDADE - Mobile First */}
                <div className="w-full max-w-6xl mx-auto mb-8 px-3 sm:px-6 md:px-8 lg:pl-6 lg:pr-16 xl:pl-8 xl:pr-20 2xl:pl-10 2xl:pr-24">
                    <div className="bg-gradient-to-br from-[#1db954]/10 to-[#1ed760]/5 rounded-2xl p-6 sm:p-8 border border-[#1db954]/20 shadow-xl">
                        {/* Header da seção */}
                        <div className="text-center mb-6 sm:mb-8">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-2 h-8 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                                <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                                    Estatísticas da Comunidade
                                </h2>
                                <div className="w-2 h-8 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                            </div>
                            <p className="text-[#b3b3b3] text-sm sm:text-base max-w-2xl mx-auto">
                                Números que mostram o crescimento e engajamento da nossa comunidade de DJs e produtores
                            </p>
                        </div>

                        {/* Cards de estatísticas */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                            <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-4 border border-[#282828]/50 text-center group hover:scale-105 transition-all duration-300 hover:border-[#1db954]/30">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                    {stats.totalTracks}
                                </div>
                                <div className="text-[#b3b3b3] text-xs sm:text-sm">
                                    {stats.totalTracks === 1 ? 'Música' : 'Músicas'}
                                </div>
                            </div>

                            <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-4 border border-[#282828]/50 text-center group hover:scale-105 transition-all duration-300 hover:border-[#1db954]/30">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                                    <Download className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                    {stats.totalDownloads}
                                </div>
                                <div className="text-[#b3b3b3] text-xs sm:text-sm">Downloads</div>
                            </div>

                            <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-4 border border-[#282828]/50 text-center group hover:scale-105 transition-all duration-300 hover:border-[#1db954]/30">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                                    <Heart className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                    {stats.totalLikes}
                                </div>
                                <div className="text-[#b3b3b3] text-xs sm:text-sm">Curtidas</div>
                            </div>

                            <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-4 border border-[#282828]/50 text-center group hover:scale-105 transition-all duration-300 hover:border-[#1db954]/30">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                    {stats.activeUsers}
                                </div>
                                <div className="text-[#b3b3b3] text-xs sm:text-sm">Usuários Ativos</div>
                            </div>
                        </div>

                        {/* Descrição da comunidade */}
                        {getCommunityInfo(stats) && (
                            <div className="mt-6 sm:mt-8 text-center">
                                <div className="bg-[#181818]/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-[#282828]/40">
                                    <div className="text-[#b3b3b3] text-sm sm:text-base leading-relaxed max-w-4xl mx-auto">
                                        {getCommunityInfo(stats)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* BARRA DE PESQUISA E FILTROS - Mobile First */}
                <div className="w-full max-w-6xl mx-auto mb-8 px-3 sm:px-6 md:px-8 lg:pl-6 lg:pr-16 xl:pl-8 xl:pr-20 2xl:pl-10 2xl:pr-24">
                    <div className="bg-[#181818] rounded-2xl p-4 sm:p-6 border border-[#282828] shadow-lg">
                        {/* Barra de pesquisa */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#b3b3b3]" />
                                <input
                                    type="text"
                                    placeholder="Buscar músicas da comunidade..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && performSearch(searchQuery)}
                                    className="w-full pl-10 pr-4 py-3 bg-[#282828] border border-[#3e3e3e] rounded-xl text-white placeholder-[#b3b3b3] focus:outline-none focus:ring-2 focus:ring-[#1db954]/50 focus:border-[#1db954]/50 transition-all duration-300"
                                />
                            </div>
                            <button
                                onClick={() => performSearch(searchQuery)}
                                disabled={!searchQuery.trim() || searchLoading}
                                className="px-4 py-2 bg-[#1db954] text-white rounded-lg hover:bg-[#1ed760] disabled:bg-[#535353] disabled:cursor-not-allowed transition h-10 w-full sm:w-auto min-w-[120px] text-sm sm:text-base font-medium shadow-lg"
                            >
                                {searchLoading ? "Buscando..." : "Buscar"}
                            </button>
                            <button
                                onClick={() => setShowFiltersModal(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#282828] text-white rounded-lg hover:bg-[#3e3e3e] transition h-10 w-full sm:w-auto min-w-[120px] text-sm sm:text-base border border-[#3e3e3e]"
                            >
                                <Filter size={18} /> Filtros
                            </button>
                        </div>

                        {/* Indicador de resultados */}
                        {hasSearched && (
                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="text-[#b3b3b3] text-sm">
                                    {searchLoading ? (
                                        "Buscando..."
                                    ) : searchResults.length > 0 ? (
                                        `${searchResults.length} resultado${searchResults.length !== 1 ? 's' : ''} encontrado${searchResults.length !== 1 ? 's' : ''}`
                                    ) : (
                                        "Nenhum resultado encontrado"
                                    )}
                                </div>
                                <button
                                    onClick={clearSearch}
                                    className="text-sm text-[#1db954] hover:text-[#1ed760] transition-colors self-start sm:self-auto"
                                >
                                    Voltar à comunidade
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* LISTA DE MÚSICAS - Mobile First */}
                <div className="w-full max-w-6xl mx-auto pb-6 sm:pb-8 px-3 sm:px-6 md:px-8 lg:pl-6 lg:pr-16 xl:pl-8 xl:pr-20 2xl:pl-10 2xl:pr-24">
                    {/* Estado de loading */}
                    {(loading || searchLoading) && (
                        <div className="flex items-center justify-center py-12 sm:py-16">
                            <div className="text-center">
                                <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#1db954] border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-[#b3b3b3] text-base sm:text-lg">
                                    {searchLoading ? "Buscando músicas..." : "Carregando comunidade..."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Nenhum resultado encontrado */}
                    {!loading && !searchLoading && hasSearched && searchResults.length === 0 && (
                        <div className="text-center py-12 sm:py-16">
                            <div className="bg-[#181818] rounded-2xl p-6 sm:p-8 max-w-md mx-auto border border-[#282828]">
                                <div className="text-5xl sm:text-6xl mb-4">🔍</div>
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                                    Nenhum resultado encontrado
                                </h3>
                                <p className="text-[#b3b3b3] mb-6 text-sm sm:text-base">
                                    Não encontramos nenhuma música para "{appliedSearchQuery}".
                                </p>
                                <div className="space-y-3">
                                    <p className="text-sm text-[#535353] mb-4">Tente buscar por:</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {["House", "Funk", "Deep House", "Techno", "Progressive"].map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                onClick={() => {
                                                    setSearchQuery(suggestion);
                                                    performSearch(suggestion);
                                                }}
                                                className="px-3 py-1 bg-[#1db954]/20 text-[#1db954] rounded-full text-sm hover:bg-[#1db954]/40 transition-colors border border-[#1db954]/30"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={clearSearch}
                                        className="mt-4 px-6 py-2 bg-[#1db954] text-white rounded-lg hover:bg-[#1ed760] transition-colors text-sm sm:text-base font-medium shadow-lg"
                                    >
                                        Ver toda a comunidade
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lista de músicas */}
                    {!loading && !searchLoading && displayTracks.length > 0 && (
                        <MusicList
                            tracks={displayTracks}
                            downloadedTrackIds={downloadedTrackIds}
                            setDownloadedTrackIds={handleDownloadedTrackIdsChange}
                            enableInfiniteScroll={false}
                            hasMore={false}
                            isLoading={loading || searchLoading}
                            onLoadMore={() => { }}
                        />
                    )}

                    {/* Paginação */}
                    {!loading && !searchLoading && !hasSearched && totalPages > 1 && (
                        <div className="mt-8 sm:mt-12">
                            <div className="bg-[#121212] rounded-2xl p-4 sm:p-6 border border-[#282828] shadow-lg">
                                {/* Controles de paginação */}
                                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                                    {/* Primeira página */}
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === 1
                                            ? 'bg-[#535353] text-[#b3b3b3] cursor-not-allowed'
                                            : 'bg-[#1db954] text-white hover:bg-[#1ed760] hover:scale-105 shadow-lg'
                                            }`}
                                        title="Primeira página"
                                    >
                                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" />
                                        </svg>
                                        Primeira
                                    </button>

                                    {/* Página anterior */}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === 1
                                            ? 'bg-[#535353] text-[#b3b3b3] cursor-not-allowed'
                                            : 'bg-[#1db954] text-white hover:bg-[#1ed760] hover:scale-105 shadow-lg'
                                            }`}
                                        title="Página anterior"
                                    >
                                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                        </svg>
                                        Anterior
                                    </button>

                                    {/* Navegação rápida por páginas */}
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${page === currentPage
                                                    ? 'bg-[#1db954] text-white shadow-lg'
                                                    : 'bg-[#282828] text-[#b3b3b3] hover:bg-[#3e3e3e] hover:text-white'
                                                    }`}
                                            >
                                                {page.toString().padStart(2, '0')}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Próxima página */}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage >= totalPages}
                                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage >= totalPages
                                            ? 'bg-[#535353] text-[#b3b3b3] cursor-not-allowed'
                                            : 'bg-[#1db954] text-white hover:bg-[#1ed760] hover:scale-105 shadow-lg'
                                            }`}
                                        title="Próxima página"
                                    >
                                        Próxima
                                        <svg className="w-4 h-4 inline ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                                        </svg>
                                    </button>

                                    {/* Última página */}
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage >= totalPages}
                                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage >= totalPages
                                            ? 'bg-[#535353] text-[#b3b3b3] cursor-not-allowed'
                                            : 'bg-[#1db954] text-white hover:bg-[#1ed760] hover:scale-105 shadow-lg'
                                            }`}
                                        title="Última página"
                                    >
                                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M5.59 7.41L10.18 12l-4.59 4.59L12 18l6-6-6-6-1.41 1.41z" />
                                        </svg>
                                        Última
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <FooterSpacer />

                {/* Modal de Filtros */}
                <FiltersModal
                    isOpen={showFiltersModal}
                    onClose={() => setShowFiltersModal(false)}
                    genres={genres}
                    artists={artists}
                    versions={versions}
                    pools={pools}
                    monthOptions={[]}
                    selectedGenre={selectedGenre}
                    selectedArtist={selectedArtist}
                    selectedDateRange={selectedDateRange}
                    selectedVersion={selectedVersion}
                    selectedMonth={selectedMonth}
                    selectedPool={selectedPool}
                    onGenreChange={handleGenreChange}
                    onArtistChange={handleArtistChange}
                    onDateRangeChange={handleDateRangeChange}
                    onVersionChange={handleVersionChange}
                    onMonthChange={handleMonthChange}
                    onPoolChange={handlePoolChange}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={handleClearFilters}
                    isLoading={loading}
                    hasActiveFilters={hasActiveFilters}
                />
            </div>
        </MainLayout>
    );
} 