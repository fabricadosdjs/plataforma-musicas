"use client";

import Header from '@/components/layout/Header';
import MusicTable from '@/components/music/MusicTable';
import { useMusicPageTitle } from '@/hooks/useDynamicTitle';
import { Track } from '@/types/track';
import { Calendar, ChevronLeft, ChevronRight, Filter, Loader2, Music, Search, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function NewPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hook para gerenciar título dinâmico da aba
  useMusicPageTitle('Novas Músicas - DJ Pool Platform');

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
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

  const ITEMS_PER_PAGE = 50;

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
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.total || 0);
        
        // Atualizar filtros apenas na primeira carga
        if (loading) {
          setGenres(data.filters?.genres || []);
          setArtists(data.filters?.artists || []);
          setVersions(data.filters?.versions || []);
        }
      } else {
        console.error('Erro ao buscar tracks:', data.error);
        setTracks([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erro ao buscar tracks:', error);
      setTracks([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchTracks();
  }, []);

  // Função para aplicar filtros (chamada pelo botão)
  const handleSearch = () => {
    fetchTracks(true); // Reset para página 1
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

  // Navegação de páginas
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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
  const hasActiveFilters = searchQuery || selectedGenre !== 'all' || selectedArtist !== 'all' || 
                         selectedDateRange !== 'all' || selectedVersion !== 'all' || selectedMonth !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-20">
        {/* Cabeçalho com estatísticas */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Music className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Novas Músicas</h1>
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

        {/* Painel de Filtros Avançados */}
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros de Busca</span>
            </h2>
            
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                disabled={searchLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                <span className="text-sm">Limpar Tudo</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {/* Campo de Busca Principal */}
            <div className="xl:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Search className="inline h-4 w-4 mr-2" />
                Buscar por nome ou artista
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Digite o nome da música ou artista..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por Gênero */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                🎵 Gênero Musical
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os gêneros</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Artista */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                🎤 Artista
              </label>
              <select
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os artistas</option>
                {artists.map(artist => (
                  <option key={artist} value={artist}>{artist}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Mês */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Calendar className="inline h-4 w-4 mr-2" />
                Mês de Lançamento
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os meses</option>
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Data Range */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                📅 Período
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os períodos</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
                <option value="3months">Últimos 3 meses</option>
                <option value="6months">Últimos 6 meses</option>
                <option value="year">Último ano</option>
              </select>
            </div>

            {/* Filtro por Versão */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                🔧 Versão
              </label>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as versões</option>
                {versions.map(version => (
                  <option key={version} value={version}>{version}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 disabled:transform-none"
            >
              {searchLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span>Buscar Músicas</span>
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
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
            {/* Tabela de Músicas */}
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <MusicTable tracks={tracks} />
            </div>
            
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
                          className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                            pageNum === currentPage
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
      </main>
    </div>
  );
}

export default function NewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
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
