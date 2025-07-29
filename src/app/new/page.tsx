// src/app/new/page.tsx
"use client";

import Header from '@/components/layout/Header';
import FiltersModal from '@/components/music/FiltersModal';
// CORREÇÃO APLICADA AQUI: Adicionado "{}"
import MusicTable from '@/components/music/MusicTable';
import { useMusicPageTitle } from '@/hooks/useDynamicTitle';
import { Track } from '@/types/track';
import { ChevronLeft, ChevronRight, Filter, Heart, Loader2, Music, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function NewPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useMusicPageTitle('Novidades - DJ Pool Platform');

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
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const ITEMS_PER_PAGE = 250;

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

  const fetchTracks = async (resetPage = false) => {
    try {
      setSearchLoading(true);
      const page = resetPage ? 1 : currentPage;
      if (resetPage) setCurrentPage(1);
      const params = new URLSearchParams();
      if (selectedGenre !== 'all') params.append('genre', selectedGenre);
      if (selectedArtist !== 'all') params.append('artist', selectedArtist);
      if (selectedDateRange !== 'all') params.append('dateRange', selectedDateRange);
      if (selectedVersion !== 'all') params.append('version', selectedVersion);
      if (selectedMonth !== 'all') params.append('month', selectedMonth);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('page', page.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());
      const response = await fetch(`/api/tracks?${params}`);
      const data = await response.json();
      if (response.ok) {
        setTracks(data.tracks || []);
        setTracksByDate(data.tracksByDate || {});
        setSortedDates(data.sortedDates || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.total || 0);
        if (loading) {
          setGenres(data.filters?.genres || []);
          setArtists(data.filters?.artists || []);
          setVersions(data.filters?.versions || []);
        }
      } else {
        console.log('Erro ao buscar tracks:', data.error || 'Erro desconhecido');
        setTracks([]); setTracksByDate({}); setSortedDates([]); setTotalCount(0); setTotalPages(1);
      }
    } catch (error) {
      console.log('Erro ao buscar tracks:', error);
      setTracks([]); setTracksByDate({}); setSortedDates([]); setTotalCount(0); setTotalPages(1);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1');
    const urlGenre = searchParams.get('genre') || 'all';
    const urlArtist = searchParams.get('artist') || 'all';
    const urlSearch = searchParams.get('search') || '';
    const urlMonth = searchParams.get('month') || 'all';
    const urlDateRange = searchParams.get('dateRange') || 'all';
    const urlVersion = searchParams.get('version') || 'all';
    setCurrentPage(urlPage);
    setSelectedGenre(urlGenre);
    setSelectedArtist(urlArtist);
    setSearchQuery(urlSearch);
    setSelectedMonth(urlMonth);
    setSelectedDateRange(urlDateRange);
    setSelectedVersion(urlVersion);
    fetchTracks(false);
  }, [searchParams]);

  useEffect(() => { fetchTracks(true); }, [searchQuery]);

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

  const handleClearFilters = () => {
    setSearchQuery(''); setSelectedGenre('all'); setSelectedArtist('all'); setSelectedDateRange('all');
    setSelectedVersion('all'); setSelectedMonth('all'); setCurrentPage(1);
    setTimeout(() => { fetchTracks(true); }, 100);
  };

  const handleSearch = () => { setCurrentPage(1); updateURL({ page: 1 }); fetchTracks(true); };
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
  const hasActiveFilters = !!(searchQuery || selectedGenre !== 'all' || selectedArtist !== 'all' || selectedDateRange !== 'all' || selectedVersion !== 'all' || selectedMonth !== 'all');

  // Exibir todos os dias disponíveis, sem paginação

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#212121' }}>
      <Header showSearchAndFilters={true} searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearchSubmit={handleSearch} onFiltersClick={() => setShowFiltersModal(true)} hasActiveFilters={hasActiveFilters} />
      <main className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Novidades</h1>
          {!session && (
            <div className="w-full flex items-center justify-center py-3 px-4 mb-4 rounded-xl shadow-md bg-yellow-100 border border-yellow-400 text-yellow-900 font-semibold text-center text-sm">
              Atenção: Usuários sem plano não podem ouvir, baixar ou curtir músicas. Apenas a navegação no catálogo está disponível.
            </div>
          )}
          {hasActiveFilters && (<div className="flex items-center space-x-2 text-orange-400 mt-2"><Filter className="h-4 w-4" /><span className="text-sm">Filtros ativos</span></div>)}
        </div>

        {/* Card de Boas-Vindas Movido para cá */}
        {session && (
          <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white p-6 rounded-2xl mb-8 shadow-2xl border border-white/10 text-center">
            <div className="flex justify-center mb-4"><Heart className="h-8 w-8 text-white/80 animate-pulse" /></div>
            <h2 className="text-3xl font-bold">Bem-vindo(a) de volta!</h2>
            <p className="mt-2 text-lg opacity-90">
              Agradecemos por fazer parte do nosso plano. Aproveite todos os benefícios exclusivos!
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                <Music className="h-8 w-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Carregando Músicas</h3>
              <p className="text-gray-400">Aguarde enquanto buscamos as melhores faixas para você...</p>
            </div>
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-32">
            <div className="p-6 bg-gray-800/50 rounded-2xl inline-block mb-6">
              <Search className="h-16 w-16 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Nenhuma música encontrada</h3>
            <p className="text-gray-400 mb-8">Tente ajustar seus filtros ou fazer uma nova busca.</p>
            <button onClick={handleClearFilters} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Limpar Filtros</button>
          </div>
        ) : (
          <>
            {sortedDates.length > 0 ? (
              <div className="space-y-8">
                {sortedDates.map((date) => (
                  <div key={date} className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-white capitalize">{formatDate(date)}</h2>
                      </div>
                    </div>
                    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                      <MusicTable
                        tracks={tracksByDate[date] || []}
                        onDownload={handleDownloadTracks}
                        isDownloading={downloading}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <MusicTable
                  tracks={tracks}
                  onDownload={handleDownloadTracks}
                  isDownloading={downloading}
                />
              </div>
            )}
          </>
        )}
        <FiltersModal isOpen={showFiltersModal} onClose={() => setShowFiltersModal(false)} genres={genres} artists={artists} versions={versions} monthOptions={monthOptions} selectedGenre={selectedGenre} selectedArtist={selectedArtist} selectedDateRange={selectedDateRange} selectedVersion={selectedVersion} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} onApplyFilters={handleSearch} onClearFilters={handleClearFilters} isLoading={searchLoading} hasActiveFilters={hasActiveFilters} onVersionChange={setSelectedVersion} onDateRangeChange={setSelectedDateRange} onArtistChange={setSelectedArtist} onGenreChange={setSelectedGenre} />
      </main>
    </div>
  );
}

export default function NewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#212121' }}><div className="text-center"><div className="relative"><div className="w-20 h-20 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div><Music className="h-8 w-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" /></div><h3 className="text-xl font-semibold text-white mb-2">Carregando</h3><p className="text-gray-400">Preparando sua experiência musical...</p></div></div>}>
      <NewPageContent />
    </Suspense>
  );
}