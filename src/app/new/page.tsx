"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { apiCache, getCacheKey } from '@/lib/cache';
import { useDataPreloader } from '@/hooks/useDataPreloader';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Search,
    Filter,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Music,
    Download,
    Heart,
    Play,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import FiltersModal from "@/components/music/FiltersModal";
import MusicList from "@/components/music/MusicList";
import BatchDownloadButtons from "@/components/download/BatchDownloadButtons";

import { useProgressiveTracksFetch } from "@/hooks/useProgressiveTracksFetch";

import { useAppContext } from "@/context/AppContext";
import { useGlobalPlayer } from "@/context/GlobalPlayerContext";
import { usePageLoading } from "@/hooks/usePageLoading";
import { useSimplePagination } from "@/hooks/useSimplePagination";
import { useDownloadsCache } from "@/hooks/useDownloadsCache";
import { Track } from "@/types/track";
import { motion } from "framer-motion";

const NewPage = () => {
    // Estado para controlar hidratação (evitar hydration mismatch)
    const [isHydrated, setIsHydrated] = useState(false);

    // Estados para carregamento de página específica

    // Função para carregar página específica
    const loadPage = useCallback(async (page: number) => {
        try {
            setIsLoading(true);
            setError(null);

            console.log(`🔄 Carregando página ${page}...`);

            // 1) Verificar cache do cliente para renderização instantânea
            const cacheKey = getCacheKey('new_tracks', { page, limit: 60 });
            const cached = apiCache.get(cacheKey);
            if (cached?.tracks) {
                setTracks(cached.tracks || []);
                setTotalCount(cached.totalCount || 0);
                setTotalPages(cached.totalPages || 0);
                console.log(`⚡ Cache hit (cliente) para página ${page}: ${cached.tracks?.length || 0} músicas`);
                // Prosseguir para confirmar dados em background sem bloquear UI
            }

            const response = await fetch(`/api/tracks/new?page=${page}&limit=60`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            setTracks(result.tracks || []);
            setTotalCount(result.totalCount || 0);
            setTotalPages(result.totalPages || 0);
            // Atualizar cache do cliente
            apiCache.set(cacheKey, result, 120);

            console.log(`✅ Página ${page} carregada: ${result.tracks?.length || 0} músicas`);

        } catch (err) {
            const error = err instanceof Error ? err : new Error('Erro desconhecido');
            setError(error);
            console.error(`❌ Erro ao carregar página ${page}:`, error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Hook para detectar hidratação
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Posições das estrelas (só no cliente)
    const [starPositions, setStarPositions] = useState<Array<{
        left: string;
        top: string;
        animationDelay: string;
        animationDuration: string;
    }>>([]);

    useEffect(() => {
        if (isHydrated) {
            const positions = Array.from({ length: 50 }, () => ({
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
            }));
            setStarPositions(positions);
        }
    }, [isHydrated]);


    // Estados para filtros
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

    // Prefetch leve para páginas de folder: aquece o cache da API by-folder
    const prefetchedFoldersRef = useRef<Set<string>>(new Set());
    const prefetchFolder = useCallback((name: string) => {
        if (!name) return;
        if (prefetchedFoldersRef.current.has(name)) return;
        prefetchedFoldersRef.current.add(name);
        // Consulta mínima (limit=1) apenas para aquecer cache do servidor
        fetch(`/api/tracks/by-folder?folder=${encodeURIComponent(name)}&limit=1`).catch(() => {
            // silencioso
        });
    }, []);
    const [selectedVersion, setSelectedVersion] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedPool, setSelectedPool] = useState("");

    // Estados para downloads
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<Set<string>>(new Set());

    // Estados para paginação baseada em hash
    const TRACKS_PER_PAGE = 60;
    const [currentPage, setCurrentPage] = useState(1);
    const [visibleTracksCount, setVisibleTracksCount] = useState(TRACKS_PER_PAGE);

    // Função para ler página do hash (apenas no cliente)
    const getPageFromHash = useCallback(() => {
        if (typeof window === 'undefined') return 1;
        const hash = window.location.hash;
        const match = hash.match(/page=(\d+)/);
        if (match && !isNaN(Number(match[1]))) {
            const page = parseInt(match[1], 10);
            return page > 0 ? page : 1;
        }
        return 1;
    }, []);

    // Sempre sincronizar currentPage com a hash antes de qualquer renderização
    useEffect(() => {
        const page = getPageFromHash();
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    }, [getPageFromHash, currentPage]);

    // Atualiza página apenas no cliente após hidratação
    // Efeito 1: escuta hashchange e atualiza currentPage
    useEffect(() => {
        if (!isHydrated) return;

        const updatePageFromHash = () => {
            const page = getPageFromHash();
            console.log(`🔗 Hash mudou, nova página: ${page}`);
            setCurrentPage(page);
            setVisibleTracksCount(page * TRACKS_PER_PAGE);
        };

        // Inicializa com o hash atual (ou 1 se vazio, sem escrever no hash)
        updatePageFromHash();
        window.addEventListener('hashchange', updatePageFromHash);
        return () => window.removeEventListener('hashchange', updatePageFromHash);
    }, [isHydrated, getPageFromHash]);

    // Efeito 2: carrega dados quando currentPage muda
    useEffect(() => {
        if (!isHydrated) return;
        loadPage(currentPage);
    }, [currentPage, isHydrated, loadPage]);


    // Estados para carregamento de página específica
    const [tracks, setTracks] = useState<Track[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Carregar página quando currentPage muda
    useEffect(() => {
        if (isHydrated) {
            loadPage(currentPage);
        }
    }, [currentPage, isHydrated, loadPage]);

    // Precarregar páginas adjacentes em background
    useDataPreloader(currentPage, { enabled: true, maxPages: 2, delay: 1200 });

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
    }, [tracks.length]);

    // Estados para estilos mais baixados
    const [styles, setStyles] = useState<Array<{ name: string; trackCount: number; downloadCount: number }>>([]);
    const [stylesLoading, setStylesLoading] = useState(true);
    const [shouldLoadStyles, setShouldLoadStyles] = useState(false);
    const stylesRef = useRef<HTMLDivElement | null>(null);

    // Estados para folders recentes
    const [recentFolders, setRecentFolders] = useState<Array<{
        name: string;
        trackCount: number;
        imageUrl: string;
        lastUpdated: string;
        downloadCount: number;
    }>>([]);
    const [foldersLoading, setFoldersLoading] = useState(true);
    const [shouldLoadFolders, setShouldLoadFolders] = useState(false);
    const foldersRef = useRef<HTMLDivElement | null>(null);





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
    }, []); // Remover tracks das dependências para evitar re-execução constante

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
    }, []); // Remover tracks das dependências para evitar re-execução constante

    // Gerar posições das estrelas após hidratação (evitar hydration mismatch)
    useEffect(() => {
        const positions = Array.from({ length: 50 }, () => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`
        }));
        setStarPositions(positions);
        // Remover setIsHydrated duplicado - já está sendo definido no início
    }, []);

    // Configurar IntersectionObserver para carregar estilos/folders quando visíveis
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!('IntersectionObserver' in window)) {
            setShouldLoadStyles(true);
            setShouldLoadFolders(true);
            return;
        }

        const observers: IntersectionObserver[] = [];

        if (stylesRef.current) {
            const obs = new IntersectionObserver((entries) => {
                if (entries.some(e => e.isIntersecting)) {
                    setShouldLoadStyles(true);
                    obs.disconnect();
                }
            }, { root: null, rootMargin: '200px', threshold: 0.1 });
            obs.observe(stylesRef.current);
            observers.push(obs);
        } else {
            // fallback
            setShouldLoadStyles(true);
        }

        if (foldersRef.current) {
            const obs2 = new IntersectionObserver((entries) => {
                if (entries.some(e => e.isIntersecting)) {
                    setShouldLoadFolders(true);
                    obs2.disconnect();
                }
            }, { root: null, rootMargin: '200px', threshold: 0.1 });
            obs2.observe(foldersRef.current);
            observers.push(obs2);
        } else {
            setShouldLoadFolders(true);
        }

        return () => observers.forEach(o => o.disconnect());
    }, []);

    // Disparar buscas quando elegíveis e com tracks suficientes para enriquecer fallback
    useEffect(() => {
        if (shouldLoadStyles && tracks.length >= 0) {
            fetchStyles();
        }
    }, [shouldLoadStyles]);
    useEffect(() => {
        if (shouldLoadFolders && tracks.length >= 0) {
            fetchRecentFolders();
        }
    }, [shouldLoadFolders]);

    const { data: session } = useSession();
    const { showAlert } = useAppContext();
    const { currentTrack, isPlaying, playTrack } = useGlobalPlayer();
    const { startLoading, stopLoading } = usePageLoading();
    const router = useRouter();


    // Hook para cache de downloads
    const downloadsCache = useDownloadsCache();

    // Otimização: Buscar todos os IDs de download de uma vez
    useEffect(() => {
        if (isHydrated && session?.user) {
            const fetchDownloadedTracks = async () => {
                try {
                    console.log('📥 Otimização: Buscando todos os IDs de faixas baixadas...');
                    const response = await fetch('/api/downloads');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && Array.isArray(data.downloads)) {
                            const ids = data.downloads.map((d: { trackId: number }) => d.trackId.toString());
                            setDownloadedTrackIds(new Set(ids));
                            console.log(`✅ Otimização: ${ids.length} IDs de download carregados.`);
                        } else {
                            console.warn('⚠️ Otimização: A resposta de /api/downloads não continha um array de downloads.', data);
                        }
                    } else {
                        console.error('❌ Otimização: Falha ao buscar faixas baixadas. Status:', response.status);
                    }
                } catch (error) {
                    console.error('❌ Otimização: Erro ao buscar faixas baixadas:', error);
                }
            };
            fetchDownloadedTracks();
        }
    }, [isHydrated, session]);

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

    // Para scroll infinito, mostramos todas as tracks ordenadas por data
    const allTracksSorted = useMemo(() => {
        const dateKeys = Object.keys(groupedTracksByDate);
        return dateKeys.flatMap(dateKey => groupedTracksByDate[dateKey] || []);
    }, [groupedTracksByDate]);

    // Usar diretamente os tracks da página atual (não precisamos mais de paginação virtual)
    const visibleTracks = useMemo(() => {
        return tracks; // Já são apenas os 60 tracks da página atual
    }, [tracks]);

    const goToPage = useCallback((page: number) => {
        if (typeof window === 'undefined') return;
        const safePage = Math.min(Math.max(1, page), totalPages);
        if (safePage === currentPage) return; // não faz nada se já está na página
        console.log(`🔗 goToPage chamado: página ${safePage}`);
        window.location.hash = `page=${safePage}`;
        // O listener de hashchange já vai atualizar os dados
    }, [totalPages, currentPage]);

    // Remover scroll infinito, agora a navegação é por página

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
    }, [communitySlides.length, isCommunityHovered]);

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
        setVisibleTracksCount(50); // Reset scroll infinito

        // Limpar URL da pesquisa
        const newUrl = `${window.location.pathname}`;
        window.history.pushState({}, '', newUrl);
    };

    // Reset do scroll infinito quando há mudanças nas tracks
    useEffect(() => {
        if (tracks.length > 0 && !hasSearched) {
            setVisibleTracksCount(50); // Reset para 50 tracks iniciais
        }
    }, [tracks.length, hasSearched]);

    // --- Determinar quais músicas mostrar ---
    const displayTracks = useMemo(() => {
        // Se há busca ativa, mostrar resultados da busca
        if (hasSearched) {
            return searchResults;
        }
        // Caso contrário, mostrar músicas visíveis do scroll infinito
        return visibleTracks;
    }, [hasSearched, searchResults, visibleTracks]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] overflow-x-hidden relative" suppressHydrationWarning>
            {/* Fundo estático sempre renderizado (SSR e cliente) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]"></div>
                {/* Estrelas só aparecem após hidratação (no cliente) */}
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
                {/* Seção HERO removida */}

                {/* CARROUSEL "COMUNIDADE DOS VIPS" - Mobile First */}
                <div className="w-full max-w-[95%] mx-auto mt-6 sm:mt-8 mb-6 sm:mb-8 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 transition-all duration-300">
                    {/* Header do carrousel - Mobile First */}
                    <div className="flex items-center justify-between mb-3 sm:mb-6">
                        <motion.div
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
                        </motion.div>

                        {/* Controles de navegação - Mobile First */}
                        <motion.div
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
                        </motion.div>
                    </div>

                    {/* Container do carrousel - Mobile First */}
                    <motion.div
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
                    </motion.div>

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
                <div ref={stylesRef} className="w-full max-w-[95%] mx-auto mb-6 sm:mb-8 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 transition-all duration-300">
                    {/* Header da seção - Mobile First */}
                    <div className="flex items-center justify-between mb-3 sm:mb-6">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-1 h-4 sm:h-5 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                            <h2 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight">
                                ESTILOS MAIS BAIXADOS
                            </h2>
                        </div>
                        <span className="text-[#1db954] text-sm sm:text-base font-medium hover:text-[#1ed760] transition-colors duration-200 cursor-pointer" onClick={() => router.push('/styles')} >
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
                                <div key={style.name} className={`group relative bg-gradient-to-br from-[#181818] to-[#282828] rounded-xl p-2 sm:p-3 border border-[#282828] hover:border-[#1db954]/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#1db954]/20 cursor-pointer ${index < 9 ? 'ring-2 ring-[#1db954]/30' : ''} ${index >= 4 ? 'hidden sm:block' : ''}`} onClick={() => router.push(`/genre/${encodeURIComponent(style.name)}`)} title={`${style.name} - ${style.trackCount} músicas, ${style.downloadCount} downloads`} >
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
                                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i < Math.min(3, Math.ceil((style.downloadCount / Math.max(...styles.map(s => s.downloadCount))) * 3)) ? 'bg-[#1db954]' : 'bg-[#282828]'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 sm:col-span-3 lg:col-span-5 xl:col-span-7 2xl:col-span-9 text-center p-6 bg-[#181818]/60 rounded-xl border border-[#282828] text-[#b3b3b3]">
                                🤷‍♂️ Nenhum estilo popular encontrado.
                            </div>
                        )}
                    </div>
                </div>

                {/* CARDS DOS FOLDERS RECENTES */}
                <div ref={foldersRef} className="w-full max-w-[95%] mx-auto mb-6 sm:mb-8 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 transition-all duration-300">
                    {/* Header da seção */}
                    <div className="flex items-center justify-between mb-3 sm:mb-6">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-1 h-4 sm:h-5 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                            <h2 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight">
                                📂 PASTAS RECENTES
                            </h2>
                        </div>
                        <span className="text-[#1db954] text-sm sm:text-base font-medium hover:text-[#1ed760] transition-colors duration-200 cursor-pointer" onClick={() => router.push('/folders')}>
                            Ver Todos
                        </span>
                    </div>

                    {/* Cards das pastas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {foldersLoading ? (
                            [...Array(5)].map((_, index) => (
                                <div key={index} className="bg-[#181818]/60 rounded-xl p-4 animate-pulse flex items-center gap-4">
                                    <div className="w-16 h-16 bg-[#282828] rounded-lg flex-shrink-0"></div>
                                    <div className="flex-grow">
                                        <div className="h-4 bg-[#282828] rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-[#282828] rounded w-1/2 mb-1"></div>
                                        <div className="h-3 bg-[#282828] rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))
                        ) : recentFolders.length > 0 ? (
                            recentFolders.slice(0, 7).map((folder) => (
                                <motion.div
                                    key={folder.name}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(29, 185, 84, 0.3), 0 4px 6px -2px rgba(29, 185, 84, 0.2)" }}
                                    className="relative bg-gradient-to-br from-[#181818] to-[#282828] rounded-xl p-4 border border-[#282828] hover:border-[#1db954]/50 cursor-pointer flex items-center gap-4 transition-all duration-300"
                                    onMouseEnter={() => prefetchFolder(folder.name)}
                                    onFocus={() => prefetchFolder(folder.name)}
                                    onTouchStart={() => prefetchFolder(folder.name)}
                                    onClick={() => router.push(`/folder/${encodeURIComponent(folder.name)}`)}
                                    title={`${folder.name} - ${folder.trackCount} músicas, ${folder.downloadCount} downloads`}
                                >
                                    <div className="flex-shrink-0 relative">
                                        <Image
                                            src={folder.imageUrl}
                                            alt={folder.name}
                                            width={64}
                                            height={64}
                                            className="rounded-lg object-cover w-16 h-16"
                                        />
                                        <div className="absolute inset-0 rounded-lg border border-white/10"></div>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-white font-bold line-clamp-1">
                                            {folder.name}
                                        </h3>
                                        <div className="text-xs text-[#b3b3b3]">
                                            <span className="flex items-center gap-1">
                                                <Music size={12} className="text-[#1db954]" /> {folder.trackCount} faixas
                                            </span>
                                            <span className="flex items-center gap-1 mt-1">
                                                <Download size={12} className="text-[#4ecdc4]" /> {folder.downloadCount} downloads
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-[#b3b3b3] group-hover:text-[#1db954] transition-colors" />
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center p-6 bg-[#181818]/60 rounded-xl border border-[#282828] text-[#b3b3b3]">
                                🤷‍♂️ Nenhum folder recente encontrado.
                            </div>
                        )}
                    </div>
                </div>


                {/* Seção principal para busca e listagem de músicas */}
                <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 mb-20 relative">

                    {/* Controles de Busca e Filtros - Mobile First */}
                    <div className="bg-[#181818]/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-[#282828]">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Campo de Busca */}
                            <div className="relative flex-grow w-full">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b3b3b3] z-10" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            performSearch(searchQuery);
                                        }
                                    }}
                                    placeholder="Buscar por nome, artista, estilo..."
                                    className="w-full pl-12 pr-4 py-3 bg-[#282828] rounded-full text-white placeholder:text-[#b3b3b3] focus:outline-none focus:ring-2 focus:ring-[#1db954] transition-all duration-300 text-sm"
                                />
                            </div>

                            {/* Botão de Filtros */}
                            <button
                                onClick={() => setShowFiltersModal(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1db954] hover:bg-[#1ed760] transition-colors duration-300 text-white font-bold py-3 px-6 rounded-full shadow-lg"
                            >
                                <Filter size={20} />
                                <span className="text-sm">Filtros</span>
                            </button>
                        </div>
                    </div>

                    {/* Exibir resultados da busca ou a lista completa */}
                    {hasSearched && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white text-xl sm:text-2xl font-bold">
                                    Resultados para: <span className="text-[#1db954]">"{appliedSearchQuery}"</span>
                                </h2>
                                <button onClick={clearSearch} className="text-[#b3b3b3] hover:text-white transition-colors text-sm">
                                    Limpar busca
                                </button>
                            </div>
                            <MusicList
                                tracks={searchResults}
                                downloadedTrackIds={Array.from(downloadedTrackIds).map(id => parseInt(id, 10))}
                                setDownloadedTrackIds={(ids) => {
                                    if (typeof ids === 'function') {
                                        setDownloadedTrackIds(prev => new Set(ids(Array.from(prev).map(id => parseInt(id, 10))).map(id => id.toString())));
                                    } else {
                                        setDownloadedTrackIds(new Set(ids.map(id => id.toString())));
                                    }
                                }}
                            />
                            {searchResults.length === 0 && (
                                <div className="text-center text-[#b3b3b3] p-6 bg-[#181818]/60 rounded-xl mt-4">
                                    🤷‍♂️ Nenhuma música encontrada com essa busca.
                                </div>
                            )}
                        </div>
                    )}

                    {!hasSearched && (
                        <div>
                            {/* Renderização direta da lista de músicas da página atual */}
                            <MusicList
                                key={`musiclist-page-${currentPage}-tracks-${tracks.length}-first-${tracks[0]?.id || 'empty'}`}
                                tracks={tracks}
                                downloadedTrackIds={Array.from(downloadedTrackIds).map(id => parseInt(id, 10))}
                                setDownloadedTrackIds={(ids) => {
                                    if (typeof ids === 'function') {
                                        setDownloadedTrackIds(prev => new Set(ids(Array.from(prev).map(id => parseInt(id, 10))).map(id => id.toString())));
                                    } else {
                                        setDownloadedTrackIds(new Set(ids.map(id => id.toString())));
                                    }
                                }}
                            />
                        </div>
                    )}

                    {/* Controles de Paginação */}
                    {!hasSearched && (
                        <div className="flex justify-center items-center mt-8 gap-4">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-full ${currentPage === 1 ? 'bg-[#282828] text-[#555] cursor-not-allowed' : 'bg-[#181818] text-white hover:bg-[#282828]'
                                    }`}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <span className="text-white font-bold">Página {currentPage} de {totalPages}</span>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-full ${currentPage === totalPages ? 'bg-[#282828] text-[#555] cursor-not-allowed' : 'bg-[#181818] text-white hover:bg-[#282828]'
                                    }`}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    )}


                    {/* Modal de Filtros (oculto por padrão) */}
                    {showFiltersModal && (
                        <FiltersModal
                            genres={genres}
                            artists={artists}
                            versions={versions}
                            pools={pools}
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
                            onApplyFilters={() => { }}
                            onClearFilters={() => { }}
                            isOpen={showFiltersModal}
                            onClose={() => setShowFiltersModal(false)}
                            monthOptions={[]}
                            isLoading={false}
                            hasActiveFilters={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewPage;