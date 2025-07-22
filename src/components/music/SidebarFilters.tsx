// src/components/SidebarFilters.tsx
"use client";

import React, { memo, useMemo } from 'react';

// Tipos para este componente
type Track = {
  id: number;
  songName: string;
  artist: string;
  style: string;
  version: string;
  imageUrl: string;
  previewUrl: string;
  downloadUrl: string;
  releaseDate: string;
  isCopyrightProtected?: boolean;
};

const SidebarFilters = memo(function SidebarFilters({ tracks, onFilterChange }: { tracks: Track[], onFilterChange: (filters: any) => void }) {
  // Adicionar verificação para garantir que 'tracks' é um array antes de usar .map
  const safeTracks = tracks || []; // Garante que tracks é um array vazio se for null/undefined

  const availableGenres = useMemo(() => [...new Set(safeTracks.map(t => t.style))], [safeTracks]);
  const availableVersions = useMemo(() => [...new Set(safeTracks.map(t => t.version))], [safeTracks]);
  const availableArtists = useMemo(() => [...new Set(safeTracks.map(t => t.artist))], [safeTracks]);
  const minDate = useMemo(() => safeTracks.length ? safeTracks.reduce((min, t) => t.releaseDate < min ? t.releaseDate : min, safeTracks[0].releaseDate) : '', [safeTracks]);
  const maxDate = useMemo(() => safeTracks.length ? safeTracks.reduce((max, t) => t.releaseDate > max ? t.releaseDate : max, safeTracks[0].releaseDate) : '', [safeTracks]);

  const handleFilterChange = (type: 'genres' | 'versions' | 'artists', value: string) => {
    onFilterChange((prevFilters: any) => {
      const currentFilter = prevFilters[type];
      const newFilter = currentFilter.includes(value)
        ? currentFilter.filter((item: string) => item !== value)
        : [...currentFilter, value];
      return { ...prevFilters, [type]: newFilter };
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, bound: 'from' | 'to') => {
    const value = e.target.value;
    onFilterChange((prevFilters: any) => ({
      ...prevFilters,
      date: {
        ...prevFilters.date,
        [bound]: value,
      },
    }));
  };

  const handleClearFilters = () => {
    onFilterChange({ genres: [], versions: [], artists: [], date: { from: '', to: '' } });
  };

  return (
    <aside className="w-72 flex-shrink-0 border-r border-gray-700 p-6 hidden lg:block text-white min-h-screen" style={{ backgroundColor: '#202124' }}>
      <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Filtros</h2>
      <div className="space-y-8">
        <div>
          <h3 className="font-semibold text-white mb-3">Estilo</h3>
          <div className="space-y-2">
            {availableGenres.map(genre => (
              <label key={genre} className="flex items-center space-x-3 cursor-pointer text-gray-300 hover:text-white">
                <input type="checkbox" onChange={() => handleFilterChange('genres', genre)} className="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500" style={{ backgroundColor: '#2d2f32' }} />
                <span>{genre}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-3">Versão</h3>
          <div className="space-y-2">
            {availableVersions.map(version => (
              <label key={version} className="flex items-center space-x-3 cursor-pointer text-gray-300 hover:text-white">
                <input type="checkbox" onChange={() => handleFilterChange('versions', version)} className="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500" style={{ backgroundColor: '#2d2f32' }} />
                <span>{version}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-3">Artista</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {availableArtists.map(artist => (
              <label key={artist} className="flex items-center space-x-3 cursor-pointer text-gray-300 hover:text-white">
                <input type="checkbox" onChange={() => handleFilterChange('artists', artist)} className="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500" style={{ backgroundColor: '#2d2f32' }} />
                <span>{artist}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-3">Data de Lançamento</h3>
          <div className="flex space-x-2 items-center">
            <input
              type="date"
              min={minDate}
              max={maxDate}
              onChange={e => handleDateChange(e, 'from')}
              className="border border-gray-600 rounded px-2 py-1 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: '#2d2f32' }}
            />
            <span className="text-gray-400">até</span>
            <input
              type="date"
              min={minDate}
              max={maxDate}
              onChange={e => handleDateChange(e, 'to')}
              className="border border-gray-600 rounded px-2 py-1 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: '#2d2f32' }}
            />
          </div>
        </div>
        <div>
          <button
            onClick={handleClearFilters}
            className="w-full mt-2 py-2 px-4 rounded text-white font-semibold transition-colors hover:bg-gray-700"
            style={{ backgroundColor: '#2d2f32' }}
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    </aside>
  );
});

export default SidebarFilters;