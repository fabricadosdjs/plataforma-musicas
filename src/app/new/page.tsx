// src/app/new/page.tsx
"use client";

import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, Download, Heart, Play, Pause, Music, TrendingUp, Clock, Star, CheckCircle, Waves, Sparkles, Crown, BarChart3, Zap, Flame, X } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useDownloadExtensionDetector } from '@/hooks/useDownloadExtensionDetector';
import { useToast } from '@/hooks/useToast';
import MusicTable from '@/components/music/MusicTable';
import Header from '@/components/layout/Header';
import FiltersModal from '@/components/music/FiltersModal';
import { useMusicPageTitle } from '@/hooks/useDynamicTitle';
import { Track } from '@/types/track';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function NewPageContent() {
  console.log('🎵 NewPage: Componente NewPageContent renderizado');
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

  const handleTracksUpdate = useCallback((updatedTracks: Track[]) => {
    // Atualizar as tracks após exclusão
    setTracks(updatedTracks);

    // Reorganizar as tracks por data
    const newTracksByDate: { [date: string]: Track[] } = {};
    updatedTracks.forEach(track => {
      const date = track.releaseDate.split('T')[0];
      if (!newTracksByDate[date]) {
        newTracksByDate[date] = [];
      }
      newTracksByDate[date].push(track);
    });

    setTracksByDate(newTracksByDate);
    setSortedDates(Object.keys(newTracksByDate).sort((a, b) => b.localeCompare(a)));
  }, []);

  const [searchLoading, setSearchLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [versions, setVersions] = useState<string[]>([]);
  const [pools, setPools] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [featuredTracks, setFeaturedTracks] = useState<any[]>([]);

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

  const fetchFeaturedTracks = async () => {
    try {
      const response = await fetch('/api/tracks/featured');
      if (response.ok) {
        const data = await response.json();
        setFeaturedTracks(data.tracks || []);
      }
    } catch (error) {
      console.error('Error fetching featured tracks:', error);
    }
  };

  const fetchTracks = async (resetPage = false) => {
    try {
      console.log('🎵 NewPage: Iniciando fetchTracks');
      setSearchLoading(true);
      const params = new URLSearchParams();
      if (selectedGenre !== 'all') params.append('genre', selectedGenre);
      if (selectedArtist !== 'all') params.append('artist', selectedArtist);
      if (selectedDateRange !== 'all') params.append('dateRange', selectedDateRange);
      if (selectedVersion !== 'all') params.append('version', selectedVersion);
      if (selectedMonth !== 'all') params.append('month', selectedMonth);
      if (selectedPool !== 'all') params.append('pool', selectedPool);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const url = `/api/tracks?${params}`;
      console.log('🎵 NewPage: Fazendo requisição para:', url);

      // Não enviar page/limit para buscar tudo
      const response = await fetch(url);
      console.log('🎵 NewPage: Resposta recebida:', response.status, response.statusText);

      const data = await response.json();
      console.log('🎵 NewPage: Dados recebidos:', {
        tracksCount: data.tracks?.length || 0,
        tracksByDateKeys: Object.keys(data.tracksByDate || {}),
        sortedDatesCount: data.sortedDates?.length || 0,
        totalCount: data.totalCount || 0
      });

      if (response.ok) {
        setTracks(data.tracks || []);
        setTracksByDate(data.tracksByDate || []);
        setSortedDates(data.sortedDates || []);
        setTotalPages(1);
        setTotalCount(data.totalCount || data.total || 0);
        if (loading) {
          console.log('🎵 NewPage: Definindo loading como false');
          setLoading(false);
        } else {
          console.log('🎵 NewPage: Loading já era false, não alterando');
        }
      } else {
        console.error('🎵 NewPage: Erro na resposta:', data);
        if (loading) {
          console.log('🎵 NewPage: Erro na resposta, mas definindo loading como false');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('🎵 NewPage: Erro ao buscar tracks:', error);
      if (loading) {
        console.log('🎵 NewPage: Erro no catch, definindo loading como false');
        setLoading(false);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // Função memoizada para renderizar MusicTable
  const renderMusicTable = useCallback((date: string) => {
    return (
      <MusicTable
        tracks={tracksByDate[date] || []}
        onDownload={handleTracksUpdate}
        isDownloading={downloading}
      />
    );
  }, [tracksByDate, downloading, handleTracksUpdate]);

  // Carregar dados iniciais
  useEffect(() => {
    console.log('🎵 NewPage: useEffect inicial executado, loading atual:', loading);
    // Carregar filtros disponíveis
    fetchFilters();
    // Carregar músicas em destaque
    fetchFeaturedTracks();

    // Verificar se há filtros na URL
    const urlSearch = searchParams.get('search');
    const urlGenre = searchParams.get('genre');
    const urlArtist = searchParams.get('artist');
    const urlDateRange = searchParams.get('dateRange');
    const urlVersion = searchParams.get('version');
    const urlMonth = searchParams.get('month');
    const urlPool = searchParams.get('pool');

    console.log('🎵 NewPage: Filtros da URL:', {
      urlSearch, urlGenre, urlArtist, urlDateRange, urlVersion, urlMonth, urlPool
    });

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

    console.log('🎵 NewPage: Chamando fetchTracks');
    fetchTracks(false);
  }, []); // Removido searchParams da dependência

  // useEffect separado para searchQuery
  useEffect(() => {
    // Só executar se não for o carregamento inicial
    if (!loading) {
      fetchTracks(true);
    }
  }, [searchQuery, loading]);

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
    const newURL = params.toString() ? `/new?${params.toString()}` : '/new';
    router.push(newURL, { scroll: false });
  };

  const handleApplyFilters = () => {
    setShowFiltersModal(false);
    handleSearch();
  };

  const handleClearFilters = () => {
    // Limpar todos os filtros
    setSelectedGenre('all');
    setSelectedArtist('all');
    setSelectedDateRange('all');
    setSelectedVersion('all');
    setSelectedMonth('all');
    setSelectedPool('all');
    setSearchQuery('');
    setCurrentPage(1);

    // Limpar a URL também
    router.push('/new', { scroll: false });

    // Aguardar um pouco antes de buscar para garantir que a URL foi limpa
    setTimeout(() => {
      // Forçar recarregamento de todas as músicas
      fetchTracks(true);
    }, 100);
  };

  const handleSearch = () => { setCurrentPage(1); updateURL({ page: 1 }); fetchTracks(true); };

  const hasActiveFilters = Boolean(
    (selectedGenre && selectedGenre !== 'all') ||
    (selectedArtist && selectedArtist !== 'all') ||
    (selectedDateRange && selectedDateRange !== 'all') ||
    (selectedVersion && selectedVersion !== 'all') ||
    (selectedMonth && selectedMonth !== 'all') ||
    (selectedPool && selectedPool !== 'all') ||
    searchQuery
  );

  const handlePageChange = (newPage: number) => { setCurrentPage(newPage); updateURL({ page: newPage }); setTimeout(() => { fetchTracks(); }, 100); };

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

  console.log('🎵 NewPage: Renderizando componente, loading:', loading, 'tracks:', tracks.length);

  return (
    <div className="min-h-screen bg-[#1B1C1D] relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Header />
      <main className="container mx-auto px-4 py-8 pt-20 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full backdrop-blur-sm border border-purple-500/30 animate-pulse-glow">
              <CheckCircle className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2 neon-text">
                Novidades
              </h1>
              <p className="text-gray-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400 animate-float" />
                As músicas mais recentes adicionadas ao catálogo
              </p>
            </div>
          </div>

          {!session && (
            <div className="w-full flex items-center justify-center py-3 px-4 mb-4 rounded-xl shadow-md bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-gray-100 font-semibold text-center text-sm backdrop-blur-sm animate-pulse">
              <Waves className="h-4 w-4 mr-2 text-orange-400" />
              Atenção: Usuários sem plano não podem ouvir, baixar ou curtir músicas. Apenas a navegação no catálogo está disponível.
            </div>
          )}
        </div>

        {/* Hero Section - Beatport Style */}
        <div className="mb-8 glass-effect rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Track */}
            <div className="lg:col-span-2 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl p-6 hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span className="text-purple-400 font-semibold text-sm uppercase tracking-wide">Featured Track</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">As músicas mais quentes da semana</h3>
              <p className="text-gray-300 mb-4">Descubra os últimos lançamentos que estão dominando as pistas de dança</p>

              {featuredTracks.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {featuredTracks.slice(0, 3).map((track, index) => (
                    <div key={track.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300">
                      <div className="w-8 h-8 bg-purple-600/30 rounded-full flex items-center justify-center text-purple-400 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{track.songName}</div>
                        <div className="text-gray-400 text-sm truncate">{track.artist}</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          {track._count?.plays || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {track._count?.downloads || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm mb-4">Carregando músicas em destaque...</div>
              )}

              <div className="flex gap-3">
                <Link href="/trending" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2">
                  <Play size={16} />
                  Ver Trending
                </Link>
                <Link href="/top-100" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200">
                  Top 100
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              <div className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <Music className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{totalCount || 0}</div>
                    <div className="text-gray-400 text-sm">Novas Músicas</div>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Star className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">VIP</div>
                    <div className="text-gray-400 text-sm">Acesso Premium</div>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">24/7</div>
                    <div className="text-gray-400 text-sm">Updates</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Genre Filters - Beatport Style */}
        <div className="mb-8">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Navegue por Gêneros
          </h2>
          <div className="flex flex-wrap gap-3">
            {genres.length > 0 ? (
              genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    setSelectedGenre(genre.toLowerCase());
                    handleSearch();
                  }}
                  className="px-4 py-2 glass-effect hover:bg-purple-600/30 text-white rounded-full transition-all duration-300 transform hover:scale-105 text-sm font-medium"
                >
                  {genre}
                </button>
              ))
            ) : (
              <div className="text-gray-400 text-sm">Carregando gêneros...</div>
            )}
          </div>
        </div>

        {/* Top 100 Promotion Box */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-red-600/20 rounded-2xl p-6 border border-yellow-500/30 backdrop-blur-sm hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-full">
                  <Crown className="h-8 w-8 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">🎵 TOP 100 RANKING</h3>
                  <p className="text-gray-300 mb-3">Descubra as músicas mais populares da plataforma em tempo real</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4 text-yellow-400" />
                      Ranking em tempo real
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-orange-400" />
                      Atualizado agora
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="h-4 w-4 text-red-400" />
                      Trending tracks
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-400">100</div>
                  <div className="text-sm text-gray-400">Músicas</div>
                </div>
                <Link
                  href="/top-100"
                  className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-yellow-500/20 transform hover:scale-105 flex items-center gap-2"
                >
                  <Crown className="h-5 w-5" />
                  Ver Top 100
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Centralized Search Bar */}
        <div className="mb-8">
          <div className="w-full glass-effect rounded-3xl p-6 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 beatport-hover">
            <div className="flex flex-col items-center gap-4">
              {/* Search Bar */}
              <div className="flex items-center w-full max-w-2xl glass-effect rounded-full px-6 py-4 focus-within:border-purple-400/70 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 pulse-button">
                <Search className="h-5 w-5 text-purple-400 mr-4 animate-pulse" />
                <input
                  type="text"
                  placeholder="Buscar músicas, artistas, estilos..."
                  className="flex-grow bg-transparent outline-none text-white placeholder-gray-400 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />

                {/* Quick Filters */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setShowFiltersModal(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 beatport-hover pulse-button ${hasActiveFilters
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-purple-600/20'
                      }`}
                  >
                    <Filter className={`h-4 w-4 ${hasActiveFilters ? 'text-purple-400 animate-pulse' : 'text-gray-300'}`} />
                    <span className="text-sm font-medium">Filtros</span>
                    {hasActiveFilters && (
                      <span className="block h-2 w-2 rounded-full bg-purple-400 ring-2 ring-purple-600 animate-pulse ml-1"></span>
                    )}
                  </button>

                  {/* Quick Search Button */}
                  <button
                    onClick={handleSearch}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 transform hover:scale-105"
                  >
                    <Search className="h-4 w-4" />
                    <span className="text-sm font-medium">Buscar</span>
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex items-center gap-3 text-purple-400 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Filtros ativos</span>
                  </div>
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-full text-xs transition-all duration-300"
                  >
                    <X className="h-3 w-3" />
                    <span>Limpar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
                <Music className="h-8 w-8 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">Carregando Músicas</h3>
              <p className="text-gray-400">Aguarde enquanto buscamos as melhores faixas para você...</p>
            </div>
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-32">
            <div className="p-6 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 rounded-3xl inline-block mb-6 border border-purple-500/20 backdrop-blur-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <Search className="h-16 w-16 text-purple-400 mx-auto animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              {hasActiveFilters ? 'Nenhuma música encontrada com os filtros atuais' : 'Nenhuma música encontrada'}
            </h3>
            <p className="text-gray-400 mb-8">
              {hasActiveFilters
                ? 'Tente ajustar seus filtros ou limpar todos os filtros para ver todas as músicas disponíveis.'
                : 'Tente fazer uma nova busca ou verificar se há músicas disponíveis.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Limpar Todos os Filtros
                </button>
              )}
              <button
                onClick={() => setShowFiltersModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-gray-500/20 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Ajustar Filtros
              </button>
            </div>
          </div>
        ) : (
          <>
            {sortedDates.length > 0 ? (
              <div className="space-y-8">
                {pagedDates.map((date, index) => (
                  <div key={date} className="space-y-4 animate-slide-in-bottom" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse-glow"></div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent capitalize neon-text">
                          {formatDate(date)}
                        </h2>
                      </div>
                    </div>
                    <div className="glass-effect rounded-3xl overflow-hidden shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                      {renderMusicTable(date)}
                    </div>
                  </div>
                ))}
                {/* Paginação de dias */}
                {totalDayPages > 1 && (
                  <div className="flex items-center justify-between mt-8 p-6 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-lg rounded-2xl border border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                    <div className="text-gray-300">
                      <span className="text-sm">Exibindo dias {daysPage + 1} de {totalDayPages}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setDaysPage(daysPage - 1)} disabled={daysPage === 0 || searchLoading} className="flex items-center space-x-2 px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 disabled:bg-gray-800/50 disabled:opacity-50 text-white rounded-lg transition-all duration-300 border border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 disabled:transform-none">
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
                              className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 ${pageNum === daysPage
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                                : 'bg-purple-600/20 hover:bg-purple-600/40 text-gray-300 disabled:opacity-50 border border-purple-500/30'
                                }`}
                            >
                              {pageNum + 1}
                            </button>
                          );
                        })}
                      </div>
                      <button onClick={() => setDaysPage(daysPage + 1)} disabled={daysPage === totalDayPages - 1 || searchLoading} className="flex items-center space-x-2 px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 disabled:bg-gray-800/50 disabled:opacity-50 text-white rounded-lg transition-all duration-300 border border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 disabled:transform-none">
                        <span>Próximo</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-32">
                <div className="p-6 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 rounded-3xl inline-block mb-6 border border-purple-500/20 backdrop-blur-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                  <Music className="h-16 w-16 text-purple-400 mx-auto animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">Nenhuma música encontrada</h3>
                <p className="text-gray-400 mb-8">Não há músicas disponíveis para os filtros selecionados.</p>
                <button onClick={handleClearFilters} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/20 transform hover:scale-105">Limpar Filtros</button>
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

export default function NewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#374151] via-[#1f2937] to-[#111827] flex items-center justify-center">
        <div className="animate-pulse text-white">Carregando...</div>
      </div>
    }>
      <NewPageContent />
    </Suspense>
  );
}