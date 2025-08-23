"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Music,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import FiltersModal from "@/components/music/FiltersModal";
import { MusicList } from "@/components/music/MusicList";

import { useAppContext } from "@/context/AppContext";
import { useGlobalPlayer } from "@/context/GlobalPlayerContext";
import { usePageLoading } from "@/hooks/usePageLoading";
import { useTracksFetch } from "@/hooks/useTracksFetch";
import { useDownloadsCache } from "@/hooks/useDownloadsCache";
import { Track } from "@/types/track";
import { motion } from "framer-motion";

const NewPage = () => {
  // Estados para filtros
  const [tracks, setTracks] = useState<Track[]>([]);
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

  // Estados para paginação baseada em datas
  const [currentPage, setCurrentPage] = useState(1);
  const [daysPerPage] = useState(3); // Cada página mostra 3 dias de conteúdo

  // Extrair dados únicos para filtros - otimizado para evitar re-cálculos desnecessários
  const genres = useMemo(() => {
    if (tracks.length === 0) return [];
    return Array.from(new Set(tracks.map(t => t.style).filter((v): v is string => Boolean(v))));
  }, [tracks.length]); // Depende apenas do tamanho, não do conteúdo completo

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
  }, [tracks]);

  // Carregar estilos quando as tracks carregarem
  useEffect(() => {
    if (tracks.length > 0) {
      fetchStyles();
    }
  }, [fetchStyles]);

  const { data: session } = useSession();
  const { showAlert } = useAppContext();
  const { currentTrack, isPlaying, playTrack } = useGlobalPlayer();
  const { startLoading, stopLoading } = usePageLoading();
  const router = useRouter();

  // Hook para cache de downloads
  const downloadsCache = useDownloadsCache();

  // Função para agrupar tracks por data
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
  }, [tracks]);

  // Calcular páginas baseadas em datas
  const dateKeys = Object.keys(groupedTracksByDate);
  const totalPages = Math.ceil(dateKeys.length / daysPerPage);

  // Obter datas para a página atual
  const currentPageDates = useMemo(() => {
    const startIndex = (currentPage - 1) * daysPerPage;
    const endIndex = startIndex + daysPerPage;
    return dateKeys.slice(startIndex, endIndex);
  }, [dateKeys, currentPage, daysPerPage]);

  // Obter tracks para a página atual
  const currentPageTracks = useMemo(() => {
    return currentPageDates.flatMap(dateKey => groupedTracksByDate[dateKey] || []);
  }, [currentPageDates, groupedTracksByDate]);

  // Função para navegar para uma página específica
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Atualizar URL com hash
      window.location.hash = `#/page=${page}`;
    }
  };

  // Função para ir para a próxima página
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Função para ir para a página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Função para ir para a primeira página
  const goToFirstPage = () => {
    goToPage(1);
  };

  // Função para ir para a última página
  const goToLastPage = () => {
    goToPage(totalPages);
  };

  // Efeito para sincronizar com hash da URL
  useEffect(() => {
    const hash = window.location.hash;
    const pageMatch = hash.match(/#\/page=(\d+)/);

    if (pageMatch) {
      const page = parseInt(pageMatch[1]);
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    } else {
      // Se não há hash, definir como página 1 e adicionar #/page=1
      setCurrentPage(1);
      window.location.hash = '#/page=1';
    }
  }, [totalPages]);

  // Efeito para sincronizar com parâmetros de pesquisa da URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('q');

    if (query && query.trim()) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, []); // Executar apenas uma vez ao carregar a página

  // Efeito para atualizar hash quando a página muda
  useEffect(() => {
    // Sempre manter o hash, mesmo para a primeira página
    window.location.hash = `#/page=${currentPage}`;
  }, [currentPage]);

  // --- SLIDES DA COMUNIDADE ---
  const communitySlides = [
    {
      id: 1,
      title: "Upload Comunitário",
      artist: "DJs da Comunidade",
      image: "https://i.ibb.co/QFxLcxhj/20250822-1324-M-sica-Eletr-nica-Vibrante-remix-01k399bwmxebctfdn0yec14eph.png",
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
      image: "https://i.ibb.co/VpVHbQ76/20250822-1329-Curadoria-de-M-sica-Eletr-nica-remix-01k399nd3qekzrz8d96pa16zkq.png",
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

  // --- Busca de músicas da API usando hook otimizado ---
  const { data: tracksData, loading: tracksLoading, error: tracksError } = useTracksFetch({
    endpoint: "/api/tracks/new",
    onSuccess: (data) => {
      startLoading("Carregando novidades...");

      // 🔥 Garante que seja array
      if (Array.isArray(data)) {
        setTracks(data);
      } else if (Array.isArray(data.tracks)) {
        setTracks(data.tracks);
      } else if (Array.isArray(data.data)) {
        setTracks(data.data);
      } else {
        console.warn("⚠️ API não retornou array de tracks:", data);
        setTracks([]);
      }

      stopLoading();
    },
    onError: (error) => {
      console.error("❌ Erro na busca:", error);
      showAlert("Erro ao carregar músicas");
      stopLoading();
    },
    onLoadingChange: (loading) => {
      // Estado de loading é gerenciado pelo hook
    }
  });

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
        const newUrl = `${window.location.pathname}?${searchParams.toString()}#/page=1`;
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

    // Limpar URL da pesquisa
    const newUrl = `${window.location.pathname}#/page=1`;
    window.history.pushState({}, '', newUrl);
  };

  // --- Determinar quais músicas mostrar ---
  const displayTracks = useMemo(() => {
    // Se há busca ativa, mostrar resultados da busca
    if (hasSearched) {
      return searchResults;
    }
    // Caso contrário, mostrar músicas normais
    return currentPageTracks;
  }, [hasSearched, searchResults, currentPageTracks]);



  return (
    <div className="min-h-screen bg-[#121212] overflow-x-hidden">
      {/* Header Fixo */}
      <Header />

      {/* Conteúdo Principal - Tela Cheia */}
      <div className="pt-12 lg:pt-16">
        {/* CARROUSEL "COMUNIDADE DOS VIPS" - Mobile First */}
        <div className="w-full max-w-[95%] mx-auto mt-2 sm:mt-4 mb-6 sm:mb-8 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 transition-all duration-300">
          {/* Header do carrousel - Mobile First */}
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1 h-4 sm:h-5 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
              <h2 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight">
                O QUE TÁ ROLANDO
              </h2>
            </div>

            {/* Controles de navegação - Mobile First */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setCurrentCommunitySlide(prev => prev === 0 ? communitySlides.length - 1 : prev - 1)}
                className="p-2 sm:p-3 bg-[#181818]/80 hover:bg-[#282828]/90 rounded-lg sm:rounded-xl text-white transition-all duration-300 backdrop-blur-md border border-[#282828]/50 hover:border-[#3e3e3e]/70 hover:shadow-lg hover:shadow-[#1db954]/20 group"
                title="Slide anterior"
              >
                <ChevronLeft size={18} className="sm:w-[22px] sm:h-[22px] group-hover:scale-110 transition-transform duration-200" />
              </button>
              <button
                onClick={() => setCurrentCommunitySlide(prev => (prev + 1) % communitySlides.length)}
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
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-cover opacity-60 group-hover:opacity-80 transition-all duration-500"
                          priority={currentCommunitySlide === slide.id - 1}
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
                          priority={currentCommunitySlide === slide.id - 1}
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
              {communitySlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCommunitySlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentCommunitySlide ? 'bg-[#1db954] w-6' : 'bg-white/50 hover:bg-white/75'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CARDS DOS ESTILOS MAIS BAIXADOS - Mobile First */}
        <div className="w-full max-w-[95%] mx-auto mb-6 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
          {/* Header da seção */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
              <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                Estilos Mais Baixados
              </h2>
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
            </div>
            <p className="text-[#b3b3b3] text-sm sm:text-base max-w-2xl mx-auto">
              Descubra os estilos musicais mais populares baseado em downloads reais
            </p>
          </div>

          {/* Cards dos estilos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-2 sm:gap-3">
            {stylesLoading ? (
              // Loading skeleton
              [...Array(9)].map((_, index) => (
                <div key={index} className="bg-[#181818] rounded-xl p-2 sm:p-3 border border-[#282828] animate-pulse">
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
                  className={`group relative bg-gradient-to-br from-[#181818] to-[#282828] rounded-xl p-2 sm:p-3 border border-[#282828] hover:border-[#1db954]/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#1db954]/20 cursor-pointer ${index < 9 ? 'ring-2 ring-[#1db954]/30' : ''
                    }`}
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

          {/* Botão para ver todos os estilos */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/styles')}
              className="px-6 py-3 bg-[#1db954] text-white rounded-xl hover:bg-[#1ed760] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              Ver Todos os Estilos
            </button>
          </div>
        </div>

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

        {/* LISTA DE MÚSICAS - Mobile First */}
        <div className="w-full max-w-[95%] mx-auto pb-4 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
          {/* Estado de loading - Mobile First */}
          {(tracksLoading || searchLoading) && (
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
          {!tracksLoading && !searchLoading && hasSearched && searchResults.length === 0 && (
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
          {!tracksLoading && !searchLoading && displayTracks.length > 0 && (
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
              hasMore={false}
              isLoading={tracksLoading || searchLoading}
              onLoadMore={() => { }}
            />
          )}

          {/* Paginação baseada em datas */}
          {!tracksLoading && !searchLoading && !hasSearched && totalPages > 1 && (
            <div className="mt-8 sm:mt-12">
              <div className="bg-[#121212] rounded-2xl p-4 sm:p-6 border border-[#282828] shadow-lg">
                {/* Controles de paginação */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {/* Primeira página */}
                  <button
                    onClick={goToFirstPage}
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
                    onClick={goToPreviousPage}
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
                        onClick={() => goToPage(page)}
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
                    onClick={goToNextPage}
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
                    onClick={goToLastPage}
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
            isLoading={tracksLoading}
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
