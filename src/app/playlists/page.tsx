// src/app/playlists/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Music, Star, List, Play, Eye } from 'lucide-react';
import FooterPlayer from '@/components/player/FooterPlayer';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import { generatePlaylistUrl } from '@/lib/playlist-utils';
import { Playlist } from '@/types/playlist';


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

            // Tentar API principal primeiro
            let response = await fetch('/api/playlists?limit=100');
            let data = await response.json();

            if (response.ok) {
                setPlaylists(data.playlists || []);
                console.log('✅ Playlists carregadas via API principal');
            } else {
                console.error('❌ Erro na API principal:', data.error);

                // Tentar API de fallback
                console.log('🔄 Tentando API de fallback...');
                response = await fetch('/api/playlists/fallback?limit=100');
                data = await response.json();

                if (response.ok) {
                    setPlaylists(data.playlists || []);
                    console.log('✅ Playlists carregadas via API de fallback');
                } else {
                    console.error('❌ Erro na API de fallback:', data.error);
                    setPlaylists([]);
                }
            }
        } catch (error) {
            console.error('❌ Error fetching playlists:', error);
            setPlaylists([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-inter">
            <Header />

            {/* Main Content */}
            <div className="pt-20">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

                    {/* Hero Section */}
                    <div className="mb-12">
                        <div className="relative">
                            {/* Background gradient - same as genres page */}
                            <div
                                className="absolute inset-0 rounded-2xl"
                                style={{
                                    backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%), linear-gradient(45deg, #1a1a1a 0%, #2d1b69 25%, #11998e 50%, #38ef7d 75%, #1a1a1a 100%)'
                                }}
                            ></div>

                            {/* Main content */}
                            <div className="relative p-8 bg-gradient-to-r from-gray-900/40 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl">
                                <div className="text-center mb-8">
                                    {/* Pool de Gravação - Enhanced */}
                                    <div className="flex items-center justify-center gap-3 mb-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-red-400 text-sm font-montserrat font-semibold uppercase tracking-[0.2em] letter-spacing-wider">
                                            Pool de Gravação
                                        </span>
                                    </div>

                                    {/* PLAYLISTS - Enhanced */}
                                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bebas-neue font-black text-white tracking-tight mb-3 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
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

                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                                                <List className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-white">{playlists.length}</p>
                                                <p className="text-gray-400 text-sm">Total de Playlists</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                                <Star className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-white">{playlists.filter(p => p.isFeatured).length}</p>
                                                <p className="text-gray-400 text-sm">Em Destaque</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                                                <Eye className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-white">{playlists.filter(p => p.isPublic).length}</p>
                                                <p className="text-gray-400 text-sm">Públicas</p>
                                            </div>
                                        </div>
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