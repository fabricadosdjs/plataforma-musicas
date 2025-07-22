"use client";

import { useEffect, useState } from 'react';

export default function NewPage() {
    const [loading, setLoading] = useState(true);
    const [tracks, setTracks] = useState([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('NewPage mounted');
        fetchTracks();
    }, []);

    const fetchTracks = async () => {
        try {
            console.log('Fetching tracks...');
            const response = await fetch('/api/tracks');
            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Tracks data:', data);
                setTracks(data);
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                setError(`Erro ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setError(`Erro de rede: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#090A15] flex flex-col items-center justify-center text-white">
                <div className="text-2xl font-bold mb-4">Carregando...</div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#090A15] flex flex-col items-center justify-center text-white">
                <div className="text-2xl font-bold mb-4 text-red-500">Erro</div>
                <div className="text-red-400 mb-4">{error}</div>
                <button
                    onClick={fetchTracks}
                    className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#090A15] text-white p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-6">Novas Músicas - Teste</h1>
                <div className="mb-4">
                    <strong>Total de músicas: {tracks.length}</strong>
                </div>

                {tracks.length === 0 ? (
                    <div className="bg-zinc-900 p-8 rounded-lg text-center">
                        <p className="text-zinc-400">Nenhuma música encontrada no banco de dados.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tracks.slice(0, 5).map((track: any, index) => (
                            <div key={index} className="bg-zinc-900 p-4 rounded-lg">
                                <div className="font-bold">{track.songName || 'Nome não disponível'}</div>
                                <div className="text-zinc-400">{track.artist || 'Artista não disponível'}</div>
                                <div className="text-sm text-zinc-500">{track.style || 'Estilo não disponível'}</div>
                            </div>
                        ))}
                        {tracks.length > 5 && (
                            <div className="text-zinc-400 text-center">
                                ... e mais {tracks.length - 5} músicas
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
