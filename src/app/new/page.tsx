// src/app/new/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, Filter, Music, Loader2, Sparkles, Clock, Star, CheckCircle, Waves, ShoppingCart, Package, X, Crown, Play, Download, Heart, Users } from 'lucide-react';
import NewFooter from '@/components/layout/NewFooter';
import { Track } from '@/types/track';

// Tipo para o progresso do ZIP
type ZipProgressState = {
  isActive: boolean;
  progress: number;
  current: number;
  total: number;
  trackName: string;
  elapsedTime: number;
  remainingTime: number;
  isGenerating: boolean;
};

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

// Função temporária para corrigir problema de timezone
const getCorrectDateKey = (dateString: string): string => {
  try {
    // Extrair apenas a parte da data (YYYY-MM-DD) se vier com timestamp
    const dateOnly = dateString.split('T')[0];

    // Assumir que a data vem no formato YYYY-MM-DD
    const trackDate = new Date(dateOnly + 'T00:00:00-03:00'); // Forçar timezone Brasil

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zerar horas para comparação

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const trackDateOnly = new Date(trackDate);
    trackDateOnly.setHours(0, 0, 0, 0);

    // Comparar timestamps
    if (trackDateOnly.getTime() === today.getTime()) {
      return 'today';
    }
    if (trackDateOnly.getTime() === yesterday.getTime()) {
      return 'yesterday';
    }
    if (trackDateOnly.getTime() > today.getTime()) {
      return 'future';
    }

    // Para outras datas, retornar a data original para que possamos formatá-la depois
    return dateOnly;
  } catch (error) {
    console.error('Erro ao processar data:', dateString, error);
    return 'no-date'; // Retornar uma chave válida em vez da string original
  }
};

// Componente principal da página
function NewPageContent() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Termo que o usuário está digitando
  const [appliedSearchQuery, setAppliedSearchQuery] = useState(''); // Termo aplicado aos filtros
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Estados para filtros
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedPool, setSelectedPool] = useState('all');

  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const daysPerPage = 7; // Mostrar exatamente 7 dias por página

  // Estados para dados dos filtros
  const [genres, setGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [versions, setVersions] = useState<string[]>([]);
  const [pools, setPools] = useState<string[]>([]);
  const [monthOptions, setMonthOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Estados para fila de downloads (movidos da MusicTable)
  const [downloadQueue, setDownloadQueue] = useState<Track[]>([]);
  const [isDownloadingQueue, setIsDownloadingQueue] = useState(false);
  const [zipProgress, setZipProgress] = useState<ZipProgressState>({
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

  // Função para atualizar URL com parâmetros de pesquisa e filtros
  const updateURL = useCallback((appliedSearchQuery: string, filters: any, page: number = 1) => {
    const params = new URLSearchParams();

    // Adicionar pesquisa se existir
    if (appliedSearchQuery.trim()) {
      params.set('q', appliedSearchQuery.trim());
    }

    // Adicionar filtros ativos
    const activeFilters: string[] = [];
    if (filters.genre !== 'all') activeFilters.push(`genres=${encodeURIComponent(filters.genre)}`);
    if (filters.artist !== 'all') activeFilters.push(`artist=${encodeURIComponent(filters.artist)}`);
    if (filters.version !== 'all') activeFilters.push(`version=${encodeURIComponent(filters.version)}`);
    if (filters.pool !== 'all') activeFilters.push(`pool=${encodeURIComponent(filters.pool)}`);
    if (filters.dateRange !== 'all') activeFilters.push(`date=${encodeURIComponent(filters.dateRange)}`);
    if (filters.month !== 'all') activeFilters.push(`uploadDate=${encodeURIComponent(filters.month)}`);
    if (page > 1) activeFilters.push(`page=${page}`);

    let newUrl = pathname;
    if (params.toString()) {
      newUrl += `?${params.toString()}`;
    }

    if (activeFilters.length > 0) {
      newUrl += `#${activeFilters.join('&')}`;
    }

    router.replace(newUrl, { scroll: false });
  }, [pathname, router]);

  // Função para ler parâmetros da URL na inicialização
  const initializeFromURL = useCallback(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      setAppliedSearchQuery(q);
    }

    // Ler filtros do hash
    const hash = window.location.hash.substring(1);
    if (hash) {
      const hashParams = new URLSearchParams(hash);
      const genres = hashParams.get('genres');
      const artist = hashParams.get('artist');
      const version = hashParams.get('version');
      const pool = hashParams.get('pool');
      const date = hashParams.get('date');
      const uploadDate = hashParams.get('uploadDate'); // Novo parâmetro
      const page = hashParams.get('page'); // Parâmetro de página

      if (genres) setSelectedGenre(decodeURIComponent(genres));
      if (artist) setSelectedArtist(decodeURIComponent(artist));
      if (version) setSelectedVersion(decodeURIComponent(version));
      if (pool) setSelectedPool(decodeURIComponent(pool));
      if (date) setSelectedDateRange(decodeURIComponent(date));
      if (uploadDate) setSelectedMonth(decodeURIComponent(uploadDate));
      if (page) setCurrentPage(parseInt(page) || 1);
    }
  }, [searchParams]);

  // Inicializar valores da URL quando a página carrega
  useEffect(() => {
    initializeFromURL();
  }, [initializeFromURL]);

  // Filtrar tracks com base na pesquisa e filtros
  const filteredTracks = useMemo(() => {
    let filtered = [...tracks];

    // Aplicar pesquisa
    if (appliedSearchQuery.trim()) {
      const query = appliedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(track =>
        track.songName.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.style.toLowerCase().includes(query) ||
        (track.version && track.version.toLowerCase().includes(query)) ||
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

    if (selectedVersion !== 'all') {
      filtered = filtered.filter(track => {
        const trackVersion = track.version && track.version.trim() !== ''
          ? track.version.trim()
          : 'Original';
        return trackVersion === selectedVersion;
      });
    }

    if (selectedPool !== 'all') {
      filtered = filtered.filter(track => track.pool === selectedPool);
    }

    if (selectedDateRange !== 'all') {
      const currentDate = getCurrentDateBrazil();
      filtered = filtered.filter(track => {
        if (!track.releaseDate) return selectedDateRange === 'no-date';

        const trackDate = convertToBrazilTimezone(track.releaseDate);

        switch (selectedDateRange) {
          case 'today':
            return isTodayBrazil(trackDate);
          case 'yesterday':
            return isYesterdayBrazil(trackDate);
          case 'this-week':
            return (currentDate.getTime() - trackDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
          case 'this-month':
            return trackDate.getMonth() === currentDate.getMonth() &&
              trackDate.getFullYear() === currentDate.getFullYear();
          default:
            return true;
        }
      });
    }

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(track => {
        if (!track.releaseDate) return false;
        const trackDate = new Date(track.releaseDate);
        const year = trackDate.getFullYear();
        const month = trackDate.getMonth(); // 0-11
        const monthYear = `${year}-${String(month + 1).padStart(2, '0')}`;
        return monthYear === selectedMonth;
      });
    }

    return filtered;
  }, [tracks, appliedSearchQuery, selectedGenre, selectedArtist, selectedVersion, selectedPool, selectedDateRange, selectedMonth]);

  // Função para obter o label da data
  const getDateLabel = (dateKey: string) => {
    if (dateKey === 'today') {
      const today = new Date();
      const formattedToday = formatDateBrazil(today);
      return `Hoje, ${formattedToday}`;
    }
    if (dateKey === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedYesterday = formatDateBrazil(yesterday);
      return `Ontem, ${formattedYesterday}`;
    }
    if (dateKey === 'future') return 'Próximos Lançamentos';
    if (dateKey === 'no-date') return 'Sem Data';

    // Se é um dia da semana (não deveria mais entrar aqui com a nova lógica)
    if (dateKey.startsWith('weekday-')) {
      const dayName = dateKey.replace('weekday-', '');
      return dayName;
    }

    // Se recebeu uma data em formato ISO, extrair apenas a parte da data
    if (dateKey.includes('T') && dateKey.includes('Z')) {
      const dateOnly = dateKey.split('T')[0];
      try {
        const date = new Date(dateOnly + 'T00:00:00-03:00');
        if (!isNaN(date.getTime())) {
          const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });
          const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
          const formattedDate = formatDateBrazil(date);
          return `${capitalizedDay}, ${formattedDate}`;
        }
      } catch (error) {
        console.error(`❌ Erro ao formatar data ISO ${dateKey}:`, error);
      }
    }

    // Para datas específicas no formato YYYY-MM-DD
    try {
      // Garantir que seja uma data válida antes de formatar
      const date = new Date(dateKey + 'T00:00:00-03:00');
      if (isNaN(date.getTime())) {
        console.error(`❌ Data inválida: ${dateKey}`);
        return 'Data Inválida'; // Retorna um label mais amigável
      }
      const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });
      const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
      const formattedDate = formatDateBrazil(date);
      return `${capitalizedDay}, ${formattedDate}`;
    } catch (error) {
      console.error(`❌ Erro ao formatar data ${dateKey}:`, error);
      return 'Data Inválida'; // Retorna um label mais amigável
    }
  };  // Função para agrupar músicas por data de lançamento
  const groupTracksByReleaseDate = useMemo(() => {
    const grouped: { [key: string]: Track[] } = {};
    const dateKeyStats: { [key: string]: number } = {};

    filteredTracks.forEach((track, index) => {
      if (track.releaseDate) {
        // Usar nossa função corrigida
        const dateKey = getCorrectDateKey(track.releaseDate);

        // Contar estatísticas
        dateKeyStats[dateKey] = (dateKeyStats[dateKey] || 0) + 1;

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
        dateKeyStats['no-date'] = (dateKeyStats['no-date'] || 0) + 1;
      }
    });    // Mostrar estatísticas
    console.log('📊 Estatísticas de agrupamento:', dateKeyStats);
    console.log('📊 Total de grupos:', Object.keys(grouped).length);    // Ordenar as chaves para exibir na ordem correta
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === 'future') return -1;
      if (b === 'future') return 1;
      if (a === 'today') return -1;
      if (b === 'today') return 1;
      if (a === 'yesterday') return -1;
      if (b === 'yesterday') return 1;
      if (a === 'no-date') return 1;
      if (b === 'no-date') return -1;

      // Para dias da semana, ordenar cronologicamente
      if (a.startsWith('weekday-') && b.startsWith('weekday-')) {
        return b.localeCompare(a); // Ordem decrescente
      }
      if (a.startsWith('weekday-')) return -1;
      if (b.startsWith('weekday-')) return 1;

      return b.localeCompare(a); // Ordem decrescente para datas passadas
    });

    // Aplicar paginação: 7 dias por página
    const totalPages = Math.ceil(sortedKeys.length / daysPerPage);
    const startIndex = (currentPage - 1) * daysPerPage;
    const endIndex = startIndex + daysPerPage;
    const paginatedKeys = sortedKeys.slice(startIndex, endIndex);

    // Criar objeto agrupado apenas com as chaves da página atual
    const paginatedGrouped: { [key: string]: Track[] } = {};
    paginatedKeys.forEach(key => {
      paginatedGrouped[key] = grouped[key];
    });

    return {
      grouped: paginatedGrouped,
      sortedKeys: paginatedKeys,
      totalPages,
      totalDays: sortedKeys.length,
      currentPage
    };
  }, [filteredTracks, tracks, currentPage, daysPerPage]);

  // Calcular automaticamente se há filtros ativos
  useEffect(() => {
    const hasFilters = appliedSearchQuery.trim() !== '' ||
      selectedGenre !== 'all' ||
      selectedArtist !== 'all' ||
      selectedDateRange !== 'all' ||
      selectedVersion !== 'all' ||
      selectedMonth !== 'all' ||
      selectedPool !== 'all';

    setHasActiveFilters(hasFilters);
  }, [appliedSearchQuery, selectedGenre, selectedArtist, selectedDateRange, selectedVersion, selectedMonth, selectedPool]);

  // Função para mudar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL(appliedSearchQuery, {
      genre: selectedGenre,
      artist: selectedArtist,
      version: selectedVersion,
      pool: selectedPool,
      dateRange: selectedDateRange,
      month: selectedMonth
    }, page);
  };

  // Resetar página quando filtros mudarem
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [selectedGenre, selectedArtist, selectedVersion, selectedPool, selectedDateRange, selectedMonth, appliedSearchQuery]);

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
        const uniqueGenres = [...new Set(tracksData.map(track => track.style))].filter(Boolean).sort();
        const uniqueArtists = [...new Set(tracksData.map(track => track.artist))].filter(Boolean).sort();

        // Para versões, usar apenas os dados reais do banco de dados
        const versionSet = new Set<string>();

        tracksData.forEach(track => {
          if (track.version && track.version.trim() !== '') {
            versionSet.add(track.version.trim());
          }
        });

        const uniqueVersions = Array.from(versionSet).sort();
        const uniquePools = [...new Set(tracksData.map(track => track.pool || 'Nexor Records'))].filter(Boolean).sort();

        // Log para debug - mostra o que foi encontrado
        console.log('🎵 Gêneros/Estilos encontrados:', uniqueGenres.length, uniqueGenres);
        console.log('🎧 Versões reais do banco:', uniqueVersions.length, uniqueVersions);
        console.log('📊 Análise de dados:', {
          totalTracks: tracksData.length,
          tracksWithVersion: tracksData.filter(t => t.version && t.version.trim() !== '').length,
          tracksWithoutVersion: tracksData.filter(t => !t.version || t.version.trim() === '').length,
          tracksWithStyle: tracksData.filter(t => t.style && t.style.trim() !== '').length,
          exemploStyles: [...new Set(tracksData.slice(0, 10).map(t => t.style))],
          exemploVersionsReais: tracksData.slice(0, 10).map(t => ({ artist: t.artist, title: t.title, version: t.version || 'SEM_VERSÃO' }))
        });

        setGenres(uniqueGenres);
        setArtists(uniqueArtists);
        setVersions(uniqueVersions);
        setPools(uniquePools);

        // Gerar opções de meses baseadas nas datas reais das tracks
        const monthsWithData = new Set<string>();
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        tracksData.forEach(track => {
          // Usar releaseDate como proxy para uploadDate por enquanto
          // TODO: Implementar campo uploadDate/createdAt se necessário
          if (track.releaseDate) {
            try {
              const date = new Date(track.releaseDate);
              // Verificar se a data é válida
              if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = date.getMonth(); // 0-11
                const monthYear = `${year}-${String(month + 1).padStart(2, '0')}`;
                const label = `${monthNames[month]} ${year}`;

                monthsWithData.add(`${monthYear}|${label}`);
              }
            } catch (error) {
              console.warn('Data inválida encontrada:', track.releaseDate, error);
            }
          }
        });

        // Converter para o formato esperado pelo componente
        const monthOptions = Array.from(monthsWithData)
          .map(item => {
            const [value, label] = item.split('|');
            return { value, label };
          })
          .sort((a, b) => {
            // Ordenar por ano/mês descendente (mais recente primeiro)
            return b.value.localeCompare(a.value);
          });

        console.log('📅 Meses com atualizações encontrados:', monthOptions);
        console.log('📊 Exemplo de URL que será gerada: /new#uploadDate=2025-08');
        setMonthOptions(monthOptions);

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
    updateURL(appliedSearchQuery, {
      genre,
      artist: selectedArtist,
      version: selectedVersion,
      pool: selectedPool,
      dateRange: selectedDateRange,
      month: selectedMonth
    });
    showToast(`🎵 Filtro de gênero: ${genre}`, 'info');
  };

  const handleArtistChange = (artist: string) => {
    setSelectedArtist(artist);
    updateURL(appliedSearchQuery, {
      genre: selectedGenre,
      artist,
      version: selectedVersion,
      pool: selectedPool,
      dateRange: selectedDateRange,
      month: selectedMonth
    });
    showToast(`🎤 Filtro de artista: ${artist}`, 'info');
  };

  const handleDateRangeChange = (dateRange: string) => {
    setSelectedDateRange(dateRange);
    updateURL(appliedSearchQuery, {
      genre: selectedGenre,
      artist: selectedArtist,
      version: selectedVersion,
      pool: selectedPool,
      dateRange,
      month: selectedMonth
    });
    showToast(`📅 Filtro de data: ${dateRange}`, 'info');
  };

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version);
    updateURL(appliedSearchQuery, {
      genre: selectedGenre,
      artist: selectedArtist,
      version,
      pool: selectedPool,
      dateRange: selectedDateRange,
      month: selectedMonth
    });
    showToast(`🎧 Filtro de versão: ${version}`, 'info');
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    updateURL(appliedSearchQuery, {
      genre: selectedGenre,
      artist: selectedArtist,
      version: selectedVersion,
      pool: selectedPool,
      dateRange: selectedDateRange,
      month
    });
    showToast(`📅 Filtro de mês: ${month}`, 'info');
  };

  const handlePoolChange = (pool: string) => {
    setSelectedPool(pool);
    updateURL(appliedSearchQuery, {
      genre: selectedGenre,
      artist: selectedArtist,
      version: selectedVersion,
      pool,
      dateRange: selectedDateRange,
      month: selectedMonth
    });
    showToast(`🏊 Filtro de pool: ${pool}`, 'info');
  };

  const handleApplyFilters = () => {
    // Verificar se há filtros ativos
    const hasFilters = appliedSearchQuery.trim() !== '' ||
      selectedGenre !== 'all' ||
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
    setSearchQuery('');
    setAppliedSearchQuery('');
    setHasActiveFilters(false);

    updateURL('', {
      genre: 'all',
      artist: 'all',
      version: 'all',
      pool: 'all',
      dateRange: 'all',
      month: 'all'
    });

    showToast('🧹 Filtros e pesquisa limpos!', 'success');
  };

  // Função para limpar apenas a pesquisa
  const handleClearSearch = () => {
    setSearchQuery('');
    setAppliedSearchQuery('');
    updateURL('', {
      genre: selectedGenre,
      artist: selectedArtist,
      version: selectedVersion,
      pool: selectedPool,
      dateRange: selectedDateRange,
      month: selectedMonth
    });
    showToast('🧹 Pesquisa limpa!', 'info');
  };

  // Função para lidar com mudanças na pesquisa (apenas estado local)
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = () => {
    const trimmedQuery = searchQuery.trim();
    setAppliedSearchQuery(trimmedQuery);

    updateURL(trimmedQuery, {
      genre: selectedGenre,
      artist: selectedArtist,
      version: selectedVersion,
      pool: selectedPool,
      dateRange: selectedDateRange,
      month: selectedMonth
    });

    if (trimmedQuery) {
      showToast(`🔍 Buscando por: "${trimmedQuery}"`, 'info');
    } else {
      showToast('🧹 Pesquisa limpa!', 'info');
    }
  };

  // Função para adicionar/remover da fila
  const onToggleQueue = (track: Track) => {
    const isInQueue = downloadQueue.some((t: Track) => t.id === track.id);

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

      setDownloadQueue((prev: Track[]) => [...prev, track]);
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
      setDownloadQueue(prev => prev.filter((t: Track) => t.id !== track.id));
      showToast(`📦 "${track.songName}" removida da fila`, 'success');
    }
  };

  // Função para cancelar geração do ZIP
  const handleCancelZipGeneration = () => {
    setCancelZipGeneration(true);
    setZipProgress((prev: ZipProgressState) => ({ ...prev, isActive: false, isGenerating: false }));
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
    setZipProgress((prev: ZipProgressState) => ({ ...prev, isActive: true, isGenerating: true }));

    // Timeout de 5 minutos
    const timeout = setTimeout(() => {
      setZipProgress((prev: ZipProgressState) => ({ ...prev, isActive: false, isGenerating: false }));
      setIsDownloadingQueue(false);
      showToast('⏰ Timeout - download em lote demorou muito', 'error');
    }, 5 * 60 * 1000);

    try {
      const trackIds = downloadQueue.map((track: Track) => track.id);
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
                setZipProgress((prev: ZipProgressState) => ({
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
                setZipProgress((prev: ZipProgressState) => ({ ...prev, isActive: false, isGenerating: false }));
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
      setZipProgress((prev: ZipProgressState) => ({ ...prev, isActive: false, isGenerating: false }));
      setIsDownloadingQueue(false);
      clearTimeout(timeout);
      showToast('❌ Erro ao fazer download em lote', 'error');
    }
  };

  // Renderização do componente
  return (
    <div className="min-h-screen bg-[#121212] relative overflow-hidden z-0" style={{ zIndex: 0 }}>
      {/* SEO Components */}
      {seoData && <SEOHead {...seoData} />}
      {tracks.length > 0 && (
        <MusicStructuredData
          track={{
            ...tracks[0],
            imageUrl: tracks[0].imageUrl ?? '',
          }}
          url={window.location.href}
        />
      )}

      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#202A3C]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#26222D]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#202A3C]/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Header />
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pt-16 sm:pt-20 relative z-10">
        {/* Hero Section - Primeiro Slide */}
        <div className="mb-8 sm:mb-12">
          {/* Header da página */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Novidades</h1>

            {/* Indicadores de filtros ativos */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {appliedSearchQuery && (
                <div className="flex items-center space-x-2 bg-[#202A3C]/60 text-blue-400 px-3 py-1 rounded-full text-sm border border-[#26222D]/50">
                  <Search className="h-3 w-3" />
                  <span>Pesquisando: "{appliedSearchQuery}"</span>
                  <button
                    onClick={handleClearSearch}
                    className="hover:text-blue-300 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {hasActiveFilters && !appliedSearchQuery && (
                <div className="flex items-center space-x-2 text-orange-400">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">Filtros ativos</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#202A3C]/80 backdrop-blur-sm rounded-xl border border-[#26222D]/50 p-6 hover:scale-105 transition-all duration-300">
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

            <div className="bg-[#202A3C]/80 backdrop-blur-sm rounded-xl border border-[#26222D]/50 p-6 hover:scale-105 transition-all duration-300">
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

            <div className="bg-[#202A3C]/80 backdrop-blur-sm rounded-xl border border-[#26222D]/50 p-6 hover:scale-105 transition-all duration-300">
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

            <div className="bg-[#202A3C]/80 backdrop-blur-sm rounded-xl border border-[#26222D]/50 p-6 hover:scale-105 transition-all duration-300">
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
              <div className="flex-1 relative flex">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar músicas..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    className="w-full pl-12 pr-12 py-4 bg-[#26222D]/60 backdrop-blur-xl border border-[#202A3C]/50 rounded-l-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  />

                  {/* Botão X para limpar pesquisa */}
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Botão de Pesquisa */}
                <button
                  onClick={handleSearchSubmit}
                  disabled={!searchQuery.trim()}
                  className={`px-6 py-4 text-white rounded-r-2xl font-semibold transition-all duration-300 shadow-lg flex items-center gap-2 ${searchQuery.trim()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-blue-500/25'
                    : 'bg-gray-600 cursor-not-allowed shadow-gray-600/25'
                    }`}
                >
                  <Search className="h-5 w-5" />
                  <span className="hidden sm:inline">Buscar</span>
                </button>
              </div>

              {/* Botão de Filtros */}
              <button
                onClick={() => setShowFiltersModal(true)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${hasActiveFilters
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-[#26222D]/60 backdrop-blur-xl border border-[#202A3C]/50 text-gray-300 hover:bg-[#26222D]/80 hover:border-[#202A3C]/70'
                  }`}
              >
                <Filter className="h-5 w-5" />
                <span>Filtros</span>
                {hasActiveFilters && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>

              {/* Botão de Limpar Filtros */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 px-4 py-4 rounded-2xl font-semibold transition-all duration-300 bg-red-500/20 backdrop-blur-xl border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:border-red-500/50 hover:text-red-300"
                  title="Limpar todos os filtros"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Limpar</span>
                </button>
              )}
            </div>
          </div>

          {/* Mensagem de Aviso para Dispositivos Móveis */}
          <div className="mb-8">
            <div className="bg-[#202A3C]/60 backdrop-blur-sm rounded-xl border border-[#26222D]/50 p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-amber-400 font-semibold text-sm mb-2">💡 Dica para Melhor Experiência</h3>
                  <p className="text-gray-300 text-sm leading-relaxed text-justify">
                    <span className="lg:hidden">
                      Para uma experiência completa e melhor navegação, recomendamos que utilize este site em computadores ou dispositivos com tela maior.
                      Algumas funcionalidades podem ter melhor desempenho em telas maiores.
                    </span>
                    <span className="hidden lg:inline">
                      Você está utilizando a melhor experiência possível! Este site foi otimizado para oferecer a melhor navegação em telas maiores.
                      Aproveite todas as funcionalidades disponíveis.
                    </span>
                  </p>
                </div>
              </div>
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

              {/* Componente de Paginação */}
              {groupTracksByReleaseDate.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8 mb-8">
                  <div className="flex items-center space-x-2">
                    {/* Botão Anterior */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === 1
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                    >
                      ← Anterior
                    </button>

                    {/* Números das páginas */}
                    <div className="flex space-x-1">
                      {[...Array(groupTracksByReleaseDate.totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        const isCurrentPage = pageNum === currentPage;

                        // Mostrar apenas algumas páginas próximas à atual
                        if (
                          pageNum === 1 ||
                          pageNum === groupTracksByReleaseDate.totalPages ||
                          (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 rounded-lg font-medium transition-all ${isCurrentPage
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 3 ||
                          pageNum === currentPage + 3
                        ) {
                          return (
                            <span key={pageNum} className="px-2 py-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Botão Próximo */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === groupTracksByReleaseDate.totalPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === groupTracksByReleaseDate.totalPages
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                    >
                      Próximo →
                    </button>
                  </div>

                  {/* Informações da paginação */}
                  <div className="text-sm text-gray-400">
                    Página {currentPage} de {groupTracksByReleaseDate.totalPages}
                    <span className="ml-2">
                      ({groupTracksByReleaseDate.totalDays} dias total)
                    </span>
                  </div>
                </div>
              )}

              {/* Footer próximo à tabela de músicas */}
              <div className="mt-12">
                <NewFooter />
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