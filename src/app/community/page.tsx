// src/app/community/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, Filter, Music, Loader2, Sparkles, Clock, Star, CheckCircle, Waves, ShoppingCart, Package, X, Crown, Play, Download, Heart, Users, Upload, TrendingUp } from 'lucide-react';

import { Track } from '@/types/track';

// Tipo para o progresso do ZIP
type ZipProgressState = {
    isActive: boolean;
    progress: number;
    current: number;
    total: number;
    trackName: string;
    elapsedTime: number;
    remainingTime: number;
    isGenerating: boolean;
};

import MusicTable from '@/components/music/MusicTable';
import { useSEO } from '@/hooks/useSEO';
import SEOHead from '@/components/seo/SEOHead';
import MusicStructuredData from '@/components/seo/MusicStructuredData';
import Header from '@/components/layout/Header';
import NewFooter from '@/components/layout/NewFooter';
import FiltersModal from '@/components/music/FiltersModal';
import { useAppContext } from '@/context/AppContext';
import { useDownloadExtensionDetector } from '@/hooks/useDownloadExtensionDetector';
import { useToast } from '@/hooks/useToast';
import { YouTubeSkeleton } from '@/components/ui/LoadingSkeleton';
import Link from 'next/link';
import {
    getCurrentDateBrazil,
    convertToBrazilTimezone,
    getDateOnlyBrazil,
    compareDatesOnly,
    isTodayBrazil,
    isYesterdayBrazil,
    formatDateBrazil,
    getDateKeyBrazil
} from '@/utils/dateUtils';

// Componente de Loading para a página
const PageSkeleton = () => <YouTubeSkeleton />;

// Função temporária para corrigir problema de timezone
const getCorrectDateKey = (dateString: string): string => {
    try {
        // Extrair apenas a parte da data (YYYY-MM-DD) se vier com timestamp
        const dateOnly = dateString.split('T')[0];

        // Assumir que a data vem no formato YYYY-MM-DD
        const trackDate = new Date(dateOnly + 'T00:00:00-03:00'); // Forçar timezone Brasil

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zerar horas para comparação

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const trackDateOnly = new Date(trackDate);
        trackDateOnly.setHours(0, 0, 0, 0);

        // Comparar timestamps
        if (trackDateOnly.getTime() === today.getTime()) {
            return 'today';
        }
        if (trackDateOnly.getTime() === yesterday.getTime()) {
            return 'yesterday';
        }
        if (trackDateOnly.getTime() > today.getTime()) {
            return 'future';
        }

        // Para outras datas, retornar a data original para que possamos formatá-la depois
        return dateOnly;
    } catch (error) {
        console.error('Erro ao processar data:', dateString, error);
        return 'no-date'; // Retornar uma chave válida em vez da string original
    }
};

