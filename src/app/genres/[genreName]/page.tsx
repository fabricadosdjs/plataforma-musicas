'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Play, Pause, Download, Heart, BarChart3, Music, Star, Tag } from 'lucide-react';
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
import Link from 'next/link';

interface PopularTrack extends Track {
  downloadCount: number;
}


export default function GenrePage() {
  const params = useParams();
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const genreName = params.genreName as string;
  const { data: session } = useSession();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useGlobalPlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [popularTracks, setPopularTracks] = useState<PopularTrack[]>([]);
  const [recentStyles, setRecentStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTracks, setTotalTracks] = useState(0);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [downloadingBatch, setDownloadingBatch] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number, total: number }>({ current: 0, total: 0 });
  const [batchCancel, setBatchCancel] = useState<boolean>(false);

  // Hook personalizado para estados de download e like
  const {
    isDownloaded, isDownloading, isLiked, isLiking,
    markAsDownloaded, markAsDownloading, markAsNotDownloading,
    markAsLiked, markAsNotLiked, markAsLiking, markAsNotLiking,
    loadUserStates
  } = useTrackStates();

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

  // Função para buscar tracks do gênero específico
  const fetchGenreTracks = async (page: number = 1) => {
    setTracksLoading(true);
    try {
      const response = await fetch(`/api/genres/${encodeURIComponent(genreName)}?page=${page}&limit=60`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text);
        throw new Error('Response is not JSON');
      }

      const data = await response.json();
      setTracks(data.tracks || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalTracks(data.pagination?.totalCount || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching genre tracks:', error);
      toast.error('Erro ao carregar músicas do gênero');
    } finally {
      setTracksLoading(false);
    }
  };

  // Função para buscar dados iniciais
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Usar a página da URL ou página 1 como padrão
      const pageFromUrl = parseInt(urlSearchParams.get('page') || '1');

      // Buscar tracks, artistas e pools do gênero específico
      await Promise.all([
        fetchGenreTracks(pageFromUrl),
        fetch(`/api/genres/${encodeURIComponent(genreName)}/artists`)
          .then(res => res.json())
          .then(data => setAvailableArtists(data))
          .catch(err => console.error('Erro ao buscar artistas:', err)),
        fetch(`/api/genres/${encodeURIComponent(genreName)}/pools`)
          .then(res => res.json())
          .then(data => setAvailablePools(data))
          .catch(err => console.error('Erro ao buscar pools:', err))
      ]);

      // Marcar automaticamente o estilo da página nos filtros
      setSearchParams(prev => ({
        ...prev,
        styles: [genreName]
      }));
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (genreName && isClient) {
      // Ler a página da URL
      const pageFromUrl = parseInt(urlSearchParams.get('page') || '1');
      setCurrentPage(pageFromUrl);

      fetchInitialData();
      loadUserStates(tracks.map(t => t.id));
    }
  }, [genreName, isClient, urlSearchParams]);

  // Função para download individual
  const handleDownload = async (track: Track) => {
    if (!session?.user) {
      toast.error('🔒 Faça login para baixar músicas');
      return;
    }

    if (isDownloading(track.id)) return;

    markAsDownloading(track.id);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id })
      });

      if (!response.ok) {
        throw new Error('Erro no download');
      }

      const { downloadUrl } = await response.json();
      const downloadResponse = await fetch(downloadUrl);
      const blob = await downloadResponse.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${track.artist} - ${track.songName}.mp3`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      markAsDownloaded(track.id);
      toast.success('✅ Download concluído!');

    } catch (error) {
      console.error('Erro no download:', error);
      toast.error('❌ Erro ao baixar música');
    } finally {
      markAsNotDownloading(track.id);
    }
  };

  // Função para like
  const handleLike = async (track: Track) => {
    if (!session?.user) {
      toast.error('🔒 Faça login para curtir músicas');
      return;
    }

    if (isLiking(track.id)) return;

    markAsLiking(track.id);

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id })
      });

      if (response.ok) {
        if (isLiked(track.id)) {
          markAsNotLiked(track.id);
          toast.success('💔 Música removida dos favoritos');
        } else {
          markAsLiked(track.id);
          toast.success('❤️ Música adicionada aos favoritos');
        }
      }
    } catch (error) {
      console.error('Erro no like:', error);
      toast.error('❌ Erro ao curtir música');
    } finally {
      markAsNotLiking(track.id);
    }
  };

  // Função para play/pause
  const handlePlayPause = async (track: Track) => {
    if (!session) {
      toast.error('🔒 Faça login para ouvir as músicas');
      return;
    }

    try {
      if (currentTrack?.id === track.id && isPlaying) {
        togglePlayPause();
      } else {
        await playTrack(track);
      }
    } catch (error) {
      console.error('Erro ao reproduzir:', error);
      toast.error('❌ Erro ao reproduzir música');
    }
  };

  // Função para download em lotes
  const downloadBatch = async (isNewOnly: boolean = false) => {
    if (!session?.user) {
      toast.error('🔒 Faça login para baixar músicas');
      return;
    }

    if (downloadingBatch) {
      toast.error('⏳ Download em andamento, aguarde...');
      return;
    }

    // Usar todas as músicas da página atual
    const sourceTracks = tracks;

    // Para DOWNLOAD ALL, sempre usar todas as músicas da página
    // Para DOWNLOAD NEW, usar apenas músicas não baixadas da página
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

  // Função para mudança de página
  const handlePageChange = (page: number) => {
    // Atualizar a URL com o parâmetro de página
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    router.push(url.pathname + url.search);

    // Buscar os dados da nova página
    fetchGenreTracks(page);
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-black text-white font-montserrat">
        <Header />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-white text-xl">Carregando músicas do gênero...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-montserrat">
      <Header />

      {/* Main Content - Full Screen */}
      <div className="pt-24 min-h-screen pb-32">
        {/* Main Content Area */}
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Genre Header */}
          <div className="mb-12">
            <div className="relative">
              {/* Background gradient */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%), linear-gradient(45deg, #1a1a1a 0%, #2d1b69 25%, #11998e 50%, #38ef7d 75%, #1a1a1a 100%)'
                }}
              ></div>

              {/* Main content */}
              <div className="relative p-8 bg-gradient-to-r from-gray-900/40 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl">
                <div className="text-center mb-6">
                  {/* Pool de Gravação */}
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-sm font-montserrat font-semibold uppercase tracking-[0.2em] letter-spacing-wider">
                      Pool de Gravação
                    </span>
                  </div>

                  {/* Genre Name */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bebas font-black text-white tracking-tight mb-3 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                    {genreName?.toUpperCase()}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-gray-300 text-lg font-montserrat font-medium max-w-2xl mx-auto leading-relaxed">
                    Explore todas as músicas do gênero {genreName}. Encontre as melhores tracks para sua próxima mix.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white">{totalTracks.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">Músicas Disponíveis</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white">{totalPages}</p>
                        <p className="text-gray-400 text-sm">Páginas</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Tag className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-white">1</p>
                        <p className="text-gray-400 text-sm">Gênero</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-4">
            <AdvancedSearch
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              availableStyles={[genreName]} // Apenas o gênero da página
              availableArtists={availableArtists}
              availablePools={availablePools}
            />
          </div>

          {/* Botões de Download em Lote */}
          <div className="mb-4 flex justify-end items-center">
            <div className="flex gap-2">
              {/* Botão Download New */}
              <button
                onClick={() => {
                  console.log('🔍 DOWNLOAD NEW clicado:', {
                    genreName,
                    tracksCount: tracks.length,
                    downloadedInThisGenre: tracks.filter(track => isDownloaded(track.id)).length,
                    newInThisGenre: tracks.filter(track => !isDownloaded(track.id)).length,
                  });
                  downloadBatch(true);
                }}
                disabled={downloadingBatch || tracks.every(track => isDownloaded(track.id))}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xs font-medium rounded transition-all duration-200 flex items-center gap-1"
                title={`Baixar apenas músicas novas deste gênero (${tracks.filter(track => !isDownloaded(track.id)).length} novas)`}
              >
                <Download className="w-3 h-3" />
                DOWNLOAD NEW
              </button>

              {/* Botão Download All */}
              <button
                onClick={() => downloadBatch(false)}
                disabled={downloadingBatch}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs font-medium rounded transition-all duration-200 flex items-center gap-1"
                title={`Baixar todas as músicas deste gênero (${tracks.length} músicas)`}
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

            {/* Progress Bar (só aparece durante download) */}
            {downloadingBatch && batchProgress.total > 0 && (
              <div className="max-w-md mr-4">
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
          </div>

          {/* Linha verde separadora */}
          <div className="w-full h-px bg-green-500 mb-4"></div>

          {/* Tracks List - Mesma estrutura da homepage */}
          <div className="space-y-0">
            {tracksLoading ? (
              <div className="text-center py-8">
                <div className="text-white text-lg">Carregando músicas...</div>
              </div>
            ) : tracks.length > 0 ? (
              tracks.map((track, index) => (
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
                          <h3 className="text-white font-inter font-semibold truncate" style={{ fontSize: '12px' }} title={track.songName}>
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
                            disabled={isDownloading(track.id)}
                            style={{ fontSize: '13px' }}
                            className={`px-4 py-2 rounded font-inter font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${isDownloaded(track.id)
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
                            style={{ fontSize: '13px' }}
                            className={`px-4 py-2 rounded font-inter font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${isLiked(track.id)
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
                          <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded font-inter font-medium" style={{ fontSize: '13px' }}>
                            {track.style}
                          </span>
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
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">Nenhuma música encontrada para este gênero.</div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50"
                >
                  Anterior
                </button>

                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                    const startPage = Math.max(1, Math.min(totalPages - 9, currentPage - 4));
                    const pageNum = startPage + i;
                    if (pageNum > totalPages) return null;

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
            </div>
          )}
        </div>
      </div>

      {/* Footer Player */}
      <FooterPlayer />
    </div>
  );
}