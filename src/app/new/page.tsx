"use client";

// Versão ÉPICA da página new com cards lindos e animações
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Search, X, Filter, Download, Music, Heart, Check, Play, Pause, Star, TrendingUp, Clock, Users, Award, Zap, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import NewFooter from '@/components/layout/NewFooter';
import FiltersModal from '@/components/music/FiltersModal';
import { MusicList } from '@/components/music/MusicList';
import { useAppContext } from '@/context/AppContext';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { Track } from '@/types/track';

const NewPage = () => {
  // Estados básicos
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Estados de filtros
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [selectedPool, setSelectedPool] = useState('all');
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  // Estados de interação
  const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);
  const [likedTrackIds, setLikedTrackIds] = useState<number[]>([]);
  const [downloadQueue, setDownloadQueue] = useState<number[]>([]);
  const [zipProgress, setZipProgress] = useState(0);

  // Hooks
  const { data: session } = useSession();
  const { showAlert } = useAppContext();
  const { currentTrack, isPlaying, playTrack } = useGlobalPlayer();

  // Dados derivados
  const filteredTracks = useMemo(() => {
    let filtered = tracks;

    // Aplicar pesquisa
    if (appliedSearchQuery) {
      const query = appliedSearchQuery.toLowerCase();
      filtered = filtered.filter(track =>
        track.songName.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.style.toLowerCase().includes(query) ||
        (track.pool && track.pool.toLowerCase().includes(query))
      );
    }

    // Aplicar filtros
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(track => track.style === selectedGenre);
    }
    if (selectedArtist !== 'all') {
      filtered = filtered.filter(track => track.artist === selectedArtist);
    }
    if (selectedPool !== 'all') {
      filtered = filtered.filter(track => track.pool && track.pool === selectedPool);
    }
    if (selectedVersion !== 'all') {
      filtered = filtered.filter(track => track.version === selectedVersion);
    }

    return filtered;
  }, [tracks, appliedSearchQuery, selectedGenre, selectedArtist, selectedPool, selectedVersion]);

  const hasActiveFilters = selectedGenre !== 'all' || selectedArtist !== 'all' || selectedPool !== 'all' || selectedVersion !== 'all';

  // Estatísticas épicas
  const stats = useMemo(() => ({
    totalTracks: tracks.length,
    newTracks: tracks.filter(t => {
      const releaseDate = new Date(t.releaseDate || '');
      const now = new Date();
      const diffDays = (now.getTime() - releaseDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 30;
    }).length,
    topGenres: tracks.reduce((acc, track) => {
      acc[track.style] = (acc[track.style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    topArtists: tracks.reduce((acc, track) => {
      acc[track.artist] = (acc[track.artist] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  }), [tracks]);

  // Funções auxiliares
  const handleSearchSubmit = () => {
    setAppliedSearchQuery(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAppliedSearchQuery('');
  };

  const handleClearFilters = () => {
    setSelectedGenre('all');
    setSelectedArtist('all');
    setSelectedPool('all');
    setSelectedVersion('all');
    setSelectedMonth('all');
    setSelectedDateRange('all');
  };

  const handleStyleClick = (style: string | undefined) => {
    if (style) {
      setSelectedGenre(style);
      setAppliedSearchQuery('');
    }
  };

  const handlePoolClick = (pool: string | undefined) => {
    if (pool) {
      setSelectedPool(pool);
      setAppliedSearchQuery('');
    }
  };

  const handleLikeToggle = (trackId: number) => {
    setLikedTrackIds(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleDownload = (track: Track) => {
    // Implementar lógica de download
    console.log('Downloading track:', track.songName);
  };

  const downloadAllTracks = (tracksToDownload: Track[]) => {
    // Implementar lógica de download em lote
    console.log('Downloading all tracks:', tracksToDownload.length);
  };

  const downloadNewTracks = (tracksToDownload: Track[]) => {
    const newTracks = tracksToDownload.filter(track => !downloadedTrackIds.includes(track.id));
    console.log('Downloading new tracks:', newTracks.length);
  };

  // Carregar dados
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        console.log('🔍 Iniciando fetch de músicas...');

        const response = await fetch('/api/tracks');
        console.log('📡 Resposta da API:', response.status, response.statusText);

        if (response.ok) {
          const data = await response.json();
          console.log('📊 Dados recebidos:', data);
          console.log('📊 Tipo de dados:', typeof data);
          console.log('📊 É array?', Array.isArray(data));
          console.log('📊 Quantidade:', data?.length || 'N/A');

          // Verificar estrutura dos dados
          if (Array.isArray(data)) {
            setTracks(data);
            console.log('✅ Músicas carregadas:', data.length);
          } else if (data?.tracks && Array.isArray(data.tracks)) {
            setTracks(data.tracks);
            console.log('✅ Músicas carregadas de data.tracks:', data.tracks.length);
          } else {
            console.error('❌ Estrutura de dados inválida:', data);
            setTracks([]);
          }
        } else {
          console.error('❌ Erro na API:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('❌ Detalhes do erro:', errorText);
          setTracks([]);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar músicas:', error);
        setTracks([]);
      } finally {
        setLoading(false);
        console.log('🏁 Fetch finalizado');
      }
    };

    fetchTracks();
  }, []);

  // Renderização
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0a1a] to-[#0a0a0a] text-white overflow-hidden">
      {/* Header */}
      <Header />

      {/* Barra de Busca Épica */}
      <div className="relative z-[9997] bg-gradient-to-r from-[#1a0a1a] via-[#2a0a2a] to-[#1a0a1a] border-b border-red-500/30 shadow-2xl" style={{ marginTop: '76px' }}>
        <div className="container mx-auto px-4 py-8">
          {/* Título Épico */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-red-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4 animate-pulse">
              🎵 NOVIDADES ÉPICAS
            </h1>
            <p className="text-xl text-gray-300 font-medium">
              Descubra as melhores músicas eletrônicas do momento
            </p>
          </div>

          {/* Barra de Busca com Efeitos */}
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-2 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Search className="h-6 w-6 text-red-400 animate-pulse" />
                      </span>
                      <input
                        type="text"
                        placeholder="🔍 Buscar músicas épicas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                        className="w-full pl-14 pr-20 py-4 text-lg bg-transparent border-none outline-none text-white placeholder-gray-400 font-medium"
                      />
                      <button
                        onClick={handleSearchSubmit}
                        disabled={!searchQuery.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white rounded-xl p-3 flex items-center justify-center transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        title="Buscar"
                      >
                        <Search className="h-5 w-5" />
                      </button>
                      {searchQuery && (
                        <button
                          onClick={handleClearSearch}
                          className="absolute right-16 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white transition-colors transform hover:scale-110"
                          title="Limpar busca"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Botão de Filtros Épico */}
                  <button
                    onClick={() => setShowFiltersModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-purple-500/30 flex items-center gap-2"
                  >
                    <Filter className="h-5 w-5" />
                    Filtros
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Cards de Estatísticas Épicas */}
          {!hasActiveFilters && !appliedSearchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Card Total de Músicas */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-red-900/40 to-orange-900/40 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 text-center transform group-hover:scale-105 transition-all duration-300 shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Music className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{stats.totalTracks}</h3>
                  <p className="text-gray-300 font-medium">Total de Músicas</p>
                </div>
              </div>

              {/* Card Novidades */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 text-center transform group-hover:scale-105 transition-all duration-300 shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{stats.newTracks}</h3>
                  <p className="text-gray-300 font-medium">Novidades</p>
                </div>
              </div>

              {/* Card Top Gênero */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 text-center transform group-hover:scale-105 transition-all duration-300 shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {Object.keys(stats.topGenres).length > 0
                      ? Object.entries(stats.topGenres).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
                      : 'N/A'
                    }
                  </h3>
                  <p className="text-gray-300 font-medium">Top Gênero</p>
                </div>
              </div>

              {/* Card Top Artista */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 text-center transform group-hover:scale-105 transition-all duration-300 shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {Object.keys(stats.topArtists).length > 0
                      ? Object.entries(stats.topArtists).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
                      : 'N/A'
                    }
                  </h3>
                  <p className="text-gray-300 font-medium">Top Artista</p>
                </div>
              </div>
            </div>
          )}

          {/* Botões de Download Épicos */}
          {!hasActiveFilters && !appliedSearchQuery && tracks.length > 0 && (
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">🚀 Downloads Épicos</h2>
                  <p className="text-gray-300 text-lg">Baixe suas músicas favoritas em massa</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => downloadNewTracks(tracks)}
                    className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-green-400/30 flex items-center justify-center gap-3"
                  >
                    <Zap className="h-6 w-6 group-hover:animate-pulse" />
                    BAIXAR NOVAS {stats.newTracks}
                  </button>

                  <button
                    onClick={() => downloadAllTracks(tracks)}
                    className="group bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-400/30 flex items-center justify-center gap-3"
                  >
                    <Download className="h-6 w-6 group-hover:animate-bounce" />
                    BAIXAR TODAS {stats.totalTracks}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Renderização condicional baseada em filtros ativos ou pesquisa */}
          {(hasActiveFilters || appliedSearchQuery) ? (
            // Lista de músicas filtradas/pesquisadas
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2 font-sans bg-gradient-to-r from-red-400 to-purple-600 bg-clip-text text-transparent">
                  {appliedSearchQuery ? '🔍 Resultados da Pesquisa' : '🎵 Músicas Encontradas com Filtros'}
                </h2>
                <p className="text-gray-400 text-lg font-sans">
                  {filteredTracks.length} {filteredTracks.length === 1 ? 'música encontrada' : 'músicas encontradas'}
                  {appliedSearchQuery && tracks.length !== filteredTracks.length && ` de ${tracks.length} total`}
                </p>
              </div>

              {/* Usar MusicList para mostrar as músicas */}
              <MusicList
                tracks={filteredTracks}
                downloadedTrackIds={downloadedTrackIds}
                setDownloadedTrackIds={setDownloadedTrackIds}
              />
            </div>
          ) : (
            // Conteúdo padrão quando não há filtros ou pesquisa
            <div className="space-y-8">
              {/* Mostrar todas as músicas quando não há pesquisa */}
              {tracks.length > 0 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2 font-sans bg-gradient-to-r from-red-400 to-purple-600 bg-clip-text text-transparent">
                      🎵 Todas as Músicas
                    </h2>
                    <p className="text-gray-400 text-lg font-sans">
                      {tracks.length} {tracks.length === 1 ? 'música disponível' : 'músicas disponíveis'}
                    </p>
                  </div>

                  {/* Usar MusicList para mostrar todas as músicas */}
                  <MusicList
                    tracks={tracks}
                    downloadedTrackIds={downloadedTrackIds}
                    setDownloadedTrackIds={setDownloadedTrackIds}
                  />
                </div>
              )}

              {/* Loading state épico */}
              {loading && (
                <div className="text-center py-16">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-red-500/30 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-red-500 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                    <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                  </div>
                  <p className="text-gray-400 mt-6 text-xl font-medium">Carregando músicas épicas...</p>
                </div>
              )}

              {/* Estado vazio */}
              {!loading && tracks.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-32 h-32 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Music className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-xl font-medium">Nenhuma música encontrada</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-16">
            <NewFooter />
          </div>
        </div>
      </div>

      {/* Modal de Filtros */}
      <FiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        genres={[]}
        artists={[]}
        versions={[]}
        pools={[]}
        monthOptions={[]}
        selectedGenre={selectedGenre}
        selectedArtist={selectedArtist}
        selectedDateRange={selectedDateRange}
        selectedVersion={selectedVersion}
        selectedMonth={selectedMonth}
        selectedPool={selectedPool}
        onGenreChange={setSelectedGenre}
        onArtistChange={setSelectedArtist}
        onDateRangeChange={() => { }}
        onVersionChange={setSelectedVersion}
        onMonthChange={setSelectedMonth}
        onPoolChange={setSelectedPool}
        onApplyFilters={() => { }}
        onClearFilters={handleClearFilters}
        isLoading={loading}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
};

export default NewPage;
