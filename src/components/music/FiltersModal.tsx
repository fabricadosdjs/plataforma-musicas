// src/components/music/FiltersModal.tsx
"use client";

import { Calendar, Filter, X } from 'lucide-react';
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
            // Não fechar se o clique for em um <select> (dropdown)
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node) &&
                !(event.target instanceof HTMLSelectElement)
            ) {
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-8">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative w-full max-w-4xl mx-4 rounded-3xl border border-[#26222D] shadow-2xl max-h-[calc(100vh-160px)] overflow-y-auto bg-[#202A3C] mb-24"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-[#26222D]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg">
                            <Filter className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Filtros Avançados</h2>
                            <p className="text-gray-400 text-sm mt-1">Refine sua busca com filtros específicos</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-[#26222D] rounded-xl transition-all duration-300 group"
                    >
                        <X className="h-6 w-6 text-gray-400 group-hover:text-white" />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between px-8 py-4 border-b border-[#2D2E2F]">
                    <div className="flex items-center gap-3">
                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                disabled={isLoading}
                                className="px-6 py-3 text-red-400 border border-red-600/30 hover:bg-red-600/20 rounded-xl transition-all duration-300 disabled:opacity-50 font-medium"
                            >
                                Limpar Filtros
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-gray-400 hover:text-white hover:bg-[#26222D] rounded-xl transition-all duration-300 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={isLoading}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 disabled:transform-none"
                        >
                            {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Filtro por Gênero */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                                <span className="text-purple-400">🎵</span>
                                Gênero Musical
                            </label>
                            <select
                                value={selectedGenre}
                                onChange={(e) => onGenreChange(e.target.value)}
                                className="w-full px-4 py-3 bg-[#26222D] border border-[#121212] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                            >
                                <option value="all">Todos os gêneros</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Artista */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                                <span className="text-purple-400">🎤</span>
                                Artista
                            </label>
                            <select
                                value={selectedArtist}
                                onChange={(e) => onArtistChange(e.target.value)}
                                className="w-full px-4 py-3 bg-[#26222D] border border-[#121212] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                            >
                                <option value="all">Todos os artistas</option>
                                {artists.map(artist => (
                                    <option key={artist} value={artist}>{artist}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Versão */}
                        {versions.length > 0 && (
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
                                    <span className="text-purple-400">🎧</span>
                                    Versão
                                </label>
                                <select
                                    value={selectedVersion}
                                    onChange={(e) => onVersionChange(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    style={{
                                        backgroundColor: '#26222D',
                                        borderColor: '#121212'
                                    }}
                                >
                                    <option value="all">Todas as versões</option>
                                    {versions.map(version => (
                                        <option key={version} value={version}>{version}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Filtro por Pool */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                🏊‍♂️ Pool
                            </label>
                            <select
                                value={selectedPool}
                                onChange={(e) => onPoolChange(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                style={{
                                    backgroundColor: '#26222D',
                                    borderColor: '#121212'
                                }}
                            >
                                <option value="all">Todos os pools</option>
                                {pools.map(pool => (
                                    <option key={pool} value={pool}>{pool}</option>
                                ))}
                            </select>
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
                                    backgroundColor: '#26222D',
                                    borderColor: '#121212'
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
                                    backgroundColor: '#26222D',
                                    borderColor: '#121212'
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
                </div>
            </div>
        </div>
    );
}
