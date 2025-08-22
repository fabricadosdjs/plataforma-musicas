'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface VolumeDebugPanelProps {
    audioRef: React.RefObject<HTMLAudioElement>;
    className?: string;
}

export default function VolumeDebugPanel({ audioRef, className = '' }: VolumeDebugPanelProps) {
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioState, setAudioState] = useState<any>({});

    useEffect(() => {
        // Verificar se o ref existe e tem um elemento
        if (!audioRef || !audioRef.current) {
            console.log('🎵 VolumeDebug: audioRef ainda não está disponível');
            return;
        }

        const audio = audioRef.current;
        console.log('🎵 VolumeDebug: audioRef disponível, configurando listeners');

        const updateState = () => {
            if (!audio) return;

            setAudioState({
                muted: audio.muted,
                volume: audio.volume,
                paused: audio.paused,
                readyState: audio.readyState,
                networkState: audio.networkState,
                currentTime: audio.currentTime,
                duration: audio.duration,
                src: audio.src,
                currentSrc: audio.currentSrc
            });
        };

        // Atualizar estado inicial
        updateState();

        // Event listeners para mudanças de estado
        audio.addEventListener('volumechange', updateState);
        audio.addEventListener('play', updateState);
        audio.addEventListener('pause', updateState);
        audio.addEventListener('loadeddata', updateState);

        return () => {
            if (audio) {
                audio.removeEventListener('volumechange', updateState);
                audio.removeEventListener('play', updateState);
                audio.removeEventListener('pause', updateState);
                audio.removeEventListener('loadeddata', updateState);
            }
        };
    }, [audioRef, audioRef?.current]);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);

        if (!audioRef || !audioRef.current) {
            console.log('🎵 VolumeDebug: audioRef não disponível para mudança de volume');
            return;
        }

        const audio = audioRef.current;
        audio.volume = newVolume;
        audio.muted = false;
        setIsMuted(false);
    };

    const toggleMute = () => {
        if (!audioRef || !audioRef.current) {
            console.log('🎵 VolumeDebug: audioRef não disponível para toggle mute');
            return;
        }

        const audio = audioRef.current;
        audio.muted = !audio.muted;
        setIsMuted(audio.muted);
    };

    const togglePlay = () => {
        if (!audioRef || !audioRef.current) {
            console.log('🎵 VolumeDebug: audioRef não disponível para toggle play');
            return;
        }

        const audio = audioRef.current;

        if (audio.paused) {
            audio.play().then(() => {
                setIsPlaying(true);
            }).catch(error => {
                console.error('🎵 VolumeDebug: Erro ao reproduzir:', error);
            });
        } else {
            audio.pause();
            setIsPlaying(false);
        }
    };

    const forceUnmute = () => {
        if (!audioRef || !audioRef.current) {
            console.log('🎵 VolumeDebug: audioRef não disponível para force unmute');
            return;
        }

        const audio = audioRef.current;
        audio.muted = false;
        audio.volume = 0.8;
        setIsMuted(false);
        setVolume(0.8);
        console.log('🎵 VolumeDebug: Forçando desmutar e volume 0.8');
    };

    return (
        <div className={`p-4 bg-gray-800 rounded-lg border border-gray-600 ${className}`}>
            <h3 className="font-bold mb-4 text-white">🔊 Volume Debug Panel</h3>

            <div className="space-y-4">
                {/* Controles de Volume */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <label className="text-white text-sm">Volume:</label>
                        <span className="text-white text-sm">{Math.round(volume * 100)}%</span>
                        <button
                            onClick={toggleMute}
                            className={`p-1 rounded ${isMuted ? 'bg-red-500' : 'bg-green-500'}`}
                        >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full"
                    />
                </div>

                {/* Controles de Play/Pause */}
                <div className="flex gap-2">
                    <button
                        onClick={togglePlay}
                        className={`px-3 py-2 rounded flex items-center gap-2 ${isPlaying ? 'bg-yellow-500' : 'bg-green-500'}`}
                    >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>

                    <button
                        onClick={forceUnmute}
                        className="px-3 py-2 rounded bg-blue-500 text-white"
                    >
                        Forçar Desmutar
                    </button>
                </div>

                {/* Estado do Áudio */}
                <div className="bg-gray-700 p-3 rounded">
                    <h4 className="text-white font-semibold mb-2">Estado do Áudio:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                        <div>Muted: {audioState.muted ? '❌' : '✅'}</div>
                        <div>Volume: {Math.round((audioState.volume || 0) * 100)}%</div>
                        <div>Playing: {audioState.paused ? '❌' : '✅'}</div>
                        <div>Ready: {audioState.readyState || 'N/A'}</div>
                        <div>Network: {audioState.networkState || 'N/A'}</div>
                        <div>Time: {audioState.currentTime || '0'}/{audioState.duration || '0'}</div>
                    </div>
                </div>

                {/* URLs */}
                <div className="bg-gray-700 p-3 rounded">
                    <h4 className="text-white font-semibold mb-2">URLs:</h4>
                    <div className="text-xs text-gray-300 space-y-1">
                        <div><strong>src:</strong> {audioState.src || 'N/A'}</div>
                        <div><strong>currentSrc:</strong> {audioState.currentSrc || 'N/A'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}