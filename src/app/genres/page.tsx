'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Search, X, ArrowUpRight, Music, TrendingUp, Users, Star } from 'lucide-react';
import Link from 'next/link';

interface Genre {
    id: number;
    name: string;
    slug: string;
    trackCount: number;
    lastUpdated: string;
    isPopular?: boolean;
    isTrending?: boolean;
}

const GenresPage = () => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'default' | 'popularity' | 'alphabetical'>('default');

    // Gêneros em destaque (top 5)
    const featuredGenres = ['HIP HOP', 'DJCITY EXCLUSIVE', 'AFRO HOUSE', 'AFRICAN', 'TECH HOUSE'];

    useEffect(() => {
        fetchGenres();
    }, []);

    const fetchGenres = async () => {
        try {
            const response = await fetch('/api/genres');
            if (response.ok) {
                const data = await response.json();
                setGenres(data);
            }
        } catch (error) {
            console.error('Error fetching genres:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredGenres = genres.filter(genre =>
        genre.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedGenres = [...filteredGenres].sort((a, b) => {
        switch (sortBy) {
            case 'popularity':
                return b.trackCount - a.trackCount;
            case 'alphabetical':
                return a.name.localeCompare(b.name);
            default:
                return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        }
    });

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
    };

    const formatDatePortuguese = (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `ATUALIZADO ${day}/${month}`;
    };


    const handleSortChange = (newSort: 'default' | 'popularity' | 'alphabetical') => {
        if (sortBy === newSort) {
            setSortBy('default');
        } else {
            setSortBy(newSort);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <Header />
                <div className="pt-32 flex items-center justify-center">
                    <div className="text-white text-xl">Carregando gêneros...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <Header />
            <div className="pt-32">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Hero Section */}
                    <div className="mb-12">
                        <div className="relative">
                            {/* Background gradient - same as homepage */}
                            <div
                                className="absolute inset-0 rounded-2xl"
                                style={{
                                    backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%), linear-gradient(45deg, #1a1a1a 0%, #2d1b69 25%, #11998e 50%, #38ef7d 75%, #1a1a1a 100%)'
                                }}
                            ></div>

                            {/* Main content */}
                            <div className="relative p-8 bg-gradient-to-r from-gray-900/40 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl">
                                <div className="text-center mb-6">
                                    {/* Pool de Gravação - Enhanced */}
                                    <div className="flex items-center justify-center gap-3 mb-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-red-400 text-sm font-montserrat font-semibold uppercase tracking-[0.2em] letter-spacing-wider">
                                            Pool de Gravação
                                        </span>
                                    </div>

                                    {/* GÊNEROS - Enhanced */}
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bebas font-black text-white tracking-tight mb-3 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                                        GÊNEROS
                                    </h1>

                                    {/* Subtitle */}
                                    <p className="text-gray-300 text-lg font-montserrat font-medium max-w-2xl mx-auto leading-relaxed">
                                        Explore nossa vasta coleção de gêneros musicais. Encontre o estilo perfeito para sua próxima mix.
                                    </p>
                                </div>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                                                <Music className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-white">{genres.length}</p>
                                                <p className="text-gray-400 text-sm">Gêneros Disponíveis</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                                <TrendingUp className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-white">
                                                    {genres.reduce((sum, genre) => sum + genre.trackCount, 0).toLocaleString()}
                                                </p>
                                                <p className="text-gray-400 text-sm">Total de Tracks</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                                <Star className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-white">
                                                    {genres.filter(g => g.isPopular).length}
                                                </p>
                                                <p className="text-gray-400 text-sm">Gêneros Populares</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Featured Genres - Top Row */}
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-3">
                            {featuredGenres.map((genre, index) => (
                                <button
                                    key={index}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors duration-200"
                                >
                                    {genre}
                                    <ArrowUpRight className="h-4 w-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Bar and Sort Buttons */}
                    <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="relative max-w-md w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search genre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X className="h-5 w-5 text-gray-400 hover:text-white" />
                                </button>
                            )}
                        </div>

                        {/* Sort Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSortChange('popularity')}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${sortBy === 'popularity'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                    }`}
                            >
                                POPULARIDADE
                            </button>
                            <button
                                onClick={() => handleSortChange('alphabetical')}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${sortBy === 'alphabetical'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                    }`}
                            >
                                A-Z
                            </button>
                        </div>
                    </div>

                    {/* Genres Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                        {sortedGenres.map((genre) => (
                            <Link
                                key={genre.id}
                                href={`/genres/${genre.slug}`}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-red-500 rounded-lg p-4 cursor-pointer transition-all duration-200 group relative min-h-[120px] flex flex-col justify-between block"
                            >
                                {/* Track Count Badge */}
                                <div className="absolute top-2 right-2 z-10">
                                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded font-bold">
                                        {genre.trackCount}
                                    </div>
                                </div>

                                {/* Genre Name */}
                                <div className="text-center flex-1 flex items-center justify-center pt-6">
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wide leading-tight">
                                        {genre.name}
                                    </h3>
                                </div>

                                {/* Updated Badge */}
                                <div className="text-center mt-2">
                                    <div className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold inline-block">
                                        {formatDatePortuguese(genre.lastUpdated)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Results Count */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            {sortedGenres.length} gêneros encontrados
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenresPage;