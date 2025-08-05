// src/app/new/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Music, Loader2, Sparkles, TrendingUp, Clock, Star, Zap, Flame, Crown, Gift, Heart, Download, Play, Pause, Volume2, FileAudio, Headphones, Mic, Disc3, Radio, Music2, Music3, Music4, Plus, Minus, ShoppingCart, Package } from 'lucide-react';
import { Track } from '@/types/track';
import MusicTable from '@/components/music/MusicTable';
import { useSEO } from '@/hooks/useSEO';
import SEOHead from '@/components/seo/SEOHead';
import MusicStructuredData from '@/components/seo/MusicStructuredData';

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
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedPool, setSelectedPool] = useState('');

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

      <main className="container mx-auto px-4 py-8 pt-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full backdrop-blur-sm border border-purple-500/30 animate-pulse-glow">
              <Music2 className="h-10 w-10 text-purple-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 neon-text">
            Novos Lançamentos
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Descubra os mais recentes lançamentos de música eletrônica em alta qualidade
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl backdrop-blur-sm border border-zinc-700/50">
            <Search className="h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar músicas, artistas ou gêneros..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
            />
            {isSearching && (
              <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl backdrop-blur-sm border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total de Músicas</p>
                <p className="text-2xl font-bold text-white">{loading ? '...' : tracks.length}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl backdrop-blur-sm border border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Em Alta</p>
                <p className="text-2xl font-bold text-white">{loading ? '...' : Math.floor(tracks.length * 0.3)}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl backdrop-blur-sm border border-orange-500/30">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Novos Hoje</p>
                <p className="text-2xl font-bold text-white">{loading ? '...' : Math.floor(tracks.length * 0.1)}</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl backdrop-blur-sm border border-yellow-500/30">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Premium</p>
                <p className="text-2xl font-bold text-white">{loading ? '...' : Math.floor(tracks.length * 0.2)}</p>
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