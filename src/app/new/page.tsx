"use client";

import Header from '@/components/layout/Header';
import MusicTable from '@/components/music/MusicTable';
import UserBenefits from '@/components/ui/UserBenefits';
import { Track } from '@/types/track';
import { Calendar, ChevronLeft, ChevronRight, Filter, Loader2, Music, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

export default function NewPage() {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [genres, setGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [versions, setVersions] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 6;

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
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedArtist('all');
    setSelectedVersion('all');
    setSelectedDateRange('all');
    setSelectedMonth('all');
    setCurrentPage(1);
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
            {/* Benefícios do Usuário */}
            {session?.user && <UserBenefits />}

            {/* Cabeçalho do Widget */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Filtros</h2>
                <p className="text-gray-400 text-sm">Refine sua busca</p>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="bg-gray-900 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-300">{tracks.length}</div>
                  <div className="text-gray-400 text-xs">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{tracks.length}</div>
                  <div className="text-gray-400 text-xs">Filtradas</div>
                </div>
              </div>
            </div>

            {/* Busca Rápida */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Busca Rápida
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Música, artista..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por Gênero */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gênero Musical
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-600 focus:border-transparent"
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Artista
              </label>
              <select
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-600 focus:border-transparent"
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Versão
              </label>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-600 focus:border-transparent"
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Período de Lançamento
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-600 focus:border-transparent"
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Mês Específico
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-600 focus:border-transparent"
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
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Novas Músicas</h1>
                <p className="text-gray-400 mt-1">Descubra os lançamentos mais recentes da plataforma</p>
              </div>
            </div>

            {/* Mensagem de boas-vindas */}
            <div className="mb-8 bg-green-600 rounded-xl p-6 text-white">
              <h2 className="text-xl font-semibold mb-3">Bem-vindo à nossa plataforma de música! 🎵</h2>
              <p className="text-justify leading-relaxed">
                Explore nossa vasta coleção de músicas dos mais variados gêneros e artistas.
                Aqui você encontra desde os lançamentos mais recentes até clássicos atemporais.
                Nossa plataforma oferece uma experiência musical única, com funcionalidades de
                curtir suas músicas favoritas e fazer downloads para ouvir offline.
                Navegue pelas categorias, use os filtros para encontrar exatamente o que procura
                e descubra novos artistas que podem se tornar seus favoritos.
              </p>
            </div>

            {/* Mensagem para usuários não VIP */}
            {(!session || !session.user?.is_vip) && (
              <div className="mb-8 bg-yellow-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">🔒 Torne-se VIP para acesso completo</h3>
                <p className="text-justify leading-relaxed">
                  Para curtir músicas, fazer downloads e ter acesso a todas as funcionalidades da plataforma,
                  você precisa ser um usuário VIP. Assine agora e desfrute de uma experiência musical
                  completa e sem limitações!
                </p>
              </div>
            )}

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
                    <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
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
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
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
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalDatePages}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
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
