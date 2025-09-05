// src/app/playlists/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Home, Music, Star, Crown, List, Tag, Users, RefreshCw, Globe, Play, Eye } from 'lucide-react';
import FooterPlayer from '@/components/player/FooterPlayer';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { generatePlaylistUrl } from '@/lib/playlist-utils';
import { Playlist } from '@/types/playlist';

const navigationItems = [
    { name: 'Home', icon: Home, href: '/', active: false },
    { name: 'New Releases', icon: Music, href: '/new-releases', active: false },
    { name: 'Most Popular', icon: Star, href: '/most-popular', active: false },
    { name: 'Nexor Records Exclusives', icon: Crown, href: '/exclusives', active: false },
    { name: 'Playlists', icon: List, href: '/playlists', active: true },
    { name: 'Genres', icon: Tag, href: '/genres', active: false },
    { name: 'Remixers', icon: Users, href: '/remixers', active: false },
    { name: 'Track Updates', icon: RefreshCw, href: '/updates', active: false },
    { name: 'Global', icon: Globe, href: '/global', active: false },
];

export default function PlaylistsPage() {
    const [isClient, setIsClient] = useState(false);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsClient(true);
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/playlists?limit=100');
            const data = await response.json();

            if (response.ok) {
                setPlaylists(data.playlists || []);
            } else {
                console.error('Erro ao carregar playlists:', data.error);
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-montserrat">
            <Header />

            {/* Main Content */}
            <div className="pt-24 flex min-h-screen pb-32">
                {/* Left Sidebar - Navigation */}
                <div className="w-72 bg-gray-900/40 backdrop-blur-sm p-4">
                    <div className="pt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                            <h2 className="text-xl font-montserrat font-bold text-white tracking-wide whitespace-nowrap">
                                NAVEGUE O CATÁLOGO
                            </h2>
                        </div>
                        <nav className="space-y-1">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium uppercase tracking-wide transition-all duration-300 ${item.active
                                            ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border-l-2 border-orange-500'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-4 sm:p-6 min-w-0 overflow-hidden">

                    {/* Playlists Section Header */}
                    <div className="mb-12">
                        <div className="relative">
                            {/* Background image with 50% transparency */}
                            <div
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
                                style={{
                                    backgroundImage: 'url(https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
                                    opacity: 0.5
                                }}
                            ></div>
                            {/* Background gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-red-900/20 rounded-2xl"></div>

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

                                    {/* PLAYLISTS - Enhanced */}
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bebas font-black text-white tracking-tight mb-3 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                                        PLAYLISTS
                                    </h1>

                                    {/* Essa é a nossa seção de playlists - Enhanced */}
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        <p className="text-gray-300 text-base font-montserrat font-medium tracking-wide">
                                            Essa é a nossa seção de playlists
                                        </p>
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute top-4 right-4 opacity-20">
                                    <div className="w-16 h-16 border border-red-500/30 rounded-full flex items-center justify-center">
                                        <div className="w-8 h-8 border border-red-500/50 rounded-full flex items-center justify-center">
                                            <div className="w-4 h-4 bg-red-500/30 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-4 left-4 opacity-10">
                                    <div className="w-12 h-12 border border-gray-500/30 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção de Playlists */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 border border-gray-500/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2 font-montserrat">Carregando playlists...</h3>
                        </div>
                    ) : playlists.length > 0 ? (
                        <div className="space-y-12">
                            {/* Featured Playlists */}
                            {playlists.filter(p => p.isFeatured).length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                                        <h2 className="text-3xl font-bold text-white font-montserrat">Playlists em Destaque</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {playlists.filter(p => p.isFeatured).map((playlist) => (
                                            <Link key={playlist.id} href={generatePlaylistUrl(playlist)}>
                                                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-gray-800/70 transition-colors group">
                                                    {/* Cover Image */}
                                                    <div className="aspect-video bg-gradient-to-br from-green-600 to-blue-600 relative">
                                                        {playlist.coverImage ? (
                                                            <img
                                                                src={playlist.coverImage}
                                                                alt={playlist.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Music className="w-16 h-16 text-white/50" />
                                                            </div>
                                                        )}

                                                        {/* Play Button Overlay */}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                                                <Play className="w-6 h-6 text-white ml-1" />
                                                            </div>
                                                        </div>

                                                        {/* Featured Badge */}
                                                        <div className="absolute top-3 right-3">
                                                            <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                                                                <Star className="w-3 h-3 inline mr-1" />
                                                                DESTAQUE
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-4">
                                                        <h3 className="text-lg font-bold text-white mb-2">{playlist.name}</h3>
                                                        {playlist.description && (
                                                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{playlist.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between text-sm text-gray-400">
                                                            <span>{playlist.trackCount || 0} músicas</span>
                                                            <span>{new Date(playlist.createdAt).toLocaleDateString('pt-BR')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Playlists por Seção */}
                            {(() => {
                                // Agrupar playlists por seção
                                const playlistsBySection = playlists.reduce((acc, playlist) => {
                                    const section = playlist.section || 'Outras';
                                    if (!acc[section]) {
                                        acc[section] = [];
                                    }
                                    acc[section].push(playlist);
                                    return acc;
                                }, {} as Record<string, Playlist[]>);

                                // Definir cores para cada seção
                                const sectionColors: Record<string, string> = {
                                    'Sua Vibe': 'from-purple-500 to-pink-500',
                                    'Final de Semana': 'from-blue-500 to-cyan-500',
                                    'Trabalho': 'from-green-500 to-emerald-500',
                                    'Festa': 'from-red-500 to-orange-500',
                                    'Relaxamento': 'from-indigo-500 to-purple-500',
                                    'Outras': 'from-gray-500 to-slate-500'
                                };

                                return Object.entries(playlistsBySection).map(([sectionName, sectionPlaylists]) => (
                                    <div key={sectionName}>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className={`w-1 h-8 bg-gradient-to-b ${sectionColors[sectionName] || 'from-gray-500 to-slate-500'} rounded-full`}></div>
                                            <h2 className="text-3xl font-bold text-white font-montserrat">{sectionName}</h2>
                                            <span className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300">
                                                {sectionPlaylists.length} playlist{sectionPlaylists.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {sectionPlaylists.map((playlist) => (
                                                <Link key={playlist.id} href={generatePlaylistUrl(playlist)}>
                                                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-gray-800/70 transition-colors group">
                                                        {/* Cover Image */}
                                                        <div className="aspect-video bg-gradient-to-br from-green-600 to-blue-600 relative">
                                                            {playlist.coverImage ? (
                                                                <img
                                                                    src={playlist.coverImage}
                                                                    alt={playlist.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Music className="w-16 h-16 text-white/50" />
                                                                </div>
                                                            )}

                                                            {/* Play Button Overlay */}
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                                                    <Play className="w-6 h-6 text-white ml-1" />
                                                                </div>
                                                            </div>

                                                            {/* Section Badge */}
                                                            <div className="absolute top-3 left-3">
                                                                <div className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${sectionColors[sectionName] || 'from-gray-500 to-slate-500'} text-white`}>
                                                                    {sectionName}
                                                                </div>
                                                            </div>

                                                            {/* Status Badge */}
                                                            <div className="absolute top-3 right-3">
                                                                <div className={`px-2 py-1 rounded-full text-xs font-bold ${playlist.isPublic
                                                                    ? 'bg-green-500 text-white'
                                                                    : 'bg-gray-500 text-white'
                                                                    }`}>
                                                                    {playlist.isPublic ? (
                                                                        <>
                                                                            <Eye className="w-3 h-3 inline mr-1" />
                                                                            PÚBLICA
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Eye className="w-3 h-3 inline mr-1" />
                                                                            PRIVADA
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Content */}
                                                        <div className="p-4">
                                                            <h3 className="text-lg font-bold text-white mb-2">{playlist.name}</h3>
                                                            {playlist.description && (
                                                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{playlist.description}</p>
                                                            )}
                                                            <div className="flex items-center justify-between text-sm text-gray-400">
                                                                <span>{playlist.trackCount || 0} músicas</span>
                                                                <span>{new Date(playlist.createdAt).toLocaleDateString('pt-BR')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 border border-gray-500/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <List className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2 font-montserrat">Nenhuma playlist encontrada</h3>
                            <p className="text-gray-400 font-montserrat">
                                Crie sua primeira playlist em /manager/playlist
                            </p>
                        </div>
                    )}

                </div>

            </div>

            {/* Footer Player */}
            <FooterPlayer />
        </div>
    );
}