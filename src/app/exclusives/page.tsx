// src/app/new-releases/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, Download, Heart, Music, Star } from 'lucide-react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { generateGradientColors, generateInitials } from '@/utils/imageUtils';
import FooterPlayer from '@/components/player/FooterPlayer';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { Track } from '@/types/track';
import { useTrackStates } from '@/hooks/useTrackStates';
import AdvancedSearch from '@/components/ui/AdvancedSearch';

interface PopularTrack extends Track {
  downloadCount: number;
}

const featuredDJs = [
  "CALVIN HARRIS",
  "DAVID GUETTA",
  "MARTIN GARRIX",
  "TIËSTO",
  "SKRILLEX"
];



export default function NewReleasesPage() {
  const { data: session } = useSession();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useGlobalPlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [popularTracks, setPopularTracks] = useState<PopularTrack[]>([]);
  const [recentStyles, setRecentStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Hook personalizado para estados de download e like
  const {
    isDownloaded, isDownloading, isLiked, isLiking,
    markAsDownloaded, markAsDownloading, markAsNotDownloading,
    markAsLiked, markAsNotLiked, markAsLiking, markAsNotLiking,
    loadUserStates
  } = useTrackStates();
  const [isClient, setIsClient] = useState(false);
  const [downloadingBatch, setDownloadingBatch] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number, total: number }>({ current: 0, total: 0 });
  const [batchCancel, setBatchCancel] = useState<boolean>(false);

  // Estados para paginação e filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [tracksLoading, setTracksLoading] = useState(false);

  // Estados para busca avançada
  const [searchParams, setSearchParams] = useState({
    query: '',
    styles: [] as string[],
    artists: [] as string[],
    pools: [] as string[]
  });
  const [availableStyles, setAvailableStyles] = useState<string[]>([]);
  const [availableArtists, setAvailableArtists] = useState<string[]>([]);
  const [availablePools, setAvailablePools] = useState<string[]>([]);

  // Função para atualizar URL com parâmetros
  const updateURL = (genre: string | null, page: number = 1) => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();
    if (genre) {
      params.set('genre', genre);
    }
    if (page > 1) {
      params.set('page', page.toString());
    }

    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, '', newURL);
  };

  // Função para ler parâmetros da URL
  const readURLParams = () => {
    if (typeof window === 'undefined') return { genre: null, page: 1 };

    const params = new URLSearchParams(window.location.search);
    const genre = params.get('genre');
    const page = parseInt(params.get('page') || '1');

    return { genre, page };
  };

  // Fetch latest tracks with pagination and filters (only Nexor Records pool)
  const fetchLatestTracks = async (
    page: number = 1,
    genre: string | null = null,
    searchParams?: {
      query: string;
      styles: string[];
      artists: string[];
      pools: string[];
    }
  ) => {
    try {
      setTracksLoading(true);

      // Usar a API específica de pool para garantir que apenas músicas da Nexor Records sejam retornadas
      const poolName = encodeURIComponent('Nexor Records');
      let url = `/api/tracks/pool/${poolName}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        let filteredTracks = data.tracks || [];

        // Aplicar filtros adicionais no frontend se necessário
        if (genre) {
          filteredTracks = filteredTracks.filter((track: any) =>
            track.style && track.style.toLowerCase().includes(genre.toLowerCase())
          );
        }

        if (searchParams) {
          if (searchParams.query) {
            const query = searchParams.query.toLowerCase();
            filteredTracks = filteredTracks.filter((track: any) =>
              track.songName.toLowerCase().includes(query) ||
              track.artist.toLowerCase().includes(query) ||
              track.style.toLowerCase().includes(query)
            );
          }

          if (searchParams.styles.length > 0) {
            filteredTracks = filteredTracks.filter((track: any) =>
              searchParams.styles.some(style =>
                track.style && track.style.toLowerCase().includes(style.toLowerCase())
              )
            );
          }

          if (searchParams.artists.length > 0) {
            filteredTracks = filteredTracks.filter((track: any) =>
              searchParams.artists.some(artist =>
                track.artist && track.artist.toLowerCase().includes(artist.toLowerCase())
              )
            );
          }
        }

        // Aplicar paginação no frontend
        const startIndex = (page - 1) * 100;
        const endIndex = startIndex + 100;
        const paginatedTracks = filteredTracks.slice(startIndex, endIndex);

        setTracks(paginatedTracks);
        setTotalPages(Math.ceil(filteredTracks.length / 100));
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching latest tracks:', error);
    } finally {
      setTracksLoading(false);
    }
  };

  // Handle genre filter with toggle functionality
  const handleGenreFilter = (genre: string | null) => {
    // Se clicou no mesmo gênero que já está selecionado, desmarca (toggle)
    if (selectedGenre === genre) {
      setSelectedGenre(null);
      setCurrentPage(1);
      updateURL(null, 1);
      fetchLatestTracks(1, null);
    } else {
      // Caso contrário, seleciona o novo gênero
      setSelectedGenre(genre);
      setCurrentPage(1);
      updateURL(genre, 1);
      fetchLatestTracks(1, genre);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL(selectedGenre, page);
    fetchLatestTracks(page, selectedGenre);
  };

  // Group tracks by release date
  const groupTracksByDate = (tracks: Track[]) => {
    const grouped: { [key: string]: Track[] } = {};

    tracks.forEach(track => {
      if (track.releaseDate) {
        const date = new Date(track.releaseDate);
        const dateKey = date.toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).toUpperCase();

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(track);
      } else {
        // Se não tem data, coloca em "Sem data"
        if (!grouped['SEM DATA']) {
          grouped['SEM DATA'] = [];
        }
        grouped['SEM DATA'].push(track);
      }
    });

    return grouped;
  };

  // Fetch recent styles
  const fetchRecentStyles = async () => {
    try {
      const response = await fetch('/api/styles/recent', {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta não é JSON válido');
      }

      const data = await response.json();

      if (data.success) {
        setRecentStyles(data.styles || []);
      } else {
        console.error('Failed to fetch recent styles:', data.error);
        setRecentStyles([]);
      }
    } catch (error) {
      console.error('Error fetching recent styles:', error);
      setRecentStyles([]);
    }
  };

  // Fetch available options for search filters
  const fetchSearchOptions = async () => {
    try {
      const response = await fetch('/api/tracks/search-options');
      if (response.ok) {
        const data = await response.json();
        setAvailableStyles(data.styles || []);
        setAvailableArtists(data.artists || []);
        setAvailablePools(data.pools || []);
      } else {
        console.error('Failed to fetch search options:', response.status, response.statusText);
        // Usar dados estáticos como fallback
        setAvailableStyles(['House', 'Techno', 'Trance', 'Progressive', 'Deep House', 'Tech House', 'Minimal', 'Ambient', 'Drum & Bass', 'Dubstep']);
        setAvailableArtists(['Calvin Harris', 'David Guetta', 'Martin Garrix', 'Tiësto', 'Skrillex', 'Deadmau5', 'Armin van Buuren', 'Above & Beyond']);
        setAvailablePools(['Beatport', 'DJCity', 'Traxsource', 'Juno Download', 'Bandcamp']);
      }
    } catch (error) {
      console.error('Error fetching search options:', error);
      // Usar dados estáticos como fallback
      setAvailableStyles(['House', 'Techno', 'Trance', 'Progressive', 'Deep House', 'Tech House', 'Minimal', 'Ambient', 'Drum & Bass', 'Dubstep']);
      setAvailableArtists(['Calvin Harris', 'David Guetta', 'Martin Garrix', 'Tiësto', 'Skrillex', 'Deadmau5', 'Armin van Buuren', 'Above & Beyond']);
      setAvailablePools(['Beatport', 'DJCity', 'Traxsource', 'Juno Download', 'Bandcamp']);
    }
  };

  // Handle advanced search
  const handleAdvancedSearch = (params: {
    query: string;
    styles: string[];
    artists: string[];
    pools: string[];
  }) => {
    setSearchParams(params);
    setCurrentPage(1);
    fetchLatestTracks(1, null, params);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchParams({
      query: '',
      styles: [],
      artists: [],
      pools: []
    });
    setCurrentPage(1);
    fetchLatestTracks(1, selectedGenre);
  };

  // Fetch most downloaded tracks (only Nexor Records pool)
  const fetchMostDownloaded = async () => {
    try {
      // Usar a API específica de pool para garantir que apenas músicas da Nexor Records sejam retornadas
      const poolName = encodeURIComponent('Nexor Records');
      const response = await fetch(`/api/tracks/pool/${poolName}`);
      if (response.ok) {
        const data = await response.json();
        // Transform the data to match our interface and limit to 15
        const transformedTracks = data.tracks?.map((track: any, index: number) => ({
          id: track.id,
          songName: track.songName,
          artist: track.artist,
          style: track.style,
          pool: track.pool,
          imageUrl: track.imageUrl,
          previewUrl: track.previewUrl,
          downloadUrl: track.downloadUrl,
          releaseDate: track.releaseDate,
          createdAt: track.createdAt,
          updatedAt: track.updatedAt,
          __v: track.__v,
          downloadCount: track.downloadCount || 0,
          rank: index + 1
        })) || [];
        setPopularTracks(transformedTracks.slice(0, 15));
      } else {
        console.error('Failed to fetch most downloaded tracks');
        setPopularTracks([]);
      }
    } catch (error) {
      console.error('Error fetching most downloaded tracks:', error);
      setPopularTracks([]);
    }
  };

  // Função para verificar downloads do usuário
  const checkUserDownloads = async (trackIds: number[]) => {
    if (!session?.user || trackIds.length === 0) return;

    try {
      const response = await fetch('/api/downloads/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackIds })
      });

      if (response.ok) {
        const data = await response.json();
        const downloadedSet = new Set<number>();
        Object.keys(data.downloads).forEach(trackId => {
          if (data.downloads[trackId]) {
            downloadedSet.add(parseInt(trackId));
          }
        });
        // Usar o hook para marcar como baixados
        downloadedSet.forEach(trackId => markAsDownloaded(trackId));
      }
    } catch (error) {
      console.error('Erro ao verificar downloads:', error);
    }
  };

  // Função para verificar likes do usuário
  const checkUserLikes = async (trackIds: number[]) => {
    if (!session?.user || trackIds.length === 0) return;

    try {
      const response = await fetch('/api/likes', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const likedSet = new Set<number>();
        if (data.likedTracks && Array.isArray(data.likedTracks)) {
          data.likedTracks.forEach((trackId: number) => {
            likedSet.add(trackId);
          });
        }
        // Usar o hook para marcar como curtidos
        likedSet.forEach(trackId => markAsLiked(trackId));
      }
    } catch (error) {
      console.error('Erro ao verificar likes:', error);
    }
  };

  // Detect client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load data on component mount
  useEffect(() => {
    if (!isClient) return;

    const loadData = async () => {
      setLoading(true);

      // Ler parâmetros da URL
      const { genre, page } = readURLParams();

      // Aplicar parâmetros da URL aos estados
      if (genre) {
        setSelectedGenre(genre);
      }
      if (page > 1) {
        setCurrentPage(page);
      }

      await Promise.all([
        fetchLatestTracks(page, genre),
        fetchMostDownloaded(),
        fetchRecentStyles(),
        fetchSearchOptions()
      ]);
      setLoading(false);
    };

    loadData();
  }, [isClient]);

  // Verificar downloads e likes quando as tracks são carregadas
  useEffect(() => {
    if (!isClient || (!tracks.length && !popularTracks.length)) return;

    const allTrackIds = [
      ...tracks.map(t => t.id),
      ...popularTracks.map(t => t.id)
    ];
    checkUserDownloads(allTrackIds);
    checkUserLikes(allTrackIds);
  }, [tracks, popularTracks, session, isClient]);

  // Carregar estados de download e like do usuário
  useEffect(() => {
    if (!session?.user || !tracks.length) return;
    const trackIds = tracks.map(track => track.id);
    loadUserStates(trackIds);
  }, [session?.user, tracks, loadUserStates]);

  // Função auxiliar para contar downloads
  const getDownloadedCount = () => {
    return tracks.filter(track => isDownloaded(track.id)).length;
  };

  const getNewTracksCount = () => {
    return tracks.filter(track => !isDownloaded(track.id)).length;
  };

  // Debug: Log do estado dos botões quando tracks mudam
  useEffect(() => {
    if (!isClient || !tracks.length) return;

    console.log('🔍 Estado atual dos downloads:', {
      totalTracks: tracks.length,
      downloadedTracks: getDownloadedCount(),
      downloadedTrackIds: tracks.filter(track => isDownloaded(track.id)).map(track => track.id),
      currentPage,
      selectedGenre
    });
  }, [tracks, isClient, currentPage, selectedGenre]);


  // Listener para mudanças na URL (botão voltar/avançar)
  useEffect(() => {
    if (!isClient) return;

    const handlePopState = () => {
      const { genre, page } = readURLParams();
      setSelectedGenre(genre);
      setCurrentPage(page);
      fetchLatestTracks(page, genre);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isClient]);

  // Função para validar se uma URL é válida
  const isValidAudioUrl = (url: string | undefined): boolean => {
    if (!url || url.trim() === '') return false;

    // Filtrar URLs localhost que podem não existir
    if (url.includes('localhost:3000') || url.includes('127.0.0.1')) {
      console.log('⚠️ URL localhost detectada, pode não estar disponível:', url);
      return false;
    }

    // Verificar se é uma URL válida
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handlePlayPause = async (track: Track, isFromMostPopular: boolean = false) => {
    console.log('🎵 Homepage: handlePlayPause chamado', {
      hasSession: !!session,
      sessionUser: session?.user?.email,
      track: track.songName
    });

    if (!session) {
      toast.error('🔒 Faça login para ouvir as músicas');
      return;
    }

    // Validar URLs antes de tentar reproduzir
    const hasValidPreviewUrl = isValidAudioUrl(track.previewUrl);
    const hasValidDownloadUrl = isValidAudioUrl(track.downloadUrl);

    if (!hasValidPreviewUrl && !hasValidDownloadUrl) {
      console.log('❌ Nenhuma URL válida encontrada para reprodução:', {
        trackId: track.id,
        songName: track.songName,
        previewUrl: track.previewUrl,
        downloadUrl: track.downloadUrl
      });
      toast.error('❌ URL de áudio não disponível para esta música');
      return;
    }

    try {
      if (currentTrack?.id === track.id && isPlaying) {
        togglePlayPause();
      } else {
        // Se for da seção Most Popular, passar a lista para auto-play
        if (isFromMostPopular && popularTracks.length > 0) {
          console.log('🎵 Homepage: Tocando da seção Most Popular', {
            track: track.songName,
            playlistLength: popularTracks.length,
            popularTracksIds: popularTracks.map(t => ({ id: t.id, name: t.songName }))
          });
          await playTrack(track, popularTracks);
        } else if (tracks.length > 0) {
          // Se for da lista principal, passar a lista de tracks
          console.log('🎵 Homepage: Tocando da lista principal', {
            track: track.songName,
            playlistLength: tracks.length,
            tracksIds: tracks.map(t => ({ id: t.id, name: t.songName }))
          });
          await playTrack(track, tracks);
        } else {
          console.log('🎵 Homepage: Tocando sem playlist');
          await playTrack(track);
        }
      }
    } catch (error) {
      console.error('Erro ao reproduzir música:', error);
      toast.error('❌ Erro ao reproduzir música');
    }
  };

  // Função de download melhorada e mais rápida
  const handleDownload = async (track: Track) => {
    if (!session?.user) {
      toast.error('🔒 Faça login para baixar músicas');
      return;
    }

    if (isDownloading(track.id)) {
      return; // Já está baixando
    }

    markAsDownloading(track.id);

    try {
      // 1. Registrar download no banco (rápido)
      const downloadResponse = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id })
      });

      if (!downloadResponse.ok) {
        throw new Error('Erro ao autorizar download');
      }

      const downloadData = await downloadResponse.json();

      // 2. Marcar como baixado imediatamente
      markAsDownloaded(track.id);

      // 3. Iniciar download do arquivo
      const response = await fetch(downloadData.downloadUrl);
      if (!response.ok) {
        throw new Error('Erro ao baixar arquivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${track.artist} - ${track.songName}.mp3`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('✅ Download concluído!', {
        duration: 2000,
        style: {
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          color: '#f9fafb',
          border: '1px solid #10b981',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });

    } catch (error) {
      console.error('Erro no download:', error);
      toast.error('❌ Erro ao baixar música');
    } finally {
      markAsNotDownloading(track.id);
    }
  };

  // Função para download em lotes
  const downloadBatch = async (isNewOnly: boolean = false, dateTracks?: Track[]) => {
    if (!session?.user) {
      toast.error('🔒 Faça login para baixar músicas');
      return;
    }

    if (downloadingBatch) {
      toast.error('⏳ Download em andamento, aguarde...');
      return;
    }

    // Usar as músicas da data específica se fornecidas, senão usar todas da página
    const sourceTracks = dateTracks || tracks;

    // Para DOWNLOAD ALL, sempre usar todas as músicas da fonte
    // Para DOWNLOAD NEW, usar apenas músicas não baixadas da fonte
    const tracksToDownload = isNewOnly
      ? sourceTracks.filter(track => !isDownloaded(track.id))
      : sourceTracks;

    if (tracksToDownload.length === 0) {
      toast.error(isNewOnly ? '📭 Nenhuma música nova para baixar' : '📭 Nenhuma música disponível');
      return;
    }

    setDownloadingBatch(true);
    setBatchCancel(false);
    setBatchProgress({ current: 0, total: tracksToDownload.length });

    try {
      // Processar em lotes de 10
      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < tracksToDownload.length; i += batchSize) {
        batches.push(tracksToDownload.slice(i, i + batchSize));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        if (batchCancel) {
          toast.error('❌ Download cancelado pelo usuário');
          break;
        }

        const batch = batches[batchIndex];

        // Processar cada música do lote
        for (let trackIndex = 0; trackIndex < batch.length; trackIndex++) {
          if (batchCancel) break;

          const track = batch[trackIndex];
          const currentProgress = batchIndex * batchSize + trackIndex + 1;
          setBatchProgress({ current: currentProgress, total: tracksToDownload.length });

          try {
            // Registrar download no banco
            const downloadResponse = await fetch('/api/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ trackId: track.id })
            });

            if (downloadResponse.ok) {
              const downloadData = await downloadResponse.json();

              // Baixar arquivo
              const response = await fetch(downloadData.downloadUrl);
              if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${track.artist} - ${track.songName}.mp3`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                // Marcar como baixado
                markAsDownloaded(track.id);
                console.log('🎵 Música marcada como baixada:', track.songName);
              }
            }

            // Pequena pausa entre downloads
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`Erro ao baixar ${track.songName}:`, error);
          }
        }

        // Pausa maior entre lotes
        if (batchIndex < batches.length - 1 && !batchCancel) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!batchCancel) {
        toast.success(`✅ Download concluído! ${tracksToDownload.length} músicas baixadas`);
      }
    } catch (error) {
      console.error('Erro no download em lote:', error);
      toast.error('❌ Erro durante o download em lote');
    } finally {
      setDownloadingBatch(false);
      setBatchProgress({ current: 0, total: 0 });
      setBatchCancel(false);
    }
  };

  // Função para cancelar download em lote
  const cancelBatchDownload = () => {
    setBatchCancel(true);
    toast.error('⏹️ Cancelando download...');
  };

  // Função para lidar com likes
  const handleLike = async (track: Track) => {
    if (!session?.user) {
      toast.error('🔒 Faça login para curtir músicas');
      return;
    }

    if (isLiking(track.id)) {
      return; // Já está processando
    }

    markAsLiking(track.id);

    try {
      console.log('🔍 Enviando like para track:', track.id);

      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: track.id
        })
      });

      console.log('🔍 Resposta da API:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Dados recebidos:', data);

        if (data.liked) {
          markAsLiked(track.id);
          toast.success('❤️ Música curtida!');
        } else {
          markAsNotLiked(track.id);
          toast.success('💔 Música descurtida');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta:', response.status, errorData);
        throw new Error(`Erro ${response.status}: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Erro no like:', error);
      toast.error(`❌ Erro ao curtir música: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      markAsNotLiking(track.id);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <Header />

      {/* Main Content */}
      <div className="pt-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

          {/* Hero Section */}
          <div className="mb-12">
            <div className="relative">
              {/* Background gradient - same as genres page */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%), linear-gradient(45deg, #1a1a1a 0%, #2d1b69 25%, #11998e 50%, #38ef7d 75%, #1a1a1a 100%)'
                }}
              ></div>

              {/* Main content */}
              <div className="relative p-8 bg-gradient-to-r from-gray-900/40 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl">
                <div className="text-center mb-8">
                  {/* Pool de Gravação - Enhanced */}
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-sm font-montserrat font-semibold uppercase tracking-[0.2em] letter-spacing-wider">
                      Pool de Gravação
                    </span>
                  </div>

                  {/* EXCLUSIVAS NEXOR RECORDS - Enhanced */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bebas-neue font-black text-white tracking-tight mb-3 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                    EXCLUSIVAS NEXOR RECORDS
                  </h1>

                  {/* Mashups, bootlegs, funks, edições e remixes exclusivos de DJs - Enhanced */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <p className="text-gray-300 text-base font-montserrat font-medium tracking-wide">
                      Mashups, bootlegs, funks, edições e remixes exclusivos de DJs
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white">{tracks.length}</p>
                        <p className="text-gray-400 text-sm">Tracks Exclusivas</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Download className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white">{getDownloadedCount()}</p>
                        <p className="text-gray-400 text-sm">Baixadas</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white">{getNewTracksCount()}</p>
                        <p className="text-gray-400 text-sm">Novas</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 opacity-20">
                  <div className="w-16 h-16 border border-red-500/30 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border border-red-500/50 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-red-500/30 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 opacity-10">
                  <div className="w-12 h-12 border border-gray-500/30 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Pesquisa Avançada */}
          <div className="mb-8">
            <AdvancedSearch
              onSearch={handleAdvancedSearch}
              onClear={handleSearchClear}
              styles={availableStyles}
              artists={availableArtists}
              pools={availablePools}
            />
          </div>


          {/* Tracklist Section */}
          <div className="space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden -mt-8">


            {/* Seção de Músicas com Agrupamento por Data */}
            {!isClient ? (
              <div className="text-center text-gray-400 py-8">
                <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="font-montserrat font-medium">Carregando músicas...</p>
              </div>
            ) : tracksLoading ? (
              <div className="text-center text-gray-400 py-8">
                <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="font-montserrat font-medium">Carregando músicas...</p>
              </div>
            ) : tracks.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p className="font-montserrat font-normal">Nenhuma música disponível</p>
              </div>
            ) : (
              <div className="mt-8 w-full max-w-full overflow-hidden">
                {/* Lista de Músicas Agrupadas por Data */}
                {Object.entries(groupTracksByDate(tracks)).map(([dateKey, dateTracks]) => (
                  <div key={dateKey} className="mb-8 w-full max-w-full overflow-hidden">
                    {/* Header da Data */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-gray-300 text-base font-inter font-medium">{dateKey}</h3>

                        {/* Botões de Download em Lote */}
                        <div className="flex gap-2">
                          {/* Botão Download New */}
                          <button
                            onClick={() => {
                              console.log('🔍 DOWNLOAD NEW clicado:', {
                                dateKey,
                                dateTracksCount: dateTracks.length,
                                downloadedInThisDate: dateTracks.filter(track => isDownloaded(track.id)).length,
                                newInThisDate: dateTracks.filter(track => !isDownloaded(track.id)).length,
                                allDownloadedTracks: getDownloadedCount()
                              });
                              downloadBatch(true, dateTracks);
                            }}
                            disabled={downloadingBatch || dateTracks.every(track => isDownloaded(track.id))}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xs font-medium rounded transition-all duration-200 flex items-center gap-1"
                            title={`Baixar apenas músicas novas desta data (${dateTracks.filter(track => !isDownloaded(track.id)).length} novas)`}
                          >
                            <Download className="w-3 h-3" />
                            DOWNLOAD NEW
                          </button>

                          {/* Botão Download All */}
                          <button
                            onClick={() => downloadBatch(false, dateTracks)}
                            disabled={downloadingBatch}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs font-medium rounded transition-all duration-200 flex items-center gap-1"
                            title={`Baixar todas as músicas desta data (${dateTracks.length} músicas)`}
                          >
                            <Download className="w-3 h-3" />
                            DOWNLOAD ALL
                          </button>

                          {/* Botão Cancelar (só aparece durante download) */}
                          {downloadingBatch && (
                            <button
                              onClick={cancelBatchDownload}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-all duration-200 flex items-center gap-1"
                              title="Cancelar download em lote"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              CANCELAR
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar (só aparece durante download) */}
                      {downloadingBatch && batchProgress.total > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Baixando...</span>
                            <span>{batchProgress.current}/{batchProgress.total}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Linha verde separadora */}
                      <div className="w-full h-px bg-green-500 mt-2"></div>
                    </div>

                    {/* Lista de Músicas da Data */}
                    <div className="bg-music-list rounded-lg overflow-hidden">
                      {dateTracks.map((track, index) => (
                        <div key={track.id} className="relative group">
                          {/* Linha divisória sutil */}
                          {index > 0 && (
                            <div className="absolute -top-px left-0 right-0 h-px bg-gray-700/30"></div>
                          )}

                          {/* Row da música - Design minimalista */}
                          <div className="flex items-center gap-6 px-6 py-4 hover:bg-hover-row transition-all duration-200">
                            {/* Capa da Música com Play/Pause */}
                            <div className="flex-shrink-0 relative w-16 h-16">
                              {/* Borda azul quando está tocando */}
                              {currentTrack?.id === track.id && isPlaying && (
                                <div className="absolute inset-0 border-2 border-blue-500 rounded"></div>
                              )}

                              {/* Capa da música */}
                              <div className="w-full h-full rounded overflow-hidden">
                                <OptimizedImage
                                  track={track}
                                  className="w-full h-full object-cover"
                                  fallbackClassName={`w-full h-full bg-gradient-to-br ${generateGradientColors(track.songName, track.artist)} flex items-center justify-center text-white font-bold text-sm`}
                                  fallbackContent={generateInitials(track.songName, track.artist)}
                                />
                              </div>

                              {/* Overlay de play/pause */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-200">
                                {currentTrack?.id === track.id && isPlaying ? (
                                  <button
                                    onClick={() => handlePlayPause(track, false)}
                                    className="opacity-100"
                                    title="Pausar"
                                  >
                                    <Pause className="w-5 h-5 text-white" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handlePlayPause(track, false)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    title="Tocar"
                                  >
                                    <Play className="w-5 h-5 text-white ml-0.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Informações da música */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex-1 min-w-0 mr-3">
                                  <h3 className="text-white font-inter font-semibold text-xs truncate mb-1" title={track.songName}>
                                    {track.songName}
                                  </h3>
                                  <p className="text-gray-300 font-inter text-xs truncate mb-2">
                                    {track.artist}
                                  </p>
                                </div>

                                {/* Botões de Download e Like estilo Facebook */}
                                <div className="flex gap-2 flex-shrink-0">
                                  {/* Botão Download */}
                                  <button
                                    onClick={() => handleDownload(track)}
                                    disabled={isDownloading(track.id)}
                                    className={`px-3 py-1.5 rounded text-xs font-inter font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${isDownloaded(track.id)
                                      ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                      : isDownloading(track.id)
                                        ? 'bg-yellow-600/20 text-yellow-400'
                                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                                      }`}
                                    title={
                                      isDownloaded(track.id)
                                        ? 'Já baixado'
                                        : isDownloading(track.id)
                                          ? 'Baixando...'
                                          : 'Download'
                                    }
                                  >
                                    {isDownloading(track.id) ? (
                                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Download className="w-3 h-3" />
                                    )}
                                    {isDownloaded(track.id) ? 'Baixado' : 'Download'}
                                  </button>

                                  {/* Botão Like */}
                                  <button
                                    onClick={() => handleLike(track)}
                                    disabled={isLiking(track.id)}
                                    className={`px-3 py-1.5 rounded text-xs font-inter font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${isLiked(track.id)
                                      ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                                      }`}
                                    title={isLiked(track.id) ? 'Descurtir' : 'Curtir'}
                                  >
                                    {isLiking(track.id) ? (
                                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <svg className="w-3 h-3" fill={isLiked(track.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                      </svg>
                                    )}
                                    {isLiked(track.id) ? 'Curtido' : 'Curtir'}
                                  </button>
                                </div>
                              </div>

                              <div className="flex gap-1 flex-wrap">
                                {track.style && (
                                  <Link
                                    href={`/genres/${track.style.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')}`}
                                    className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-inter font-medium text-xs hover:bg-red-500/30 hover:text-red-200 transition-all duration-200 border border-red-500/30"
                                    title={`Ver todas as músicas de ${track.style}`}
                                  >
                                    {track.style}
                                  </Link>
                                )}
                                {track.pool && (
                                  <Link
                                    href={`/pools/${track.pool.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')}`}
                                    className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-inter font-medium text-xs hover:bg-blue-500/30 hover:text-blue-200 transition-all duration-200 border border-blue-500/30"
                                    title={`Ver todas as músicas da pool ${track.pool}`}
                                  >
                                    {track.pool}
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-12">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-800/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50"
                    >
                      Anterior
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 9, currentPage - 4)) + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 ${currentPage === pageNum
                              ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                              : 'bg-gray-800/50 text-white hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-800/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50"
                    >
                      Próximo
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Player */}
      <FooterPlayer />
    </div>
  );
}
