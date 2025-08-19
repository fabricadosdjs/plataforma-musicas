"use client";

import React from 'react';
import { X, Music, TrendingUp, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GenresModalProps {
    isOpen: boolean;
    onClose: () => void;
    genres: Array<{ genre: string; count: number }>;
}

const genreIcons = {
    'House': '🏠',
    'Tech House': '⚡',
    'Deep House': '🌊',
    'Progressive House': '🚀',
    'Techno': '🔥',
    'Trance': '✨',
    'Drum & Bass': '🥁',
    'Dubstep': '💥',
    'Electro': '⚡',
    'Minimal': '🎯',
    'Hardstyle': '💀',
    'Future Bass': '🌟',
    'Trap': '🎪',
    'Ambient': '🌙',
    'Breakbeat': '🔨',
    'Garage': '🏭',
    'Jungle': '🌴',
    'Psytrance': '🌀',
    'Big Room': '🏟️',
    'Festival': '🎉',
    'Melodic Techno': '🎼',
    'Progressive Trance': '🌅',
    'Uplifting Trance': '☀️',
    'Vocal Trance': '🎤',
    'Hard Trance': '⚔️',
    'Acid': '🧪',
    'Industrial': '⚙️',
    'Synthwave': '🌆',
    'Chillout': '😌',
    'Downtempo': '🍃'
};

const genreColors = {
    'House': 'from-blue-500 to-cyan-500',
    'Tech House': 'from-purple-500 to-pink-500',
    'Deep House': 'from-indigo-500 to-blue-500',
    'Progressive House': 'from-green-500 to-emerald-500',
    'Techno': 'from-red-500 to-orange-500',
    'Trance': 'from-violet-500 to-purple-500',
    'Drum & Bass': 'from-yellow-500 to-orange-500',
    'Dubstep': 'from-gray-500 to-slate-500',
    'Electro': 'from-cyan-500 to-blue-500',
    'Minimal': 'from-stone-500 to-gray-500',
    'Hardstyle': 'from-red-600 to-rose-600',
    'Future Bass': 'from-pink-500 to-rose-500',
    'Trap': 'from-purple-600 to-indigo-600',
    'Ambient': 'from-slate-400 to-gray-400',
    'Breakbeat': 'from-orange-500 to-red-500',
    'Garage': 'from-teal-500 to-green-500',
    'Jungle': 'from-green-600 to-emerald-600',
    'Psytrance': 'from-violet-600 to-purple-600',
    'Big Room': 'from-blue-600 to-indigo-600',
    'Festival': 'from-yellow-400 to-orange-400',
    'Melodic Techno': 'from-indigo-400 to-purple-400',
    'Progressive Trance': 'from-cyan-400 to-blue-400',
    'Uplifting Trance': 'from-yellow-300 to-orange-300',
    'Vocal Trance': 'from-pink-400 to-rose-400',
    'Hard Trance': 'from-red-500 to-pink-500',
    'Acid': 'from-lime-500 to-green-500',
    'Industrial': 'from-gray-600 to-slate-600',
    'Synthwave': 'from-purple-400 to-pink-400',
    'Chillout': 'from-blue-300 to-cyan-300',
    'Downtempo': 'from-green-300 to-teal-300'
};

export default function GenresModal({ isOpen, onClose, genres }: GenresModalProps) {
    const router = useRouter();

    const handleGenreClick = (genreName: string) => {
        router.push(`/genre/${encodeURIComponent(genreName)}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="relative p-6 border-b border-gray-700/50 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-pink-900/30">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:bg-gray-700/50 hover:text-white transition-all duration-300 transform hover:scale-110"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <Music className="h-7 w-7 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">Todos os Gêneros</h2>
                        </div>
                        <p className="text-gray-300 text-lg">
                            Explore todos os estilos musicais disponíveis na plataforma
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <TrendingUp className="h-5 w-5 text-purple-400" />
                            <span className="text-purple-300 font-medium">
                                {genres.length} gêneros disponíveis
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {genres.map(({ genre, count }) => {
                            const icon = genreIcons[genre as keyof typeof genreIcons] || '🎵';
                            const colorClass = genreColors[genre as keyof typeof genreColors] || 'from-gray-500 to-slate-500';

                            return (
                                <button
                                    key={genre}
                                    onClick={() => handleGenreClick(genre)}
                                    className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 text-left hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                                >
                                    {/* Background glow effect */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${colorClass} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

                                    <div className="relative z-10">
                                        {/* Icon and arrow */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-xl flex items-center justify-center shadow-lg`}>
                                                <span className="text-2xl">{icon}</span>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-300 transform group-hover:translate-x-1" />
                                        </div>

                                        {/* Genre name */}
                                        <h3 className="font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                                            {genre}
                                        </h3>

                                        {/* Count */}
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 bg-gradient-to-r ${colorClass} rounded-full`}></div>
                                            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                                                {count} {count === 1 ? 'faixa' : 'faixas'}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-700/50 bg-gradient-to-r from-gray-900/50 to-black/50">
                    <div className="text-center">
                        <p className="text-gray-400 text-sm mb-3">
                            Clique em qualquer gênero para explorar suas faixas
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
