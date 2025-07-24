"use client";

import Header from '@/components/layout/Header';
import FiltersModal from '@/components/music/FiltersModal';
import MusicTable from '@/components/music/MusicTable';
import { useMusicPageTitle } from '@/hooks/useDynamicTitle';
import { Track } from '@/types/track';
import { ChevronLeft, ChevronRight, Filter, Loader2, Music, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function NewPageContent() {
  // Destaque da Semana: músicas lançadas nos últimos 7 dias
  const getWeekHighlights = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // Flatten all tracks from tracksByDate
    const allTracks = Object.values(tracksByDate).flat();
    // Filtrar por data
    const highlights = allTracks.filter(track => {
      const release = new Date(track.releaseDate);
      return release >= sevenDaysAgo && release <= now;
    });
    // Ordenar por data decrescente
    highlights.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    return highlights.slice(0, 5);
  };

  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hook para gerenciar título dinâmico da aba
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
        await new Promise(res => setTimeout(res, 200)); // Pequeno delay para evitar bloqueio do navegador
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

  // Estados dos filtros (controlados localmente, não por URL)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Estado do modal de filtros
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const ITEMS_PER_PAGE = 250;

  // Função para formatar data em português
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Hoje';
    if (isYesterday) return 'Ontem';

    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Função para buscar músicas
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

        // Atualizar filtros apenas na primeira carga
        if (loading) {
          setGenres(data.filters?.genres || []);
          setArtists(data.filters?.artists || []);
          setVersions(data.filters?.versions || []);
        }
      } else {
        console.log('Erro ao buscar tracks:', data.error || 'Erro desconhecido');
        setTracks([]);
        setTracksByDate({});
        setSortedDates([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.log('Erro ao buscar tracks:', error);
      setTracks([]);
      setTracksByDate({});
      setSortedDates([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Carregar dados iniciais e sincronizar com URL
  useEffect(() => {
    // Sincronizar estados com URL na primeira carga
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

  // Busca instantânea ao digitar
  useEffect(() => {
    fetchTracks(true);
  }, [searchQuery]);

  // Atualizar URL quando filtros mudarem
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

  // Função para limpar filtros
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedArtist('all');
    setSelectedDateRange('all');
    setSelectedVersion('all');
    setSelectedMonth('all');
    setCurrentPage(1);

    // Buscar sem filtros
    setTimeout(() => {
      fetchTracks(true);
    }, 100);
  };

  // Função para aplicar filtros (chamada pelo botão)
  const handleSearch = () => {
    setCurrentPage(1);
    updateURL({ page: 1 });
    fetchTracks(true); // Reset para página 1
  };

  // Navegação de páginas
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateURL({ page: newPage });
    setTimeout(() => {
      fetchTracks();
    }, 100);
  };

  // Gerar opções de mês
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();

    // Últimos 24 meses
    for (let i = 0; i < 24; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const value = `${year}-${String(month).padStart(2, '0')}`;
      const label = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });

      options.push({ value, label });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  // Verificar se há filtros ativos
  const hasActiveFilters = !!(searchQuery || selectedGenre !== 'all' || selectedArtist !== 'all' ||
    selectedDateRange !== 'all' || selectedVersion !== 'all' || selectedMonth !== 'all');

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#212121' }}
    >
      <Header
        showSearchAndFilters={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        onFiltersClick={() => setShowFiltersModal(true)}
        hasActiveFilters={hasActiveFilters}
      />

      <main className="container mx-auto px-4 py-8 pt-20">
        {/* Cabeçalho com estatísticas */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Music className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Novidades</h1>
                <div className="flex items-center space-x-4 text-gray-300">
                  <p className="flex items-center space-x-2">
                    <span className="text-2xl font-semibold text-blue-400">
                      {totalCount.toLocaleString()}
                    </span>
                    <span>músicas disponíveis</span>
                  </p>
                  {hasActiveFilters && (
                    <div className="flex items-center space-x-2 text-orange-400">
                      <Filter className="h-4 w-4" />
                      <span className="text-sm">Filtros ativos</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Indicador de carregamento */}
            {searchLoading && (
              <div className="flex items-center space-x-2 text-blue-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Buscando...</span>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Principal - Tabela ocupa toda a largura */}
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
            <p className="text-gray-400 mb-8">
              Tente ajustar seus filtros ou fazer uma nova busca.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <>
            {/* Tabelas de Músicas Agrupadas por Data */}
            {sortedDates.length > 0 ? (
              <div className="space-y-8">
                {sortedDates.map((date) => (
                  <div key={date} className="space-y-4">
                    {/* Header da Data */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-white capitalize">
                          {formatDate(date)}
                        </h2>
                      </div>
                      <div className="text-gray-400 text-sm">
                        ({tracksByDate[date]?.length} música{tracksByDate[date]?.length !== 1 ? 's' : ''})
                      </div>
                    </div>

                    {/* Tabela para esta data */}
                    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                      <MusicTable tracks={tracksByDate[date] || []} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback para exibição normal se não há dados agrupados */
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <MusicTable tracks={tracks} />
              </div>
            )}

            {/* Paginação Melhorada */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 p-6 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="text-gray-300">
                  <span className="text-sm">
                    Exibindo página {currentPage} de {totalPages}
                    <span className="text-blue-400 font-medium">
                      ({((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount.toLocaleString()})
                    </span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || searchLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:opacity-50 text-white rounded-lg transition-all duration-200 border border-gray-600/30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Anterior</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={searchLoading}
                          className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${pageNum === currentPage
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || searchLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:opacity-50 text-white rounded-lg transition-all duration-200 border border-gray-600/30"
                  >
                    <span>Próxima</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal de Filtros */}
        <FiltersModal
          isOpen={showFiltersModal}
          onClose={() => setShowFiltersModal(false)}
          genres={genres}
          artists={artists}
          versions={versions}
          monthOptions={monthOptions}
          selectedGenre={selectedGenre}
          selectedArtist={selectedArtist}
          selectedDateRange={selectedDateRange}
          selectedVersion={selectedVersion}
          selectedMonth={selectedMonth}
          onGenreChange={setSelectedGenre}
          onArtistChange={setSelectedArtist}
          onDateRangeChange={setSelectedDateRange}
          onVersionChange={setSelectedVersion}
          onMonthChange={setSelectedMonth}
          onApplyFilters={handleSearch}
          onClearFilters={handleClearFilters}
          isLoading={searchLoading}
          hasActiveFilters={hasActiveFilters}
        />
      </main>
    </div>
  );
}

export default function NewPage() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#212121' }}
      >
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <Music className="h-8 w-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Carregando</h3>
          <p className="text-gray-400">Preparando sua experiência musical...</p>
        </div>
      </div>
    }>
      <NewPageContent />
    </Suspense>
  );
}
