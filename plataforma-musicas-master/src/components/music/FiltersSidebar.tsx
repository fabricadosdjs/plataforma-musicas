// src/components/music/FiltersSidebar.tsx
"use client";

import { Calendar, Filter, Search, X } from 'lucide-react';

interface FiltersSidebarProps {
    genres: string[];
    artists: string[];
    versions: string[];
    monthOptions: Array<{ value: string; label: string }>;
    selectedGenres: string[];
    selectedArtists: string[];
    selectedDateRange: string;
    selectedVersions: string[];
    selectedMonth: string;
    onGenresChange: (values: string[]) => void;
    onArtistsChange: (values: string[]) => void;
    onDateRangeChange: (value: string) => void;
    onVersionsChange: (values: string[]) => void;
    onMonthChange: (value: string) => void;
    onApplyFilters: () => void;
    onClearFilters: () => void;
    isLoading: boolean;
    hasActiveFilters: boolean;
}

export default function FiltersSidebar({
    genres,
    artists,
    versions,
    monthOptions,
    selectedGenres,
    selectedArtists,
    selectedDateRange,
    selectedVersions,
    selectedMonth,
    onGenresChange,
    onArtistsChange,
    onDateRangeChange,
    onVersionsChange,
    onMonthChange,
    onApplyFilters,
    onClearFilters,
    isLoading,
    hasActiveFilters
}: FiltersSidebarProps) {

    const handleGenreToggle = (genre: string) => {
        if (selectedGenres.includes(genre)) {
            onGenresChange(selectedGenres.filter(g => g !== genre));
        } else {
            onGenresChange([...selectedGenres, genre]);
        }
    };

    const handleArtistToggle = (artist: string) => {
        if (selectedArtists.includes(artist)) {
            onArtistsChange(selectedArtists.filter(a => a !== artist));
        } else {
            onArtistsChange([...selectedArtists, artist]);
        }
    };

    const handleVersionToggle = (version: string) => {
        if (selectedVersions.includes(version)) {
            onVersionsChange(selectedVersions.filter(v => v !== version));
        } else {
            onVersionsChange([...selectedVersions, version]);
        }
    };

    return (
        <div
            className="backdrop-blur-lg rounded-2xl border p-6 shadow-2xl sticky top-24"
            style={{
                backgroundColor: '#2a2a2a',
                borderColor: '#3a3a3a'
            }}
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Filtros</span>
                </h3>

                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        disabled={isLoading}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 rounded-lg transition-all duration-200 disabled:opacity-50 text-sm"
                    >
                        <X className="h-3 w-3" />
                        <span>Limpar</span>
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Filtro por Gênero - Checkboxes */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        🎵 Gênero Musical ({selectedGenres.length} selecionados)
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {genres.map(genre => (
                            <label
                                key={genre}
                                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800/30 rounded-lg p-2 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedGenres.includes(genre)}
                                    onChange={() => handleGenreToggle(genre)}
                                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm text-gray-300">{genre}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Filtro por Artista - Checkboxes */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        🎤 Artista ({selectedArtists.length} selecionados)
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {artists.map(artist => (
                            <label
                                key={artist}
                                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800/30 rounded-lg p-2 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedArtists.includes(artist)}
                                    onChange={() => handleArtistToggle(artist)}
                                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm text-gray-300">{artist}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Filtro por Versão - Checkboxes */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        🎧 Versões ({selectedVersions.length} selecionadas)
                    </label>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                        {versions.map(version => (
                            <label
                                key={version}
                                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800/30 rounded-lg p-2 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedVersions.includes(version)}
                                    onChange={() => handleVersionToggle(version)}
                                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm text-gray-300">{version}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Filtro por Mês */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        <Calendar className="inline h-4 w-4 mr-2" />
                        Mês de Lançamento
                    </label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => onMonthChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{
                            backgroundColor: '#1a1a1a',
                            borderColor: '#3a3a3a'
                        }}
                    >
                        <option value="all">Todos os meses</option>
                        {monthOptions.map(month => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filtro por Data Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        📅 Período
                    </label>
                    <select
                        value={selectedDateRange}
                        onChange={(e) => onDateRangeChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{
                            backgroundColor: '#1a1a1a',
                            borderColor: '#3a3a3a'
                        }}
                    >
                        <option value="all">Todos os períodos</option>
                        <option value="week">Última semana</option>
                        <option value="month">Último mês</option>
                        <option value="3months">Últimos 3 meses</option>
                        <option value="6months">Últimos 6 meses</option>
                        <option value="year">Último ano</option>
                    </select>
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="mt-6 space-y-3">
                <button
                    onClick={onApplyFilters}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                >
                    <Search className="h-4 w-4" />
                    <span>Aplicar Filtros</span>
                </button>
            </div>

            {/* Estatísticas */}
            {hasActiveFilters && (
                <div
                    className="mt-6 p-4 border rounded-lg"
                    style={{
                        backgroundColor: '#1a2332',
                        borderColor: '#2563eb50'
                    }}
                >
                    <div className="flex items-center space-x-2 text-blue-400 text-sm">
                        <Filter className="h-4 w-4" />
                        <span>Filtros aplicados</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Clique em "Aplicar Filtros" para ver os resultados
                    </p>
                </div>
            )}
        </div>
    );
}
