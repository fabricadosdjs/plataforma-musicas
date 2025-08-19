// src/components/music/FiltersModal.tsx
"use client";

import { Calendar, Filter, X, Sparkles, Music, User, Clock, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface FiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    genres: string[];
    artists: string[];
    versions: string[];
    pools: string[];
    monthOptions: Array<{ value: string; label: string }>;
    selectedGenre: string;
    selectedArtist: string;
    selectedDateRange: string;
    selectedVersion: string;
    selectedMonth: string;
    selectedPool: string;
    onGenreChange: (value: string) => void;
    onArtistChange: (value: string) => void;
    onDateRangeChange: (value: string) => void;
    onVersionChange: (value: string) => void;
    onMonthChange: (value: string) => void;
    onPoolChange: (value: string) => void;
    onApplyFilters: () => void;
    onClearFilters: () => void;
    isLoading: boolean;
    hasActiveFilters: boolean;
}

export default function FiltersModal({
    isOpen,
    onClose,
    genres,
    artists,
    versions,
    pools,
    monthOptions,
    selectedGenre,
    selectedArtist,
    selectedDateRange,
    selectedVersion,
    selectedMonth,
    selectedPool,
    onGenreChange,
    onArtistChange,
    onDateRangeChange,
    onVersionChange,
    onMonthChange,
    onPoolChange,
    onApplyFilters,
    onClearFilters,
    isLoading,
    hasActiveFilters
}: FiltersModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Fechar modal ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Fechar com ESC
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleApply = () => {
        onApplyFilters();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-8 px-4">
            {/* Backdrop com blur */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative w-full max-w-5xl rounded-3xl border border-gray-800/50 shadow-2xl max-h-[calc(100vh-80px)] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-900 to-black"
            >
                {/* Header elegante */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 md:p-8 border-b border-gray-800/50 bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 rounded-2xl shadow-2xl shadow-purple-500/25">
                            <Filter className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                                Filtros Avançados
                            </h2>
                            <p className="text-gray-400 text-sm mt-1 hidden sm:block">
                                Refine sua busca com filtros específicos e personalizados
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-800/50 rounded-2xl transition-all duration-300 group hover:scale-110"
                    >
                        <X className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 md:px-8 py-4 border-b border-gray-800/30 bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                disabled={isLoading}
                                className="px-6 py-3 text-red-400 border border-red-600/30 hover:bg-red-600/20 rounded-2xl transition-all duration-300 disabled:opacity-50 font-medium hover:scale-105 transform"
                            >
                                <Sparkles className="h-4 w-4 inline mr-2" />
                                Limpar Filtros
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-2xl transition-all duration-300 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={isLoading}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 disabled:from-purple-400 disabled:via-pink-400 disabled:to-purple-500 text-white rounded-2xl transition-all duration-300 font-medium shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Aplicando...
                                </div>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4 inline mr-2" />
                                    Aplicar Filtros
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content com grid responsivo */}
                <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                        {/* Filtro por Gênero */}
                        <div className="space-y-3 group">
                            <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                                <div className="p-2 bg-purple-600/20 rounded-lg group-hover:bg-purple-600/30 transition-colors">
                                    <Music className="h-4 w-4 text-purple-400" />
                                </div>
                                Gênero Musical
                            </label>
                            <select
                                value={selectedGenre}
                                onChange={(e) => onGenreChange(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:border-gray-600/50 hover:bg-gray-800/70"
                            >
                                <option value="all">🎵 Todos os gêneros</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Artista */}
                        <div className="space-y-3 group">
                            <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                                <div className="p-2 bg-pink-600/20 rounded-lg group-hover:bg-pink-600/30 transition-colors">
                                    <User className="h-4 w-4 text-pink-400" />
                                </div>
                                Artista
                            </label>
                            <select
                                value={selectedArtist}
                                onChange={(e) => onArtistChange(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300 hover:border-gray-600/50 hover:bg-gray-800/70"
                            >
                                <option value="all">🎤 Todos os artistas</option>
                                {artists.map(artist => (
                                    <option key={artist} value={artist}>{artist}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Versão */}
                        {versions.length > 0 && (
                            <div className="space-y-3 group">
                                <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                                    <div className="p-2 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition-colors">
                                        <Sparkles className="h-4 w-4 text-blue-400" />
                                    </div>
                                    Versão
                                </label>
                                <select
                                    value={selectedVersion}
                                    onChange={(e) => onVersionChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-gray-600/50 hover:bg-gray-800/70"
                                >
                                    <option value="all">🎧 Todas as versões</option>
                                    {versions.map(version => (
                                        <option key={version} value={version}>{version}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Filtro por Pool */}
                        <div className="space-y-3 group">
                            <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                                <div className="p-2 bg-green-600/20 rounded-lg group-hover:bg-green-600/30 transition-colors">
                                    <span className="text-green-400 text-lg">🏊‍♂️</span>
                                </div>
                                Pool
                            </label>
                            <select
                                value={selectedPool}
                                onChange={(e) => onPoolChange(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 hover:border-gray-600/50 hover:bg-gray-800/70"
                            >
                                <option value="all">🌊 Todos os pools</option>
                                {pools.map(pool => (
                                    <option key={pool} value={pool}>{pool}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Mês */}
                        <div className="space-y-3 group">
                            <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                                <div className="p-2 bg-yellow-600/20 rounded-lg group-hover:bg-yellow-600/30 transition-colors">
                                    <Calendar className="h-4 w-4 text-yellow-400" />
                                </div>
                                Mês de Lançamento
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => onMonthChange(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-300 hover:border-gray-600/50 hover:bg-gray-800/70"
                            >
                                <option value="all">📅 Todos os meses</option>
                                {monthOptions.map(month => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Data Range */}
                        <div className="space-y-3 group">
                            <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                                <div className="p-2 bg-indigo-600/20 rounded-lg group-hover:bg-indigo-600/30 transition-colors">
                                    <Clock className="h-4 w-4 text-indigo-400" />
                                </div>
                                Período
                            </label>
                            <select
                                value={selectedDateRange}
                                onChange={(e) => onDateRangeChange(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 hover:border-gray-600/50 hover:bg-gray-800/70"
                            >
                                <option value="all">⏰ Todos os períodos</option>
                                <option value="week">📅 Última semana</option>
                                <option value="month">📅 Último mês</option>
                                <option value="3months">📅 Últimos 3 meses</option>
                                <option value="6months">📅 Últimos 6 meses</option>
                                <option value="year">📅 Último ano</option>
                            </select>
                        </div>
                    </div>

                    {/* Dica de uso */}
                    <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700/30 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-600/20 rounded-lg">
                                <Sparkles className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-gray-300 font-medium">💡 Dica de Uso</p>
                                <p className="text-gray-400 text-sm">Combine múltiplos filtros para encontrar exatamente o que procura. Os filtros são aplicados em tempo real.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
