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
    monthOptions: Array<{ value: string; label: string }>;
    selectedGenre: string;
    selectedArtist: string;
    selectedDateRange: string;
    selectedVersion: string;
    selectedMonth: string;
    onGenreChange: (value: string) => void;
    onArtistChange: (value: string) => void;
    onDateRangeChange: (value: string) => void;
    onVersionChange: (value: string) => void;
    onMonthChange: (value: string) => void;
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
    monthOptions,
    selectedGenre,
    selectedArtist,
    selectedDateRange,
    selectedVersion,
    selectedMonth,
    onGenreChange,
    onArtistChange,
    onDateRangeChange,
    onVersionChange,
    onMonthChange,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative w-full max-w-2xl mx-4 rounded-2xl border shadow-2xl max-h-[90vh] overflow-y-auto"
                style={{
                    backgroundColor: '#2a2a2a',
                    borderColor: '#3a3a3a'
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#3a3a3a' }}>
                    <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                        <Filter className="h-5 w-5" />
                        <span>Filtrar Músicas</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Filtro por Gênero */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                🎵 Gênero Musical
                            </label>
                            <select
                                value={selectedGenre}
                                onChange={(e) => onGenreChange(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                style={{
                                    backgroundColor: '#1a1a1a',
                                    borderColor: '#3a3a3a'
                                }}
                            >
                                <option value="all">Todos os gêneros</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Artista */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                🎤 Artista
                            </label>
                            <select
                                value={selectedArtist}
                                onChange={(e) => onArtistChange(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                style={{
                                    backgroundColor: '#1a1a1a',
                                    borderColor: '#3a3a3a'
                                }}
                            >
                                <option value="all">Todos os artistas</option>
                                {artists.map(artist => (
                                    <option key={artist} value={artist}>{artist}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Versão */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                🎧 Versão
                            </label>
                            <select
                                value={selectedVersion}
                                onChange={(e) => onVersionChange(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                style={{
                                    backgroundColor: '#1a1a1a',
                                    borderColor: '#3a3a3a'
                                }}
                            >
                                <option value="all">Todas as versões</option>
                                {versions.map(version => (
                                    <option key={version} value={version}>{version}</option>
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
                        <div className="md:col-span-2">
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
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: '#3a3a3a' }}>
                    <div className="flex items-center space-x-3">
                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                disabled={isLoading}
                                className="px-4 py-2 text-red-400 border border-red-600/30 hover:bg-red-600/20 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Limpar Filtros
                            </button>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={isLoading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
                        >
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
