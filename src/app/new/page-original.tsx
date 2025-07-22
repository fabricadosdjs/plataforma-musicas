"use client";

import Header from '@/components/layout/Header';
import MusicTable from '@/components/music/MusicTable';
import FooterPlayer from '@/components/player/FooterPlayer';
import { Track } from '@/types/track';
import { Filter, Loader2, Music, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NewPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    fetchTracks();
  }, []);

  useEffect(() => {
    filterTracks();
  }, [tracks, searchQuery, selectedGenre]);

  const fetchTracks = async () => {
    try {
      const response = await fetch('/api/tracks');
      if (response.ok) {
        const data = await response.json();
        setTracks(data);

        // Extrai gêneros únicos para filtro
        const uniqueGenres = [...new Set(data.map((track: Track) => track.style))] as string[];
        setGenres(uniqueGenres);
      } else {
        console.error('Erro ao buscar músicas');
      }
    } catch (error) {
      console.error('Erro ao buscar músicas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTracks = () => {
    let filtered = tracks;

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(track =>
        track.songName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.style.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por gênero
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(track => track.style === selectedGenre);
    }

    setFilteredTracks(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090A15] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <div className="text-white text-lg">Carregando músicas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A15] text-white">
      <Header onSearchChange={handleSearch} />

      <main className="p-6 pb-32">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho da página */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Novas Músicas</h1>
              <p className="text-zinc-400 mt-1">Descubra os lançamentos mais recentes da plataforma</p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-2xl font-bold text-white">{tracks.length}</div>
              <div className="text-zinc-400 text-sm">Total de Músicas</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-2xl font-bold text-white">{genres.length}</div>
              <div className="text-zinc-400 text-sm">Gêneros Disponíveis</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="text-2xl font-bold text-white">{filteredTracks.length}</div>
              <div className="text-zinc-400 text-sm">Músicas Filtradas</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-white">Filtros</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro por gênero */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Gênero Musical
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os Gêneros</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo de busca adicional */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Busca Rápida
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Buscar música, artista ou gênero..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-3 py-2 text-white placeholder-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de músicas */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {filteredTracks.length === 0 ? (
              <div className="p-12 text-center">
                <Music className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-400 mb-2">
                  Nenhuma música encontrada
                </h3>
                <p className="text-zinc-500">
                  Tente ajustar os filtros ou a busca para encontrar mais resultados.
                </p>
              </div>
            ) : (
              <MusicTable tracks={filteredTracks} />
            )}
          </div>
        </div>
      </main>

      <FooterPlayer />
    </div>
  );
}
