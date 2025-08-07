// src/app/new/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Music, Loader2, Sparkles, Clock, Star, CheckCircle, Waves, ShoppingCart, Package, X, Crown, Play, Download, Heart, Users } from 'lucide-react';
import { Track } from '@/types/track';
import MusicTable from '@/components/music/MusicTable';
import { useSEO } from '@/hooks/useSEO';
import SEOHead from '@/components/seo/SEOHead';
import MusicStructuredData from '@/components/seo/MusicStructuredData';
import Header from '@/components/layout/Header';
import FiltersModal from '@/components/music/FiltersModal';
import { useAppContext } from '@/context/AppContext';
import { useDownloadExtensionDetector } from '@/hooks/useDownloadExtensionDetector';
import { useToast } from '@/hooks/useToast';
import { YouTubeSkeleton } from '@/components/ui/LoadingSkeleton';
import Link from 'next/link';
import {
  getCurrentDateBrazil,
  convertToBrazilTimezone,
  getDateOnlyBrazil,
  compareDatesOnly,
  isTodayBrazil,
  isYesterdayBrazil,
  formatDateBrazil,
  getDateKeyBrazil
} from '@/utils/dateUtils';

// Componente de Loading para a página
const PageSkeleton = () => <YouTubeSkeleton />;

// Componente principal da página
function NewPageContent() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Estados para filtros
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedPool, setSelectedPool] = useState('all');

  // Estados para dados dos filtros
  const [genres, setGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [versions, setVersions] = useState<string[]>([]);
  const [pools, setPools] = useState<string[]>([]);
  const [monthOptions, setMonthOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Estados para fila de downloads (movidos da MusicTable)
  const [downloadQueue, setDownloadQueue] = useState<Track[]>([]);
  const [isDownloadingQueue, setIsDownloadingQueue] = useState(false);
  const [zipProgress, setZipProgress] = useState<{
    isActive: boolean;
    progress: number;
    current: number;
    total: number;
    trackName: string;
    elapsedTime: number;
    remainingTime: number;
    isGenerating: boolean;
  }>({
    isActive: false,
    progress: 0,
    current: 0,
    total: 0,
    trackName: '',
    elapsedTime: 0,
    remainingTime: 0,
    isGenerating: false
  });

  // Estado para controlar o cancelamento
  const [cancelZipGeneration, setCancelZipGeneration] = useState(false);

  // Estado para estatísticas reais
  const [stats, setStats] = useState({
    downloadsToday: 0,
    totalLikes: 0,
    vipUsersCount: 0,
    totalTracks: 0
  });

  // SEO para a página
  const { seoData } = useSEO({
    customTitle: 'Novos Lançamentos - Músicas Eletrônicas',
    customDescription: 'Descubra os mais recentes lançamentos de música eletrônica. House, Techno, Trance e muito mais em alta qualidade.',
    customKeywords: 'novos lançamentos, música eletrônica, house, techno, trance, DJ, downloads'
  });

  // Função para agrupar músicas por data de lançamento
  const groupTracksByReleaseDate = useMemo(() => {
    const grouped: { [key: string]: Track[] } = {};

    tracks.forEach(track => {
      if (track.releaseDate) {
        // Usar timezone do Brasil
        const dateKey = getDateKeyBrazil(track.releaseDate);

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(track);
      } else {
        // Se não tem releaseDate, colocar em "Sem Data"
        if (!grouped['no-date']) {
          grouped['no-date'] = [];
        }
        grouped['no-date'].push(track);
      }
    });

    // Ordenar as chaves para exibir na ordem correta
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === 'future') return -1;
      if (b === 'future') return 1;
      if (a === 'today') return -1;
      if (b === 'today') return 1;
      if (a === 'yesterday') return -1;
      if (b === 'yesterday') return 1;
      if (a === 'no-date') return 1;
      if (b === 'no-date') return 1;
      return b.localeCompare(a); // Ordem decrescente para datas passadas
    });

    return { grouped, sortedKeys };
  }, [tracks]);

  // Função para obter o label da data
  const getDateLabel = (dateKey: string) => {
    if (dateKey === 'today') return 'Hoje';
    if (dateKey === 'yesterday') return 'Ontem';
    if (dateKey === 'future') return 'Próximos Lançamentos';
    if (dateKey === 'no-date') return 'Sem Data';

    // Para datas específicas, usar timezone do Brasil
    return formatDateBrazil(dateKey);
  };

  // Calcular automaticamente se há filtros ativos
  useEffect(() => {
    const hasFilters = selectedGenre !== 'all' ||
      selectedArtist !== 'all' ||
      selectedDateRange !== 'all' ||
      selectedVersion !== 'all' ||
      selectedMonth !== 'all' ||
      selectedPool !== 'all';

    setHasActiveFilters(hasFilters);
  }, [selectedGenre, selectedArtist, selectedDateRange, selectedVersion, selectedMonth, selectedPool]);

  // Fetch estatísticas reais
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  }, []);

  // Fetch tracks com filtros
  const fetchTracks = useCallback(async () => {
    try {
      setLoading(true);
      showToast('🔄 Carregando músicas...', 'info');

      const response = await fetch('/api/tracks');
      if (response.ok) {
        const data = await response.json();
        // Corrige para aceitar diferentes formatos de resposta
        let tracksData: Track[] = [];
        if (Array.isArray(data.tracks)) {
          tracksData = data.tracks;
        } else if (Array.isArray(data)) {
          tracksData = data;
        } else if (Array.isArray(data.data?.tracks)) {
          tracksData = data.data.tracks;
        }

        setTracks(tracksData);

        // Extrair dados para filtros
        const uniqueGenres = [...new Set(tracksData.map(track => track.style))];
        const uniqueArtists = [...new Set(tracksData.map(track => track.artist))];
        const uniqueVersions = [...new Set(tracksData.map(track => track.version || 'Original'))];
        const uniquePools = [...new Set(tracksData.map(track => track.pool || 'Nexor Records'))];

        setGenres(uniqueGenres);
        setArtists(uniqueArtists);
        setVersions(uniqueVersions);
        setPools(uniquePools);

        // Gerar opções de meses
        const months = [
          { value: 'Janeiro', label: 'Janeiro' },
          { value: 'Fevereiro', label: 'Fevereiro' },
          { value: 'Março', label: 'Março' },
          { value: 'Abril', label: 'Abril' },
          { value: 'Maio', label: 'Maio' },
          { value: 'Junho', label: 'Junho' },
          { value: 'Julho', label: 'Julho' },
          { value: 'Agosto', label: 'Agosto' },
          { value: 'Setembro', label: 'Setembro' },
          { value: 'Outubro', label: 'Outubro' },
          { value: 'Novembro', label: 'Novembro' },
          { value: 'Dezembro', label: 'Dezembro' }
        ];
        setMonthOptions(months);

        showToast(`✅ ${tracksData.length} músicas carregadas!`, 'success');
      } else {
        setTracks([]);
        showToast('❌ Erro ao carregar músicas', 'error');
      }
    } catch (error) {
      console.error('Erro ao buscar músicas:', error);
      setTracks([]);
      showToast('❌ Erro ao carregar músicas', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Carregamento inicial
  useEffect(() => {
    fetchTracks();
    fetchStats();
  }, [fetchTracks, fetchStats]);

  // Funções para filtros
  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    showToast(`🎵 Filtro de gênero: ${genre}`, 'info');
  };

  const handleArtistChange = (artist: string) => {
    setSelectedArtist(artist);
    showToast(`🎤 Filtro de artista: ${artist}`, 'info');
  };

  const handleDateRangeChange = (dateRange: string) => {
    setSelectedDateRange(dateRange);
    showToast(`📅 Filtro de período: ${dateRange}`, 'info');
  };

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version);
    showToast(`🎧 Filtro de versão: ${version}`, 'info');
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    showToast(`📆 Filtro de mês: ${month}`, 'info');
  };

  const handlePoolChange = (pool: string) => {
    setSelectedPool(pool);
    showToast(`🏢 Filtro de pool: ${pool}`, 'info');
  };

  const handleApplyFilters = () => {
    // Verificar se há filtros ativos
    const hasFilters = selectedGenre !== 'all' ||
      selectedArtist !== 'all' ||
      selectedDateRange !== 'all' ||
      selectedVersion !== 'all' ||
      selectedMonth !== 'all' ||
      selectedPool !== 'all';

    setHasActiveFilters(hasFilters);
    showToast('✅ Filtros aplicados!', 'success');
    setShowFiltersModal(false);
  };

  const handleClearFilters = () => {
    setSelectedGenre('all');
    setSelectedArtist('all');
    setSelectedDateRange('all');
    setSelectedVersion('all');
    setSelectedMonth('all');
    setSelectedPool('all');
    setHasActiveFilters(false);
    showToast('🧹 Filtros limpos!', 'success');
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      showToast(`🔍 Buscando por: "${searchQuery}"`, 'info');
    }
  };

  // Função para adicionar/remover da fila
  const onToggleQueue = (track: Track) => {
    const isInQueue = downloadQueue.some(t => t.id === track.id);

    if (!isInQueue) {
      // Verificar limite de 20 músicas
      if (downloadQueue.length >= 20) {
        showToast('⚠️ Limite de 20 músicas atingido! Remova algumas músicas da fila antes de adicionar mais.', 'warning');
        return;
      }

      // Avisar se o ZIP está sendo gerado
      if (zipProgress.isActive) {
        showToast('⚠️ ZIP em geração! A música será adicionada à fila atual.', 'info');
      }

      setDownloadQueue(prev => [...prev, track]);
      showToast(`📦 "${track.songName}" adicionada à fila`, 'success');

      // Adicionar classe de animação ao ícone
      const icon = document.querySelector('.download-queue-icon');
      if (icon) {
        icon.classList.add('animate-bounce');
        setTimeout(() => {
          icon.classList.remove('animate-bounce');
        }, 1000);
      }
    } else {
      setDownloadQueue(prev => prev.filter(t => t.id !== track.id));
      showToast(`📦 "${track.songName}" removida da fila`, 'success');
    }
  };

  // Função para cancelar geração do ZIP
  const handleCancelZipGeneration = () => {
    setCancelZipGeneration(true);
    setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
    setIsDownloadingQueue(false);
    showToast('❌ Geração do ZIP cancelada', 'warning');
  };

  // Função para download em lote (ZIP)
  const handleDownloadQueue = async () => {
    if (!session?.user) {
      showToast('👤 Faça login para fazer downloads', 'warning');
      return;
    }

    if (downloadQueue.length === 0) {
      showToast('📦 Adicione músicas à fila primeiro', 'warning');
      return;
    }

    setCancelZipGeneration(false);
    setIsDownloadingQueue(true);
    setZipProgress(prev => ({ ...prev, isActive: true, isGenerating: true }));

    // Timeout de 5 minutos
    const timeout = setTimeout(() => {
      setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
      setIsDownloadingQueue(false);
      showToast('⏰ Timeout - download em lote demorou muito', 'error');
    }, 5 * 60 * 1000);

    try {
      const trackIds = downloadQueue.map(track => track.id);
      const filename = `nexor-records-${new Date().toISOString().split('T')[0]}.zip`;

      const response = await fetch('/api/downloads/zip-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackIds, filename })
      });

      if (!response.ok) {
        throw new Error('Erro ao iniciar download em lote');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Erro ao ler resposta do servidor');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        // Verificar se foi cancelado
        if (cancelZipGeneration) {
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        buffer += chunk;

        // Processar linhas completas
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Manter linha incompleta no buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = line.slice(6).trim();

              // Verificar se a linha não está vazia
              if (!jsonData) {
                continue;
              }

              const data = JSON.parse(jsonData);

              if (data.type === 'progress') {
                setZipProgress(prev => ({
                  ...prev,
                  progress: data.progress,
                  current: data.current,
                  total: data.total,
                  trackName: data.trackName,
                  elapsedTime: data.elapsedTime,
                  remainingTime: data.remainingTime
                }));
              } else if (data.type === 'complete') {
                console.log('✅ ZIP gerado com sucesso');

                // Verificar se zipData existe
                if (!data.zipData) {
                  throw new Error('Dados do ZIP não recebidos');
                }

                // Decodificar dados do ZIP
                const zipBuffer = atob(data.zipData);
                const bytes = new Uint8Array(zipBuffer.length);
                for (let i = 0; i < zipBuffer.length; i++) {
                  bytes[i] = zipBuffer.charCodeAt(i);
                }

                // Criar blob e fazer download
                const blob = new Blob([bytes], { type: 'application/zip' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // Limpar fila e estados
                setDownloadQueue([]);
                setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
                setIsDownloadingQueue(false);
                clearTimeout(timeout);

                showToast('✅ Download em lote concluído!', 'success');
              } else if (data.type === 'error') {
                throw new Error(data.message || 'Erro ao gerar ZIP');
              }
            } catch (error) {
              console.error('Erro ao processar dados do ZIP:', error);
              console.error('Linha problemática:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro no download em lote:', error);
      setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
      setIsDownloadingQueue(false);
      clearTimeout(timeout);
      showToast('❌ Erro ao fazer download em lote', 'error');
    }
  };



  return (
    <div className="min-h-screen bg-[#1B1C1D] relative overflow-hidden z-0" style={{ zIndex: 0 }}>
      {/* SEO Components */}
      {seoData && <SEOHead {...seoData} />}
      {tracks.length > 0 && <MusicStructuredData track={tracks[0]} url={window.location.href} />}

      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Header />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pt-16 sm:pt-20 relative z-10">
        {/* Hero Section - Primeiro Slide */}
        <div className="mb-8 sm:mb-12">
          {/* Header da página */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Novidades</h1>
            {hasActiveFilters && (
              <div className="flex items-center space-x-2 text-orange-400 mt-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filtros ativos</span>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Music className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total de Músicas</p>
                  <p className="text-2xl font-bold text-white">{stats.totalTracks}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Downloads Hoje</p>
                  <p className="text-2xl font-bold text-white">{stats.downloadsToday}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Likes</p>
                  <p className="text-2xl font-bold text-white">{stats.totalLikes}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500/20 to-red-600/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Usuários VIP</p>
                  <p className="text-2xl font-bold text-white">{stats.vipUsersCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Pesquisa e Filtros */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Barra de Pesquisa */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar músicas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="w-full pl-12 pr-4 py-4 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                />
              </div>

              {/* Botão de Filtros */}
              <button
                onClick={() => setShowFiltersModal(true)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${hasActiveFilters
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-black/30 backdrop-blur-xl border border-white/10 text-gray-300 hover:bg-black/50 hover:border-white/20'
                  }`}
              >
                <Filter className="h-5 w-5" />
                <span>Filtros</span>
                {hasActiveFilters && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            </div>
          </div>

          {/* Loading State */}
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
              <div className="space-y-8">
                {groupTracksByReleaseDate.sortedKeys.map((dateKey) => {
                  const tracksForDate = groupTracksByReleaseDate.grouped[dateKey];
                  const dateLabel = getDateLabel(dateKey);

                  return (
                    <div key={dateKey} className="space-y-4">
                      {/* Header da Data */}
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-white capitalize">
                          {dateLabel}
                        </h2>
                        <span className="text-sm text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                          {tracksForDate.length} {tracksForDate.length === 1 ? 'música' : 'músicas'}
                        </span>
                      </div>

                      {/* Tabela para esta data */}
                      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                        <MusicTable tracks={tracksForDate} onToggleQueue={onToggleQueue} externalDownloadQueue={downloadQueue} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal de Filtros */}
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
          onGenreChange={handleGenreChange}
          onArtistChange={handleArtistChange}
          onDateRangeChange={handleDateRangeChange}
          onVersionChange={handleVersionChange}
          onMonthChange={handleMonthChange}
          onPoolChange={handlePoolChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          isLoading={loading}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Ícone Flutuante da Fila de Downloads */}
        {downloadQueue.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={handleDownloadQueue}
              disabled={isDownloadingQueue || zipProgress.isActive}
              className="relative group"
              title={`Fila de Downloads (${downloadQueue.length}/20) - Máximo 20 músicas - Clique para gerar ZIP`}
            >
              {/* Ícone principal */}
              <div className="relative">
                <div className="download-queue-icon w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group-hover:shadow-blue-500/50">
                  {isDownloadingQueue || zipProgress.isActive ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <ShoppingCart className="h-8 w-8 text-white" />
                  )}
                </div>

                {/* Contador */}
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                  {downloadQueue.length}
                </div>

                {/* Animação de pulso quando adiciona música */}
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {isDownloadingQueue || zipProgress.isActive ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {zipProgress.isGenerating ? 'Processando...' : 'Baixando...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Gerar ZIP ({downloadQueue.length}/20 músicas)
                  </div>
                )}
              </div>
            </button>

            {/* Botão para limpar fila ou cancelar ZIP */}
            <button
              onClick={zipProgress.isActive ? handleCancelZipGeneration : () => setDownloadQueue([])}
              disabled={isDownloadingQueue && !zipProgress.isActive}
              className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title={zipProgress.isActive ? "Cancelar geração do ZIP" : "Limpar fila"}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Progress Bar Flutuante */}
        {zipProgress.isActive && (
          <div className="fixed bottom-24 right-6 z-50 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-medium">
                  {zipProgress.trackName}
                </span>
                <button
                  onClick={handleCancelZipGeneration}
                  className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200"
                  title="Cancelar geração do ZIP"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <span className="text-sm text-gray-300">
                {zipProgress.current}/{zipProgress.total} ({zipProgress.progress}%)
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${zipProgress.progress}%` }}
              ></div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// Componente principal com Suspense
export default function NewPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewPageContent />
    </Suspense>
  );
}