"use client";

import Header from '@/components/layout/Header';
import MusicTable from '@/components/music/MusicTable';
import { useMusicPageTitle } from '@/hooks/useDynamicTitle';
import { Track } from '@/types/track';
import { Calendar, ChevronLeft, ChevronRight, Filter, Loader2, Music, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

function NewPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hook para gerenciar título dinâmico da aba
  useMusicPageTitle('Novas Músicas - DJ Pool Platform');

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [versions, setVersions] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // Estados derivados dos parâmetros da URL
  const searchQuery = searchParams?.get('search') || '';
  const selectedGenre = searchParams?.get('genre') || 'all';
  const selectedArtist = searchParams?.get('artist') || 'all';
  const selectedDateRange = searchParams?.get('dateRange') || 'all';
  const selectedVersion = searchParams?.get('version') || 'all';
  const selectedMonth = searchParams?.get('month') || 'all';
  const currentPage = parseInt(searchParams?.get('page') || '1');

  const ITEMS_PER_PAGE = 100;

  // Função para atualizar URL com novos parâmetros
  const updateURL = (newParams: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    // Atualizar ou remover parâmetros
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === 'all' || value === '' || value === 1) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    // Se estamos mudando filtros (não página), resetar para página 1 e marcar como loading de filtro
    if (Object.keys(newParams).some(key => key !== 'page')) {
      params.delete('page');
      setFilterLoading(true);
    }

    const newURL = params.toString() ? `/new?${params.toString()}` : '/new';
    router.push(newURL, { scroll: false });
  };

  // Handlers para mudanças de filtros
  const handleSearchChange = (search: string) => {
    updateURL({ search });
  };

  const handleGenreChange = (genre: string) => {
    updateURL({ genre });
  };

  const handleArtistChange = (artist: string) => {
    updateURL({ artist });
  };

  const handleDateRangeChange = (dateRange: string) => {
    updateURL({ dateRange });
  };

  const handleVersionChange = (version: string) => {
    updateURL({ version });
  };

  const handleMonthChange = (month: string) => {
    updateURL({ month });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Função para buscar tracks do banco
  const fetchTracks = async () => {
    const isInitialLoad = !tracks.length;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setFilterLoading(true);
    }

    try {
      const params = new URLSearchParams();

      if (selectedGenre !== 'all') params.append('genre', selectedGenre);
      if (selectedArtist !== 'all') params.append('artist', selectedArtist);
      if (selectedDateRange !== 'all') params.append('dateRange', selectedDateRange);
      if (selectedVersion !== 'all') params.append('version', selectedVersion);
      if (selectedMonth !== 'all') params.append('month', selectedMonth);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', currentPage.toString());
      params.append('limit', '50');

      const response = await fetch(`/api/tracks?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTracks(data.tracks || []);
        setTotalPages(data.totalPages || 1);
        setGenres(data.filters?.genres || []);
        setArtists(data.filters?.artists || []);
        setVersions(data.filters?.versions || []);
      } else {
        console.error('Erro ao buscar tracks:', data.error);
      }
    } catch (error) {
      console.error('Erro ao buscar tracks:', error);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [selectedGenre, selectedArtist, selectedDateRange, selectedVersion, selectedMonth, searchQuery, currentPage]);

  // Extrair meses únicos das datas de lançamento
  const months = useMemo(() => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const uniqueMonths = [...new Set(tracks.map(track => {
      const date = new Date(track.releaseDate);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))];

    return uniqueMonths.sort().reverse().map(month => {
      const [year, monthNum] = month.split('-');
      return {
        value: month,
        label: `${monthNames[parseInt(monthNum) - 1]} ${year}`
      };
    });
  }, [tracks]);

  // Função para formatar data por extenso
  const formatDateExtended = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} de ${month} de ${year}`;
  };

  // Organizar tracks por data (mais recente primeiro)
  const tracksByDate = useMemo(() => {
    const sorted = [...tracks].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

    // Agrupar por data
    const grouped = sorted.reduce((acc, track) => {
      const date = track.releaseDate;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(track);
      return acc;
    }, {} as Record<string, Track[]>);

    return grouped;
  }, [tracks]);

  // Paginação baseada em grupos de datas
  const dateGroups = Object.keys(tracksByDate);
  const totalDatePages = Math.ceil(dateGroups.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const handleSearch = (query: string) => {
    handleSearchChange(query);
  };

  const clearFilters = () => {
    updateURL({
      search: '',
      genre: 'all',
      artist: 'all',
      version: 'all',
      dateRange: 'all',
      month: 'all',
      page: 1
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-4" />
        <div className="text-white text-lg">Carregando músicas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans">
      <Header />

      <div className="flex flex-col md:flex-row">
        {/* Sidebar de Filtros - Responsivo e Menor */}
        <div className="w-full md:w-64 bg-black/20 backdrop-blur-sm border-b md:border-b-0 md:border-r border-gray-800/50 p-3 md:p-4 md:min-h-screen">
          <div className="md:sticky md:top-6">
            {/* Cabeçalho do Widget */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-light text-white tracking-wide">Filtros</h2>
                <p className="text-gray-400 text-xs font-light">Refine sua busca</p>
              </div>
            </div>

            {/* Busca Rápida - Próxima ao cabeçalho */}
            <div className="mb-3">
              <label className="block text-xs font-light text-gray-300 mb-1 tracking-wide">
                Busca Rápida
              </label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Música, artista..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full border border-gray-700/50 rounded-lg pl-8 pr-2 py-1.5 text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-black/20 backdrop-blur-sm font-light"
                />
              </div>
            </div>

            {/* Filtro por Gênero */}
            <div className="mb-3">
              <label className="block text-xs font-light text-gray-300 mb-1 tracking-wide">
                Gênero Musical
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => handleGenreChange(e.target.value)}
                className="w-full border border-gray-700/50 rounded-lg px-2 py-1.5 text-white text-sm focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-black/20 backdrop-blur-sm font-light"
              >
                <option value="all">Todos os Gêneros</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Artista */}
            <div className="mb-3">
              <label className="block text-xs font-light text-gray-300 mb-1 tracking-wide">
                Artista
              </label>
              <select
                value={selectedArtist}
                onChange={(e) => handleArtistChange(e.target.value)}
                className="w-full border border-gray-700/50 rounded-lg px-2 py-1.5 text-white text-sm focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-black/20 backdrop-blur-sm font-light"
              >
                <option value="all">Todos os Artistas</option>
                {artists.map((artist) => (
                  <option key={artist} value={artist}>
                    {artist}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Versão */}
            <div className="mb-3">
              <label className="block text-xs font-light text-gray-300 mb-1 tracking-wide">
                Versão
              </label>
              <select
                value={selectedVersion}
                onChange={(e) => handleVersionChange(e.target.value)}
                className="w-full border border-gray-700/50 rounded-lg px-2 py-1.5 text-white text-sm focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-black/20 backdrop-blur-sm font-light"
              >
                <option value="all">Todas as Versões</option>
                {versions.map((version) => (
                  <option key={version} value={version}>
                    {version}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Data */}
            <div className="mb-3">
              <label className="block text-xs font-light text-gray-300 mb-1 tracking-wide">
                <Calendar className="inline w-3 h-3 mr-1" />
                Período de Lançamento
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="w-full border border-gray-700/50 rounded-lg px-2 py-1.5 text-white text-sm focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-black/20 backdrop-blur-sm font-light"
              >
                <option value="all">Qualquer período</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
                <option value="3months">Últimos 3 meses</option>
                <option value="6months">Últimos 6 meses</option>
                <option value="year">Último ano</option>
              </select>
            </div>

            {/* Filtro por Mês Específico */}
            <div className="mb-3">
              <label className="block text-xs font-light text-gray-300 mb-1 tracking-wide">
                <Calendar className="inline w-3 h-3 mr-1" />
                Mês Específico
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full border border-gray-700/50 rounded-lg px-2 py-1.5 text-white text-sm focus:ring-2 focus:ring-gray-800 focus:border-transparent bg-black/20 backdrop-blur-sm font-light"
              >
                <option value="all">Todos os Meses</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão Limpar Filtros */}
            <button
              onClick={clearFilters}
              className="w-full hover:bg-gray-700/50 text-white px-3 py-1.5 rounded-lg font-light text-sm transition-colors bg-black/30 backdrop-blur-sm tracking-wide"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 p-4 md:p-6 pb-20 md:pb-32">
          <div className="max-w-6xl mx-auto">
            {/* Cabeçalho da página */}
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <Music className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-light text-white tracking-wide">Novas Músicas</h1>
                <p className="text-gray-400 mt-1 text-sm md:text-base font-light">Descubra os lançamentos mais recentes da plataforma</p>
              </div>
            </div>

            {/* Músicas organizadas por data */}
            <div className="space-y-6 md:space-y-8 mb-6 md:mb-8">
              {loading ? (
                <div className="bg-black/20 backdrop-blur-sm border border-gray-800/50 rounded-xl p-8 md:p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <h3 className="text-lg md:text-xl font-sans font-semibold text-gray-400 mb-2 tracking-wide">
                      Carregando músicas...
                    </h3>
                    <p className="text-gray-500 text-sm md:text-base font-sans">
                      Aplicando filtros e organizando resultados
                    </p>
                  </div>
                </div>
              ) : filterLoading ? (
                <div className="relative">
                  {/* Overlay de carregamento */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 bg-black/60 px-6 py-4 rounded-lg border border-gray-700">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <p className="text-white text-sm font-medium">Aplicando filtros...</p>
                    </div>
                  </div>

                  {/* Conteúdo anterior (opaco) */}
                  <div className="opacity-50 pointer-events-none">
                    {Object.entries(tracksByDate).slice(startIndex, startIndex + ITEMS_PER_PAGE).map(([date, dateTracks]) => (
                      <div key={date} className="bg-black/20 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden mb-6">
                        <div className="px-4 md:px-6 py-3 md:py-4 bg-black/30 backdrop-blur-sm">
                          <h2 className="text-lg md:text-xl font-sans font-bold text-white tracking-wide">
                            {formatDateExtended(date)}
                          </h2>
                          <p className="text-gray-100 text-sm mt-1 font-sans">
                            {dateTracks.length} música{dateTracks.length !== 1 ? 's' : ''} lançada{dateTracks.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <MusicTable tracks={dateTracks} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : tracks.length === 0 ? (
                <div className="bg-black/20 backdrop-blur-sm border border-gray-800/50 rounded-xl p-8 md:p-12 text-center">
                  <Music className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-sans font-semibold text-gray-400 mb-2 tracking-wide">
                    Nenhuma música encontrada
                  </h3>
                  <p className="text-gray-500 text-sm md:text-base font-sans">
                    {selectedMonth !== 'all' ? 'Não foram encontradas músicas para o mês selecionado.' : 'Tente ajustar os filtros ou a busca para encontrar mais resultados.'}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Limpar Filtros
                  </button>
                </div>
              ) : (
                Object.entries(tracksByDate).slice(startIndex, startIndex + ITEMS_PER_PAGE).map(([date, dateTracks]) => (
                  <div key={date} className="bg-black/20 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden">
                    {/* Cabeçalho da data */}
                    <div className="px-4 md:px-6 py-3 md:py-4 bg-black/30 backdrop-blur-sm">
                      <h2 className="text-lg md:text-xl font-sans font-bold text-white tracking-wide">
                        {formatDateExtended(date)}
                      </h2>
                      <p className="text-gray-100 text-sm mt-1 font-sans">
                        {dateTracks.length} música{dateTracks.length !== 1 ? 's' : ''} lançada{dateTracks.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Lista de músicas do dia */}
                    <MusicTable tracks={dateTracks} />
                  </div>
                ))
              )}
            </div>

            {/* Paginação */}
            {totalDatePages > 1 && (
              <div className="bg-black/20 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-gray-400 text-sm md:text-base text-center md:text-left font-sans">
                    Mostrando {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, tracks.length)} de {tracks.length} músicas
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 hover:bg-gray-700/50 disabled:bg-gray-800/50 disabled:opacity-50 text-white rounded-lg transition-colors bg-black/30 backdrop-blur-sm text-sm md:text-base font-sans tracking-wide"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Anterior</span>
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalDatePages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 md:w-10 md:h-10 rounded-lg font-sans font-medium transition-colors text-sm md:text-base tracking-wide ${currentPage === page
                            ? 'text-white bg-black/50 backdrop-blur-sm'
                            : 'bg-black/20 backdrop-blur-sm hover:bg-gray-700/50 text-gray-300'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalDatePages}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 hover:bg-gray-700/50 disabled:bg-gray-800/50 disabled:opacity-50 text-white rounded-lg transition-colors bg-black/30 backdrop-blur-sm text-sm md:text-base font-sans tracking-wide"
                    >
                      <span className="hidden sm:inline">Próxima</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <Header />
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      </div>
    }>
      <NewPageContent />
    </Suspense>
  );
}
