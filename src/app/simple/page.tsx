"use client";

import React, { useState, useEffect } from "react";

const SimpleNewPage = () => {
    const [tracks, setTracks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                console.log('🔍 Iniciando busca de tracks...');
                setIsLoading(true);
                setError(null);

                const response = await fetch('/api/tracks/new');
                console.log('📡 Resposta da API:', response.status, response.statusText);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('📊 Dados recebidos:', data);

                if (data.tracks && Array.isArray(data.tracks)) {
                    setTracks(data.tracks);
                    console.log('✅ Tracks carregadas:', data.tracks.length);
                } else {
                    console.log('⚠️ Formato de dados inesperado:', data);
                    setTracks([]);
                }
            } catch (err) {
                console.error('❌ Erro ao buscar tracks:', err);
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
                setTracks([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTracks();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Novidades - Versão Simples</h1>

                {isLoading && (
                    <div className="text-center py-12">
                        <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-400">Carregando músicas...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-red-400 mb-2">Erro ao carregar músicas</h2>
                        <p className="text-red-300">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {!isLoading && !error && (
                    <div>
                        <div className="mb-6">
                            <p className="text-gray-400">
                                {tracks.length} música{tracks.length !== 1 ? 's' : ''} encontrada{tracks.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {tracks.slice(0, 10).map((track, index) => (
                                <div
                                    key={track.id || index}
                                    className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            {track.imageUrl ? (
                                                <img
                                                    src={track.imageUrl}
                                                    alt={track.songName}
                                                    className="w-full h-full object-cover rounded-lg"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-white font-bold text-lg">
                                                    {(track.songName || 'T').charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-semibold truncate">
                                                {track.songName || 'Nome não disponível'}
                                            </h3>
                                            <p className="text-gray-400 text-sm truncate">
                                                {track.artist || 'Artista não disponível'}
                                            </p>
                                            {track.style && (
                                                <p className="text-gray-500 text-xs truncate">
                                                    {track.style}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => console.log('Play:', track.songName)}
                                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                title="Tocar"
                                            >
                                                ▶️
                                            </button>

                                            <button
                                                onClick={() => console.log('Download:', track.songName)}
                                                className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                                title="Baixar"
                                            >
                                                ⬇️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {tracks.length > 10 && (
                                <div className="text-center py-4">
                                    <p className="text-gray-400">
                                        ... e mais {tracks.length - 10} músicas
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimpleNewPage;