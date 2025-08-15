"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, Filter, Music, Loader2, Sparkles, Clock, Star, CheckCircle, Waves, ShoppingCart, Package, X, Crown, Play, Heart, Users, Pause, Download, Plus, ChevronLeft, Calendar } from 'lucide-react';
import NewFooter from '@/components/layout/NewFooter';
import { Track } from '@/types/track';
import { useSEO } from '@/hooks/useSEO';
import SEOHead from '@/components/seo/SEOHead';
import MusicStructuredData from '@/components/seo/MusicStructuredData';
import Header from '@/components/layout/Header';
import FiltersModal from '@/components/music/FiltersModal';
import { useAppContext } from '@/context/AppContext';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useDownloadExtensionDetector } from '@/hooks/useDownloadExtensionDetector';
import { useToast } from '@/hooks/useToast';
import { YouTubeSkeleton } from '@/components/ui/LoadingSkeleton';
import { MusicList } from '@/components/music/MusicList';
import { StylesSlider } from '@/components/music/StylesSlider';
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
  const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const { data: session } = useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Estados para filtros
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedPool, setSelectedPool] = useState('all');

  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const daysPerPage = 7;

  // Estados para dados dos filtros
  const [genres, setGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [versions, setVersions] = useState<string[]>([]);
  const [pools, setPools] = useState<string[]>([]);
  const [monthOptions, setMonthOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Estado para estilos principais com contadores reais
  const [mainStyles, setMainStyles] = useState<Array<{ id: number; name: string; color: string; count: number }>>([
    // Estado inicial vazio - será preenchido com dados reais do banco
  ]);

  // Estados para fila de downloads
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

  const [cancelZipGeneration, setCancelZipGeneration] = useState(false);

  // SEO para a página
  const { seoData } = useSEO({
    customTitle: 'Novos Lançamentos - Músicas Eletrônicas',
    customDescription: 'Descubra os mais recentes lançamentos de música eletrônica. House, Techno, Trance e muito mais em alta qualidade.',
    customKeywords: 'novos lançamentos, música eletrônica, house, techno, trance, DJ, downloads'
  });

  // Carregar músicas baixadas do localStorage ao montar
  useEffect(() => {
    const savedDownloadedTracks = localStorage.getItem('downloadedTracks');
    if (savedDownloadedTracks) {
      try {
        setDownloadedTrackIds(JSON.parse(savedDownloadedTracks));
      } catch (error) {
        setDownloadedTrackIds([]);
        console.error('❌ Erro ao carregar músicas baixadas:', error);
      }
    } else {
      setDownloadedTrackIds([]);
    }
  }, []);

  // Processar parâmetros da URL para aplicar filtros automaticamente
  useEffect(() => {
    if (searchParams) {
      const styleParam = searchParams.get('style');
      const artistParam = searchParams.get('artist');
      const poolParam = searchParams.get('pool');
      const searchParam = searchParams.get('search');

      // Aplicar filtro de estilo se presente na URL
      if (styleParam) {
        setSelectedGenre(styleParam);
        setHasActiveFilters(true);
        console.log('🎵 Filtro de estilo aplicado da URL:', styleParam);
      }

      // Aplicar filtro de artista se presente na URL
      if (artistParam) {
        setSelectedArtist(artistParam);
        setHasActiveFilters(true);
        console.log('🎤 Filtro de artista aplicado da URL:', artistParam);
      }

      // Aplicar filtro de pool se presente na URL
      if (poolParam) {
        setSelectedPool(poolParam);
        setHasActiveFilters(true);
        console.log('🏊 Filtro de pool aplicado da URL:', poolParam);
      }

      // Aplicar pesquisa se presente na URL
      if (searchParam) {
        setSearchQuery(searchParam);
        setAppliedSearchQuery(searchParam);
        setHasActiveFilters(true);
        console.log('🔍 Pesquisa aplicada da URL:', searchParam);
      }
    }
  }, [searchParams]);

  // Log quando selectedGenre ou selectedPool mudam
  useEffect(() => {
    console.log('🔄 selectedGenre mudou para:', selectedGenre);
    console.log('🔄 selectedPool mudou para:', selectedPool);

    if (selectedGenre !== 'all') {
      console.log('🎵 Aplicando filtro de estilo:', selectedGenre);
      console.log('📊 Total de músicas disponíveis:', tracks.length);
      const matchingTracks = tracks.filter(track => track.style === selectedGenre);
      console.log('🎵 Músicas que correspondem ao estilo:', matchingTracks.length);
    }

    if (selectedPool !== 'all') {
      console.log('🏊 Aplicando filtro de pool:', selectedPool);
      console.log('📊 Total de músicas disponíveis:', tracks.length);
      const matchingTracks = tracks.filter(track => track.pool === selectedPool);
      console.log('🏊 Músicas que correspondem ao pool:', matchingTracks.length);
    }
  }, [selectedGenre, selectedPool, tracks]);

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
  };

  // Placeholder para groupTracksByReleaseDate (será movido para depois de filteredTracks)

  // Filtrar tracks com base na pesquisa e filtros
  const filteredTracks = useMemo(() => {
    let filtered = [...tracks];

    console.log('🔍 Iniciando filtros:', {
      totalTracks: tracks.length,
      selectedGenre,
      selectedArtist,
      selectedPool,
      appliedSearchQuery
    });

    if (appliedSearchQuery.trim()) {
      const query = appliedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(track =>
        track.songName.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.style.toLowerCase().includes(query) ||
        (track.version && track.version.toLowerCase().includes(query)) ||
        (track.pool && track.pool.toLowerCase().includes(query))
      );
      console.log('🔍 Após pesquisa:', filtered.length, 'músicas');
    }

    if (selectedGenre !== 'all') {
      console.log('🎵 Aplicando filtro de estilo:', selectedGenre);
      const beforeFilter = filtered.length;

      // Normalizar strings para comparação mais robusta
      const normalizedSelectedGenre = selectedGenre.trim().toLowerCase();
      filtered = filtered.filter(track => {
        const normalizedTrackStyle = track.style ? track.style.trim().toLowerCase() : '';
        const matches = normalizedTrackStyle === normalizedSelectedGenre;
        if (!matches) {
          console.log(`❌ Não corresponde: "${track.style}" !== "${selectedGenre}"`);
        }
        return matches;
      });

      console.log('🎵 Após filtro de estilo:', beforeFilter, '->', filtered.length, 'músicas');

      // Log das músicas que passaram no filtro
      if (filtered.length > 0) {
        console.log('🎵 Músicas com estilo', selectedGenre, ':', filtered.map(t => `${t.artist} - ${t.songName} (${t.style})`));
      } else {
        console.log('❌ Nenhuma música encontrada com estilo:', selectedGenre);
        // Log de todos os estilos disponíveis para debug
        const availableStyles = [...new Set(tracks.map(t => t.style))].sort();
        console.log('📊 Estilos disponíveis:', availableStyles);

        // Verificar se há estilos similares
        const similarStyles = availableStyles.filter(style =>
          style && style.toLowerCase().includes(normalizedSelectedGenre) ||
          normalizedSelectedGenre.includes(style.toLowerCase())
        );
        if (similarStyles.length > 0) {
          console.log('🔍 Estilos similares encontrados:', similarStyles);
        }
      }
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
        const month = trackDate.getMonth();
        const monthYear = `${year}-${String(month + 1).padStart(2, '0')}`;
        return monthYear === selectedMonth;
      });
    }

    console.log('✅ Filtros aplicados. Resultado final:', filtered.length, 'músicas');
    return filtered;
  }, [tracks, appliedSearchQuery, selectedGenre, selectedArtist, selectedVersion, selectedPool, selectedDateRange, selectedMonth]);

  // Fetch tracks com filtros
  const fetchTracks = useCallback(async () => {
    try {
      setLoading(true);
      showToast('🔄 Carregando músicas...', 'info');

      const response = await fetch('/api/tracks');
      if (response.ok) {
        const data = await response.json();
        let tracksData: Track[] = [];
        if (Array.isArray(data.tracks)) {
          tracksData = data.tracks;
        } else if (Array.isArray(data)) {
          tracksData = data;
        } else if (Array.isArray(data.data?.tracks)) {
          tracksData = data.data.tracks;
        }

        setTracks(tracksData);

        const uniqueGenres = [...new Set(tracksData.map(track => track.style))].filter(Boolean).sort();
        const uniqueArtists = [...new Set(tracksData.map(track => track.artist))].filter(Boolean).sort();

        const versionSet = new Set<string>();
        tracksData.forEach(track => {
          if (track.version && track.version.trim() !== '') {
            versionSet.add(track.version.trim());
          }
        });

        const uniqueVersions = Array.from(versionSet).sort();
        const uniquePools = [...new Set(tracksData.map(track => track.pool || 'Nexor Records'))].filter(Boolean).sort();

        setGenres(uniqueGenres);
        setArtists(uniqueArtists);
        setVersions(uniqueVersions);
        setPools(uniquePools);

        // Gerar estilos principais com contadores reais
        const styleCounts = tracksData.reduce((acc, track) => {
          if (track.style) {
            acc[track.style] = (acc[track.style] || 0) + 1;
          }
          return acc;
        }, {} as { [key: string]: number });

        // Criar array de estilos principais ordenados por quantidade
        const mainStylesData = Object.entries(styleCounts)
          .sort(([, a], [, b]) => b - a) // Ordenar por quantidade decrescente
          .slice(0, 16) // Pegar os 16 estilos mais populares
          .map(([style, count], index) => {
            // Cores para os estilos (reutilizando o esquema anterior)
            const colors = ['blue', 'purple', 'cyan', 'green', 'indigo', 'pink', 'orange', 'red', 'teal', 'yellow', 'emerald', 'rose', 'violet', 'amber', 'sky', 'lime'];
            return {
              id: index + 1,
              name: style,
              color: colors[index] || 'gray',
              count: count
            };
          });

        setMainStyles(mainStylesData);

        // Log para debug dos estilos principais
        console.log('🎯 Estilos principais com contadores reais:', mainStylesData);
        console.log('📊 Contadores por estilo:', styleCounts);

        // Log para debug dos estilos disponíveis
        console.log('📊 Estilos únicos encontrados:', uniqueGenres);
        console.log('📊 Total de músicas carregadas:', tracksData.length);

        // Log adicional para verificar contadores por estilo
        console.log('🔍 Contadores detalhados por estilo:');
        Object.entries(styleCounts).forEach(([style, count]) => {
          console.log(`  ${style}: ${count} músicas`);
        });

        // Verificar se há músicas com estilo "Trance"
        const tranceTracks = tracksData.filter(track => track.style === 'Trance');
        console.log('🎵 Músicas com estilo Trance:', tranceTracks.length);
        if (tranceTracks.length > 0) {
          console.log('🎵 Exemplos de músicas Trance:', tranceTracks.slice(0, 3).map(t => `${t.artist} - ${t.songName}`));
        }

        // Log adicional para debug
        console.log('📊 Primeiras 5 músicas carregadas:', tracksData.slice(0, 5).map(t => ({
          id: t.id,
          artist: t.artist,
          songName: t.songName,
          style: t.style,
          pool: t.pool
        })));

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

  // Função para agrupar músicas por data de lançamento
  const groupTracksByReleaseDate = useMemo(() => {
    const grouped: { [key: string]: Track[] } = {};
    const dateKeyStats: { [key: string]: number } = {};

    // Usar filteredTracks em vez de tracks para aplicar filtros
    filteredTracks.forEach((track) => {
      if (track.releaseDate) {
        const dateKey = getCorrectDateKey(track.releaseDate);
        dateKeyStats[dateKey] = (dateKeyStats[dateKey] || 0) + 1;
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(track);
      } else {
        if (!grouped['no-date']) {
          grouped['no-date'] = [];
        }
        grouped['no-date'].push(track);
        dateKeyStats['no-date'] = (dateKeyStats['no-date'] || 0) + 1;
      }
    });

    // Log para debug
    console.log('📊 Estatísticas de agrupamento:', dateKeyStats);
    console.log('📊 Total de grupos:', Object.keys(grouped).length);

    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === 'future') return -1;
      if (b === 'future') return 1;
      if (a === 'today') return -1;
      if (b === 'today') return 1;
      if (a === 'yesterday') return -1;
      if (b === 'yesterday') return 1;
      if (a === 'no-date') return 1;
      if (b === 'no-date') return -1;
      return b.localeCompare(a);
    });

    const totalPages = Math.ceil(sortedKeys.length / daysPerPage);
    const startIndex = (currentPage - 1) * daysPerPage;
    const endIndex = startIndex + daysPerPage;
    const paginatedKeys = sortedKeys.slice(startIndex, endIndex);

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
  }, [filteredTracks, currentPage, daysPerPage]);

  // Carregamento inicial
  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  // Função para download em lote de 10 em 10
  const downloadBatch = async (tracks: Track[], batchSize: number = 10) => {
    const totalTracks = tracks.length;
    let downloadedCount = 0;

    for (let i = 0; i < totalTracks; i += batchSize) {
      const batch = tracks.slice(i, i + batchSize);

      // Mostrar progresso
      showToast(`📥 Baixando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalTracks / batchSize)}`, 'info');

      // Download de cada música do lote
      for (const track of batch) {
        try {
          const response = await fetch('/api/admin/download-track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              trackId: track.id,
              originalFileName: `${track.artist} - ${track.songName}.mp3`
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${track.artist} - ${track.songName}.mp3`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          // Adicionar à lista de músicas baixadas
          setDownloadedTrackIds(prev => [...prev, track.id]);

          // Salvar no localStorage
          const savedTracks = JSON.parse(localStorage.getItem('downloadedTracks') || '[]');
          const updatedTracks = [...savedTracks, track];
          localStorage.setItem('downloadedTracks', JSON.stringify(updatedTracks));

          downloadedCount++;

          // Pequena pausa entre downloads para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`❌ Erro ao baixar ${track.songName}:`, error);
          showToast(`❌ Erro ao baixar ${track.songName}`, 'error');
        }
      }

      // Pausa entre lotes
      if (i + batchSize < totalTracks) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    showToast(`✅ Download concluído! ${downloadedCount} músicas baixadas`, 'success');
  };

  // Função para baixar apenas músicas novas (não baixadas)
  const downloadNewTracks = async (tracks: Track[]) => {
    const newTracks = tracks.filter(track => !downloadedTrackIds.includes(track.id));

    if (newTracks.length === 0) {
      showToast('ℹ️ Todas as músicas desta data já foram baixadas!', 'info');
      return;
    }

    showToast(`📥 Iniciando download de ${newTracks.length} músicas novas...`, 'info');
    await downloadBatch(newTracks);
  };

  // Função para baixar todas as músicas da data
  const downloadAllTracks = async (tracks: Track[]) => {
    showToast(`📥 Iniciando download de todas as ${tracks.length} músicas...`, 'info');
    await downloadBatch(tracks);
  };

  // Função para adicionar/remover da fila
  const onToggleQueue = (track: Track) => {
    const isInQueue = downloadQueue.some((t: Track) => t.id === track.id);

    if (!isInQueue) {
      setDownloadQueue((prev: Track[]) => [...prev, track]);
      showToast(`📦 "${track.songName}" adicionada à fila`, 'success');
    } else {
      setDownloadQueue(prev => prev.filter((t: Track) => t.id !== track.id));
      showToast(`📦 "${track.songName}" removida da fila`, 'success');
    }
  };

  // Funções para filtros
  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setHasActiveFilters(genre !== 'all');
    updateURLHash();
    showToast(`🎵 Filtro de gênero: ${genre}`, 'info');
  };

  const handleArtistChange = (artist: string) => {
    setSelectedArtist(artist);
    setHasActiveFilters(artist !== 'all');
    updateURLHash();
    showToast(`🎤 Filtro de artista: ${artist}`, 'info');
  };

  const handlePoolChange = (pool: string) => {
    setSelectedPool(pool);
    setHasActiveFilters(pool !== 'all');
    updateURLHash();
    showToast(`🏊 Filtro de pool: ${pool}`, 'info');
  };

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version);
    setHasActiveFilters(version !== 'all');
    updateURLHash();
    showToast(`🎵 Filtro de versão: ${version}`, 'info');
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setHasActiveFilters(month !== 'all');
    updateURLHash();
    showToast(`📅 Filtro de mês: ${month}`, 'info');
  };

  // Função para atualizar a URL hash com os filtros ativos
  const updateURLHash = () => {
    const hashParams = new URLSearchParams();

    if (selectedGenre !== 'all') hashParams.set('genre', selectedGenre);
    if (selectedArtist !== 'all') hashParams.set('artist', selectedArtist);
    if (selectedPool !== 'all') hashParams.set('pool', selectedPool);
    if (selectedVersion !== 'all') hashParams.set('version', selectedVersion);
    if (selectedMonth !== 'all') hashParams.set('month', selectedMonth);
    if (appliedSearchQuery) hashParams.set('search', appliedSearchQuery);

    const hashString = hashParams.toString();
    if (hashString) {
      window.location.hash = `#${hashString}`;
    } else {
      window.location.hash = '';
    }
  };

  // Função para ler filtros da URL hash
  const readURLHash = () => {
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);
    let hasFilters = false;

    if (params.has('genre')) {
      setSelectedGenre(params.get('genre')!);
      hasFilters = true;
    }

    if (params.has('artist')) {
      setSelectedArtist(params.get('artist')!);
      hasFilters = true;
    }

    if (params.has('pool')) {
      setSelectedPool(params.get('pool')!);
      hasFilters = true;
    }

    if (params.has('version')) {
      setSelectedVersion(params.get('version')!);
      hasFilters = true;
    }

    if (params.has('month')) {
      setSelectedMonth(params.get('month')!);
      hasFilters = true;
    }

    if (params.has('search')) {
      const searchQuery = params.get('search')!;
      setSearchQuery(searchQuery);
      setAppliedSearchQuery(searchQuery);
      hasFilters = true;
    }

    setHasActiveFilters(hasFilters);
  };

  // Ler filtros da URL ao carregar a página
  useEffect(() => {
    readURLHash();
  }, []);

  // Atualizar URL quando filtros mudarem
  useEffect(() => {
    updateURLHash();
  }, [selectedGenre, selectedArtist, selectedPool, selectedVersion, selectedMonth, appliedSearchQuery]);

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
    window.location.hash = ''; // Limpar hash da URL
    showToast('🧹 Filtros e pesquisa limpos!', 'success');
  };

  const handleSearchSubmit = () => {
    const trimmedQuery = searchQuery.trim();
    setAppliedSearchQuery(trimmedQuery);
    if (trimmedQuery) {
      showToast(`🔍 Buscando por: "${trimmedQuery}"`, 'info');
    } else {
      showToast('🧹 Pesquisa limpa!', 'info');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAppliedSearchQuery('');
    showToast('🧹 Pesquisa limpa!', 'info');
  };

  // Renderização do componente
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <Header />

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Barra de Busca e Filtros */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <span className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar músicas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="w-full min-w-[120px] sm:min-w-0 pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-4 text-sm sm:text-base bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-gray-600/50 transition-all duration-300 font-sans"
                />
                <button
                  onClick={handleSearchSubmit}
                  disabled={!searchQuery.trim()}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-xl p-2 flex items-center justify-center transition-all duration-300 shadow-lg disabled:bg-gray-700 disabled:cursor-not-allowed"
                  style={{ height: '32px', width: '32px' }}
                  title="Buscar"
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-10 sm:right-14 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-white transition-colors"
                    style={{ zIndex: 2 }}
                    title="Limpar busca"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Botão de Limpar Filtros */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 bg-red-600/20 backdrop-blur-xl border border-red-600/30 text-red-400 hover:bg-red-600/30 hover:border-red-600/50 hover:text-red-300 font-sans"
                title="Limpar todos os filtros"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Limpar Filtros</span>
              </button>

              {/* Botões de Download para Filtros */}
              {filteredTracks.length > 0 && (
                <>
                  <button
                    onClick={() => downloadAllTracks(filteredTracks)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 bg-green-600/20 backdrop-blur-xl border border-green-600/30 text-green-400 hover:bg-green-600/30 hover:border-green-600/50 hover:text-green-300 font-sans"
                    title="Baixar todas as músicas com filtros aplicados"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">BAIXAR TODAS</span>
                    <span className="bg-green-600/30 text-green-200 px-2 py-0.5 rounded-full text-xs font-bold">
                      {filteredTracks.length}
                    </span>
                  </button>

                  <button
                    onClick={() => downloadNewTracks(filteredTracks)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 bg-blue-600/20 backdrop-blur-xl border border-blue-600/30 text-blue-400 hover:bg-blue-600/30 hover:border-blue-600/50 hover:text-blue-300 font-sans"
                    title="Baixar apenas músicas novas com filtros aplicados"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">BAIXAR NOVAS</span>
                    <span className="bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded-full text-xs font-bold">
                      {filteredTracks.filter(track => !downloadedTrackIds.includes(track.id)).length}
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Layout Principal com Sidebar e Conteúdo */}
        <div className="flex gap-8">
          {/* Widget Lateral de Filtros */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sticky top-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 font-sans">
                <Filter className="h-5 w-5 text-gray-400" />
                Filtros
              </h3>

              {/* Filtro de Estilo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2 font-sans">
                  Estilo Musical
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => handleGenreChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/80 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/50 transition-all duration-200 font-sans"
                >
                  <option value="all">Todos os Estilos</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Artista */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2 font-sans">
                  Artista
                </label>
                <select
                  value={selectedArtist}
                  onChange={(e) => handleArtistChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/80 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/50 transition-all duration-200 font-sans"
                >
                  <option value="all">Todos os Artistas</option>
                  {artists.map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Pool/Label */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2 font-sans">
                  Pool/Label
                </label>
                <select
                  value={selectedPool}
                  onChange={(e) => handlePoolChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/80 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/50 transition-all duration-200 font-sans"
                >
                  <option value="all">Todas as Pools</option>
                  {pools.map((pool) => (
                    <option key={pool} value={pool}>
                      {pool}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Versão */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2 font-sans">
                  Versão
                </label>
                <select
                  value={selectedVersion}
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/80 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/50 transition-all duration-200 font-sans"
                >
                  <option value="all">Todas as Versões</option>
                  {versions.map((version) => (
                    <option key={version} value={version}>
                      {version}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Mês */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2 font-sans">
                  Mês
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/80 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/50 transition-all duration-200 font-sans"
                >
                  <option value="all">Todos os Meses</option>
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estatísticas dos Filtros */}
              {hasActiveFilters && (
                <div className="mt-6 p-4 bg-gray-700/40 rounded-lg border border-gray-600/30">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 font-sans">Resultados</h4>
                  <div className="space-y-2 text-xs font-sans">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total encontrado:</span>
                      <span className="text-white font-medium">{filteredTracks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Novas:</span>
                      <span className="text-blue-400 font-medium">
                        {filteredTracks.filter(track => !downloadedTrackIds.includes(track.id)).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Já baixadas:</span>
                      <span className="text-green-400 font-medium">
                        {filteredTracks.filter(track => downloadedTrackIds.includes(track.id)).length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0">
            {/* Hero Section */}
            <div className="mb-8 sm:mb-12">
              {/* Header da página */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {appliedSearchQuery && (
                    <div className="flex items-center space-x-2 bg-gray-700/60 text-blue-400 px-3 py-1 rounded-full text-sm border border-gray-600/50 font-sans">
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
                    <div className="flex items-center space-x-2 text-orange-400 font-sans">
                      <Filter className="h-4 w-4" />
                      <span className="text-sm">Filtros ativos</span>
                    </div>
                  )}

                  {/* Estatísticas dos Filtros */}
                  {hasActiveFilters && filteredTracks.length > 0 && (
                    <div className="flex items-center space-x-2 text-green-400 bg-green-600/10 px-3 py-1 rounded-full text-sm border border-green-600/20 font-sans">
                      <Music className="h-3 w-3" />
                      <span>
                        {filteredTracks.length} {filteredTracks.length === 1 ? 'música encontrada' : 'músicas encontradas'}
                        {tracks.length !== filteredTracks.length && ` de ${tracks.length} total`}
                      </span>
                    </div>
                  )}

                  {/* Resumo dos Filtros Ativos */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {selectedGenre !== 'all' && (
                        <div className="flex items-center space-x-2 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-600/30 font-sans">
                          <Music className="h-3 w-3" />
                          <span>Estilo: {selectedGenre}</span>
                        </div>
                      )}

                      {selectedArtist !== 'all' && (
                        <div className="flex items-center space-x-2 bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm border border-purple-600/30 font-sans">
                          <Users className="h-3 w-3" />
                          <span>Artista: {selectedArtist}</span>
                        </div>
                      )}

                      {selectedPool !== 'all' && (
                        <div className="flex items-center space-x-2 bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-600/30 font-sans">
                          <Package className="h-3 w-3" />
                          <span>Pool: {selectedPool}</span>
                        </div>
                      )}

                      {selectedVersion !== 'all' && (
                        <div className="flex items-center space-x-2 bg-orange-600/20 text-orange-400 px-3 py-1 rounded-full text-sm border border-orange-600/30 font-sans">
                          <Star className="h-3 w-3" />
                          <span>Versão: {selectedVersion}</span>
                        </div>
                      )}

                      {selectedDateRange !== 'all' && (
                        <div className="flex items-center space-x-2 bg-cyan-600/20 text-cyan-400 px-3 py-1 rounded-full text-sm border border-cyan-600/30 font-sans">
                          <Clock className="h-3 w-3" />
                          <span>Período: {selectedDateRange}</span>
                        </div>
                      )}

                      {selectedMonth !== 'all' && (
                        <div className="flex items-center space-x-2 bg-pink-600/20 text-pink-400 px-3 py-1 rounded-full text-sm border border-pink-600/30 font-sans">
                          <Calendar className="h-3 w-3" />
                          <span>Mês: {selectedMonth}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Título da seção - só mostrar quando não há filtros ativos */}
              {!hasActiveFilters && (
                <div className="mb-8 text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-widest font-sans">NOVIDADES</h1>
                </div>
              )}

              {/* Seção de Download em Lote para Filtros */}
              {hasActiveFilters && filteredTracks.length > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-r from-gray-700/20 to-gray-600/20 rounded-2xl border border-gray-600/30">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-2 font-sans">
                        🎯 Downloads em Lote para Filtros Aplicados
                      </h2>
                      <p className="text-gray-300 text-sm font-sans">
                        Baixe todas as músicas que correspondem aos seus filtros atuais
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => downloadNewTracks(filteredTracks)}
                        className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm border border-blue-400/30 font-sans"
                        title="Baixar apenas músicas novas com filtros aplicados"
                      >
                        <Download className="h-4 w-4" />
                        BAIXAR NOVAS
                        <span className="bg-blue-400/30 text-blue-100 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                          {filteredTracks.filter(track => !downloadedTrackIds.includes(track.id)).length}
                        </span>
                      </button>

                      <button
                        onClick={() => downloadAllTracks(filteredTracks)}
                        className="px-6 py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm border border-green-400/30 font-sans"
                        title="Baixar todas as músicas com filtros aplicados"
                      >
                        <Download className="h-4 w-4" />
                        BAIXAR TODAS
                        <span className="bg-green-400/30 text-green-100 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                          {filteredTracks.length}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Estatísticas Detalhadas */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400 font-sans">{filteredTracks.length}</div>
                      <div className="text-xs text-gray-400 font-sans">Total Filtrado</div>
                    </div>
                    <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-400 font-sans">
                        {filteredTracks.filter(track => !downloadedTrackIds.includes(track.id)).length}
                      </div>
                      <div className="text-xs text-gray-400 font-sans">Novas</div>
                    </div>
                    <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400 font-sans">
                        {filteredTracks.filter(track => downloadedTrackIds.includes(track.id)).length}
                      </div>
                      <div className="text-xs text-gray-400 font-sans">Já Baixadas</div>
                    </div>
                    <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                      <div className="text-2xl font-bold text-orange-400 font-sans">
                        {Math.ceil(filteredTracks.length / 10)}
                      </div>
                      <div className="text-xs text-gray-400 font-sans">Lotes de 10</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Renderização condicional baseada em filtros ativos */}
              {hasActiveFilters ? (
                // Lista de músicas filtradas organizadas por data
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-2 font-sans">
                      🎵 Músicas Encontradas com Filtros
                    </h2>
                    <p className="text-gray-400 text-sm font-sans">
                      {filteredTracks.length} {filteredTracks.length === 1 ? 'música encontrada' : 'músicas encontradas'}
                    </p>
                  </div>

                  {/* Agrupar músicas filtradas por data */}
                  {(() => {
                    const groupedFilteredTracks: { [key: string]: Track[] } = {};

                    filteredTracks.forEach((track) => {
                      if (track.releaseDate) {
                        const dateKey = getCorrectDateKey(track.releaseDate);
                        if (!groupedFilteredTracks[dateKey]) {
                          groupedFilteredTracks[dateKey] = [];
                        }
                        groupedFilteredTracks[dateKey].push(track);
                      } else {
                        if (!groupedFilteredTracks['no-date']) {
                          groupedFilteredTracks['no-date'] = [];
                        }
                        groupedFilteredTracks['no-date'].push(track);
                      }
                    });

                    // Ordenar as chaves de data
                    const sortedDateKeys = Object.keys(groupedFilteredTracks).sort((a, b) => {
                      if (a === 'future') return -1;
                      if (b === 'future') return 1;
                      if (a === 'today') return -1;
                      if (b === 'today') return 1;
                      if (a === 'yesterday') return -1;
                      if (b === 'yesterday') return 1;
                      if (a === 'no-date') return 1;
                      if (b === 'no-date') return 1;
                      return b.localeCompare(a);
                    });

                    return (
                      <div className="space-y-6">
                        {sortedDateKeys.map((dateKey) => {
                          const tracksForDate = groupedFilteredTracks[dateKey];
                          const dateLabel = getDateLabel(dateKey);

                          return (
                            <div key={dateKey} className="space-y-4">
                              {/* Header da Data */}
                              <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                  <div className="w-2 h-2 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-lg"></div>
                                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white capitalize font-sans tracking-wide">
                                    {dateLabel}
                                  </h2>
                                </div>
                              </div>

                              {/* Quantidade de músicas com background vermelho elegante */}
                              <div className="mb-6">
                                <div className="flex items-center justify-between">
                                  <div className="inline-flex items-center text-red-400 text-xs font-semibold bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30 font-sans">
                                    <span className="tracking-wide">
                                      {tracksForDate.length} {tracksForDate.length === 1 ? 'música' : 'músicas'}
                                    </span>
                                  </div>

                                  {/* Botões de Download em Lote para esta data */}
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => downloadNewTracks(tracksForDate)}
                                      className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm border border-blue-400/30 font-sans"
                                      title="Baixar apenas músicas novas desta data"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      BAIXAR NOVAS
                                      <span className="bg-blue-400/30 text-blue-100 px-2 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm">
                                        {tracksForDate.filter(track => !downloadedTrackIds.includes(track.id)).length}
                                      </span>
                                    </button>

                                    <button
                                      onClick={() => downloadAllTracks(tracksForDate)}
                                      className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs font-medium rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm border border-green-400/30 font-sans"
                                      title="Baixar todas as músicas desta data"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      BAIXAR TODAS
                                      <span className="bg-green-400/30 text-green-100 px-2 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm">
                                        {tracksForDate.length}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Linha verde sutil para separar data do conteúdo */}
                              <div className="h-0.5 bg-gradient-to-r from-transparent via-green-400/20 to-transparent mb-6"></div>

                              {/* Lista de Músicas para esta data */}
                              <div className="overflow-hidden">
                                <MusicList
                                  tracks={tracksForDate}
                                  downloadedTrackIds={downloadedTrackIds}
                                  setDownloadedTrackIds={setDownloadedTrackIds}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                // Lista de Músicas Agrupadas por Data (comportamento original)
                <div className="space-y-8">
                  {groupTracksByReleaseDate.sortedKeys.map((dateKey) => {
                    const tracksForDate = groupTracksByReleaseDate.grouped[dateKey];
                    const dateLabel = getDateLabel(dateKey);

                    return (
                      <div key={dateKey} className="space-y-4">
                        {/* Header da Data */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white capitalize font-sans">
                              {dateLabel}
                            </h2>
                          </div>
                        </div>

                        {/* Quantidade de músicas com background vermelho */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between">
                            <div className="inline-flex items-center text-red-400 text-xs font-semibold bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30 font-sans">
                              <span className="tracking-wide">
                                {tracksForDate.length} {tracksForDate.length === 1 ? 'música' : 'músicas'}
                              </span>
                            </div>

                            {/* Botões de Download em Lote */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => downloadNewTracks(tracksForDate)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 font-sans"
                                title="Baixar apenas músicas novas (não baixadas)"
                              >
                                <Download className="h-4 w-4" />
                                BAIXAR NOVAS
                                <span className="bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded-full text-xs font-bold">
                                  {tracksForDate.filter(track => !downloadedTrackIds.includes(track.id)).length}
                                </span>
                              </button>

                              <button
                                onClick={() => downloadAllTracks(tracksForDate)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 font-sans"
                                title="Baixar todas as músicas desta data"
                              >
                                <Download className="h-4 w-4" />
                                BAIXAR TODAS
                                <span className="bg-green-600/30 text-green-200 px-2 py-0.5 rounded-full text-xs font-bold">
                                  {tracksForDate.length}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Linha verde para separar data do conteúdo */}
                        <div className="h-0.5 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full mb-4"></div>

                        {/* Lista de Músicas para esta data */}
                        <div className="overflow-hidden">
                          <MusicList
                            tracks={tracksForDate}
                            downloadedTrackIds={downloadedTrackIds}
                            setDownloadedTrackIds={setDownloadedTrackIds}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer próximo à lista de músicas */}
              <div className="mt-12">
                <NewFooter />
              </div>
            </div>
          </div>
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
          onDateRangeChange={() => { }}
          onVersionChange={handleVersionChange}
          onMonthChange={handleMonthChange}
          onPoolChange={handlePoolChange}
          onApplyFilters={() => { }}
          onClearFilters={handleClearFilters}
          isLoading={loading}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </div>
  );
}

export default NewPageContent;