// Componente principal da página
function CommunityPageContent() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(''); // Termo que o usuário está digitando
    const [appliedSearchQuery, setAppliedSearchQuery] = useState(''); // Termo aplicado aos filtros
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [hasActiveFilters, setHasActiveFilters] = useState(false);

    // Estado para estatísticas da comunidade
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        activeUsers: 16, // Valor padrão baseado no que o usuário mencionou
        communityScore: 0
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



    // Estados para fila de downloads (movidos da MusicTable)
    const [downloadQueue, setDownloadQueue] = useState<Track[]>([]);
    const [isDownloadingQueue, setIsDownloadingQueue] = useState(false);
    const [zipProgress, setZipProgress] = useState<ZipProgressState>({
        isActive: false,
        progress: 0,
        current: 0,
        total: 0,
        trackName: '',
        elapsedTime: 0,
        remainingTime: 0,
        isGenerating: false
    });

    // Estados para filtros disponíveis
    const [genres, setGenres] = useState<string[]>([]);
    const [artists, setArtists] = useState<string[]>([]);
    const [versions, setVersions] = useState<string[]>([]);
    const [pools, setPools] = useState<string[]>([]);

    // Hook para SEO
    const { seoData } = useSEO({
        customTitle: 'Comunidade - Músicas dos DJs',
        customDescription: 'Descubra as melhores músicas enviadas pelos DJs da comunidade. Novos lançamentos, diferentes estilos e artistas.',
        customKeywords: 'comunidade, djs, músicas, novos lançamentos, estilos variados',
        customImage: '/images/community-og.jpg'
    });

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
                    communityScore
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
                    activeUsers: data.activeUsersToday
                }));
            }
        } catch (error) {
            console.error('Error fetching active users:', error);
            // Manter o valor padrão de 16 em caso de erro
        }
    };

    // Carregar dados iniciais
    useEffect(() => {
        fetchFilters();
        fetchCommunityTracks();
        fetchActiveUsers(); // Buscar usuários ativos do banco
    }, [fetchFilters, fetchCommunityTracks]);

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
    };

    // Função para buscar
    const handleSearch = () => {
        setAppliedSearchQuery(searchQuery);
        setCurrentPage(1);
        fetchCommunityTracks(true);
    };

    // Função para mudar página
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchCommunityTracks();
    };

    // Função para adicionar/remover da fila de download
    const onToggleQueue = (track: Track) => {
        setDownloadQueue(prev => {
            const isInQueue = prev.find(t => t.id === track.id);
            if (isInQueue) {
                return prev.filter(t => t.id !== track.id);
            } else {
                if (prev.length >= 20) {
                    showToast('❌ Máximo de 20 músicas na fila de download', 'error');
                    return prev;
                }
                showToast('✅ Música adicionada à fila de download', 'success');
                return [...prev, track];
            }
        });
    };

    // Função para gerar ZIP da fila de download
    const handleDownloadQueue = async () => {
        if (downloadQueue.length === 0) return;

        try {
            setIsDownloadingQueue(true);
            setZipProgress(prev => ({
                ...prev,
                isActive: true,
                total: downloadQueue.length,
                current: 0,
                progress: 0,
                isGenerating: true
            }));

            // Simular progresso de geração do ZIP
            for (let i = 0; i < downloadQueue.length; i++) {
                const track = downloadQueue[i];
                setZipProgress(prev => ({
                    ...prev,
                    current: i + 1,
                    progress: Math.round(((i + 1) / downloadQueue.length) * 100),
                    trackName: track.songName
                }));

                // Simular tempo de processamento
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Simular download do ZIP
            setZipProgress(prev => ({ ...prev, isGenerating: false }));
            await new Promise(resolve => setTimeout(resolve, 1000));

            showToast('✅ ZIP gerado com sucesso!', 'success');
            setDownloadQueue([]);
        } catch (error) {
            showToast('❌ Erro ao gerar ZIP', 'error');
        } finally {
            setIsDownloadingQueue(false);
            setZipProgress(prev => ({ ...prev, isActive: false }));
        }
    };

    // Função para cancelar geração do ZIP
    const handleCancelZipGeneration = () => {
        setZipProgress(prev => ({ ...prev, isActive: false }));
        setIsDownloadingQueue(false);
    };

    // Função para limpar fila de download
    const handleClearQueue = () => {
        setDownloadQueue([]);
        showToast('🗑️ Fila de download limpa', 'info');
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

    // Função para mudar busca
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            handleSearch();
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setAppliedSearchQuery('');
        setHasActiveFilters(false);
        fetchCommunityTracks(true);
    };

    // Função para obter label da data
    const getDateLabel = (dateKey: string) => {
        if (dateKey === 'today') return 'Hoje';
        if (dateKey === 'yesterday') return 'Ontem';
        if (dateKey === 'future') return 'Futuro';
        if (dateKey === 'no-date') return 'Sem Data';

        try {
            const date = new Date(dateKey + 'T00:00:00-03:00');
            return date.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateKey;
        }
    };

    // Agrupar músicas por data de lançamento
    const groupTracksByReleaseDate = useMemo(() => {
        const grouped: { [key: string]: Track[] } = {};
        const sortedKeys: string[] = [];

        tracks.forEach(track => {
            const dateKey = getCorrectDateKey(track.releaseDate || '');

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
                sortedKeys.push(dateKey);
            }

            grouped[dateKey].push(track);
        });

        // Ordenar chaves de data
        sortedKeys.sort((a, b) => {
            if (a === 'today') return -1;
            if (a === 'yesterday') return -2;
            if (a === 'future') return 1;
            if (b === 'today') return 1;
            if (b === 'yesterday') return 2;
            if (b === 'future') return -1;

            try {
                return new Date(b).getTime() - new Date(a).getTime();
            } catch {
                return 0;
            }
        });

        return {
            grouped,
            sortedKeys,
            totalPages: Math.ceil(sortedKeys.length / 7), // 7 dias por página
            totalDays: sortedKeys.length
        };
    }, [tracks]);

    // Renderização do componente
    return (
        <div className="bg-[#121212] relative overflow-hidden z-0" style={{ zIndex: 0 }}>
            {/* SEO Components */}
            {seoData && (
                <SEOHead
                    title={seoData.title}
                    description={seoData.description}
                    keywords={seoData.keywords}
                    image={seoData.image}
                    url={seoData.url}
                    type={seoData.type}
                    musicData={seoData.musicData}
                />
            )}
            {tracks.length > 0 && (
                <MusicStructuredData
                    track={{
                        ...tracks[0],
                        imageUrl: tracks[0].imageUrl ?? '',
                    }}
                    url={window.location.href}
                />
            )}

            {/* Animated background particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#202A3C]/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#26222D]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#202A3C]/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            <Header />
            <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pt-16 sm:pt-20 pb-4 relative z-10">
                {/* Hero Section - Primeiro Slide */}
                <div className="mb-8 sm:mb-12">
                    {/* Header da página */}
                    <div className="mb-6 sm:mb-8">

                        {/* Indicadores de filtros ativos */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {appliedSearchQuery && (
                                <div className="flex items-center space-x-2 bg-[#202A3C]/60 text-blue-400 px-3 py-1 rounded-full text-sm border border-[#26222D]/50">
                                    <Search className="h-3 w-3" />
                                    <span>Pesquisando: "{appliedSearchQuery}"</span>
                                    <button
                                        onClick={handleClearSearch}
                                        className="hover:text-blue-300 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            {hasActiveFilters && !appliedSearchQuery && (
                                <div className="flex items-center space-x-2 text-orange-400">
                                    <Filter className="h-4 w-4" />
                                    <span className="text-sm">Filtros ativos</span>
                                </div>
                            )}
                        </div>

                        {!session && (
                            <div className="w-full flex items-center justify-center py-3 px-4 mt-4 rounded-xl shadow-md bg-yellow-100 border border-yellow-400 text-yellow-900 font-semibold text-center text-sm">
                                Atenção: Usuários sem plano não podem ouvir, baixar ou curtir músicas. Apenas a navegação no catálogo está disponível.
                            </div>
                        )}
                    </div>

                    {/* Hero Section - COMUNIDADE DOS VIPS */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl">
                                    <Music className="h-8 w-8 text-white" />
                                </div>
                                <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-500 via-violet-500 to-emerald-500 bg-clip-text text-transparent drop-shadow-lg">
                                    COMUNIDADE DOS VIPS
                                </h1>
                                <p className="text-gray-300 text-lg mt-2">Músicas Produzidas e Enviadas pela galera da comunidade</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl border border-yellow-500/30 p-6 text-center group hover:scale-105 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Download className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{stats.totalDownloads.toLocaleString()}</h3>
                            <p className="text-yellow-300 text-sm">Downloads da Semana</p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl border border-pink-500/30 p-6 text-center group hover:scale-105 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Heart className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{stats.totalLikes.toLocaleString()}</h3>
                            <p className="text-pink-300 text-sm">Likes da Semana</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 text-center group hover:scale-105 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{stats.activeUsers.toLocaleString()}</h3>
                            <p className="text-purple-300 text-sm">Usuários Ativos</p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl border border-emerald-500/30 p-6 text-center group hover:scale-105 transition-all duration-300">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{stats.communityScore.toLocaleString()}</h3>
                            <p className="text-emerald-300 text-sm">Score Comunidade</p>
                        </div>
                    </div>

                    {/* Cards de Recursos da Comunidade */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="group bg-[#202A3C]/80 backdrop-blur-sm rounded-xl border border-[#26222D]/50 p-6 hover:scale-105 transition-all duration-300 hover:border-purple-500/50">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                                    <Upload className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Upload Comunitário</h3>
                                    <p className="text-sm text-gray-400">DJs compartilham suas criações</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Nossa comunidade de DJs profissionais compartilha suas melhores produções,
                                garantindo que você tenha acesso a músicas exclusivas e de alta qualidade.
                            </p>
                        </div>

                        <div className="group bg-[#202A3C]/80 backdrop-blur-sm rounded-xl border border-[#26222D]/50 p-6 hover:scale-105 transition-all duration-300 hover:border-blue-500/50">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Trending da Semana</h3>
                                    <p className="text-sm text-gray-400">Músicas mais populares</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Descubra quais músicas estão bombando na comunidade.
                                Baseado em downloads, likes e feedback dos DJs.
                            </p>
                        </div>

                        <div className="group bg-[#202A3C]/80 backdrop-blur-sm rounded-xl border border-[#26222D]/50 p-6 hover:scale-105 transition-all duration-300 hover:border-emerald-500/50">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                                    <Star className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Curadoria Premium</h3>
                                    <p className="text-sm text-gray-400">Seleção especializada</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Nossa equipe de curadores analisa cada música enviada,
                                garantindo apenas o melhor da música eletrônica.
                            </p>
                        </div>
                    </div>

                    {/* Barra de Pesquisa e Filtros */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Barra de Pesquisa */}
                            <div className="flex-1 relative flex">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar músicas da comunidade..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                        className="w-full pl-12 pr-12 py-4 bg-[#26222D]/60 backdrop-blur-xl border border-[#202A3C]/50 rounded-l-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                    />

                                    {/* Botão X para limpar pesquisa */}
                                    {searchQuery && (
                                        <button
                                            onClick={handleClearSearch}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>

                                {/* Botão de Pesquisa */}
                                <button
                                    onClick={handleSearchSubmit}
                                    disabled={!searchQuery.trim()}
                                    className={`px-6 py-4 text-white rounded-r-2xl font-semibold transition-all duration-300 shadow-lg flex items-center gap-2 ${searchQuery.trim()
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-blue-500/25'
                                        : 'bg-gray-600 cursor-not-allowed shadow-gray-600/25'
                                        }`}
                                >
                                    <Search className="h-5 w-5" />
                                    <span className="hidden sm:inline">Buscar</span>
                                </button>
                            </div>

                            {/* Botão de Filtros */}
                            <button
                                onClick={() => setShowFiltersModal(true)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${hasActiveFilters
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-[#26222D]/60 backdrop-blur-xl border border-[#202A3C]/50 text-gray-300 hover:bg-[#26222D]/80 hover:border-[#202A3C]/70'
                                    }`}
                            >
                                <Filter className="h-5 w-5" />
                                <span>Filtros</span>
                                {hasActiveFilters && (
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                )}
                            </button>

                            {/* Botão de Limpar Filtros */}
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="flex items-center gap-2 px-4 py-4 rounded-2xl font-semibold transition-all duration-300 bg-red-500/20 backdrop-blur-xl border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:border-red-500/50 hover:text-red-300"
                                    title="Limpar todos os filtros"
                                >
                                    <X className="h-4 w-4" />
                                    <span className="hidden sm:inline">Limpar</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mensagem de Aviso para Dispositivos Móveis */}
                    <div className="mb-8">
                        <div className="bg-[#202A3C]/60 backdrop-blur-sm rounded-xl border border-[#26222D]/50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-amber-400 font-semibold text-sm mb-2">💡 Dica para Melhor Experiência</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed text-justify">
                                        <span className="lg:hidden">
                                            Para uma experiência completa e melhor navegação, recomendamos que utilize este site em computadores ou dispositivos com tela maior.
                                            Algumas funcionalidades podem ter melhor desempenho em telas maiores.
                                        </span>
                                        <span className="hidden lg:inline">
                                            Você está utilizando a melhor experiência possível! Este site foi otimizado para oferecer a melhor navegação em telas maiores.
                                            Aproveite todas as funcionalidades disponíveis.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-32">
                            <div className="text-center">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
                                    <Users className="h-8 w-8 text-purple-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Carregando Músicas da Comunidade</h3>
                                <p className="text-gray-400">Aguarde enquanto buscamos as faixas enviadas pelos DJs...</p>
                            </div>
                        </div>
                    ) : tracks.length === 0 ? (
                        <div className="text-center py-32">
                            <div className="p-6 bg-gray-800/50 rounded-2xl inline-block mb-6">
                                <Users className="h-16 w-16 text-gray-400 mx-auto" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Nenhuma música da comunidade encontrada</h3>
                            <p className="text-gray-400 mb-8">
                                Tente ajustar seus filtros ou fazer uma nova busca.
                            </p>
                            <button
                                onClick={handleClearFilters}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Limpar Filtros
                            </button>
                        </div>
                    ) : (
                        <>


                            {/* Tabelas de Músicas Agrupadas por Data */}
                            <div className="space-y-8">
                                {groupTracksByReleaseDate.sortedKeys.map((dateKey) => {
                                    const tracksForDate = groupTracksByReleaseDate.grouped[dateKey];
                                    const dateLabel = getDateLabel(dateKey);

                                    return (
                                        <div key={dateKey} className="space-y-4">
                                            {/* Header da Data */}
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                                <h2 className="text-2xl font-bold text-white capitalize">
                                                    {dateLabel}
                                                </h2>
                                                <span className="text-sm text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                                                    {tracksForDate.length} {tracksForDate.length === 1 ? 'música' : 'músicas'}
                                                </span>
                                            </div>

                                            {/* Tabela para esta data */}
                                            <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                                                <MusicTable tracks={tracksForDate} onToggleQueue={onToggleQueue} externalDownloadQueue={downloadQueue} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Componente de Paginação */}
                            {groupTracksByReleaseDate.totalPages > 1 && (
                                <div className="flex justify-center items-center space-x-4 mt-8 mb-8">
                                    <div className="flex items-center space-x-2">
                                        {/* Botão Anterior */}
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === 1
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-700 text-white hover:bg-gray-600'
                                                }`}
                                        >
                                            ← Anterior
                                        </button>

                                        {/* Números das páginas */}
                                        <div className="flex space-x-1">
                                            {[...Array(groupTracksByReleaseDate.totalPages)].map((_, index) => {
                                                const pageNum = index + 1;
                                                const isCurrentPage = pageNum === currentPage;

                                                // Mostrar apenas algumas páginas próximas à atual
                                                if (
                                                    pageNum === 1 ||
                                                    pageNum === groupTracksByReleaseDate.totalPages ||
                                                    (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                                                ) {
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`px-3 py-2 rounded-lg font-medium transition-all ${isCurrentPage
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                } else if (
                                                    pageNum === currentPage - 3 ||
                                                    pageNum === currentPage + 3
                                                ) {
                                                    return (
                                                        <span key={pageNum} className="px-2 py-2 text-gray-500">
                                                            ...
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>

                                        {/* Botão Próximo */}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === groupTracksByReleaseDate.totalPages}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === groupTracksByReleaseDate.totalPages
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-700 text-white hover:bg-gray-600'
                                                }`}
                                        >
                                            Próximo →
                                        </button>
                                    </div>

                                    {/* Informações da paginação */}
                                    <div className="text-sm text-gray-400">
                                        Página {currentPage} de {groupTracksByReleaseDate.totalPages}
                                        <span className="ml-2">
                                            ({groupTracksByReleaseDate.totalDays} dias total)
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Footer atualizado */}
                            <div className="mt-12">
                                <NewFooter />
                            </div>
                        </>
                    )}
                </div>

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

                {/* Botão de Fila de Downloads */}
                {downloadQueue.length > 0 && (
                    <div className="fixed bottom-6 right-6 z-50">
                        <button
                            onClick={handleDownloadQueue}
                            disabled={isDownloadingQueue || zipProgress.isActive}
                            className="relative group"
                            title={`Fila de Downloads (${downloadQueue.length}/20) - Máximo 20 músicas - Clique para gerar ZIP`}
                        >
                            {/* Ícone principal */}
                            <div className="relative">
                                <div className="download-queue-icon w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group-hover:shadow-purple-500/50">
                                    {isDownloadingQueue || zipProgress.isActive ? (
                                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                                    ) : (
                                        <ShoppingCart className="h-8 w-8 text-white" />
                                    )}
                                </div>

                                {/* Contador */}
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                                    {downloadQueue.length}
                                </div>

                                {/* Animação de pulso quando adiciona música */}
                                <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-20"></div>
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                {isDownloadingQueue || zipProgress.isActive ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {zipProgress.isGenerating ? 'Processando...' : 'Baixando...'}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Gerar ZIP ({downloadQueue.length}/20 músicas)
                                    </div>
                                )}
                            </div>
                        </button>

                        {/* Botão para limpar fila ou cancelar ZIP */}
                        <button
                            onClick={zipProgress.isActive ? handleCancelZipGeneration : handleClearQueue}
                            disabled={isDownloadingQueue && !zipProgress.isActive}
                            className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={zipProgress.isActive ? "Cancelar geração do ZIP" : "Limpar fila"}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}

                {/* Progress Bar Flutuante */}
                {zipProgress.isActive && (
                    <div className="fixed bottom-24 right-6 z-50 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-white font-medium">
                                    {zipProgress.trackName}
                                </span>
                                <button
                                    onClick={handleCancelZipGeneration}
                                    className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
                                    title="Cancelar geração do ZIP"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                            <span className="text-sm text-gray-300">
                                {zipProgress.current}/{zipProgress.total} ({zipProgress.progress}%)
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${zipProgress.progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

// Componente principal com Suspense
export default function CommunityPage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <CommunityPageContent />
        </Suspense>
    );
} 