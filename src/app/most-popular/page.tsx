// src/app/new-releases/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, Download, Heart, Home, Music, Star, Crown, List, BarChart3, Tag, Users, RefreshCw, Globe, ChevronDown } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { generateGradientColors, generateInitials } from '@/utils/imageUtils';
import FooterPlayer from '@/components/player/FooterPlayer';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { Track } from '@/types/track';
import { useTrackStates } from '@/hooks/useTrackStates';
// AdvancedSearch removido - não é mais necessário
import Link from 'next/link';

// Interface PopularTrack removida - não é mais necessária

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

const navigationItems = [
  { name: 'Home', icon: Home, href: '/', active: false },
  { name: 'New Releases', icon: Music, href: '/new-releases', active: false },
  { name: 'Most Popular', icon: Star, href: '/most-popular', active: true },
  { name: 'Nexor Records Exclusives', icon: Crown, href: '/exclusives', active: false },
  { name: 'Playlists', icon: List, href: '/playlists', active: false },
  { name: 'Genres', icon: Tag, href: '/genres', active: false },
  { name: 'Remixers', icon: Users, href: '/remixers', active: false },
  { name: 'Track Updates', icon: RefreshCw, href: '/updates', active: false },
  { name: 'Global', icon: Globe, href: '/global', active: false },
];

