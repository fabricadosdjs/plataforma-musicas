// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, Download, Heart } from 'lucide-react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { generateGradientColors, generateInitials } from '@/utils/imageUtils';
import FooterPlayer from '@/components/player/FooterPlayer';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { Track } from '@/types/track';
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

const heroSlides = [
  {
    id: 1,
    imageUrl: "https://s3.amazonaws.com/djc.www.images/djcity2/heroes/1756235131293-An%20archive%20of%20the%20top%20tracks%20downloaded%20each%20month.-thumbnail.png",
    title: "Archive Collection",
    subtitle: "Top tracks downloaded each month"
  },
  {
    id: 2,
    imageUrl: "https://s3.amazonaws.com/djc.www.images/djcity2/heroes/1755820289808-Playlists-thumbnail.png",
    title: "Playlists",
    subtitle: "Curated mixes for every occasion"
  }
];

export default function HomePage() {
  const { data: session } = useSession();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useGlobalPlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [popularTracks, setPopularTracks] = useState<PopularTrack[]>([]);
  const [recentStyles, setRecentStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [downloadedTracks, setDownloadedTracks] = useState<Set<number>>(new Set());
  const [downloadingTracks, setDownloadingTracks] = useState<Set<number>>(new Set());
  const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set());
  const [likingTracks, setLikingTracks] = useState<Set<number>>(new Set());
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

  // Fetch latest tracks with pagination and filters
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
      let url = `/api/tracks/new?page=${page}&limit=60`;

      if (genre) {
        url += `&genre=${encodeURIComponent(genre)}`;
      }

      if (searchParams) {
        if (searchParams.query) {
          url += `&query=${encodeURIComponent(searchParams.query)}`;
        }
        if (searchParams.styles.length > 0) {
          url += `&styles=${encodeURIComponent(JSON.stringify(searchParams.styles))}`;
        }
        if (searchParams.artists.length > 0) {
          url += `&artists=${encodeURIComponent(JSON.stringify(searchParams.artists))}`;
        }
        if (searchParams.pools.length > 0) {
          url += `&pools=${encodeURIComponent(JSON.stringify(searchParams.pools))}`;
        }
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTracks(data.tracks || []);
        setTotalPages(data.totalPages || 1);
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

  // Função para gerar slug do gênero
  const generateGenreSlug = (style: string) => {
    return style.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/\//g, '-%2F-')
      .replace(/--/g, '-');
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
      const response = await fetch('/api/styles/recent');
      if (response.ok) {
        const data = await response.json();
        setRecentStyles(data.styles || []);
      } else {
        console.error('Failed to fetch recent styles');
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

  // Fetch most downloaded tracks
  const fetchMostDownloaded = async () => {
    try {
      const response = await fetch('/api/tracks/most-downloaded');
      if (response.ok) {
        const data = await response.json();
        // Transform the data to match our interface and limit to 13
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
        setPopularTracks(transformedTracks.slice(0, 13));
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
        setDownloadedTracks(downloadedSet);
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
        setLikedTracks(likedSet);
      }
    } catch (error) {
      console.error('Erro ao verificar likes:', error);
    }
  };


  // Load data on component mount
  useEffect(() => {

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
  }, []);

  // Definir isClient após hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Verificar downloads e likes quando as tracks são carregadas
  useEffect(() => {
    if (!tracks.length && !popularTracks.length) return;

    const allTrackIds = [
      ...tracks.map(t => t.id),
      ...popularTracks.map(t => t.id)
    ];
    checkUserDownloads(allTrackIds);
    checkUserLikes(allTrackIds);
  }, [tracks, popularTracks, session]);

  // Debug: Log do estado dos botões quando downloadedTracks muda
  useEffect(() => {
    if (!tracks.length) return;

    console.log('🔍 Estado atual dos downloads:', {
      totalTracks: tracks.length,
      downloadedTracks: downloadedTracks.size,
      downloadedTrackIds: Array.from(downloadedTracks),
      currentPage,
      selectedGenre
    });
  }, [downloadedTracks, tracks, currentPage, selectedGenre]);

  // Auto-slide hero section
  useEffect(() => {

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Listener para mudanças na URL (botão voltar/avançar)
  useEffect(() => {

    const handlePopState = () => {
      const { genre, page } = readURLParams();
      setSelectedGenre(genre);
      setCurrentPage(page);
      fetchLatestTracks(page, genre);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

    if (downloadingTracks.has(track.id)) {
      return; // Já está baixando
    }

    setDownloadingTracks(prev => new Set(prev).add(track.id));

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
      setDownloadedTracks(prev => new Set(prev).add(track.id));

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
      // Remover do estado de baixado se houve erro
      setDownloadedTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(track.id);
        return newSet;
      });
    } finally {
      setDownloadingTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(track.id);
        return newSet;
      });
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
      ? sourceTracks.filter(track => !downloadedTracks.has(track.id))
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
                setDownloadedTracks(prev => {
                  const newSet = new Set(prev).add(track.id);
                  console.log('🎵 Música marcada como baixada:', track.songName, 'Total baixadas:', newSet.size);
                  return newSet;
                });
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

    if (likingTracks.has(track.id)) {
      return; // Já está processando
    }

    setLikingTracks(prev => new Set(prev).add(track.id));

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
          setLikedTracks(prev => new Set(prev).add(track.id));
          toast.success('❤️ Música curtida!');
        } else {
          setLikedTracks(prev => {
            const newSet = new Set(prev);
            newSet.delete(track.id);
            return newSet;
          });
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
      setLikingTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(track.id);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <Header />

      {/* Main Content */}
      <div className="pt-24 flex flex-col lg:flex-row min-h-screen pb-32">
        {/* Main Content Area */}
        <div className="w-full lg:w-3/5 p-4 sm:p-6">
          {/* Hero Section */}
          <div className="relative mb-12 mt-4">
            <div className="relative rounded-2xl overflow-hidden h-80 sm:h-96 shadow-2xl">
              {/* Slides */}
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <div
                    className="w-full h-full bg-cover bg-center relative"
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%), url(${slide.imageUrl})`
                    }}
                  >
                    {/* NEW & NOTABLE Badge */}
                    <div className="absolute top-6 right-6 bg-gradient-to-r from-emerald-400 to-teal-500 text-black px-4 py-2 rounded-full font-inter font-semibold text-sm shadow-lg backdrop-blur-sm">
                      ✨ NEW & NOTABLE
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-12">
                      <div className="max-w-2xl">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-inter font-bold text-white leading-tight mb-4 tracking-tight">
                          {slide.title}
                        </h2>
                        <p className="text-xl sm:text-2xl text-gray-100 font-inter font-light leading-relaxed">
                          {slide.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Navigation Dots */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                      ? 'bg-white scale-125'
                      : 'bg-white/40 hover:bg-white/70'
                      }`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Discover More Section */}
          <div className="mb-12 -mt-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
              <h2 className="text-2xl font-bebas font-bold text-white tracking-wide">
                DESCUBRA MAIS
              </h2>
            </div>

            {/* Cards de Navegação - Design Ultra Moderno */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Card 1 - Mais Populares */}
              <Link href="/most-popular">
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/50 to-pink-500/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-[#242424] backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-white font-inter font-bold text-sm leading-tight mb-1 tracking-wide">
                      MAIS POPULARES
                    </h3>
                    <p className="text-gray-500 text-sm font-inter uppercase tracking-wider">Top tracks</p>
                  </div>
                </div>
              </Link>

              {/* Card 2 - Top Playlists */}
              <Link href="/playlists">
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/50 to-emerald-500/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-[#242424] backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                        </svg>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-white font-inter font-bold text-sm leading-tight mb-1 tracking-wide">
                      TOP PLAYLISTS
                    </h3>
                    <p className="text-gray-500 text-sm font-inter uppercase tracking-wider">Curated mixes</p>
                  </div>
                </div>
              </Link>

              {/* Card 3 - Charts Mensais */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/50 to-orange-500/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-[#242424] backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" />
                      </svg>
                    </div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-white font-inter font-bold text-sm leading-tight mb-1 tracking-wide whitespace-nowrap">
                    CHARTS MENSAIS
                  </h3>
                  <p className="text-gray-500 text-sm font-inter uppercase tracking-wider">Ranking Mensal</p>
                </div>
              </div>

              {/* Card 4 - Navegar Gêneros */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/50 to-cyan-500/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-[#242424] backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-white font-inter font-bold text-sm leading-tight mb-1 tracking-wide">
                    GÊNEROS
                  </h3>
                  <p className="text-gray-500 text-xs font-inter uppercase tracking-wider">Explore styles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Highlights Section */}
          <div className="mb-12 -mt-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-2xl font-bebas font-bold text-white tracking-wide">
                DESTAQUES ESPECIAIS
              </h2>
            </div>

            {/* Featured Slides */}
            <div className="relative rounded-2xl overflow-hidden h-64 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-red-600/90"></div>

              {/* Content */}
              <div className="relative z-10 h-full flex items-center justify-between p-8">
                <div className="flex-1">
                  <div className="mb-4">
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-inter font-medium">
                      🔥 TRENDING NOW
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bebas font-bold text-white mb-3 tracking-tight">
                    MIXES EXCLUSIVOS
                  </h3>
                  <p className="text-white/90 text-lg font-inter font-light mb-6 max-w-md">
                    Descubra as melhores seleções curadas pelos nossos DJs profissionais
                  </p>
                  <div className="flex gap-4">
                    <Link href="/new-releases">
                      <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-inter font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-105">
                        EXPLORAR MIXES
                      </button>
                    </Link>
                    <Link href="/playlists">
                      <button className="border-2 border-white text-white px-6 py-3 rounded-xl font-inter font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300">
                        VER PLAYLISTS
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">★</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-4 right-4 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
              <div className="absolute bottom-8 right-8 w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
              <div className="absolute top-1/2 right-12 w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* New Releases Section Header */}
          <div className="mb-12 -mt-4">
            <div className="relative">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-red-900/20 rounded-2xl"></div>

              {/* Main content */}
              <div className="relative p-8 bg-gradient-to-r from-gray-900/40 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl">
                <div className="text-center mb-6">
                  {/* Pool de Gravação - Enhanced */}
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-sm font-inter font-semibold uppercase tracking-[0.2em] letter-spacing-wider">
                      Pool de Gravação
                    </span>
                  </div>

                  {/* NOVOS LANÇAMENTOS - Enhanced */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bebas font-black text-white tracking-tight mb-3 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                    NOVOS LANÇAMENTOS
                  </h1>

                  {/* Pool Exclusivo de DJs - Enhanced */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <p className="text-gray-300 text-base font-inter font-medium tracking-wide">
                      Pool Exclusivo de DJs
                    </p>
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

        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-2/5 p-4 sm:p-6 lg:pl-4 lg:pr-6">
          <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/30 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6 -mt-4">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
              <h3 className="text-xl font-inter font-bold text-white tracking-wide">Most Popular</h3>
            </div>
            <div className="space-y-3">
              {popularTracks.slice(0, 12).map((track, index) => (
                <div key={track.id} className="flex items-center gap-3 p-3 bg-gray-800/30 hover:bg-gray-700/40 rounded-lg transition-all duration-200 border border-gray-700/30 hover:border-gray-600/50">
                  {/* Número da posição */}
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>

                  {/* Capa da música com botão de play */}
                  <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden relative group">
                    <OptimizedImage
                      track={track}
                      className="w-full h-full object-cover"
                      fallbackClassName={`w-full h-full bg-gradient-to-br ${generateGradientColors(track.songName, track.artist)} flex items-center justify-center text-white font-bold text-xs`}
                      fallbackContent={generateInitials(track.songName, track.artist)}
                    />
                    {/* Botão Play/Pause sobreposto */}
                    <button
                      onClick={() => handlePlayPause(track, false)}
                      className={`absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all duration-200 ${currentTrack?.id === track.id && isPlaying
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                        }`}
                      title={currentTrack?.id === track.id && isPlaying ? 'Pausar' : 'Tocar'}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Informações da música */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-inter font-semibold text-sm truncate" title={track.songName}>
                      {track.songName}
                    </h4>
                    <p className="text-gray-300 font-inter font-normal text-xs truncate">
                      {track.artist}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {track.style && (
                        <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded text-xs font-inter font-medium">
                          {track.style}
                        </span>
                      )}
                      <span className="text-gray-400 text-xs">
                        {track.downloadCount} downloads
                      </span>
                    </div>
                  </div>

                  {/* Botões de Download e Like */}
                  <div className="flex gap-1 flex-shrink-0">
                    {/* Botão Download */}
                    <button
                      onClick={() => handleDownload(track)}
                      disabled={downloadingTracks.has(track.id)}
                      style={{ fontSize: '11px' }}
                      className={`px-2 py-1 rounded font-inter font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${downloadedTracks.has(track.id)
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : downloadingTracks.has(track.id)
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                        }`}
                      title={
                        downloadedTracks.has(track.id)
                          ? 'Já baixado'
                          : downloadingTracks.has(track.id)
                            ? 'Baixando...'
                            : 'Download'
                      }
                    >
                      {downloadingTracks.has(track.id) ? (
                        <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="w-2 h-2" />
                      )}
                      {downloadedTracks.has(track.id) ? 'Baixado' : 'Download'}
                    </button>

                    {/* Botão Like */}
                    <button
                      onClick={() => handleLike(track)}
                      disabled={likingTracks.has(track.id)}
                      style={{ fontSize: '11px' }}
                      className={`px-2 py-1 rounded font-inter font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${likedTracks.has(track.id)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                        }`}
                      title={likedTracks.has(track.id) ? 'Descurtir' : 'Curtir'}
                    >
                      {likingTracks.has(track.id) ? (
                        <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-2 h-2" fill={likedTracks.has(track.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                      {likedTracks.has(track.id) ? 'Curtido' : 'Curtir'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Pesquisa e Musiclist em Largura Total */}
      <div className="w-full px-4 sm:px-6 pb-32 -mt-20 sm:-mt-24 lg:-mt-40">
        {/* Barra de Pesquisa Avançada */}
        <div className="mb-4">
          <AdvancedSearch
            onSearch={handleAdvancedSearch}
            onClear={handleSearchClear}
            styles={availableStyles}
            artists={availableArtists}
            pools={availablePools}
          />
        </div>

        {/* Tracklist Section */}
        <div className="space-y-3 sm:space-y-4">

          {!isClient ? (
            <div className="text-center text-gray-400 py-8">
              <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="font-inter font-medium">Carregando...</p>
            </div>
          ) : recentStyles.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="font-inter font-normal">Nenhum estilo disponível</p>
            </div>
          ) : null}

          {/* Seção de Músicas com Agrupamento por Data */}
          {tracksLoading ? (
            <div className="text-center text-gray-400 py-8">
              <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="font-inter font-medium">Carregando músicas...</p>
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="font-inter font-normal">Nenhuma música disponível</p>
            </div>
          ) : (
            <div className="mt-8">
              {/* Lista de Músicas Agrupadas por Data */}
              {Object.entries(groupTracksByDate(tracks)).map(([dateKey, dateTracks]) => (
                <div key={dateKey} className="mb-8">
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
                              downloadedInThisDate: dateTracks.filter(track => downloadedTracks.has(track.id)).length,
                              newInThisDate: dateTracks.filter(track => !downloadedTracks.has(track.id)).length,
                              allDownloadedTracks: downloadedTracks.size
                            });
                            downloadBatch(true, dateTracks);
                          }}
                          disabled={downloadingBatch || dateTracks.every(track => downloadedTracks.has(track.id))}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xs font-inter font-medium rounded transition-all duration-200 flex items-center gap-1"
                          title={`Baixar apenas músicas novas desta data (${dateTracks.filter(track => !downloadedTracks.has(track.id)).length} novas)`}
                        >
                          <Download className="w-3 h-3" />
                          DOWNLOAD NEW
                        </button>

                        {/* Botão Download All */}
                        <button
                          onClick={() => downloadBatch(false, dateTracks)}
                          disabled={downloadingBatch}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs font-inter font-medium rounded transition-all duration-200 flex items-center gap-1"
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
                  <div className="space-y-0">
                    {dateTracks.map((track, index) => (
                      <div key={track.id} className="relative">
                        {/* Linha divisória branca */}
                        {index > 0 && (
                          <div className="absolute -top-px left-0 right-0 h-px bg-white/30 z-10"></div>
                        )}

                        {/* Row da música */}
                        <div className="flex items-center gap-4 bg-gray-900/30 hover:bg-[#242424] backdrop-blur-sm p-4 transition-all duration-300 border border-transparent hover:border-gray-700/50">
                          {/* Capa da Música com Play/Pause */}
                          <div className="flex-shrink-0 relative w-20 h-20">
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

                            {/* Overlay preto quando está tocando */}
                            {currentTrack?.id === track.id && isPlaying && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Pause className="w-6 h-6 text-white" />
                              </div>
                            )}

                            {/* Botão Play sobreposto (só aparece no hover quando não está tocando) */}
                            {!(currentTrack?.id === track.id && isPlaying) && (
                              <button
                                onClick={() => handlePlayPause(track, false)}
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all duration-200 opacity-0 hover:opacity-100 group"
                                title="Tocar"
                              >
                                <Play className="w-6 h-6 text-white ml-0.5" />
                              </button>
                            )}
                          </div>

                          {/* Informações da música */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex-1 min-w-0 mr-3">
                                <h3 className="text-white font-inter font-semibold truncate" style={{ fontSize: '13px' }} title={track.songName}>
                                  {track.songName}
                                </h3>
                                <p className="text-gray-300 font-inter font-normal truncate -mt-0.5" style={{ fontSize: '13px' }}>
                                  {track.artist}
                                </p>
                              </div>

                              {/* Botões de Download e Like estilo Facebook */}
                              <div className="flex gap-2 flex-shrink-0">
                                {/* Botão Download */}
                                <button
                                  onClick={() => handleDownload(track)}
                                  disabled={downloadingTracks.has(track.id)}
                                  style={{ fontSize: '13px' }}
                                  className={`px-4 py-2 rounded font-inter font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${downloadedTracks.has(track.id)
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : downloadingTracks.has(track.id)
                                      ? 'bg-yellow-600 text-white'
                                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                                    }`}
                                  title={
                                    downloadedTracks.has(track.id)
                                      ? 'Já baixado'
                                      : downloadingTracks.has(track.id)
                                        ? 'Baixando...'
                                        : 'Download'
                                  }
                                >
                                  {downloadingTracks.has(track.id) ? (
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Download className="w-3 h-3" />
                                  )}
                                  {downloadedTracks.has(track.id) ? 'Baixado' : 'Download'}
                                </button>

                                {/* Botão Like */}
                                <button
                                  onClick={() => handleLike(track)}
                                  disabled={likingTracks.has(track.id)}
                                  style={{ fontSize: '13px' }}
                                  className={`px-4 py-2 rounded font-inter font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${likedTracks.has(track.id)
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                                    }`}
                                  title={likedTracks.has(track.id) ? 'Descurtir' : 'Curtir'}
                                >
                                  {likingTracks.has(track.id) ? (
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <svg className="w-3 h-3" fill={likedTracks.has(track.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                  )}
                                  {likedTracks.has(track.id) ? 'Curtido' : 'Curtir'}
                                </button>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {track.style && (
                                <Link
                                  href={`/genres/${generateGenreSlug(track.style)}`}
                                  className="bg-red-500/20 text-red-300 px-2 py-1 rounded font-inter font-medium hover:bg-red-500/30 hover:text-red-200 transition-all duration-200 cursor-pointer"
                                  style={{ fontSize: '13px' }}
                                  title={`Ver todas as músicas de ${track.style}`}
                                >
                                  {track.style}
                                </Link>
                              )}
                              {track.pool && (
                                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-inter font-medium" style={{ fontSize: '13px' }}>
                                  {track.pool}
                                </span>
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

              {/* Botão Navegar Catálogo */}
              <div className="flex justify-center mt-8">
                <button className="px-12 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bebas font-bold text-xl tracking-wider rounded-lg transition-all duration-200 border border-red-400/20 hover:border-red-300/40">
                  NAVEGAR CATÁLOGO
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Footer Player */}
      <FooterPlayer />
    </div>
  );
}
