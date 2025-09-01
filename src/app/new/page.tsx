"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Music,
    RefreshCw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import FiltersModal from "@/components/music/FiltersModal";
import MusicList from "@/components/music/MusicList";
import BatchDownloadButtons from "@/components/download/BatchDownloadButtons";
import { ProgressiveLoadingBar, LoadMoreButton, ErrorRetryButton } from "@/components/ui/ProgressiveLoadingBar";

import { useAppContext } from "@/context/AppContext";
import { useGlobalPlayer } from "@/context/GlobalPlayerContext";
import { usePageLoading } from "@/hooks/usePageLoading";
import { useSimplePagination } from "@/hooks/useSimplePagination";
import { useDownloadsCache } from "@/hooks/useDownloadsCache";
import { Track } from "@/types/track";
import dynamicImport from "next/dynamic";

// Code splitting para Framer Motion
const MotionDiv = dynamicImport(() => import("framer-motion").then(mod => ({ default: mod.motion.div })), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 rounded" />
});

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

const NewPage = () => {
    const router = useRouter();
    const pathname = usePathname();

    // Estado para hidratação
    const [isHydrated, setIsHydrated] = useState(false);
    const [starPositions, setStarPositions] = useState<Array<{
        left: string;
        top: string;
        animationDelay: string;
        animationDuration: string;
    }>>([]);

    // Estados para busca e filtros
    const [searchQuery, setSearchQuery] = useState("");
    const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Estados para filtros
    const [selectedGenre, setSelectedGenre] = useState("");
    const [selectedArtist, setSelectedArtist] = useState("");
    const [selectedDateRange, setSelectedDateRange] = useState("");
    const [selectedVersion, setSelectedVersion] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedPool, setSelectedPool] = useState("");

    // Função para extrair número da página da URL
    const getPageFromUrl = useCallback(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            const match = hash.match(/#\/page=(\d+)/);
            return match ? parseInt(match[1], 10) : 1;
        }
        return 1;
    }, []);

    // Função para atualizar a URL com a página atual
    const updateUrlWithPage = useCallback((page: number) => {
        if (typeof window !== 'undefined') {
            const newHash = `#/page=${page}`;
            if (window.location.hash !== newHash) {
                window.location.hash = newHash;
            }
        }
    }, []);

    // Hook para paginação simples das músicas
    const {
        tracks,
        totalCount,
        currentPage,
        totalPages,
        isLoading,
        error,
        loadPage,
        nextPage,
        previousPage,
        hasNextPage,
        hasPreviousPage,
        forceReload
    } = useSimplePagination({
        endpoint: '/api/tracks/new',
        pageSize: 60, // 60 músicas por página
        initialPage: getPageFromUrl(), // Usar página da URL
        onError: (error) => {
            console.error('❌ Erro no carregamento da página:', error);
        },
        onPageChange: (page) => {
            // Atualizar URL quando a página muda
            updateUrlWithPage(page);
        }
    });

    // Sincronizar com mudanças na URL (navegação manual)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleHashChange = () => {
            const newPage = getPageFromUrl();
            if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
                loadPage(newPage);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [currentPage, totalPages, loadPage, getPageFromUrl]);

    // Atualizar URL inicial se não houver hash
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.location.hash && currentPage === 1) {
            updateUrlWithPage(1);
        }
    }, [currentPage, updateUrlWithPage]);

    // Detectar quando a página volta do histórico e recarregar se necessário
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handlePageShow = (event: PageTransitionEvent) => {
            // Se a página foi carregada do cache do navegador (back/forward)
            if (event.persisted && tracks.length === 0) {
                console.log('🔄 Página voltou do cache do navegador sem dados, recarregando...');
                setTimeout(() => forceReload(), 100);
            }
        };

        const handlePopState = () => {
            // Se não há músicas carregadas, forçar reload
            if (tracks.length === 0) {
                console.log('🔄 Navegação de volta detectada sem dados, recarregando...');
                setTimeout(() => forceReload(), 100);
            }
        };

        window.addEventListener('pageshow', handlePageShow);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [tracks.length, forceReload]);

    // Extrair dados únicos para filtros - otimizado para evitar re-cálculos desnecessários
    const genres = useMemo(() => {
        if (tracks.length === 0) return [];
        return Array.from(new Set(tracks.map(t => t.style).filter((v): v is string => Boolean(v))));
    }, [tracks.length]); // Recalcular apenas quando necessário

    const artists = useMemo(() => {
        if (tracks.length === 0) return [];
        return Array.from(new Set(tracks.map(t => t.artist).filter((v): v is string => Boolean(v))));
    }, [tracks.length]);

    const versions = useMemo(() => {
        if (tracks.length === 0) return [];
        return Array.from(new Set(tracks.map(t => t.version).filter((v): v is string => Boolean(v))));
    }, [tracks.length]);

    const pools = useMemo(() => {
        if (tracks.length === 0) return [];
        return Array.from(new Set(tracks.map(t => t.pool).filter((v): v is string => Boolean(v))));
    }, [tracks.length]);

    const monthOptions = useMemo(() => {
        if (tracks.length === 0) return [];
        const months = tracks
            .map(t => {
                if (!t.releaseDate) return null;
                const d = new Date(t.releaseDate);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            })
            .filter((v): v is string => Boolean(v));
        return Array.from(new Set(months)).map(m => ({ value: m, label: m }));
    }, [tracks]);

    // Estados para estilos mais baixados
    const [styles, setStyles] = useState<Array<{ name: string; trackCount: number; downloadCount: number }>>([]);
    const [stylesLoading, setStylesLoading] = useState(true);

    // Estados para folders recentes
    const [recentFolders, setRecentFolders] = useState<Array<{
        name: string;
        trackCount: number;
        imageUrl: string;
        lastUpdated: string;
        downloadCount: number;
    }>>([]);
    const [foldersLoading, setFoldersLoading] = useState(true);





    // Buscar estilos mais baixados
    const fetchStyles = useCallback(async () => {
        try {
            console.log('🎭 Buscando estilos mais baixados...');
            setStylesLoading(true);
            const response = await fetch('/api/tracks/styles/most-downloaded');

            if (response.ok) {
                const data = await response.json();
                console.log('📊 Dados recebidos da API:', data);
                if (data.success && data.styles.length > 0) {
                    console.log('✅ Estilos carregados com sucesso:', data.styles.length);
                    setStyles(data.styles.slice(0, 9)); // Top 9 estilos para tela cheia
                } else {
                    console.log('⚠️ API não retornou estilos válidos, usando fallback');
                    // Fallback: usar dados das tracks carregadas
                    if (tracks.length > 0) {
                        const styleCounts: { [key: string]: { name: string; trackCount: number; downloadCount: number } } = {};

                        tracks.forEach(track => {
                            const style = track.style;
                            if (!style) return;

                            if (!styleCounts[style]) {
                                styleCounts[style] = { name: style, trackCount: 0, downloadCount: 0 };
                            }
                            styleCounts[style].trackCount++;
                            styleCounts[style].downloadCount = Math.floor(Math.random() * 100) + 10;
                        });

                        const fallbackStyles = Object.values(styleCounts)
                            .sort((a, b) => b.downloadCount - a.downloadCount)
                            .slice(0, 8);
                        console.log('🔄 Usando estilos fallback:', fallbackStyles.length);
                        setStyles(fallbackStyles);
                    }
                }
            } else {
                console.log('❌ API retornou erro:', response.status);
            }
        } catch (error) {
            console.error('❌ Erro ao buscar estilos:', error);
            // Fallback: usar dados das tracks carregadas
            if (tracks.length > 0) {
                const styleCounts: { [key: string]: { name: string; trackCount: number; downloadCount: number } } = {};

                tracks.forEach(track => {
                    const style = track.style;
                    if (!style) return;

                    if (!styleCounts[style]) {
                        styleCounts[style] = { name: style, trackCount: 0, downloadCount: 0 };
                    }
                    styleCounts[style].trackCount++;
                    styleCounts[style].downloadCount = Math.floor(Math.random() * 100) + 10;
                });

                const fallbackStyles = Object.values(styleCounts)
                    .sort((a, b) => b.downloadCount - a.downloadCount)
                    .slice(0, 8);
                console.log('🔄 Usando estilos fallback após erro:', fallbackStyles.length);
                setStyles(fallbackStyles);
            }
        } finally {
            setStylesLoading(false);
        }
    }, [tracks]); // Incluir tracks nas dependências para usar dados atualizados

    // Buscar folders recentes
    const fetchRecentFolders = useCallback(async () => {
        try {
            console.log('📁 Buscando folders recentes...');
            console.log('📁 Tracks disponíveis:', tracks.length);

            // Debug: verificar se as tracks têm folders
            const tracksWithFolders = tracks.filter(track => track.folder);
            console.log('📁 Tracks com folders:', tracksWithFolders.length);
            if (tracksWithFolders.length > 0) {
                console.log('📁 Exemplos de folders:', tracksWithFolders.slice(0, 3).map(t => t.folder));
            }

            setFoldersLoading(true);

            // Adicionar timeout para a requisição
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

            const response = await fetch('/api/tracks/folders/recent', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                console.log('📁 Dados de folders recebidos da API:', data);
                if (data.success && data.folders.length > 0) {
                    console.log('✅ Folders recentes carregados com sucesso:', data.folders.length);
                    setRecentFolders(data.folders);
                } else {
                    console.log('⚠️ Nenhum folder encontrado na API, usando fallback');
                    // Fallback: criar folders baseados nas tracks
                    if (tracks.length > 0) {
                        console.log('🔄 Criando fallback com tracks disponíveis...');
                        const folderCounts: {
                            [key: string]: {
                                name: string;
                                trackCount: number;
                                imageUrl: string;
                                lastUpdated: string;
                                downloadCount: number;
                            }
                        } = {};

                        tracks.forEach(track => {
                            const folder = track.folder;
                            if (!folder) return;

                            if (!folderCounts[folder]) {
                                folderCounts[folder] = {
                                    name: folder,
                                    trackCount: 0,
                                    imageUrl: track.imageUrl || '/images/default-folder.jpg',
                                    lastUpdated: track.updatedAt || track.createdAt,
                                    downloadCount: 0
                                };
                            }
                            folderCounts[folder].trackCount++;
                            folderCounts[folder].downloadCount = Math.floor(Math.random() * 50) + 5;
                        });

                        const fallbackFolders = Object.values(folderCounts)
                            .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                            .slice(0, 7);
                        console.log('🔄 Usando folders fallback:', fallbackFolders.length);
                        console.log('🔄 Folders do fallback:', fallbackFolders.map(f => f.name));
                        setRecentFolders(fallbackFolders);
                    } else {
                        console.log('⚠️ Nenhuma track disponível para fallback');
                    }
                }
            } else {
                console.log('❌ API de folders retornou erro:', response.status);
                // Usar fallback imediatamente
                if (tracks.length > 0) {
                    const folderCounts: {
                        [key: string]: {
                            name: string;
                            trackCount: number;
                            imageUrl: string;
                            lastUpdated: string;
                            downloadCount: number;
                        }
                    } = {};

                    tracks.forEach(track => {
                        const folder = track.folder;
                        if (!folder) return;

                        if (!folderCounts[folder]) {
                            folderCounts[folder] = {
                                name: folder,
                                trackCount: 0,
                                imageUrl: track.imageUrl || '/images/default-folder.jpg',
                                lastUpdated: track.updatedAt || track.createdAt,
                                downloadCount: 0
                            };
                        }
                        folderCounts[folder].trackCount++;
                        folderCounts[folder].downloadCount = Math.floor(Math.random() * 50) + 5;
                    });

                    const fallbackFolders = Object.values(folderCounts)
                        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                        .slice(0, 7);
                    console.log('🔄 Usando folders fallback após erro da API:', fallbackFolders.length);
                    console.log('🔄 Folders do fallback após erro:', fallbackFolders.map(f => f.name));
                    setRecentFolders(fallbackFolders);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao buscar folders recentes:', error);
            // Fallback: usar dados das tracks carregadas
            if (tracks.length > 0) {
                const folderCounts: {
                    [key: string]: {
                        name: string;
                        trackCount: number;
                        imageUrl: string;
                        lastUpdated: string;
                        downloadCount: number;
                    }
                } = {};

                tracks.forEach(track => {
                    const folder = track.folder;
                    if (!folder) return;

                    if (!folderCounts[folder]) {
                        folderCounts[folder] = {
                            name: folder,
                            trackCount: 0,
                            imageUrl: track.imageUrl || '/images/default-folder.jpg',
                            lastUpdated: track.updatedAt || track.createdAt,
                            downloadCount: 0
                        };
                    }
                    folderCounts[folder].trackCount++;
                    folderCounts[folder].downloadCount = Math.floor(Math.random() * 50) + 5;
                });

                const fallbackFolders = Object.values(folderCounts)
                    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                    .slice(0, 7);
                console.log('🔄 Usando folders fallback após erro:', fallbackFolders.length);
                console.log('🔄 Folders do fallback após erro:', fallbackFolders.map(f => f.name));
                setRecentFolders(fallbackFolders);
            }
        } finally {
            setFoldersLoading(false);
        }
    }, [tracks]); // Incluir tracks nas dependências para usar dados atualizados

    // Gerar posições das estrelas após hidratação (evitar hydration mismatch)
    useEffect(() => {
        const positions = Array.from({ length: 50 }, () => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`
        }));
        setStarPositions(positions);
        setIsHydrated(true);
    }, []);

    // Carregar estilos e folders apenas uma vez quando há tracks suficientes
    useEffect(() => {
        if (tracks.length > 20 && !styles.length && !recentFolders.length) { // Carregar apenas uma vez
            fetchStyles();
            fetchRecentFolders();
        }
    }, [tracks.length, styles.length, recentFolders.length, fetchStyles, fetchRecentFolders]); // Incluir fetchStyles e fetchRecentFolders nas dependências

    const { data: session } = useSession();
    const { showAlert } = useAppContext();
    const { currentTrack, isPlaying, playTrack } = useGlobalPlayer();
    const { startLoading, stopLoading } = usePageLoading();

    // Hook para cache de downloads
    const downloadsCache = useDownloadsCache();

    // Função para agrupar tracks por data - otimizada para evitar recálculos desnecessários
    const groupedTracksByDate = useMemo(() => {
        if (tracks.length === 0) return {};

        const groups: { [key: string]: Track[] } = {};

        tracks.forEach(track => {
            const date = track.releaseDate || track.createdAt;
            if (!date) return;

            const dateKey = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(track);
        });

        // Ordenar por data (mais recente primeiro)
        return Object.fromEntries(
            Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        );
    }, [tracks.length]); // Recalcular apenas quando o tamanho muda



    // --- SLIDES DA COMUNIDADE ---
    const communitySlides = [
        {
            id: 1,
            title: "Upload Comunitário",
            artist: "DJs da Comunidade",
            image: "https://i.ibb.co/Q7B5BSTz/20250513-1005-DJ-em-Balada-Brasileira-remix-01jv4vx7prex7a005qqn46ee4z.png",
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
            image: "https://i.ibb.co/Q7B5BSTz/20250513-1005-DJ-em-Balada-Brasileira-remix-01jv4vx7prex7a005qqn46ee4z.png",
            link: "/community",
            badge: "PREMIUM",
        },
    ];

    const [currentCommunitySlide, setCurrentCommunitySlide] = useState(0);
    const [isCommunityHovered, setIsCommunityHovered] = useState(false);

    useEffect(() => {
        if (isCommunityHovered) return; // Pausa o autoplay ao passar o mouse
        const interval = setInterval(() => {
            setCurrentCommunitySlide((prev) => (prev + 1) % communitySlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isCommunityHovered]); // communitySlides.length é constante

    // Hook para carregamento progressivo das músicas já está configurado acima

    // Função para realizar busca
    const performSearch = async (query: string) => {
        if (!query.trim()) return;

        try {
            startLoading(`Buscando por "${query}"...`);
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
                showAlert("Erro ao buscar músicas");
            }
        } catch (error) {
            console.error("Erro na busca:", error);
            setSearchResults([]);
            setAppliedSearchQuery(query);
            setHasSearched(true);
            showAlert("Erro ao buscar músicas");
        } finally {
            setSearchLoading(false);
            stopLoading();
        }
    };

    // Função para limpar busca
    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setAppliedSearchQuery("");
        setHasSearched(false);
        loadPage(1); // Reset para primeira página

        // Limpar URL da pesquisa
        const newUrl = `${window.location.pathname}`;
        window.history.pushState({}, '', newUrl);
    };



    // --- Determinar quais músicas mostrar ---
    const displayTracks = useMemo(() => {
        // Se há busca ativa, mostrar resultados da busca
        if (hasSearched) {
            return searchResults;
        }
        // Caso contrário, mostrar músicas da página atual
        return tracks;
    }, [hasSearched, searchResults, tracks]);



    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] overflow-x-hidden relative">
            {/* Particles Background Effect */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]"></div>
                {isHydrated && starPositions.map((star, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/10 rounded-full animate-pulse"
                        style={{
                            left: star.left,
                            top: star.top,
                            animationDelay: star.animationDelay,
                            animationDuration: star.animationDuration
                        }}
                    />
                ))}
            </div>

            {/* Header Fixo */}
            <Header />

            {/* Conteúdo Principal - Tela Cheia */}
            <div className="pt-16 lg:pt-20 relative z-10">
                {/* SLIDE SECTION - Substituindo as estatísticas */}
                <div className="w-full max-w-[95%] mx-auto mt-4 sm:mt-6 mb-6 sm:mb-8 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-br from-[#1db954]/10 via-[#181818]/80 to-[#282828]/50 rounded-3xl p-6 sm:p-8 border border-[#1db954]/20 backdrop-blur-xl shadow-2xl"
                    >
                        <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-4 mb-2">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-gradient-to-r from-[#1db954] via-[#1ed760] to-[#00d4aa] bg-clip-text">
                                    NOVIDADES DA SEMANA
                                </h1>
                                {tracks.length === 0 && !isLoading && (
                                    <button
                                        onClick={forceReload}
                                        className="px-4 py-2 bg-[#1db954] text-white rounded-lg font-medium text-sm hover:bg-[#1ed760] transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                                        title="Recarregar músicas"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Recarregar
                                    </button>
                                )}
                            </div>
                            <p className="text-[#b3b3b3] text-sm sm:text-base">As melhores faixas eletrônicas recém-lançadas</p>
                        </div>

                        {/* Slide de destaque */}
                        <div className="bg-[#181818]/60 rounded-2xl p-6 border border-[#282828]/50">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                                        ✨ Destaque da Semana
                                    </h2>
                                    <p className="text-[#b3b3b3] text-sm md:text-base leading-relaxed">
                                        Descubra as faixas mais quentes que acabaram de chegar na plataforma.
                                        Música eletrônica de qualidade, sempre atualizada com os últimos lançamentos.
                                    </p>
                                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                                        <span className="px-3 py-1 bg-[#1db954]/20 text-[#1db954] text-xs rounded-full border border-[#1db954]/30">
                                            House
                                        </span>
                                        <span className="px-3 py-1 bg-[#1db954]/20 text-[#1db954] text-xs rounded-full border border-[#1db954]/30">
                                            Techno
                                        </span>
                                        <span className="px-3 py-1 bg-[#1db954]/20 text-[#1db954] text-xs rounded-full border border-[#1db954]/30">
                                            Progressive
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-2xl flex items-center justify-center">
                                        <svg className="w-16 h-16 md:w-20 md:h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </MotionDiv>
                </div>

                {/* CARROUSEL "COMUNIDADE DOS VIPS" - Mobile First */}
                <div className="w-full max-w-[95%] mx-auto mt-6 sm:mt-8 mb-6 sm:mb-8 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 transition-all duration-300">
                    {/* Header do carrousel - Mobile First */}
                    <div className="flex items-center justify-between mb-3 sm:mb-6">
                        <MotionDiv
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex items-center gap-1.5 sm:gap-2"
                        >
                            <div className="w-1 h-4 sm:h-5 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full animate-pulse"></div>
                            <h2 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-[#b3b3b3] bg-clip-text text-transparent">
                                🔥 TRENDING NOW
                            </h2>
                            <div className="flex items-center gap-1 ml-2">
                                <div className="w-2 h-2 bg-[#ff6b6b] rounded-full animate-ping"></div>
                                <span className="text-[#ff6b6b] text-xs font-bold">LIVE</span>
                            </div>
                        </MotionDiv>

                        {/* Controles de navegação - Mobile First */}
                        <MotionDiv
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex items-center gap-2 sm:gap-3"
                        >
                            <button
                                onClick={() => setCurrentCommunitySlide(prev => prev === 0 ? communitySlides.length - 1 : prev - 1)}
                                className="p-2 sm:p-3 bg-gradient-to-br from-[#181818]/80 to-[#282828]/80 hover:from-[#282828]/90 hover:to-[#3e3e3e]/90 rounded-lg sm:rounded-xl text-white transition-all duration-300 backdrop-blur-md border border-[#282828]/50 hover:border-[#1db954]/70 hover:shadow-lg hover:shadow-[#1db954]/30 group"
                                title="Slide anterior"
                            >
                                <ChevronLeft size={18} className="sm:w-[22px] sm:h-[22px] group-hover:scale-110 group-hover:text-[#1db954] transition-all duration-200" />
                            </button>
                            <button
                                onClick={() => setCurrentCommunitySlide(prev => (prev + 1) % communitySlides.length)}
                                className="p-2 sm:p-3 bg-gradient-to-br from-[#181818]/80 to-[#282828]/80 hover:from-[#282828]/90 hover:to-[#3e3e3e]/90 rounded-lg sm:rounded-xl text-white transition-all duration-300 backdrop-blur-md border border-[#282828]/50 hover:border-[#1db954]/70 hover:shadow-lg hover:shadow-[#1db954]/30 group"
                                title="Próximo slide"
                            >
                                <ChevronRight size={18} className="sm:w-[22px] sm:h-[22px] group-hover:scale-110 group-hover:text-[#1db954] transition-all duration-200" />
                            </button>
                        </MotionDiv>
                    </div>

                    {/* Container do carrousel - Mobile First */}
                    <MotionDiv
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#181818]/80 to-[#282828]/60 border border-[#282828]/50 shadow-2xl backdrop-blur-xl"
                    >
                        {/* Slides container */}
                        <div
                            className="flex transition-transform duration-700 ease-out"
                            style={{ transform: `translateX(-${currentCommunitySlide * 100}%)` }}
                            onMouseEnter={() => setIsCommunityHovered(true)}
                            onMouseLeave={() => setIsCommunityHovered(false)}
                        >
                            {communitySlides.map((slide) => (
                                <div key={slide.id} className="w-full flex-shrink-0">
                                    {/* Mobile: Layout ultra-compacto sem overflow */}
                                    <div className="block sm:hidden">
                                        <div className="relative h-32 sm:h-40 overflow-hidden group">
                                            {/* Background image com overlay */}
                                            <div className="absolute inset-0">
                                                <img
                                                    src={slide.image}
                                                    alt={slide.title}
                                                    className="object-cover opacity-60 group-hover:opacity-80 transition-all duration-500 w-full h-full"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'https://i.ibb.co/Q7B5BSTz/20250513-1005-DJ-em-Balada-Brasileira-remix-01jv4vx7prex7a005qqn46ee4z.png';
                                                    }}
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
                                                <img
                                                    src={slide.image}
                                                    alt={slide.title}
                                                    className="object-cover opacity-60 group-hover:opacity-80 transition-all duration-500 w-full h-full"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'https://i.ibb.co/Q7B5BSTz/20250513-1005-DJ-em-Balada-Brasileira-remix-01jv4vx7prex7a005qqn46ee4z.png';
                                                    }}
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

                        {/* Indicadores de slide - Ocultos em mobile */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 hidden sm:flex">
                            {communitySlides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentCommunitySlide(index)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentCommunitySlide ? 'bg-[#1db954] w-6' : 'bg-white/50 hover:bg-white/75'
                                        }`}
                                />
                            ))}
                        </div>
                    </MotionDiv>

                    {/* Aviso Mobile - Experiência Desktop Recomendada */}
                    <div className="block sm:hidden mt-4">
                        <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-white font-semibold text-sm">Dica de Experiência</span>
                            </div>
                            <p className="text-white text-xs leading-relaxed">
                                Para uma experiência completa e otimizada, acesse o site através de um computador
                            </p>
                            <div className="mt-2 flex items-center justify-center gap-2 text-white text-xs">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>Mais recursos • Melhor navegação • Interface completa</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARDS DOS ESTILOS MAIS BAIXADOS - Mobile First */}
                <div className="w-full max-w-[95%] mx-auto mb-6 sm:mb-8 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 transition-all duration-300">
                    {/* Header da seção - Mobile First */}
                    <div className="flex items-center justify-between mb-3 sm:mb-6">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-1 h-4 sm:h-5 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                            <h2 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight">
                                ESTILOS MAIS BAIXADOS
                            </h2>
                        </div>
                        <span
                            className="text-[#1db954] text-sm sm:text-base font-medium hover:text-[#1ed760] transition-colors duration-200 cursor-pointer"
                            onClick={() => router.push('/styles')}
                        >
                            Ver Todos
                        </span>
                    </div>


                    {/* Cards dos estilos */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-2 sm:gap-3">
                        {stylesLoading ? (
                            // Loading skeleton - 4 em mobile, 9 em desktop
                            [...Array(9)].map((_, index) => (
                                <div key={index} className={`bg-[#181818] rounded-xl p-2 sm:p-3 border border-[#282828] animate-pulse ${index >= 4 ? 'hidden sm:block' : ''}`}>
                                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#282828] rounded-lg mx-auto mb-2"></div>
                                    <div className="h-3 bg-[#282828] rounded mb-2"></div>
                                    <div className="h-2 bg-[#282828] rounded mb-1"></div>
                                    <div className="h-2 bg-[#282828] rounded"></div>
                                </div>
                            ))
                        ) : styles.length > 0 ? (
                            styles.slice(0, 9).map((style, index) => (
                                <div
                                    key={style.name}
                                    className={`group relative bg-gradient-to-br from-[#181818] to-[#282828] rounded-xl p-2 sm:p-3 border border-[#282828] hover:border-[#1db954]/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#1db954]/20 cursor-pointer ${index < 9 ? 'ring-2 ring-[#1db954]/30' : ''} ${index >= 4 ? 'hidden sm:block' : ''}`}
                                    onClick={() => router.push(`/genre/${encodeURIComponent(style.name)}`)}
                                    title={`${style.name} - ${style.trackCount} músicas, ${style.downloadCount} downloads`}
                                >
                                    {/* Badge de posição para top 9 */}
                                    {index < 9 && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-white text-xs font-bold">
                                                {index + 1}
                                            </span>
                                        </div>
                                    )}

                                    {/* Ícone do estilo */}
                                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>

                                    {/* Nome do estilo */}
                                    <h3 className="text-white text-xs sm:text-sm font-bold mb-2 text-center line-clamp-2 leading-tight">
                                        {style.name}
                                    </h3>

                                    {/* Estatísticas */}
                                    <div className="space-y-1 text-center">
                                        <div className="text-[#1db954] text-xs font-semibold">
                                            {style.trackCount} músicas
                                        </div>
                                        <div className="text-[#b3b3b3] text-xs">
                                            {style.downloadCount} downloads
                                        </div>
                                    </div>

                                    {/* Indicador de popularidade */}
                                    <div className="mt-2 flex justify-center">
                                        <div className="flex space-x-1">
                                            {[...Array(3)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i < Math.min(3, Math.ceil((style.downloadCount / Math.max(...styles.map(s => s.downloadCount))) * 3))
                                                        ? 'bg-[#1db954]'
                                                        : 'bg-[#535353]'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hover effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#1db954]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            ))
                        ) : (
                            // Mensagem quando não há estilos
                            <div className="col-span-full text-center py-8">
                                <p className="text-[#b3b3b3] text-sm">Nenhum estilo encontrado</p>
                            </div>
                        )}
                    </div>


                </div>

                {/* CARDS DOS FOLDERS RECENTES - Mobile First */}
                <div className="w-full max-w-[95%] mx-auto mb-6 sm:mb-8 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 transition-all duration-300">
                    {/* Header da seção - Mobile First */}
                    <div className="flex items-center justify-between mb-3 sm:mb-6">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-1 h-4 sm:h-5 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                            <h2 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight">
                                FOLDERS RECENTES
                            </h2>
                        </div>
                        <span
                            className="text-[#1db954] text-sm sm:text-base font-medium hover:text-[#1ed760] transition-colors duration-200 cursor-pointer"
                            onClick={() => router.push('/folders')}
                        >
                            Ver Todos
                        </span>
                    </div>


                    {/* Cards dos folders */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-2 sm:gap-3">
                        {foldersLoading ? (
                            // Loading skeleton - 4 em mobile, 9 em desktop
                            [...Array(9)].map((_, index) => (
                                <div key={index} className={`bg-[#181818] rounded-xl p-2 sm:p-3 border border-[#282828] animate-pulse ${index >= 4 ? 'hidden sm:block' : ''}`}>
                                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#282828] rounded-lg mx-auto mb-2"></div>
                                    <div className="h-3 bg-[#282828] rounded mb-2"></div>
                                    <div className="h-2 bg-[#282828] rounded mb-1"></div>
                                    <div className="h-2 bg-[#282828] rounded"></div>
                                </div>
                            ))
                        ) : recentFolders.length > 0 ? (
                            recentFolders.slice(0, 9).map((folder, index) => (
                                <div
                                    key={folder.name}
                                    className={`group relative bg-gradient-to-br from-[#181818] to-[#282828] rounded-xl p-2 sm:p-3 border border-[#282828] hover:border-[#1db954]/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#1db954]/20 cursor-pointer ${index < 9 ? 'ring-2 ring-[#1db954]/30' : ''} ${index >= 4 ? 'hidden sm:block' : ''}`}
                                    onClick={() => router.push(`/folder/${encodeURIComponent(folder.name)}`)}
                                    title={`${folder.name} - ${folder.trackCount} músicas, ${folder.downloadCount} downloads`}
                                >
                                    {/* Badge de posição para top 9 */}
                                    {index < 9 && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-white text-xs font-bold">
                                                {index + 1}
                                            </span>
                                        </div>
                                    )}

                                    {/* Imagem do folder */}
                                    <div className="w-7 h-7 sm:w-9 sm:h-9 mx-auto mb-2 overflow-hidden rounded-lg">
                                        <img
                                            src={folder.imageUrl}
                                            alt={folder.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/images/default-folder.jpg';
                                            }}
                                        />
                                    </div>

                                    {/* Nome do folder */}
                                    <h3 className="text-white text-xs sm:text-sm font-bold mb-2 text-center line-clamp-2 leading-tight">
                                        {folder.name}
                                    </h3>

                                    {/* Estatísticas */}
                                    <div className="space-y-1 text-center">
                                        <div className="text-[#1db954] text-xs font-semibold">
                                            {folder.trackCount} músicas
                                        </div>
                                        <div className="text-[#b3b3b3] text-xs">
                                            {folder.downloadCount} downloads
                                        </div>
                                    </div>

                                    {/* Indicador de popularidade */}
                                    <div className="mt-2 flex justify-center">
                                        <div className="flex space-x-1">
                                            {[...Array(3)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i < Math.min(3, Math.ceil((folder.downloadCount / Math.max(...recentFolders.map(f => f.downloadCount))) * 3))
                                                        ? 'bg-[#1db954]'
                                                        : 'bg-[#535353]'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hover effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#1db954]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            ))
                        ) : (
                            // Mensagem quando não há folders
                            <div className="col-span-full text-center py-8">
                                <p className="text-[#b3b3b3] text-sm">Nenhum folder recente encontrado</p>
                            </div>
                        )}
                    </div>


                </div>

                {/* MENSAGEM DE BOAS-VINDAS PARA USUÁRIOS NÃO LOGADOS */}
                {!session?.user && (
                    <div className="w-full max-w-[95%] mx-auto mb-6 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
                        <div className="bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 rounded-2xl p-6 border border-blue-500/30 backdrop-blur-sm relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                            </div>

                            <div className="relative z-10 text-center">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mr-3 shadow-lg">
                                        <Music className="h-6 w-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Bem-vindo ao DJ Pools! 🎶</h2>
                                </div>

                                <p className="text-gray-300 text-lg mb-4">
                                    Você está prestes a entrar no universo mais completo de packs exclusivos, remixes raros e faixas selecionadas para DJs que não param nunca. 🚀
                                </p>

                                <p className="text-gray-300 mb-4">
                                    👉 Para ter acesso ilimitado a todos os conteúdos e aproveitar o que há de melhor na cena eletrônica, assine um dos nossos planos hoje mesmo e faça parte dessa comunidade que vive e respira música.
                                </p>

                                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/30 mb-4">
                                    <h3 className="text-lg font-bold text-purple-300 mb-3">💎 Benefícios de assinar:</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                                            <span className="text-gray-300">Acesso imediato a milhares de tracks exclusivas</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                                            <span className="text-gray-300">Downloads ilimitados direto do nosso drive</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                                            <span className="text-gray-300">Packs atualizados toda semana</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                                            <span className="text-gray-300">Conteúdos pensados para elevar o nível dos seus sets</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-300 text-sm mb-4">
                                    Não fique de fora da batida. 🔥<br />
                                    👉 Assine agora e seja parte do DJ Pools!
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Link href="/plans">
                                        <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-sm">
                                            Ver Planos
                                        </button>
                                    </Link>
                                    <Link href="/auth/sign-in">
                                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-sm">
                                            Fazer Login
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                {/* BARRA DE BUSCA E FILTROS - Mobile First */}
                <div className="w-full max-w-[95%] mx-auto mb-4 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
                    <div className="bg-[#181818] rounded-2xl p-4 sm:p-6 border border-[#282828] shadow-lg">
                        {/* Título principal - Mobile First */}
                        <div className="mb-3 sm:mb-4">
                            <h1 className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-1 h-4 sm:h-5 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                                <span className="text-white text-xl sm:text-2xl font-bold tracking-tight">
                                    {hasSearched ? `RESULTADOS PARA "${appliedSearchQuery}"` : "NOVIDADES"}
                                </span>
                            </h1>
                        </div>

                        {/* Container de busca e filtros - Mobile First */}
                        <div className="space-y-2 sm:space-y-3">
                            {/* Barra de pesquisa responsiva - Mobile First */}
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Buscar por música, artista, estilo..."
                                    className="bg-[#282828] text-white rounded-lg px-4 py-2 pl-10 pr-10 focus:ring-2 focus:ring-[#1db954] outline-none w-full h-10 text-sm sm:text-base border border-[#3e3e3e] focus:border-[#1db954]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            performSearch(searchQuery);
                                        }
                                    }}
                                    disabled={searchLoading}
                                />
                                {searchLoading ? (
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin w-4 h-4 border-2 border-[#1db954] border-t-transparent rounded-full"></div>
                                    </div>
                                ) : (
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b3b3b3] cursor-pointer hover:text-[#1db954] transition-colors"
                                        size={18}
                                        onClick={() => performSearch(searchQuery)}
                                    />
                                )}
                                {hasSearched && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b3b3b3] hover:text-red-400 transition-colors"
                                        title="Limpar busca"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Botões de ação responsivos - Mobile First */}
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

                        {/* Indicador de resultados - Mobile First */}
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
                                    Voltar às novidades
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botões de Download em Massa removidos conforme solicitado */}

                {/* LISTA DE MÚSICAS - Mobile First */}
                <div className="w-full max-w-[95%] mx-auto pb-4 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
                    {/* Barra de Progresso Progressiva */}
                    {!searchLoading && (
                        <div className="mb-6">
                            <ProgressiveLoadingBar
                                loaded={totalCount}
                                total={totalCount}
                                isLoading={isLoading}
                                isComplete={!isLoading}
                                error={error}
                                onRetry={() => loadPage(currentPage)}
                            />

                            {/* Botão de Carregar Mais */}
                            <LoadMoreButton
                                onClick={() => loadPage(currentPage + 1)}
                                isLoading={isLoading}
                                isComplete={!isLoading}
                                loaded={totalCount}
                                total={totalCount}
                            />

                            {/* Botão de Retry em caso de erro */}
                            {error && (
                                <ErrorRetryButton
                                    error={error}
                                    onRetry={() => loadPage(currentPage)}
                                />
                            )}
                        </div>
                    )}

                    {/* Estado de loading - Mobile First */}
                    {(isLoading || searchLoading) && (
                        <div className="flex items-center justify-center py-12 sm:py-16">
                            <div className="text-center">
                                <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#1db954] border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-[#b3b3b3] text-base sm:text-lg">
                                    {searchLoading ? "Buscando músicas..." : "Carregando novidades..."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Nenhum resultado encontrado - Mobile First */}
                    {!isLoading && !searchLoading && hasSearched && searchResults.length === 0 && (
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
                                        {["Progressive House", "Trance", "Techno", "Deep House", "Melodic Techno"].map((suggestion) => (
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
                                        Ver todas as novidades
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lista de músicas - Mobile First */}
                    {!isLoading && !searchLoading && displayTracks.length > 0 && (
                        <MusicList
                            tracks={displayTracks}
                            downloadedTrackIds={downloadsCache.downloadedTrackIds}
                            setDownloadedTrackIds={(ids) => {
                                if (typeof ids === 'function') {
                                    const newIds = ids(downloadsCache.downloadedTrackIds);
                                    downloadsCache.markAsDownloaded(newIds[newIds.length - 1]);
                                } else {
                                    // Para compatibilidade, mas o cache já gerencia isso
                                    console.log('Cache de downloads gerenciado automaticamente');
                                }
                            }}
                            enableInfiniteScroll={false} // Desabilitar infinite scroll para usar paginação baseada em datas
                            hasMore={hasNextPage}
                            isLoading={isLoading || searchLoading}
                            onLoadMore={() => { }}
                        />
                    )}

                    {/* Controles de Paginação - Sempre visível e com tela cheia */}
                    {!hasSearched && (
                        <div className="mt-8 sm:mt-12 w-full">
                            <div className="bg-[#121212] rounded-2xl p-6 sm:p-8 border border-[#282828] shadow-lg">
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                    {/* Informações da página - Lado esquerdo */}
                                    <div className="text-center lg:text-left flex-1">
                                        <h3 className="text-[#ffffff] text-lg sm:text-xl font-semibold mb-2">
                                            Navegação de Páginas
                                        </h3>
                                        <p className="text-[#b3b3b3] text-base sm:text-lg mb-1">
                                            Página <span className="text-[#1db954] font-bold">{currentPage}</span> de <span className="text-[#1db954] font-bold">{totalPages}</span>
                                        </p>
                                        <p className="text-[#535353] text-sm sm:text-base">
                                            Músicas <span className="text-[#1db954] font-semibold">
                                                {((currentPage - 1) * 60) + 1}-{Math.min(currentPage * 60, totalCount)}
                                            </span> de {totalCount.toLocaleString()} • 60 por página
                                        </p>
                                    </div>

                                    {/* Controles de navegação - Lado direito */}
                                    {totalPages > 1 && (
                                        <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 justify-center lg:justify-end">
                                            {/* Botão Anterior */}
                                            <button
                                                onClick={previousPage}
                                                disabled={!hasPreviousPage || isLoading}
                                                className={`px-6 py-3 rounded-xl text-base font-medium transition-all ${hasPreviousPage && !isLoading
                                                    ? 'bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white hover:from-[#1ed760] hover:to-[#1db954] shadow-lg hover:shadow-xl transform hover:scale-105'
                                                    : 'bg-[#282828] text-[#535353] cursor-not-allowed'
                                                    }`}
                                            >
                                                Anterior
                                            </button>

                                            {/* Números das páginas - Centralizado */}
                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 10) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 4) {
                                                        pageNum = totalPages - 9 + i;
                                                    } else {
                                                        pageNum = currentPage - 4 + i;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => loadPage(pageNum)}
                                                            disabled={isLoading}
                                                            className={`w-10 h-10 rounded-xl text-base font-medium transition-all ${currentPage === pageNum
                                                                ? 'bg-[#1db954] text-white shadow-lg'
                                                                : 'bg-[#282828] text-[#b3b3b3] hover:bg-[#383838] hover:shadow-md'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Botão Próxima */}
                                            <button
                                                onClick={nextPage}
                                                disabled={!hasNextPage || isLoading}
                                                className={`px-6 py-3 rounded-xl text-base font-medium transition-all ${hasNextPage && !isLoading
                                                    ? 'bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white hover:from-[#1ed760] hover:to-[#1db954] shadow-lg hover:scale-105'
                                                    : 'bg-[#282828] text-[#535353] cursor-not-allowed'
                                                    }`}
                                            >
                                                Próxima
                                            </button>
                                        </div>
                                    )}

                                    {/* Indicador de carregamento */}
                                    {isLoading && (
                                        <div className="absolute inset-0 bg-[#121212]/80 rounded-2xl flex items-center justify-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-[#1db954] text-sm">Carregando...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* MODAL DE FILTROS */}
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
                        onApplyFilters={() => setShowFiltersModal(false)}
                        onClearFilters={() => {
                            setSelectedGenre("");
                            setSelectedArtist("");
                            setSelectedDateRange("");
                            setSelectedVersion("");
                            setSelectedMonth("");
                            setSelectedPool("");
                        }}
                        isLoading={isLoading}
                        hasActiveFilters={Boolean(selectedGenre || selectedArtist || selectedDateRange || selectedVersion || selectedMonth || selectedPool)}
                    />
                )}

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
};

export default NewPage;