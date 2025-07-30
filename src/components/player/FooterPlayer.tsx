// src/components/player/FooterPlayer.tsx
"use client";
import React, { useRef, useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";



export default function FooterPlayer() {
    const { currentTrack, isPlaying, playTrack, togglePlayPause, nextTrack } = useAppContext();
    const audioRef = useRef<HTMLAudioElement>(null);
    // const waveformRef = useRef<any>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    // Detectar se o usuário está logado via localStorage (NextAuth) ou cookie
    // Preferencialmente, use NextAuth se disponível
    let isLoggedIn = false;
    if (typeof window !== 'undefined') {
        // NextAuth armazena o token em cookies, mas podemos usar localStorage ou contexto global se disponível
        // Aqui, tentamos detectar pelo localStorage ou sessionStorage, mas o ideal é passar via contexto
        try {
            const session = window.localStorage.getItem('nextauth.session-token') || window.sessionStorage.getItem('nextauth.session-token');
            isLoggedIn = !!session;
        } catch (e) {
            isLoggedIn = false;
        }
    }

    // Retroceder para o início da track
    const prevTrack = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]);



    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };




    // Bloquear player para usuários não logados
    if (!isLoggedIn) {
        return (
            <div className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-gray-900 to-black border-t border-gray-800 shadow-2xl z-50 flex flex-col items-center">
                <div className="w-full max-w-3xl flex flex-col items-center px-4 py-4">
                    <div className="text-center text-gray-300 text-sm font-semibold">Faça login para acessar o player de músicas.</div>
                </div>
            </div>
        );
    }

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-gray-900 to-black border-t border-gray-800 shadow-2xl z-50 flex flex-col items-center">
            <audio
                id="footer-audio"
                ref={audioRef}
                src={currentTrack.previewUrl || currentTrack.downloadUrl}
                autoPlay={isPlaying}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={nextTrack}
                style={{ display: "none" }}
            />
            <div className="w-full max-w-3xl flex flex-col items-center px-4 py-2">
                <div className="flex items-center w-full justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <img
                            src={currentTrack.imageUrl}
                            alt={currentTrack.songName}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-700 shadow-md"
                        />
                        <div className="flex flex-col">
                            <span className="text-white font-semibold text-sm truncate max-w-[180px]">
                                {currentTrack.songName}
                            </span>
                            <span className="text-gray-300 text-xs truncate max-w-[180px]">
                                {currentTrack.artist}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={prevTrack}
                            className="p-2 rounded-full hover:bg-gray-700/60 text-gray-200 hover:text-white transition"
                            title="Anterior"
                        >
                            <SkipBack size={24} />
                        </button>
                        <button
                            onClick={togglePlayPause}
                            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition"
                            title={isPlaying ? "Pausar" : "Tocar"}
                        >
                            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                        </button>
                        <button
                            onClick={nextTrack}
                            className="p-2 rounded-full hover:bg-gray-700/60 text-gray-200 hover:text-white transition"
                            title="Próxima"
                        >
                            <SkipForward size={24} />
                        </button>
                    </div>
                </div>
                <div className="w-full flex flex-col items-center">
                    {/* Waveform removido */}
                    <div className="w-full h-12 flex items-center justify-center text-gray-500 italic" style={{ fontSize: '14px' }}>Waveform desativado</div>
                    <div className="flex justify-between w-full text-xs text-gray-400 mt-1">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatTime(seconds: number) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}
