"use client";

// Configurações para evitar problemas de hidratação
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Filter, Users, TrendingUp, Heart, Download, Play, Upload, Star, X, Crown, ChevronLeft, ChevronRight, Music } from 'lucide-react';
import { Track } from '@/types/track';
import Header from '@/components/layout/Header';
import MusicList from '@/components/music/MusicList';
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
            image: "https://i.ibb.co/Q7B5BSTz/20250513-1005-DJ-em-Balada-Brasileira-remix-01jv4vx7prex7a005qqn46ee4z.png",
            link: "/community",
            badge: "TRENDING",
        },
        {
            id: 3,
            title: "Curadoria Premium",
            artist: "Seleção Especializada",
            image: "https://i.ibb.co/Vm1xPqt/slide1.jpg",
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
        <div className="min-h-screen bg-[#121212] overflow-x-hidden">
            {/* Header Fixo */}
            <Header />

            {/* Conteúdo Principal - Tela Cheia */}
            <div className="pt-12 lg:pt-16">
                {/* Header da página Community */}
                <div className="w-full bg-gradient-to-b from-[#1db954]/20 to-transparent">
                    <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-12">
                        {/* Informações da página Community */}
                        <div className="text-center">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                                Community
                            </h1>

                            {/* Seção Hero - Descrição da página Community */}
                            <div className="max-w-4xl mx-auto mb-8">
                                <div className="bg-[#181818] rounded-xl p-6 border border-[#282828] mb-6">
                                    <div className="text-[#b3b3b3] text-sm sm:text-base leading-relaxed space-y-4">
                                        <p>
                                            Bem-vindo à Community, o coração pulsante da música eletrônica brasileira. Aqui você encontra produções exclusivas de DJs e produtores da nossa comunidade, compartilhando suas criações mais inovadoras.
                                        </p>

                                        <p>
                                            🎵 Descubra talentos emergentes, explore novos estilos e conecte-se com produtores que estão moldando o futuro da música eletrônica. Cada track é uma expressão única da criatividade brasileira.
                                        </p>

                                        <p>
                                            🌟 Nossa comunidade é construída por produtores apaixonados que compartilham suas visões musicais. Aqui você encontra desde deep house até techno pesado, sempre com a qualidade e originalidade que caracteriza a cena brasileira.
                                        </p>

                                        <p className="text-[#1db954] font-semibold text-base sm:text-lg">
                                            Junte-se à comunidade e faça parte da revolução musical!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.totalTracks}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Músicas</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.totalDownloads.toLocaleString()}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Downloads</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.totalLikes.toLocaleString()}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Curtidas</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.activeUsers}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Usuários Ativos</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Aviso Mobile - Igual à página /new */}
                <div className="block sm:hidden w-full max-w-[95%] mx-auto px-3 sm:px-6 md:px-8 mb-8">
                    <div className="bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a]">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-[#1db954] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <div className="text-white text-sm">
                                <p className="font-medium">Acesso Mobile</p>
                                <p className="text-[#b3b3b3] text-xs">Para uma melhor experiência, acesse através de um computador</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seção de Login */}
                {!session && (
                    <div className="w-full max-w-[95%] mx-auto px-3 sm:px-6 md:px-8 mb-8">
                        <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-6 border border-[#282828]/50 text-center">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-white text-xl font-bold">Junte-se à Comunidade</h2>
                            </div>
                            <p className="text-[#b3b3b3] mb-6 max-w-2xl mx-auto">
                                Faça login para ouvir as prévias, curtir músicas e baixar as faixas mais populares da comunidade.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/auth/sign-in">
                                    <button className="bg-[#1db954] hover:bg-[#1ed760] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                                        Fazer Login
                                    </button>
                                </Link>
                                <Link href="/auth/sign-up">
                                    <button className="bg-[#282828] hover:bg-[#3e3e3e] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                                        Criar Conta
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Seção de Busca */}
                <div className="w-full max-w-[95%] mx-auto px-3 sm:px-6 md:px-8 mb-8">
                    <div className="bg-[#181818] rounded-xl p-6 border border-[#282828]">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                            <button
                                onClick={() => performSearch(searchQuery)}
                                disabled={searchLoading || !searchQuery.trim()}
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
                    </div>
                </div>

                {/* Lista de Músicas */}
                <div className="w-full max-w-[95%] mx-auto px-3 sm:px-6 md:px-8 mb-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="animate-spin w-12 h-12 border-4 border-[#1db954] border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-[#b3b3b3] text-lg">Carregando músicas da comunidade...</p>
                            </div>
                        </div>
                    ) : (
                        <MusicList
                            tracks={hasSearched ? searchResults : tracks}
                            downloadedTrackIds={downloadedTrackIds}
                            setDownloadedTrackIds={setDownloadedTrackIds}
                            enableInfiniteScroll={false}
                            hasMore={false}
                            isLoading={loading || searchLoading}
                            onLoadMore={() => { }}
                        />
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
    );
} 