export default function MostPopularPage() {
  const { data: session } = useSession();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useGlobalPlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  // popularTracks removido - não é mais necessário
  const [recentStyles, setRecentStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  // Hook personalizado para estados de download e like
  const {
    isDownloaded, isDownloading, isLiked, isLiking,
    markAsDownloaded, markAsDownloading, markAsNotDownloading,
    markAsLiked, markAsNotLiked, markAsLiking, markAsNotLiking,
    loadUserStates
  } = useTrackStates();
  const [downloadingBatch, setDownloadingBatch] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number, total: number }>({ current: 0, total: 0 });
  const [batchCancel, setBatchCancel] = useState<boolean>(false);

  // Estados para filtros
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [availableMonths, setAvailableMonths] = useState<Array<{ value: string, label: string, count: number }>>([]);
  const [tracksLoading, setTracksLoading] = useState(false);

  // Estados de busca avançada removidos - foco apenas nos gêneros do top 100
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);

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

  // Fetch most popular tracks with filters
  const fetchMostPopularTracks = async (
    genre: string | null = null,
    month: string | null = null
  ) => {
    try {
      setTracksLoading(true);
      let url = `/api/tracks/most-downloaded?limit=100`;

      if (genre) {
        url += `&genre=${encodeURIComponent(genre)}`;
      }

      if (month) {
        url += `&month=${encodeURIComponent(month)}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Most Popular API Response:', {
          tracksCount: data.tracks?.length || 0,
          totalTracks: data.totalTracks
        });
        setTracks(data.tracks || []);

        // Extrair gêneros únicos das músicas do top 100 (apenas quando não há filtro aplicado)
        if (!genre && data.tracks && data.tracks.length > 0) {
          const uniqueGenres = [...new Set(
            data.tracks
              .map((track: any) => track.style)
              .filter((style: any) => style && style.trim() !== '')
          )] as string[];

          // Remover "Alternative" da lista
          const filteredGenres = uniqueGenres.filter((genre: string) =>
            genre.toLowerCase() !== 'alternative'
          );

          console.log('🎵 Gêneros do Top 100 (sem Alternative):', filteredGenres);
          setAvailableGenres(filteredGenres);
        }
      } else {
        console.error('❌ API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching most popular tracks:', error);
    } finally {
      setTracksLoading(false);
    }
  };

  // Handle genre filter with toggle functionality
  const handleGenreFilter = (genre: string | null) => {
    // Se clicou no mesmo gênero que já está selecionado, desmarca (toggle)
    if (selectedGenre === genre) {
      setSelectedGenre(null);
      updateURL(null, 1);
      fetchMostPopularTracks(null);
    } else {
      // Caso contrário, seleciona o novo gênero
      setSelectedGenre(genre);
      updateURL(genre, 1);
      fetchMostPopularTracks(genre);
    }
  };


  // Função para lidar com mudança de mês
  const handleMonthChange = (month: string | null) => {
    setSelectedMonth(month);
    updateURL(selectedGenre, 1);
    fetchMostPopularTracks(selectedGenre, month);
  };

  // Add ranking to tracks
  const addRankingToTracks = (tracks: Track[]) => {
    return tracks.map((track, index) => ({
      ...track,
      rank: index + 1
    }));
  };

  // Fetch available months
  const fetchAvailableMonths = async () => {
    try {
      const response = await fetch('/api/tracks/months');
      if (response.ok) {
        const data = await response.json();
        setAvailableMonths(data.months || []);
        console.log('🔍 Available months:', data.months);
      } else {
        console.error('Failed to fetch available months');
      }
    } catch (error) {
      console.error('Error fetching available months:', error);
    }
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

  // Função removida - gêneros agora vêm das músicas do top 100

  // Funções de busca avançada removidas - foco apenas nos gêneros do top 100

  // Função removida - não é necessária para esta página

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

    const loadData = async () => {
      setLoading(true);

      // Ler parâmetros da URL
      const { genre } = readURLParams();

      // Aplicar parâmetros da URL aos estados
      if (genre) {
        setSelectedGenre(genre);
      }

      await Promise.all([
        fetchMostPopularTracks(genre, selectedMonth),
        fetchRecentStyles(),
        fetchAvailableMonths()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

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

  // Verificar downloads e likes quando as tracks são carregadas
  useEffect(() => {
    if (!tracks.length) return;

    const allTrackIds = tracks.map(t => t.id);
    checkUserDownloads(allTrackIds);
    checkUserLikes(allTrackIds);
  }, [tracks, session]);

  // Debug: Log do estado dos botões quando tracks mudam
  useEffect(() => {
    if (!tracks.length) return;

    console.log('🔍 Estado atual dos downloads:', {
      totalTracks: tracks.length,
      downloadedTracks: getDownloadedCount(),
      downloadedTrackIds: tracks.filter(track => isDownloaded(track.id)).map(track => track.id),
      selectedGenre
    });
  }, [tracks, selectedGenre]);

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
      const { genre } = readURLParams();
      setSelectedGenre(genre);
      fetchMostPopularTracks(genre);
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

  const handlePlayPause = async (track: Track) => {
    console.log('🎵 Most Popular: handlePlayPause chamado', {
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
        if (tracks.length > 0) {
          // Se for da lista principal, passar a lista de tracks
          console.log('🎵 Most Popular: Tocando da lista principal', {
            track: track.songName,
            playlistLength: tracks.length,
            tracksIds: tracks.map(t => ({ id: t.id, name: t.songName }))
          });
          await playTrack(track, tracks);
        } else {
          console.log('🎵 Most Popular: Tocando sem playlist');
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
    <div className="min-h-screen bg-black text-white font-montserrat">
      <Header />

      {/* Main Content */}
      <div className="pt-24 flex min-h-screen pb-32">
        {/* Left Sidebar - Navigation */}
        <div className="w-72 bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="pt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
              <h2 className="text-xl font-montserrat font-bold text-white tracking-wide whitespace-nowrap">
                NAVEGUE O CATÁLOGO
              </h2>
            </div>
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium uppercase tracking-wide transition-all duration-300 ${item.active
                      ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border-l-2 border-orange-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 min-w-0 overflow-hidden">

          {/* Most Popular Section Header */}
          <div className="mb-12">
            <div className="relative">
              {/* Background image with 50% transparency */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
                style={{
                  backgroundImage: 'url(https://i.ibb.co/5Wsg1TXK/lisa-alter-ego-3440x1440-21612.jpg)',
                  opacity: 0.5
                }}
              ></div>
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-red-900/20 rounded-2xl"></div>

              {/* Main content */}
              <div className="relative p-8 bg-gradient-to-r from-gray-900/40 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl">
                <div className="text-center mb-6">
                  {/* Pool de Gravação - Enhanced */}
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-sm font-montserrat font-semibold uppercase tracking-[0.2em] letter-spacing-wider">
                      Pool de Gravação
                    </span>
                  </div>

                  {/* MAIS POPULARES - Enhanced */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bebas font-black text-white tracking-tight mb-3 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                    MAIS POPULARES
                  </h1>

                  {/* Top 100 Mais Baixadas de Todos os Tempos - Enhanced */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <p className="text-gray-300 text-base font-montserrat font-medium tracking-wide">
                      Top 100 Mais Baixadas de Todos os Tempos
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


          {/* Tracklist Section */}
          <div className="space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden -mt-14">

            {!isClient ? (
              <div className="text-center text-gray-400 py-8">
                <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="font-montserrat font-medium">Carregando gêneros...</p>
              </div>
            ) : availableGenres.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p className="font-montserrat font-normal">Nenhum gênero disponível</p>
              </div>
            ) : null}

            {/* Seção de Músicas Mais Populares com Ranking */}
            {!isClient ? (
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
                {/* Header do Ranking */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-300 text-[40px] font-bebas font-normal">
                      TOP 100
                    </h3>

                    {/* Dropdown de Filtro por Mês */}
                    <div className="relative">
                      <select
                        value={selectedMonth || 'all'}
                        onChange={(e) => handleMonthChange(e.target.value === 'all' ? null : e.target.value)}
                        className="appearance-none bg-gray-800/50 border border-gray-600/50 text-white px-4 py-2 pr-8 rounded-lg focus:outline-none focus:border-red-500 transition-all duration-200 text-sm font-jost"
                      >
                        <option value="all">Todos os meses</option>
                        {availableMonths.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label} ({month.count})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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

                {/* Lista de Músicas com Ranking */}
                <div className="space-y-0 w-full max-w-full overflow-hidden">
                  {addRankingToTracks(tracks).map((track, index) => (
                    <div key={track.id} className="relative w-full max-w-full overflow-hidden">
                      {/* Linha divisória branca */}
                      {index > 0 && (
                        <div className="absolute -top-px left-0 right-0 h-px bg-white/30 z-10"></div>
                      )}

                      {/* Row da música */}
                      <div className="flex items-center gap-4 bg-gray-900/30 hover:bg-[#242424] backdrop-blur-sm p-4 transition-all duration-300 border border-transparent hover:border-gray-700/50">
                        {/* Número do Ranking */}
                        <div className="flex-shrink-0 w-12 text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${track.rank <= 3
                            ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black'
                            : track.rank <= 10
                              ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white'
                              : 'bg-gray-700 text-gray-300'
                            }`}>
                            {track.rank}
                          </div>
                        </div>

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
                              onClick={() => handlePlayPause(track)}
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
                              <h3 className="text-white truncate" style={{ fontFamily: 'Jost, sans-serif', fontWeight: 600, fontSize: '12px' }} title={track.songName}>
                                {track.songName}
                              </h3>
                              <p className="text-gray-300 truncate -mt-0.5" style={{ fontFamily: 'Jost, sans-serif', fontWeight: 400, fontSize: '13px' }}>
                                {track.artist}
                              </p>
                            </div>

                            {/* Botões de Download e Like estilo Facebook */}
                            <div className="flex gap-2 flex-shrink-0">
                              {/* Botão Download */}
                              <button
                                onClick={() => handleDownload(track)}
                                disabled={isDownloading(track.id)}
                                style={{ fontFamily: 'Jost, sans-serif', fontWeight: 400, fontSize: '13px' }}
                                className={`px-4 py-2 rounded font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${isDownloaded(track.id)
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : isDownloading(track.id)
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
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
                                style={{ fontFamily: 'Jost, sans-serif', fontWeight: 400, fontSize: '13px' }}
                                className={`px-4 py-2 rounded font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${isLiked(track.id)
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
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

                          <div className="flex gap-2">
                            {track.style && (
                              <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded uppercase tracking-wide" style={{ fontFamily: 'Jost, sans-serif', fontWeight: 400, fontSize: '13px' }}>
                                {track.style}
                              </span>
                            )}
                            {track.pool && (
                              <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded uppercase tracking-wide" style={{ fontFamily: 'Jost, sans-serif', fontWeight: 400, fontSize: '13px' }}>
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
            )}
          </div>
        </div>

      </div>

      {/* Footer Player */}
      <FooterPlayer />
    </div>
  );
}
