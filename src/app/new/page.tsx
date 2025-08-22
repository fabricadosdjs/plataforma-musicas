"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
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

  // --- SLIDES PRINCIPAIS (destaques da produtora) ---
  const slides = [
    {
      id: 0,
      title: "Lone Wolf (Original Mix)",
      artist: "Dj Jéssika Luana",
      image: "https://i.ibb.co/sdzRfhCj/atwork-4417627.jpg",
      link: "https://ditto.fm/lone-wolf-dj-jessika-luana",
      badge: "LANÇAMENTO",
    },
    {
      id: 1,
      title: "Exclusive Release 01",
      artist: "Nexor Records",
      image: "https://i.ibb.co/Vm1xPqt/slide1.jpg",
      link: "/release/1",
      badge: "EXCLUSIVO",
    },
    {
      id: 2,
      title: "New Track Showcase",
      artist: "DJ Nexor",
      image: "https://i.ibb.co/ZfDzHn9/slide2.jpg",
      link: "/release/2",
      badge: "NOVIDADE",
    },
    {
      id: 3,
      title: "Pool Exclusive Drop",
      artist: "Various Artists",
      image: "https://i.ibb.co/4sfx2D4/slide3.jpg",
      link: "/release/3",
      badge: "EXCLUSIVO",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return; // Pausa o autoplay ao passar o mouse
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length, isHovered]);

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
    <MainLayout>
      <div className="min-h-screen bg-[#121212] overflow-x-hidden">
        {/* CARROUSEL "NOVO EM NOSSA GRAVADORA" - Mobile First */}
        <div className="w-full max-w-6xl mx-auto mt-4 sm:mt-8 mb-8 sm:mb-12 px-3 sm:px-6 md:px-8 lg:pl-6 lg:pr-16 xl:pl-8 xl:pr-20 2xl:pl-10 2xl:pr-24 transition-all duration-300">
          {/* Header do carrousel - Mobile First */}
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
              <h2 className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                NOVO EM NOSSA GRAVADORA
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

                        {/* Informações ultra-compactas */}
                        <div className="text-center space-y-1">
                          <h3 className="text-sm font-black text-white leading-tight tracking-tight drop-shadow-lg line-clamp-1">
                            {slide.title}
                          </h3>
                          <p className="text-xs text-gray-200 font-medium truncate">
                            {slide.artist}
                          </p>

                          {/* Botão único ultra-compacto */}
                          <a
                            href={slide.link}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg transform hover:scale-105"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span>Ouvir</span>
                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: Layout original */}
                  <div className="hidden sm:block">
                    <div className="relative h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] overflow-hidden group">
                      {/* Background image com overlay melhorado */}
                      <div className="absolute inset-0">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-cover opacity-70 group-hover:opacity-90 transition-all duration-700 scale-105 group-hover:scale-100"
                          priority={currentSlide === slide.id - 1}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      </div>

                      {/* Conteúdo do slide */}
                      <div className="relative z-10 h-full flex items-center justify-center">
                        <div className="w-full max-w-6xl mx-auto px-6 md:px-8 lg:px-12 xl:px-16 flex flex-col items-center text-center gap-6 md:gap-8 lg:gap-12">
                          {/* Imagem destacada */}
                          <div className="flex-shrink-0">
                            <div className="relative w-32 h-32 md:w-40 md:h-40 lg:w-52 lg:h-52 xl:w-60 xl:h-60 2xl:w-72 2xl:h-72 group">
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl lg:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                              <div className="relative w-full h-full">
                                <Image
                                  src={slide.image}
                                  alt={slide.title}
                                  fill
                                  className="object-cover rounded-2xl lg:rounded-3xl shadow-2xl group-hover:scale-105 transition-all duration-500 border-2 border-white/10"
                                  priority={currentSlide === slide.id - 1}
                                />
                                {/* Badge profissional */}
                                <span className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-full uppercase tracking-wider shadow-xl backdrop-blur-md border border-green-400/30">
                                  {slide.badge}
                                </span>

                                {/* Play button overlay melhorado */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 rounded-2xl lg:rounded-3xl transition-all duration-500">
                                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-2xl transform scale-75 group-hover:scale-100 border-2 md:border-3 lg:border-4 border-white/20">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="white"
                                      className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 ml-0.5"
                                    >
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Informações do slide */}
                          <div className="flex-1 text-center space-y-4 md:space-y-6">
                            <div className="space-y-2 md:space-y-4">
                              <h3 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                                {slide.title}
                              </h3>
                              <p className="text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-gray-200 font-medium leading-relaxed">
                                {slide.artist}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                              <a
                                href={slide.link}
                                className="group relative px-4 md:px-6 lg:px-8 xl:px-10 py-2 md:py-3 lg:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg sm:rounded-xl lg:rounded-2xl hover:from-pink-600 hover:to-purple-600 transition-all duration-500 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 backdrop-blur-md border border-purple-500/30 hover:border-purple-400/50 overflow-hidden text-sm md:text-base lg:text-lg"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span className="relative z-10 flex items-center gap-2 md:gap-3 justify-center">
                                  Ouvir Agora
                                  <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-white/10 to-purple-600/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                              </a>

                              <button className="px-4 md:px-6 lg:px-8 xl:px-10 py-2 md:py-3 lg:py-4 bg-white/5 backdrop-blur-md text-white font-semibold rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-500 shadow-lg hover:shadow-xl group text-sm md:text-base lg:text-lg">
                                <span className="flex items-center gap-2 md:gap-3 justify-center">
                                  Mais Detalhes
                                  <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Indicadores de slide - Mobile First */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${index === currentSlide
                    ? 'bg-[#1db954] scale-125'
                    : 'bg-[#535353] hover:bg-[#b3b3b3]'
                    }`}
                  title={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* BARRA DE BUSCA E FILTROS - Mobile First */}
        <div className="w-full max-w-6xl mx-auto mb-6 sm:mb-8 px-3 sm:px-6 md:px-8 lg:pl-6 lg:pr-16 xl:pl-8 xl:pr-20 2xl:pl-10 2xl:pr-24">
          <div className="bg-[#181818] rounded-2xl p-4 sm:p-6 border border-[#282828] shadow-lg">
            {/* Título principal - Mobile First */}
            <div className="mb-4 sm:mb-6">
              <h1 className="flex items-center gap-2 sm:gap-3">
                <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                <span className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
                  {hasSearched ? `RESULTADOS PARA "${appliedSearchQuery}"` : "NOVIDADES"}
                </span>
              </h1>
            </div>

            {/* Container de busca e filtros - Mobile First */}
            <div className="space-y-3 sm:space-y-4">
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
        <div className="w-full max-w-6xl mx-auto pb-6 sm:pb-8 px-3 sm:px-6 md:px-8 lg:pl-6 lg:pr-16 xl:pl-8 xl:pr-20 2xl:pl-10 2xl:pr-24">
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
      </div>
    </MainLayout>
  );
};

export default NewPage;
