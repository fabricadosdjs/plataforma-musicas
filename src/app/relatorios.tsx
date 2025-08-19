"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import MainLayout from '@/components/layout/MainLayout';
import {
  BarChart3, TrendingUp, Music, Download, Users, Calendar,
  Play, Heart, Star, Activity, Target, Award, Globe,
  ChevronDown, Filter, Search, RefreshCw, Eye, BarChart, Clock
} from 'lucide-react';

interface TrackStats {
  totalTracks: number;
  totalDownloads: number;
  totalPlays: number;
  totalLikes: number;
  genres: Record<string, number>;
  artists: Record<string, number>;
  pools: Record<string, number>;
  recentTracks: any[];
  topTracks: any[];
}

const RelatoriosPage = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<TrackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod, selectedGenre]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas via API
      const response = await fetch('/api/stats?' + new URLSearchParams({
        period: selectedPeriod,
        genre: selectedGenre
      }));

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        throw new Error('Erro ao buscar estatísticas');
      }

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Dados de exemplo para demonstração
      setStats({
        totalTracks: 1250,
        totalDownloads: 5670,
        totalPlays: 2340,
        totalLikes: 890,
        genres: {
          'House': 320,
          'Techno': 280,
          'Trance': 200,
          'Dubstep': 180,
          'Deep House': 150,
          'Progressive House': 120
        },
        artists: {
          'DJ Groove Master': 45,
          'Bass Hunter': 38,
          'Techno King': 32,
          'House Master': 28,
          'Trance Lord': 25
        },
        pools: {
          'Nexor Records': 800,
          'Community': 300,
          'Premium': 150
        },
        recentTracks: [
          { songName: 'Midnight Groove', artist: 'DJ Groove Master', style: 'House', pool: 'Nexor Records' },
          { songName: 'Deep Bass', artist: 'Bass Hunter', style: 'Dubstep', pool: 'Community' },
          { songName: 'Techno Storm', artist: 'Techno King', style: 'Techno', pool: 'Premium' }
        ],
        topTracks: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getTopGenres = () => {
    if (!stats?.genres) return [];
    return Object.entries(stats.genres)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);
  };

  const getTopArtists = () => {
    if (!stats?.artists) return [];
    return Object.entries(stats.artists)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Carregando relatórios...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Relatórios e Estatísticas
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Análise completa da plataforma musical com métricas detalhadas
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                  <option value="1y">Último ano</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Music className="h-5 w-5 text-pink-400" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">Todos os gêneros</option>
                  {stats?.genres && Object.keys(stats.genres).map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={fetchStats}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </button>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <Music className="h-6 w-6 text-purple-400" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-2">Total de Faixas</h3>
              <p className="text-3xl font-bold text-white">{stats?.totalTracks || 0}</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-pink-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-pink-600/20 rounded-lg flex items-center justify-center">
                  <Download className="h-6 w-6 text-pink-400" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-2">Total de Downloads</h3>
              <p className="text-3xl font-bold text-white">{stats?.totalDownloads || 0}</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Play className="h-6 w-6 text-blue-400" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-2">Total de Plays</h3>
              <p className="text-3xl font-bold text-white">{stats?.totalPlays || 0}</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-green-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-green-400" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-2">Total de Likes</h3>
              <p className="text-3xl font-bold text-white">{stats?.totalLikes || 0}</p>
            </div>
          </div>

          {/* Gráficos e Análises */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Top Gêneros */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Top Gêneros
              </h3>
              <div className="space-y-4">
                {getTopGenres().map(([genre, count], index) => (
                  <div key={genre} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400 font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="text-white font-medium">{genre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(count / (stats?.totalTracks || 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-300 text-sm w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Artistas */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-pink-400" />
                Top Artistas
              </h3>
              <div className="space-y-4">
                {getTopArtists().map(([artist, count], index) => (
                  <div key={artist} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-pink-600/20 rounded-lg flex items-center justify-center">
                        <span className="text-pink-400 font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="text-white font-medium">{artist}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(count / (stats?.totalTracks || 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-300 text-sm w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tracks Recentes */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Faixas Recentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats?.recentTracks.map((track, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <Music className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{track.songName}</h4>
                      <p className="text-gray-400 text-xs">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{track.style}</span>
                    <span>{track.pool}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RelatoriosPage;
