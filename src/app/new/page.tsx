"use client";

import Header from '@/components/layout/Header';
import MusicTable from '@/components/music/MusicTable';
import { Track } from '@/types/track';
import { Calendar, ChevronLeft, ChevronRight, Filter, Loader2, Music, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

function NewPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
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

  const ITEMS_PER_PAGE = 6;

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

    // Se estamos mudando filtros (não página), resetar para página 1
    if (Object.keys(newParams).some(key => key !== 'page')) {
      params.delete('page');
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
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (selectedGenre !== 'all') params.append('genre', selectedGenre);
      if (selectedArtist !== 'all') params.append('artist', selectedArtist);
      if (selectedDateRange !== 'all') params.append('dateRange', selectedDateRange);
      if (selectedVersion !== 'all') params.append('version', selectedVersion);
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
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [selectedGenre, selectedArtist, selectedDateRange, selectedVersion, searchQuery, currentPage]);

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
      <div className="min-h-screen bg-[#202124] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-4" />
        <div className="text-white text-lg">Carregando músicas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#202124] text-white font-sans">
      <Header onSearchChange={handleSearch} />

      <div className="flex">
        {/* Sidebar de Filtros */}
        <div className="w-80 min-h-screen bg-[#202124] border-r border-gray-800 p-6">
          <div className="sticky top-6">
            {/* Cabeçalho do Widget */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #1a1a1a, #0d0d0d)' }}>
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Filtros</h2>
                <p className="text-gray-400 text-sm">Refine sua busca</p>
              </div>
            </div>

            {/* Busca Rápida - Próxima ao cabeçalho */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Busca Rápida
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Música, artista..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  style={{ backgroundColor: '#202124' }}
                />
              </div>
            </div>

            {/* Filtro por Gênero */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gênero Musical
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => handleGenreChange(e.target.value)}
                className="w-full border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                style={{ backgroundColor: '#202124' }}
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Artista
              </label>
              <select
                value={selectedArtist}
                onChange={(e) => handleArtistChange(e.target.value)}
                className="w-full border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                style={{ backgroundColor: '#202124' }}
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Versão
              </label>
              <select
                value={selectedVersion}
                onChange={(e) => handleVersionChange(e.target.value)}
                className="w-full border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                style={{ backgroundColor: '#202124' }}
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Período de Lançamento
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="w-full border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                style={{ backgroundColor: '#202124' }}
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Mês Específico
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                style={{ backgroundColor: '#202124' }}
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
              className="w-full hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 p-6 pb-32">
          <div className="max-w-6xl mx-auto">
            {/* Cabeçalho da página */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #1a1a1a, #0d0d0d)' }}>
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Novas Músicas</h1>
                <p className="text-gray-400 mt-1">Descubra os lançamentos mais recentes da plataforma</p>
              </div>
            </div>

            {/* Músicas organizadas por data */}
            <div className="space-y-8 mb-8">
              {tracks.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                  <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    Nenhuma música encontrada
                  </h3>
                  <p className="text-gray-500">
                    Tente ajustar os filtros ou a busca para encontrar mais resultados.
                  </p>
                </div>
              ) : (
                Object.entries(tracksByDate).slice(startIndex, startIndex + ITEMS_PER_PAGE).map(([date, dateTracks]) => (
                  <div key={date} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    {/* Cabeçalho da data */}
                    <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #1a1a1a, #0d0d0d)' }}>
                      <h2 className="text-xl font-bold text-white">
                        {formatDateExtended(date)}
                      </h2>
                      <p className="text-gray-100 text-sm mt-1">
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
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="text-gray-400">
                    Mostrando {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, tracks.length)} de {tracks.length} músicas
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
                      style={{ backgroundColor: currentPage === 1 ? undefined : '#1a1a1a' }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalDatePages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                            ? 'text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                            }`}
                          style={currentPage === page ? { backgroundColor: '#1a1a1a' } : undefined}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalDatePages}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
                      style={{ backgroundColor: currentPage === totalDatePages ? undefined : '#1a1a1a' }}
                    >
                      Próxima
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
