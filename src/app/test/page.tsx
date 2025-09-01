"use client";

import React, { useState, useEffect } from "react";

const TestPage = () => {
    const [tracks, setTracks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                console.log('🔍 Testando API...');
                setIsLoading(true);
                setError(null);

                const response = await fetch('/api/tracks/new');
                console.log('📡 Resposta:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                console.log('📊 Dados:', data);

                if (data.tracks && Array.isArray(data.tracks)) {
                    setTracks(data.tracks.slice(0, 5)); // Apenas 5 para teste
                    console.log('✅ Sucesso:', data.tracks.length);
                } else {
                    setTracks([]);
                }
            } catch (err) {
                console.error('❌ Erro:', err);
                setError(err instanceof Error ? err.message : 'Erro');
                setTracks([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTracks();
    }, []);

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#000', 
            color: '#fff', 
            padding: '20px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>
                Teste de API
            </h1>

            {isLoading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #3b82f6',
                        borderTop: '4px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <p>Carregando...</p>
                </div>
            )}

            {error && (
                <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ color: '#f87171', marginBottom: '10px' }}>Erro</h2>
                    <p style={{ color: '#fca5a5' }}>{error}</p>
                </div>
            )}

            {!isLoading && !error && (
                <div>
                    <p style={{ marginBottom: '20px', color: '#9ca3af' }}>
                        {tracks.length} músicas encontradas
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {tracks.map((track, index) => (
                            <div
                                key={track.id || index}
                                style={{
                                    backgroundColor: '#1f2937',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    border: '1px solid #374151'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        backgroundColor: '#3b82f6',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {track.songName ? track.songName.charAt(0).toUpperCase() : '?'}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ 
                                            color: '#fff', 
                                            fontWeight: '600',
                                            marginBottom: '4px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {track.songName || 'Sem nome'}
                                        </h3>
                                        <p style={{ 
                                            color: '#9ca3af', 
                                            fontSize: '0.875rem',
                                            marginBottom: '2px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {track.artist || 'Artista desconhecido'}
                                        </p>
                                        {track.style && (
                                            <p style={{ 
                                                color: '#6b7280', 
                                                fontSize: '0.75rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {track.style}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default TestPage;