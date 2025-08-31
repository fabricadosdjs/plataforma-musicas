"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
// useSession removido pois não está sendo usado
import { useParams } from 'next/navigation';
import { Music, ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import Footer from '@/components/layout/Footer';
import MusicList from '@/components/music/MusicList';
import { Track } from '@/types/track';
import FooterSpacer from '@/components/layout/FooterSpacer';

const SearchPage = () => {
    const params = useParams();
    const query = params?.query ? decodeURIComponent(params.query as string) : '';

    // Hooks - sempre no topo
    // const { data: session } = useSession(); // Removido temporariamente

    // Estados
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(query);
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);

    // Dados filtrados
    const filteredTracks = useMemo(() => {
        let filtered = tracks;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(track =>
                track.songName.toLowerCase().includes(query) ||
                track.artist.toLowerCase().includes(query) ||
                track.style.toLowerCase().includes(query) ||
                (track.pool && track.pool.toLowerCase().includes(query))
            );
        }

        return filtered;
    }, [tracks, searchQuery]);

    // Funções
    const handleClearSearch = () => setSearchQuery('');
    const handleBackToNew = () => window.open('/new', '_blank');

    // Carregar dados de busca
    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/tracks?search=${encodeURIComponent(query)}&limit=50&page=1`);

                if (response.ok) {
                    const data = await response.json();
                    const tracksData = Array.isArray(data.tracks) ? data.tracks : [];
                    setTracks(tracksData);
                }
            } catch (error) {
                console.error('Erro ao buscar músicas:', error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchSearchResults();
        }
    }, [query]);

    // Verificar se há uma query válida
    if (!query) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-4">Query de busca inválida</h1>
                        <button
                            onClick={handleBackToNew}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                            Voltar para /new
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                        <button
                            onClick={handleBackToNew}
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar para /new</span>
                        </button>

                        <h1 className="text-3xl font-bold text-white mb-4">
                            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Resultados da Busca
                            </span>
                        </h1>

                        <p className="text-gray-400">
                            Buscando por: <span className="text-purple-400 font-semibold">&quot;{query}&quot;</span>
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full mb-4 mx-auto">
                                <div className="w-full h-full border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                            </div>
                            <p className="text-lg text-gray-400">Buscando músicas...</p>
                        </div>
                    ) : filteredTracks.length > 0 ? (
                        <div>
                            <MusicList
                                tracks={filteredTracks}
                                downloadedTrackIds={downloadedTrackIds}
                                setDownloadedTrackIds={setDownloadedTrackIds}
                                itemsPerPage={4}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Music className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">
                                Nenhuma música encontrada para &quot;{query}&quot;
                            </h3>
                            <p className="text-gray-400 mb-6">
                                Tente usar termos diferentes ou ajustar os filtros
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleClearSearch}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                >
                                    Limpar Busca
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
            <FooterSpacer />
        </MainLayout>
    );
};

export default SearchPage;
