"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, Filter, X, Music, User, Building, Hash } from 'lucide-react';

interface AdvancedSearchProps {
    searchParams?: {
        query: string;
        styles: string[];
        artists: string[];
        pools: string[];
    };
    setSearchParams?: (params: {
        query: string;
        styles: string[];
        artists: string[];
        pools: string[];
    }) => void;
    availableStyles?: string[];
    availableArtists?: string[];
    availablePools?: string[];
    onSearch?: (searchParams: {
        query: string;
        styles: string[];
        artists: string[];
        pools: string[];
    }) => void;
    onClear?: () => void;
    styles?: string[];
    artists?: string[];
    pools?: string[];
}

export default function AdvancedSearch({
    searchParams,
    setSearchParams,
    availableStyles = [],
    availableArtists = [],
    availablePools = [],
    onSearch,
    onClear,
    styles = [],
    artists = [],
    pools = []
}: AdvancedSearchProps) {
    const [searchQuery, setSearchQuery] = useState(searchParams?.query || '');
    const [selectedStyles, setSelectedStyles] = useState<string[]>(searchParams?.styles || []);
    const [selectedArtists, setSelectedArtists] = useState<string[]>(searchParams?.artists || []);
    const [selectedPools, setSelectedPools] = useState<string[]>(searchParams?.pools || []);
    const [showFilters, setShowFilters] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Marcar como hidratado quando o componente montar no cliente
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Sincronizar estados quando as props mudarem
    useEffect(() => {
        if (searchParams) {
            setSearchQuery(searchParams.query || '');
            setSelectedStyles(searchParams.styles || []);
            setSelectedArtists(searchParams.artists || []);
            setSelectedPools(searchParams.pools || []);
        }
    }, [searchParams]);

    // Usar as props corretas para filtragem
    const stylesToUse = availableStyles.length > 0 ? availableStyles : styles;
    const artistsToUse = availableArtists.length > 0 ? availableArtists : artists;
    const poolsToUse = availablePools.length > 0 ? availablePools : pools;

    // Filtrar opções baseado na busca usando useMemo para evitar re-renders
    const filteredStyles = useMemo(() => {
        if (searchQuery) {
            return stylesToUse.filter(style =>
                style.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return stylesToUse;
    }, [searchQuery, stylesToUse]);

    const filteredArtists = useMemo(() => {
        if (searchQuery) {
            return artistsToUse.filter(artist =>
                artist.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return artistsToUse;
    }, [searchQuery, artistsToUse]);

    const filteredPools = useMemo(() => {
        if (searchQuery) {
            return poolsToUse.filter(pool =>
                pool.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return poolsToUse;
    }, [searchQuery, poolsToUse]);

    // Gerenciar hash da URL
    useEffect(() => {
        // Só executar após hidratação
        if (!isHydrated) return;

        // Ler hash da URL ao carregar
        const hash = window.location.hash.substring(1);
        if (hash) {
            try {
                const params = JSON.parse(decodeURIComponent(hash));
                if (params.query) setSearchQuery(params.query);
                if (params.styles) setSelectedStyles(params.styles);
                if (params.artists) setSelectedArtists(params.artists);
                if (params.pools) setSelectedPools(params.pools);
            } catch (error) {
                console.error('Erro ao decodificar hash:', error);
            }
        }
    }, [isHydrated]);

    // Atualizar hash quando filtros mudarem
    const updateHash = () => {
        if (!isHydrated) return;

        const params = {
            query: searchQuery,
            styles: selectedStyles,
            artists: selectedArtists,
            pools: selectedPools
        };

        const hash = encodeURIComponent(JSON.stringify(params));
        window.history.replaceState(null, '', `#${hash}`);
    };

    const handleSearch = () => {
        updateHash();
        const searchData = {
            query: searchQuery,
            styles: selectedStyles,
            artists: selectedArtists,
            pools: selectedPools,
        };

        if (setSearchParams) {
            setSearchParams(searchData);
        }

        if (onSearch) {
            onSearch(searchData);
        }
    };

    const handleClear = () => {
        setSearchQuery('');
        setSelectedStyles([]);
        setSelectedArtists([]);
        setSelectedPools([]);

        if (isHydrated) {
            window.history.replaceState(null, '', window.location.pathname);
        }

        if (setSearchParams) {
            setSearchParams({
                query: '',
                styles: [],
                artists: [],
                pools: []
            });
        }

        if (onClear) {
            onClear();
        }
    };

    const hasActiveFilters = selectedStyles.length > 0 || selectedArtists.length > 0 || selectedPools.length > 0;

    // Funções para gerenciar seleção múltipla
    const toggleStyle = (style: string) => {
        // Não permitir desmarcar o estilo da página (quando há apenas um estilo disponível)
        const isPageStyle = availableStyles.length === 1 && availableStyles[0] === style;

        if (isPageStyle && selectedStyles.includes(style)) {
            return; // Não fazer nada se tentar desmarcar o estilo da página
        }

        setSelectedStyles(prev =>
            prev.includes(style)
                ? prev.filter(s => s !== style)
                : [...prev, style]
        );
    };

    const toggleArtist = (artist: string) => {
        setSelectedArtists(prev =>
            prev.includes(artist)
                ? prev.filter(a => a !== artist)
                : [...prev, artist]
        );
    };

    const togglePool = (pool: string) => {
        setSelectedPools(prev =>
            prev.includes(pool)
                ? prev.filter(p => p !== pool)
                : [...prev, pool]
        );
    };

    return (
        <div className="w-full bg-gradient-to-r from-gray-900/30 to-gray-800/20 backdrop-blur-sm rounded-lg p-3 border border-gray-700/20 shadow-lg">
            {/* Barra de Pesquisa Principal - Compacta */}
            <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar músicas, artistas, estilos..."
                        className="w-full bg-gray-800/50 border border-gray-600/30 rounded-lg pl-10 pr-10 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Botões de Ação Compactos */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${showFilters || hasActiveFilters
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-gray-700/40 text-gray-300 hover:bg-gray-600/40'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filtros</span>
                    {hasActiveFilters && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                            {selectedStyles.length + selectedArtists.length + selectedPools.length}
                        </span>
                    )}
                </button>

                <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                    <Search className="w-4 h-4" />
                    <span className="text-sm">Buscar</span>
                </button>

                {hasActiveFilters && (
                    <button
                        onClick={handleClear}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5"
                    >
                        <X className="w-4 h-4" />
                        <span className="text-sm">Limpar</span>
                    </button>
                )}
            </div>

            {/* Tags de Filtros Ativos - Compactas */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedStyles.map((style) => (
                        <span key={style} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5">
                            <Music className="w-3 h-3" />
                            {style}
                            <button
                                onClick={() => toggleStyle(style)}
                                className="hover:text-blue-200 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    {selectedArtists.map((artist) => (
                        <span key={artist} className="bg-green-500/20 text-green-300 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5">
                            <User className="w-3 h-3" />
                            {artist}
                            <button
                                onClick={() => toggleArtist(artist)}
                                className="hover:text-green-200 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    {selectedPools.map((pool) => (
                        <span key={pool} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5">
                            <Building className="w-3 h-3" />
                            {pool}
                            <button
                                onClick={() => togglePool(pool)}
                                className="hover:text-purple-200 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Modal com Portal */}
            {showFilters && typeof window !== 'undefined' && createPortal(
                <div
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 flex items-center justify-center"
                    style={{ zIndex: 999999 }}
                >
                    <div className="bg-gray-800 rounded-lg p-6 w-11/12 max-w-4xl max-h-5/6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Filtros</h2>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Estilos */}
                            <div>
                                <h3 className="text-white mb-2">Estilos ({selectedStyles.length})</h3>
                                <input
                                    type="text"
                                    placeholder="Buscar estilos..."
                                    className="w-full p-2 bg-gray-700 text-white rounded mb-2"
                                    onChange={(e) => {
                                        const query = e.target.value.toLowerCase();
                                        // A filtragem agora é feita via useMemo
                                    }}
                                />
                                <div className="max-h-40 overflow-y-auto bg-gray-700 rounded p-2">
                                    {filteredStyles.map((style) => {
                                        // Se for o estilo da página (único disponível), não permitir desmarcar
                                        const isPageStyle = availableStyles.length === 1 && availableStyles[0] === style;

                                        return (
                                            <label key={style} className="flex items-center gap-2 p-1 text-white text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStyles.includes(style)}
                                                    onChange={() => !isPageStyle && toggleStyle(style)}
                                                    disabled={isPageStyle}
                                                    className={`w-4 h-4 ${isPageStyle ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                />
                                                <span className={isPageStyle ? 'text-gray-400' : ''}>{style}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Artistas */}
                            <div>
                                <h3 className="text-white mb-2">Artistas ({selectedArtists.length})</h3>
                                <input
                                    type="text"
                                    placeholder="Buscar artistas..."
                                    className="w-full p-2 bg-gray-700 text-white rounded mb-2"
                                    onChange={(e) => {
                                        const query = e.target.value.toLowerCase();
                                        // A filtragem agora é feita via useMemo
                                    }}
                                />
                                <div className="max-h-40 overflow-y-auto bg-gray-700 rounded p-2">
                                    {filteredArtists.map((artist) => (
                                        <label key={artist} className="flex items-center gap-2 p-1 text-white text-sm">
                                            <input
                                                type="checkbox"
                                                checked={selectedArtists.includes(artist)}
                                                onChange={() => toggleArtist(artist)}
                                                className="w-4 h-4"
                                            />
                                            {artist}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Pools */}
                            <div>
                                <h3 className="text-white mb-2">Pools ({selectedPools.length})</h3>
                                <input
                                    type="text"
                                    placeholder="Buscar pools..."
                                    className="w-full p-2 bg-gray-700 text-white rounded mb-2"
                                    onChange={(e) => {
                                        const query = e.target.value.toLowerCase();
                                        // A filtragem agora é feita via useMemo
                                    }}
                                />
                                <div className="max-h-40 overflow-y-auto bg-gray-700 rounded p-2">
                                    {filteredPools.map((pool) => (
                                        <label key={pool} className="flex items-center gap-2 p-1 text-white text-sm">
                                            <input
                                                type="checkbox"
                                                checked={selectedPools.includes(pool)}
                                                onChange={() => togglePool(pool)}
                                                className="w-4 h-4"
                                            />
                                            {pool}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-600">
                            <span className="text-gray-400">
                                {selectedStyles.length + selectedArtists.length + selectedPools.length} filtros ativos
                            </span>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClear}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                                >
                                    Limpar
                                </button>
                                <button
                                    onClick={() => {
                                        handleSearch();
                                        setShowFilters(false);
                                    }}
                                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </div>
    );
}