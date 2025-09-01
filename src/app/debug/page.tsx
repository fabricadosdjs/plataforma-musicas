"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Track } from "@/types/track";

const DebugNewPage = () => {
    const { data: session } = useSession();
    const [tracks, setTracks] = useState<Track[]>([]);
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
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Debug - Página /new</h1>

                <div className="bg-gray-800 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4">Status da Sessão</h2>
                    <p>Usuário logado: {session?.user ? 'Sim' : 'Não'}</p>
                    <p>Email: {session?.user?.email || 'N/A'}</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4">Status do Carregamento</h2>
                    <p>Carregando: {isLoading ? 'Sim' : 'Não'}</p>
                    <p>Erro: {error || 'Nenhum'}</p>
                    <p>Tracks carregadas: {tracks.length}</p>
                </div>

                {isLoading && (
                    <div className="bg-blue-900 p-6 rounded-lg mb-6">
                        <h2 className="text-xl font-semibold mb-4">Carregando...</h2>
                        <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900 p-6 rounded-lg mb-6">
                        <h2 className="text-xl font-semibold mb-4">Erro</h2>
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {tracks.length > 0 && (
                    <div className="bg-green-900 p-6 rounded-lg mb-6">
                        <h2 className="text-xl font-semibold mb-4">Tracks Encontradas ({tracks.length})</h2>
                        <div className="space-y-2">
                            {tracks.slice(0, 5).map((track, index) => (
                                <div key={track.id || index} className="bg-gray-700 p-3 rounded">
                                    <p className="font-semibold">{track.songName}</p>
                                    <p className="text-gray-300">{track.artist}</p>
                                    <p className="text-sm text-gray-400">{track.style}</p>
                                </div>
                            ))}
                            {tracks.length > 5 && (
                                <p className="text-gray-400">... e mais {tracks.length - 5} tracks</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Teste de API</h2>
                    <button
                        onClick={async () => {
                            try {
                                console.log('🧪 Testando API...');
                                const response = await fetch('/api/tracks/new');
                                const data = await response.json();
                                console.log('🧪 Resultado do teste:', data);
                                alert(`API retornou: ${data.tracks?.length || 0} tracks`);
                            } catch (err) {
                                console.error('🧪 Erro no teste:', err);
                                alert(`Erro: ${err}`);
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                    >
                        Testar API
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DebugNewPage;
