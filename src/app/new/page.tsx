// src/app/new/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Download, Heart, Play, Pause, Music, TrendingUp, Clock, Star, CheckCircle } from 'lucide-react';
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

  const fetchTracks = async (resetPage = false) => {
    try {
      setSearchLoading(true);
      const params = new URLSearchParams();
      if (selectedGenre !== 'all') params.append('genre', selectedGenre);
      if (selectedArtist !== 'all') params.append('artist', selectedArtist);
      if (selectedDateRange !== 'all') params.append('dateRange', selectedDateRange);
      if (selectedVersion !== 'all') params.append('version', selectedVersion);
      if (selectedMonth !== 'all') params.append('month', selectedMonth);
      if (selectedPool !== 'all') params.append('pool', selectedPool);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      // Não enviar page/limit para buscar tudo
      const response = await fetch(`/api/tracks?${params}`);
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
      console.error('Error fetching tracks:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    // Carregar filtros disponíveis
    fetchFilters();

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

    fetchTracks(false);
  }, [searchParams]);

  useEffect(() => {
    fetchTracks(true);
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
    const newURL = params.toString() ? `/new?${params.toString()}` : '/new';
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
    router.push('/new', { scroll: false });
    // Aguardar um pouco antes de buscar para garantir que a URL foi limpa
    setTimeout(() => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#374151] via-[#1f2937] to-[#111827]">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-[#374151] to-[#4b5563] rounded-full">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Novidades</h1>
              <p className="text-gray-300">As músicas mais recentes adicionadas ao catálogo</p>
            </div>
          </div>

          {!session && (
            <div className="w-full flex items-center justify-center py-3 px-4 mb-4 rounded-xl shadow-md bg-[#374151] border border-gray-700 text-gray-100 font-semibold text-center text-sm">
              Atenção: Usuários sem plano não podem ouvir, baixar ou curtir músicas. Apenas a navegação no catálogo está disponível.
            </div>
          )}
        </div>

        {/* Search and Filters Section */}
        <div className="mb-8 bg-gradient-to-br from-[#374151]/70 via-[#1f2937]/70 to-[#111827]/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/30 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center w-full max-w-md bg-gradient-to-r from-[#374151]/80 to-[#1f2937]/80 rounded-full px-4 py-3 border border-gray-700/50 focus-within:border-[#6b7280]/70 transition-all duration-200 backdrop-blur-sm">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Buscar músicas, artistas, estilos..."
                className="flex-grow bg-transparent outline-none text-white placeholder-gray-400 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Filters Button */}
            <button
              onClick={() => setShowFiltersModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#374151]/80 to-[#1f2937]/80 hover:from-[#374151]/90 hover:to-[#1f2937]/90 text-white rounded-full transition-all duration-200 border border-gray-700/50 hover:border-gray-600/70 backdrop-blur-sm"
            >
              <Filter className={`h-4 w-4 ${hasActiveFilters ? 'text-[#6b7280]' : 'text-gray-300'}`} />
              <span className="text-sm font-medium">Filtros</span>
              {hasActiveFilters && (
                <span className="block h-2 w-2 rounded-full bg-[#6b7280] ring-2 ring-gray-800"></span>
              )}
            </button>

            {/* Active Filters Indicator */}
            {hasActiveFilters && (
              <div className="flex items-center space-x-2 text-[#6b7280]">
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filtros ativos</span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-[#6b7280]/30 border-t-[#6b7280] rounded-full animate-spin mx-auto mb-6"></div>
                <Music className="h-8 w-8 text-[#6b7280] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Carregando Músicas</h3>
              <p className="text-gray-400">Aguarde enquanto buscamos as melhores faixas para você...</p>
            </div>
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-32">
            <div className="p-6 bg-gradient-to-br from-[#374151]/50 via-[#1f2937]/50 to-[#111827]/50 rounded-2xl inline-block mb-6 border border-gray-700/30 backdrop-blur-sm">
              <Search className="h-16 w-16 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Nenhuma música encontrada</h3>
            <p className="text-gray-400 mb-8">Tente ajustar seus filtros ou fazer uma nova busca.</p>
            <button onClick={handleClearFilters} className="px-6 py-3 bg-gradient-to-r from-[#374151] to-[#4b5563] hover:from-[#4b5563] hover:to-[#6b7280] text-white rounded-lg font-medium transition-colors shadow-lg">Limpar Filtros</button>
          </div>
        ) : (
          <>
            {sortedDates.length > 0 ? (
              <div className="space-y-8">
                {pagedDates.map((date) => (
                  <div key={date} className="space-y-4">
                    <div className="flex items-center space-x-4"><div className="flex items-center space-x-3"><div className="w-3 h-3 bg-[#6b7280] rounded-full"></div><h2 className="text-2xl font-bold text-white capitalize">{formatDate(date)}</h2></div></div>
                    <div className="bg-gradient-to-br from-[#374151]/60 via-[#1f2937]/60 to-[#111827]/60 backdrop-blur-sm rounded-2xl border border-gray-600/30 overflow-hidden shadow-2xl">
                      <MusicTable tracks={tracksByDate[date] || []} onDownload={handleDownloadTracks} isDownloading={downloading} />
                    </div>
                  </div>
                ))}
                {/* Paginação de dias */}
                {totalDayPages > 1 && (
                  <div className="flex items-center justify-between mt-8 p-6 bg-gradient-to-br from-[#374151]/20 via-[#1f2937]/20 to-[#111827]/20 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="text-gray-300">
                      <span className="text-sm">Exibindo dias {daysPage + 1} de {totalDayPages}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => setDaysPage(daysPage - 1)} disabled={daysPage === 0 || searchLoading} className="flex items-center space-x-2 px-4 py-2 bg-[#374151]/50 hover:bg-[#4b5563]/50 disabled:bg-[#1f2937]/50 disabled:opacity-50 text-white rounded-lg transition-all duration-200 border border-gray-600/30">
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
                                ? 'bg-[#6b7280] text-white'
                                : 'bg-[#374151]/50 hover:bg-[#4b5563]/50 text-gray-300 disabled:opacity-50'
                                }`}
                            >
                              {pageNum + 1}
                            </button>
                          );
                        })}
                      </div>
                      <button onClick={() => setDaysPage(daysPage + 1)} disabled={daysPage === totalDayPages - 1 || searchLoading} className="flex items-center space-x-2 px-4 py-2 bg-[#374151]/50 hover:bg-[#4b5563]/50 disabled:bg-[#1f2937]/50 disabled:opacity-50 text-white rounded-lg transition-all duration-200 border border-gray-600/30">
                        <span>Próximo</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-32">
                <div className="p-6 bg-gradient-to-br from-[#374151]/50 via-[#1f2937]/50 to-[#111827]/50 rounded-2xl inline-block mb-6 border border-gray-700/30 backdrop-blur-sm">
                  <Music className="h-16 w-16 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Nenhuma música encontrada</h3>
                <p className="text-gray-400 mb-8">Não há músicas disponíveis para os filtros selecionados.</p>
                <button onClick={handleClearFilters} className="px-6 py-3 bg-gradient-to-r from-[#374151] to-[#4b5563] hover:from-[#4b5563] hover:to-[#6b7280] text-white rounded-lg font-medium transition-colors shadow-lg">Limpar Filtros</button>
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