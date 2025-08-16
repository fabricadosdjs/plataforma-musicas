// src/components/music/FiltersSidebar.tsx
"use client";

import { Calendar, Filter, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FiltersSidebarProps {
    genres: string[];
    artists: string[];
    versions: string[];
    pools: string[];
    monthOptions: Array<{ value: string; label: string }>;
    selectedGenres: string[];
    selectedArtists: string[];
    selectedPools: string[];
    selectedDateRange: string;
    selectedVersions: string[];
    selectedMonth: string;
    onGenresChange: (values: string[]) => void;
    onArtistsChange: (values: string[]) => void;
    onPoolsChange: (values: string[]) => void;
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
    pools,
    monthOptions,
    selectedGenres,
    selectedArtists,
    selectedPools,
    selectedDateRange,
    selectedVersions,
    selectedMonth,
    onGenresChange,
    onArtistsChange,
    onPoolsChange,
    onDateRangeChange,
    onVersionsChange,
    onMonthChange,
    onApplyFilters,
    onClearFilters,
    isLoading,
    hasActiveFilters
}: FiltersSidebarProps) {
    console.log('🎨 FiltersSidebar renderizando com:', {
        genres: genres.length,
        artists: artists.length,
        versions: versions.length,
        pools: pools.length,
        monthOptions: monthOptions.length,
        selectedGenres,
        selectedArtists,
        selectedPools,
        selectedVersions,
        selectedMonth,
        hasActiveFilters
    });

    // Estados para controlar dropdowns
    const [openDropdowns, setOpenDropdowns] = useState({
        genres: false,
        artists: false,
        versions: false,
        pools: false,
        month: false,
        dateRange: false
    });

    const toggleDropdown = (dropdown: keyof typeof openDropdowns) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [dropdown]: !prev[dropdown]
        }));
    };

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

    const handlePoolToggle = (pool: string) => {
        if (selectedPools.includes(pool)) {
            onPoolsChange(selectedPools.filter(p => p !== pool));
        } else {
            onPoolsChange([...selectedPools, pool]);
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
            className="backdrop-blur-xl rounded-3xl border shadow-2xl sticky top-24 overflow-hidden"
            style={{
                backgroundColor: '#0a0a0a',
                borderColor: '#dc2626',
                boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.3)'
            }}
        >
            {/* Header elegante com gradiente */}
            <div className="bg-gradient-to-r from-red-600/20 via-red-700/20 to-red-800/20 p-6 border-b border-red-700/50">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                            <Filter className="h-5 w-5 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                            Filtros Avançados
                        </span>
                    </h3>

                    {hasActiveFilters && (
                        <button
                            onClick={onClearFilters}
                            disabled={isLoading}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/30 text-red-400 rounded-xl transition-all duration-300 disabled:opacity-50 text-sm font-medium backdrop-blur-sm"
                        >
                            <X className="h-4 w-4" />
                            <span>Limpar</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Conteúdo dos filtros */}
            <div className="p-6 space-y-4">
                {/* Filtro por Gênero - Dropdown */}
                <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/30 overflow-hidden backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300">
                    <button
                        onClick={() => toggleDropdown('genres')}
                        className="w-full px-5 py-4 flex items-center justify-between text-left bg-transparent hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30">
                                <span className="text-2xl">🎵</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-semibold text-base">Gênero Musical</span>
                                <span className="text-gray-400 text-sm">Selecione os estilos</span>
                            </div>
                            {selectedGenres.length > 0 && (
                                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    {selectedGenres.length}
                                </span>
                            )}
                        </div>
                        <div className="p-2 bg-gray-700/30 rounded-lg">
                            {openDropdowns.genres ? (
                                <ChevronUp className="h-5 w-5 text-blue-400" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                    </button>

                    {openDropdowns.genres && (
                        <div className="px-5 pb-5 max-h-48 overflow-y-auto space-y-2 bg-gray-800/20">
                            {genres.map(genre => (
                                <label
                                    key={genre}
                                    className="flex items-center space-x-3 cursor-pointer hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 rounded-xl p-3 transition-all duration-200"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedGenres.includes(genre)}
                                        onChange={() => handleGenreToggle(genre)}
                                        className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                    />
                                    <span className="text-gray-200 font-medium">{genre}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Filtro por Artista - Dropdown */}
                <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/30 overflow-hidden backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300">
                    <button
                        onClick={() => toggleDropdown('artists')}
                        className="w-full px-5 py-4 flex items-center justify-between text-left bg-transparent hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-300"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/30">
                                <span className="text-2xl">🎤</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-semibold text-base">Artista</span>
                                <span className="text-gray-400 text-sm">Escolha os artistas</span>
                            </div>
                            {selectedArtists.length > 0 && (
                                <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    {selectedArtists.length}
                                </span>
                            )}
                        </div>
                        <div className="p-2 bg-gray-700/30 rounded-lg">
                            {openDropdowns.artists ? (
                                <ChevronUp className="h-5 w-5 text-purple-400" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                    </button>

                    {openDropdowns.artists && (
                        <div className="px-5 pb-5 max-h-48 overflow-y-auto space-y-2 bg-gray-800/20">
                            {artists.map(artist => (
                                <label
                                    key={artist}
                                    className="flex items-center space-x-3 cursor-pointer hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 rounded-xl p-3 transition-all duration-200"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedArtists.includes(artist)}
                                        onChange={() => handleArtistToggle(artist)}
                                        className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                    />
                                    <span className="text-gray-200 font-medium">{artist}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Seção de Estilos e Pool/Label lado a lado */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Filtro por Estilos - Dropdown */}
                    <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/30 overflow-hidden backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300">
                        <button
                            onClick={() => toggleDropdown('genres')}
                            className="w-full px-4 py-4 flex items-center justify-between text-left bg-transparent hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 transition-all duration-300"
                        >
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl border border-emerald-500/30">
                                    <span className="text-xl">🎭</span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-white font-semibold text-sm">Estilos</span>
                                    <span className="text-gray-400 text-xs">Gêneros musicais</span>
                                </div>
                                {selectedGenres.length > 0 && (
                                    <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg ml-1">
                                        {selectedGenres.length}
                                    </span>
                                )}
                            </div>
                            <div className="p-1.5 bg-gray-700/30 rounded-lg ml-2">
                                {openDropdowns.genres ? (
                                    <ChevronUp className="h-4 w-4 text-emerald-400" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                            </div>
                        </button>

                        {openDropdowns.genres && (
                            <div className="px-4 pb-4 max-h-40 overflow-y-auto space-y-2 bg-gray-800/20">
                                {genres.map(genre => (
                                    <label
                                        key={genre}
                                        className="flex items-center space-x-2 cursor-pointer hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 rounded-lg p-2 transition-all duration-200"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedGenres.includes(genre)}
                                            onChange={() => handleGenreToggle(genre)}
                                            className="w-4 h-4 text-emerald-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                        />
                                        <span className="text-gray-200 font-medium text-sm truncate">{genre}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filtro por Pool/Label - Dropdown */}
                    <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/30 overflow-hidden backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300">
                        <button
                            onClick={() => toggleDropdown('pools')}
                            className="w-full px-4 py-4 flex items-center justify-between text-left bg-transparent hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-500/10 transition-all duration-300"
                        >
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl border border-amber-500/30">
                                    <span className="text-xl">🏷️</span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-white font-semibold text-sm">Pool/Label</span>
                                    <span className="text-gray-400 text-xs">Gravadoras</span>
                                </div>
                                {selectedPools.length > 0 && (
                                    <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg ml-1">
                                        {selectedPools.length}
                                    </span>
                                )}
                            </div>
                            <div className="p-1.5 bg-gray-700/30 rounded-lg ml-2">
                                {openDropdowns.pools ? (
                                    <ChevronUp className="h-4 w-4 text-amber-400" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                            </div>
                        </button>

                        {openDropdowns.pools && (
                            <div className="px-4 pb-4 max-h-40 overflow-y-auto space-y-2 bg-gray-800/20">
                                {pools.map(pool => (
                                    <label
                                        key={pool}
                                        className="flex items-center space-x-2 cursor-pointer hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-500/10 rounded-lg p-2 transition-all duration-200"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedPools.includes(pool)}
                                            onChange={() => handlePoolToggle(pool)}
                                            className="w-4 h-4 text-amber-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                        />
                                        <span className="text-gray-200 font-medium text-sm truncate">{pool}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Filtro por Versão - Dropdown */}
                <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/30 overflow-hidden backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300">
                    <button
                        onClick={() => toggleDropdown('versions')}
                        className="w-full px-5 py-4 flex items-center justify-between text-left bg-transparent hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-red-500/10 transition-all duration-300"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl border border-orange-500/30">
                                <span className="text-2xl">⭐</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-semibold text-base">Versão</span>
                                <span className="text-gray-400 text-sm">Selecione as versões</span>
                            </div>
                            {selectedVersions.length > 0 && (
                                <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    {selectedVersions.length}
                                </span>
                            )}
                        </div>
                        <div className="p-2 bg-gray-700/30 rounded-lg">
                            {openDropdowns.versions ? (
                                <ChevronUp className="h-5 w-5 text-orange-400" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                    </button>

                    {openDropdowns.versions && (
                        <div className="px-5 pb-5 max-h-32 overflow-y-auto space-y-2 bg-gray-800/20">
                            {versions.map(version => (
                                <label
                                    key={version}
                                    className="flex items-center space-x-3 cursor-pointer hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-red-500/10 rounded-xl p-3 transition-all duration-200"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedVersions.includes(version)}
                                        onChange={() => handleVersionToggle(version)}
                                        className="w-5 h-5 text-orange-600 bg-gray-700 border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                    />
                                    <span className="text-gray-200 font-medium">{version}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Filtro por Mês - Dropdown */}
                <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/30 overflow-hidden backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300">
                    <button
                        onClick={() => toggleDropdown('month')}
                        className="w-full px-5 py-4 flex items-center justify-between text-left bg-transparent hover:bg-gradient-to-r hover:from-teal-500/10 hover:to-cyan-500/10 transition-all duration-300"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-xl border border-teal-500/30">
                                <Calendar className="h-5 w-5 text-teal-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-semibold text-base">Mês de Lançamento</span>
                                <span className="text-gray-400 text-sm">Escolha o período</span>
                            </div>
                        </div>
                        <div className="p-2 bg-gray-700/30 rounded-lg">
                            {openDropdowns.month ? (
                                <ChevronUp className="h-5 w-5 text-teal-400" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                    </button>

                    {openDropdowns.month && (
                        <div className="px-5 pb-5 bg-gray-800/20">
                            <select
                                value={selectedMonth}
                                onChange={(e) => onMonthChange(e.target.value)}
                                className="w-full px-4 py-3 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-700/50 border-gray-600/50 hover:border-teal-500/50 transition-all duration-200"
                            >
                                <option value="all">Todos os meses</option>
                                {monthOptions.map(month => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Filtro por Data Range - Dropdown */}
                <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/30 overflow-hidden backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300">
                    <button
                        onClick={() => toggleDropdown('dateRange')}
                        className="w-full px-5 py-4 flex items-center justify-between text-left bg-transparent hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-blue-500/10 transition-all duration-300"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-xl border border-indigo-500/30">
                                <span className="text-2xl">📅</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-semibold text-base">Período</span>
                                <span className="text-gray-400 text-sm">Defina o intervalo</span>
                            </div>
                        </div>
                        <div className="p-2 bg-gray-700/30 rounded-lg">
                            {openDropdowns.dateRange ? (
                                <ChevronUp className="h-5 w-5 text-indigo-400" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                    </button>

                    {openDropdowns.dateRange && (
                        <div className="px-5 pb-5 bg-gray-800/20">
                            <select
                                value={selectedDateRange}
                                onChange={(e) => onDateRangeChange(e.target.value)}
                                className="w-full px-4 py-3 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-700/50 border-gray-600/50 hover:border-indigo-500/50 transition-all duration-200"
                            >
                                <option value="all">Todos os períodos</option>
                                <option value="today">Hoje</option>
                                <option value="yesterday">Ontem</option>
                                <option value="this-week">Esta semana</option>
                                <option value="this-month">Este mês</option>
                                <option value="3months">Últimos 3 meses</option>
                                <option value="6months">Últimos 6 meses</option>
                                <option value="year">Último ano</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="px-6 pb-6 space-y-4">
                <button
                    onClick={onApplyFilters}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center space-x-3 hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Search className="h-5 w-5" />
                    <span>Aplicar Filtros</span>
                </button>
            </div>

            {/* Estatísticas */}
            {hasActiveFilters && (
                <div className="mx-6 mb-6 p-4 border rounded-2xl bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/20">
                    <div className="flex items-center space-x-3 text-red-400 text-sm font-medium">
                        <Filter className="h-5 w-5" />
                        <span>Filtros Ativos</span>
                    </div>
                    <p className="text-xs text-red-300 mt-2">
                        Clique em "Aplicar Filtros" para ver os resultados filtrados
                    </p>
                </div>
            )}
        </div>
    );
}
