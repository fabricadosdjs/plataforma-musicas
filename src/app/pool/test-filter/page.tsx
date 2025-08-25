"use client";

import { useEffect, useState } from 'react';
import MusicList from '@/components/music/MusicList';
import { Track } from '@/types/track';
import { useSession } from 'next-auth/react';
import MainLayout from '@/components/layout/MainLayout';

export default function TestFilterPage() {
    const { data: session } = useSession();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<string | null>('Progressive House');

    // Simular tracks de teste com diferentes estilos
    useEffect(() => {
        const mockTracks: Track[] = [
            {
                id: 1,
                songName: "Test Track 1",
                artist: "Test Artist 1",
                style: "Progressive House",
                pool: "Test Pool",
                imageUrl: "",
                downloadUrl: "",
                releaseDate: "2025-01-15",
                createdAt: new Date("2025-01-15"),
                previewUrl: "",
                isCommunity: false,
                uploadedBy: null,
                downloadCount: 0,
                likeCount: 0,
                playCount: 0
            },
            {
                id: 2,
                songName: "Test Track 2",
                artist: "Test Artist 2",
                style: "Progressive House",
                pool: "Test Pool",
                imageUrl: "",
                downloadUrl: "",
                releaseDate: "2025-01-14",
                createdAt: new Date("2025-01-14"),
                previewUrl: "",
                isCommunity: false,
                uploadedBy: null,
                downloadCount: 0,
                likeCount: 0,
                playCount: 0
            },
            {
                id: 3,
                songName: "Test Track 3",
                artist: "Test Artist 3",
                style: "Trance",
                pool: "Test Pool",
                imageUrl: "",
                downloadUrl: "",
                releaseDate: "2025-01-13",
                createdAt: new Date("2025-01-13"),
                previewUrl: "",
                isCommunity: false,
                uploadedBy: null,
                downloadCount: 0,
                likeCount: 0,
                playCount: 0
            }
        ];

        setTracks(mockTracks);
        setLoading(false);
    }, []);

    // Aplicar filtros quando tracks ou selectedGenre mudarem
    useEffect(() => {
        if (tracks.length > 0) {
            let filtered = tracks;

            // Aplicar filtro de estilo se selecionado
            if (selectedGenre && selectedGenre !== 'N/A') {
                filtered = tracks.filter(track =>
                    track.style && track.style.toLowerCase().includes(selectedGenre.toLowerCase())
                );
                console.log(`🎵 Filtrado por estilo "${selectedGenre}": ${filtered.length} tracks`);
            }

            setFilteredTracks(filtered);
        } else {
            setFilteredTracks([]);
        }
    }, [tracks, selectedGenre]);

    // Carregar IDs de tracks baixadas do localStorage
    useEffect(() => {
        const saved = localStorage.getItem('downloadedTrackIds');
        if (saved) {
            try {
                setDownloadedTrackIds(JSON.parse(saved));
            } catch (error) {
                console.error('Erro ao carregar IDs baixados:', error);
            }
        }
    }, []);

    // Salvar IDs de tracks baixadas no localStorage
    const handleDownloadedTrackIdsChange = (newIds: number[]) => {
        setDownloadedTrackIds(newIds);
        localStorage.setItem('downloadedTrackIds', JSON.stringify(newIds));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-black">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-blue-400 text-lg">Carregando músicas de teste...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-black text-white">
                {/* Hero Section */}
                <div className="relative z-10 bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 border-b border-blue-700/30 shadow-2xl">
                    <div className="container mx-auto px-4 py-16">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl shadow-2xl mb-6">
                                <span className="text-white text-5xl">🧪</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-6">
                                Página de Teste - Filtros
                            </h1>
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto w-48 mb-6"></div>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                Esta página demonstra o funcionamento dos filtros por estilo nas páginas de pool, incluindo os botões "Baixar Novas" e "Baixar Tudo" funcionais.
                            </p>
                            <div className="mt-8">
                                <span className="inline-block bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-200 px-6 py-3 rounded-full text-lg font-semibold border border-blue-500/50 shadow-lg">
                                    {selectedGenre ? `${filteredTracks.length} de ${tracks.length}` : tracks.length} músicas disponíveis
                                    {selectedGenre && (
                                        <span className="block text-sm text-blue-300 mt-1">
                                            Filtrado por: {selectedGenre}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informações de Teste */}
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {/* Card de Filtros */}
                        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-6 border border-blue-700/30 hover:border-blue-600/50 transition-all duration-300">
                            <h3 className="text-2xl font-bold text-blue-300 mb-4">🎯 Filtros Ativos</h3>
                            <p className="text-gray-300 mb-4">Teste os filtros por estilo e veja os botões funcionando.</p>
                            <div className="text-blue-200 text-lg font-semibold">
                                Estilo: {selectedGenre || 'Nenhum'}
                            </div>
                        </div>

                        {/* Card de Funcionalidades */}
                        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-2xl p-6 border border-purple-700/30 hover:border-purple-600/50 transition-all duration-300">
                            <h3 className="text-2xl font-bold text-purple-300 mb-4">⚡ Funcionalidades</h3>
                            <p className="text-gray-300 mb-4">Botões "Baixar Novas" e "Baixar Tudo" funcionais.</p>
                            <div className="text-purple-200 text-lg font-semibold">
                                Downloads em lote ativos
                            </div>
                        </div>

                        {/* Card de URLs */}
                        <div className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 rounded-2xl p-6 border border-indigo-700/30 hover:border-indigo-600/50 transition-all duration-300">
                            <h3 className="text-2xl font-bold text-indigo-300 mb-4">🔗 URLs de Teste</h3>
                            <p className="text-gray-300 mb-4">Teste diferentes filtros via URL.</p>
                            <div className="text-indigo-200 text-sm font-semibold space-y-1">
                                <div>• /pool/test-filter</div>
                                <div>• /pool/test-filter#/genre=Progressive%20House</div>
                                <div>• /pool/test-filter#/genre=Trance</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Músicas */}
                <div className="relative z-[9989]">
                    <div className="container mx-auto px-4 py-6">
                        <MusicList
                            tracks={filteredTracks}
                            downloadedTrackIds={downloadedTrackIds}
                            setDownloadedTrackIds={handleDownloadedTrackIdsChange}
                            showDate={true}
                            hasActiveFilters={selectedGenre !== null}
                            selectedGenre={selectedGenre || "Test Pool"}
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
