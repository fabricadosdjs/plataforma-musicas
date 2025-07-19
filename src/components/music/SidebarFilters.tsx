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

    const handleFilterChange = (type: 'genres' | 'versions', value: string) => {
      onFilterChange((prevFilters: any) => {
          const currentFilter = prevFilters[type];
          const newFilter = currentFilter.includes(value)
              ? currentFilter.filter((item: string) => item !== value)
              : [...currentFilter, value];
          return { ...prevFilters, [type]: newFilter };
      });
    };

    return (
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 p-6 hidden lg:block">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Filtros</h2>
        <div className="space-y-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Gênero</h3>
            <div className="space-y-2">
              {availableGenres.map(genre => (
                <label key={genre} className="flex items-center space-x-3 text-gray-600 cursor-pointer">
                  <input type="checkbox" onChange={() => handleFilterChange('genres', genre)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span>{genre}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Versão</h3>
            <div className="space-y-2">
              {availableVersions.map(version => (
                <label key={version} className="flex items-center space-x-3 text-gray-600 cursor-pointer">
                  <input type="checkbox" onChange={() => handleFilterChange('versions', version)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span>{version}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
});

export default SidebarFilters;