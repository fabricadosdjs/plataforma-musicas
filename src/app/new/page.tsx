// src/app/new/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Music, Loader2, Sparkles, TrendingUp, Clock, Star, Zap, Flame, Crown, Gift, Heart, Download, Play, Pause, Volume2, FileAudio, Headphones, Mic, Disc3, Radio, Music2, Music3, Music4, Plus, Minus, ShoppingCart, Package, CheckCircle, Waves, BarChart3, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
import Link from 'next/link';

// Componente de Loading para a página
const PageSkeleton = () => (
  <div className="animate-pulse">
    {/* Hero Section Skeleton */}
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
      </div>
      <div className="h-12 bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
      <div className="h-6 bg-gray-700 rounded w-1/2 mx-auto"></div>
    </div>

    {/* Search Bar Skeleton */}
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl">
        <div className="w-8 h-8 bg-gray-700 rounded"></div>
        <div className="flex-1 h-10 bg-gray-700 rounded"></div>
        <div className="w-24 h-10 bg-gray-700 rounded"></div>
      </div>
    </div>

    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="p-6 bg-zinc-800/50 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Table Skeleton */}
    <div className="w-full">
      <div className="hidden md:table min-w-full">
        <thead className="sticky top-0 z-10 bg-[#1A1B1C]/80 backdrop-blur-sm">
          <tr className="border-b border-zinc-800">
            <th className="px-4 py-3 w-[35%]">
              <div className="h-4 bg-gray-700 rounded w-24"></div>
            </th>
            <th className="px-4 py-3 w-[15%]">
              <div className="h-4 bg-gray-700 rounded w-16"></div>
            </th>
            <th className="px-4 py-3 w-[15%]">
              <div className="h-4 bg-gray-700 rounded w-12"></div>
            </th>
            <th className="px-4 py-3 w-[35%] text-right">
              <div className="h-4 bg-gray-700 rounded w-20 ml-auto"></div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/70">
          {Array.from({ length: 8 }).map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-4 py-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="h-6 bg-gray-700 rounded w-20"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-6 bg-gray-700 rounded w-16"></div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-8 h-8 bg-gray-700 rounded"></div>
                  <div className="w-8 h-8 bg-gray-700 rounded"></div>
                  <div className="w-8 h-8 bg-gray-700 rounded"></div>
                  <div className="w-8 h-8 bg-gray-700 rounded"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </div>
    </div>
  </div>
);

// Componente principal da página
function NewPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { hasExtension, detectedExtensions } = useDownloadExtensionDetector();
  const { showToast } = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedPool, setSelectedPool] = useState('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // SEO para a página
  const { seoData } = useSEO({
    customTitle: 'Novos Lançamentos - Músicas Eletrônicas',
    customDescription: 'Descubra os mais recentes lançamentos de música eletrônica. House, Techno, Trance e muito mais em alta qualidade.',
    customKeywords: 'novos lançamentos, música eletrônica, house, techno, trance, DJ, downloads'
  });

  // Estados otimizados
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search query
  const debouncedSearchQuery = useMemo(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchParams.get('q') || '');
    }, 300);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Fetch tracks with loading states
  const fetchTracks = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsSearching(true);
    }

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedGenre) params.append('genre', selectedGenre);
      if (selectedPool) params.append('pool', selectedPool);

      const response = await fetch(`/api/tracks?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTracks(data.tracks || []);
      }
    } catch (error) {
      console.error('Erro ao buscar músicas:', error);
    } finally {
      setIsSearching(false);
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [searchQuery, selectedGenre, selectedPool]);

  // Initial load effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTracks(false);
    }, 500); // Simula tempo de carregamento inicial

    return () => clearTimeout(timer);
  }, []);

  // Search effect
  useEffect(() => {
    if (!isInitialLoad) {
      fetchTracks();
    }
  }, [fetchTracks, isInitialLoad]);

  // Handle search input
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set('q', value);
    } else {
      url.searchParams.delete('q');
    }
    window.history.pushState({}, '', url.toString());
  }, []);

  // Handle tracks update
  const handleTracksUpdate = useCallback((updatedTracks: Track[]) => {
    setTracks(updatedTracks);
  }, []);

  // Render music table with loading
  const renderMusicTable = useCallback(() => {
    if (loading || isInitialLoad) {
      return <PageSkeleton />;
    }

    return (
      <MusicTable
        tracks={tracks}
        onDownload={handleTracksUpdate}
        isDownloading={isSearching}
      />
    );
  }, [tracks, loading, isInitialLoad, isSearching, handleTracksUpdate]);

  return (
    <div className="min-h-screen bg-[#1B1C1D] relative overflow-hidden">
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
      <main className="container mx-auto px-4 py-8 pt-20 relative z-10">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full backdrop-blur-sm border border-purple-500/30 animate-pulse-glow">
              <CheckCircle className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2 neon-text">
                Novidades
              </h1>
              <p className="text-gray-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400 animate-float" />
                As músicas mais recentes adicionadas ao catálogo
              </p>
            </div>
          </div>

          {!session && (
            <div className="w-full flex items-center justify-center py-3 px-4 mb-4 rounded-xl shadow-md bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-gray-100 font-semibold text-center text-sm backdrop-blur-sm animate-pulse">
              <Waves className="h-4 w-4 mr-2 text-orange-400" />
              Atenção: Usuários sem plano não podem ouvir, baixar ou curtir músicas. Apenas a navegação no catálogo está disponível.
            </div>
          )}
        </div>

        {/* Hero Section - Beatport Style */}
        <div className="mb-8 glass-effect rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Track */}
            <div className="lg:col-span-2 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl p-6 hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span className="text-purple-400 font-semibold text-sm uppercase tracking-wide">Featured Track</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">As músicas mais quentes da semana</h3>
              <p className="text-gray-300 mb-4">Descubra os últimos lançamentos que estão dominando as pistas de dança</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300">
                  <div className="w-8 h-8 bg-purple-600/30 rounded-full flex items-center justify-center text-purple-400 font-bold text-sm">
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">Loading...</div>
                    <div className="text-gray-400 text-sm truncate">Loading...</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      0
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      0
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/trending" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2">
                  <Play size={16} />
                  Ver Trending
                </Link>
                <Link href="/top-100" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200">
                  Top 100
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              <div className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <Music className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{loading ? '...' : tracks.length}</div>
                    <div className="text-gray-400 text-sm">Novas Músicas</div>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Star className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">VIP</div>
                    <div className="text-gray-400 text-sm">Acesso Premium</div>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">24/7</div>
                    <div className="text-gray-400 text-sm">Updates</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 100 Promotion Box */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-red-600/20 rounded-2xl p-6 border border-yellow-500/30 backdrop-blur-sm hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-full">
                  <Crown className="h-8 w-8 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">🎵 TOP 100 RANKING</h3>
                  <p className="text-gray-300 mb-3">Descubra as músicas mais populares da plataforma em tempo real</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4 text-yellow-400" />
                      Ranking em tempo real
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-orange-400" />
                      Atualizado agora
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="h-4 w-4 text-red-400" />
                      Trending tracks
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-400">100</div>
                  <div className="text-sm text-gray-400">Músicas</div>
                </div>
                <Link
                  href="/top-100"
                  className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-yellow-500/20 transform hover:scale-105 flex items-center gap-2"
                >
                  <Crown className="h-5 w-5" />
                  Ver Top 100
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Centralized Search Bar */}
        <div className="mb-8">
          <div className="w-full glass-effect rounded-3xl p-6 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 beatport-hover">
            <div className="flex flex-col items-center gap-4">
              {/* Search Bar */}
              <div className="flex items-center w-full max-w-2xl glass-effect rounded-full px-6 py-4 focus-within:border-purple-400/70 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 pulse-button">
                <Search className="h-5 w-5 text-purple-400 mr-4 animate-pulse" />
                <input
                  type="text"
                  placeholder="Buscar músicas, artistas, estilos..."
                  className="flex-grow bg-transparent outline-none text-white placeholder-gray-400 text-sm"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                {isSearching && (
                  <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Music Table */}
        <div className="w-full">
          {renderMusicTable()}
        </div>
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