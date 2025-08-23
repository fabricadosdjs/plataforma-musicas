"use client";

// Configurações para evitar problemas de hidratação
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Filter, Users, TrendingUp, Heart, Download, Play, Upload, Star, X, Crown, ChevronLeft, ChevronRight, Music } from 'lucide-react';
import { Track } from '@/types/track';
import Header from '@/components/layout/Header';
import { MusicList } from '@/components/music/MusicList';
import FooterSpacer from '@/components/layout/FooterSpacer';
import FiltersModal from '@/components/music/FiltersModal';
import { useToastContext } from '@/context/ToastContext';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import Image from 'next/image';
import Link from 'next/link';

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
    const [dataLoaded, setDataLoaded] = useState(false);

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
    const [isClient, setIsClient] = useState(false);

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
        if (genres.length > 0) return; // Evita re-chamadas

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
    }, [genres.length]);

    // Buscar estatísticas reais da comunidade
    const fetchCommunityStats = async () => {
        if (dataLoaded) return; // Evita re-chamadas

        try {
            const [statsResponse, activeUsersResponse] = await Promise.all([
                fetch('/api/tracks/community/stats'),
                fetch('/api/stats/active-users-today')
            ]);

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(prevStats => ({
                    ...prevStats,
                    totalTracks: statsData.totalTracks || 0,
                    totalDownloads: statsData.totalDownloads || 0,
                    totalLikes: statsData.totalLikes || 0,
                    communityScore: Math.round((statsData.totalDownloads * 0.6) + (statsData.totalLikes * 0.4))
                }));
            }

            if (activeUsersResponse.ok) {
                const activeUsersData = await activeUsersResponse.json();
                setStats(prevStats => ({
                    ...prevStats,
                    activeUsers: activeUsersData.activeUsersToday || 0
                }));
            }

            setDataLoaded(true);
        } catch (error) {
            console.error('Erro ao buscar estatísticas da comunidade:', error);
        }
    };

    // Detectar quando o componente está no cliente
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Carregar dados iniciais - Apenas uma vez
    useEffect(() => {
        if (isClient && !dataLoaded) {
            fetchFilters();
            fetchCommunityTracks();
            fetchCommunityStats();
        }
    }, [isClient, dataLoaded]); // Só executa se não foi carregado ainda

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

    // Função para aplicar filtros com debounce
    const handleApplyFilters = () => {
        setShowFiltersModal(false);
        setCurrentPage(1);

        // Debounce para evitar múltiplas chamadas
        setTimeout(() => {
            fetchCommunityTracks(true);
        }, 300);
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
        <div className="min-h-screen bg-[#121212] relative overflow-hidden">
            {/* Header Fixo */}
            <Header />

            {/* Conteúdo Principal - Tela Cheia */}
            <div className="pt-12 lg:pt-16">
                <div className="min-h-screen bg-[#121212] overflow-x-hidden">
                    {/* CARROUSEL "COMUNIDADE DOS VIPS" - Mobile First */}
                    <div className="w-full max-w-[95%] mx-auto mt-4 sm:mt-8 mb-8 sm:mb-12 px-3 sm:px-6 md:px-8 transition-all duration-300">
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
                        {isClient ? (
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
                        ) : (
                            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#181818] border border-[#282828] shadow-2xl h-32 sm:h-40 lg:h-72">
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-pulse text-gray-400">Carregando...</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SEÇÃO DE ESTATÍSTICAS DA COMUNIDADE - Mobile First */}
                    <div className="w-full max-w-[95%] mx-auto mb-8 px-3 sm:px-6 md:px-8">
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

                            {/* Informação sobre upload direto */}
                            <div className="mt-6 sm:mt-8 text-center">
                                <div className="bg-gradient-to-r from-[#1db954]/20 to-[#1ed760]/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-[#1db954]/30">
                                    <div className="flex items-center justify-center gap-3 mb-3">
                                        <Upload className="h-5 w-5 text-[#1db954]" />
                                        <h3 className="text-white text-lg sm:text-xl font-semibold">
                                            Contribua com a Comunidade
                                        </h3>
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
                                        Cada usuário pode enviar músicas diretamente de sua conta! Compartilhe suas produções,
                                        descobertas e favoritos com outros DJs e produtores da comunidade.
                                    </div>
                                    <div className="mt-4">
                                        <Link
                                            href="/profile"
                                            className="inline-flex items-center gap-2 px-6 py-2 bg-[#1db954] hover:bg-[#1ed760] text-white rounded-lg font-medium transition-colors duration-300 hover:scale-105 shadow-lg"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Enviar Música
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BARRA DE PESQUISA E FILTROS - Mobile First */}
                    <div className="w-full max-w-[95%] mx-auto mb-8 px-3 sm:px-6 md:px-8">
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
                    <div className="w-full max-w-[95%] mx-auto pb-6 sm:pb-8 px-3 sm:px-6 md:px-8">
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
                        {!loading && !searchLoading && displayTracks.length > 0 ? (
                            <MusicList
                                tracks={displayTracks}
                                downloadedTrackIds={downloadedTrackIds}
                                setDownloadedTrackIds={handleDownloadedTrackIdsChange}
                                enableInfiniteScroll={false}
                                hasMore={false}
                                isLoading={loading || searchLoading}
                                onLoadMore={() => { }}
                            />
                        ) : (
                            /* Skeleton de carregamento */
                            <div className="space-y-8">
                                {[1, 2, 3].map((groupIndex) => (
                                    <div key={groupIndex} className="space-y-4">
                                        {/* Header do grupo */}
                                        <div className="flex items-center justify-between">
                                            <div className="h-8 w-32 bg-gray-700 rounded-lg animate-pulse"></div>
                                            <div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse"></div>
                                        </div>

                                        {/* Linha verde */}
                                        <div className="h-px bg-gray-700 rounded-full"></div>

                                        {/* Grid de músicas skeleton */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {[1, 2, 3, 4].map((trackIndex) => (
                                                <div key={trackIndex} className="space-y-3">
                                                    {/* Thumbnail skeleton */}
                                                    <div className="w-full aspect-square bg-gray-700 rounded-lg animate-pulse"></div>

                                                    {/* Informações skeleton */}
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
                                                        <div className="h-3 w-3/4 bg-gray-700 rounded animate-pulse"></div>
                                                    </div>

                                                    {/* Botões skeleton */}
                                                    <div className="flex gap-2">
                                                        <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                                                        <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Skeleton específico para busca */}
                        {searchLoading && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    {/* Header de busca */}
                                    <div className="flex items-center justify-between">
                                        <div className="h-8 w-40 bg-gray-700 rounded-lg animate-pulse"></div>
                                        <div className="h-6 w-24 bg-gray-700 rounded-full animate-pulse"></div>
                                    </div>

                                    {/* Linha verde */}
                                    <div className="h-px bg-gray-700 rounded-full"></div>

                                    {/* Grid de busca skeleton */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4, 5, 6].map((trackIndex) => (
                                            <div key={trackIndex} className="space-y-3">
                                                {/* Thumbnail skeleton */}
                                                <div className="w-full aspect-square bg-gray-700 rounded-lg animate-pulse"></div>

                                                {/* Informações skeleton */}
                                                <div className="space-y-2">
                                                    <div className="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
                                                    <div className="h-3 w-3/4 bg-gray-700 rounded animate-pulse"></div>
                                                </div>

                                                {/* Botões skeleton */}
                                                <div className="flex gap-2">
                                                    <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                                                    <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
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

                {/* Footer Simples */}
                <footer className="bg-black border-t border-gray-800 mt-20">
                    <div className="max-w-[95%] mx-auto px-6 py-12">

                        {/* Conteúdo Principal */}
                        <div className="flex flex-col items-center gap-4">

                            {/* Logo e Nome */}
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                        <Music className="w-7 h-7 text-white" />
                                    </div>
                                    <span className="text-2xl font-bold text-white">
                                        Nexor Records Pools
                                    </span>
                                </div>
                            </div>

                            {/* Links */}
                            <div className="flex flex-wrap justify-center gap-6">
                                <Link href="/new" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                    Novidades
                                </Link>
                                <Link href="/trending" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                    Trending
                                </Link>
                                <Link href="/plans" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                    Planos
                                </Link>
                                <Link href="/privacidade" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                    Privacidade
                                </Link>
                                <Link href="/termos" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                    Termos
                                </Link>
                            </div>

                            {/* Redes Sociais */}
                            <div className="flex gap-4">
                                <a href="https://twitter.com/plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806.026-1.566.247-2.229.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                    </svg>
                                </a>
                                <a href="https://instagram.com/plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.017 12.017.017z" />
                                    </svg>
                                </a>
                                <a href="https://youtube.com/@plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </a>
                            </div>

                            {/* Copyright */}
                            <div className="text-center">
                                <p className="text-gray-400 text-sm">
                                    © 2025 Nexor Records Pools. Todos os direitos reservados.
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
} 