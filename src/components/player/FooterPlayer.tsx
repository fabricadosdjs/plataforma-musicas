// src/components/player/FooterPlayer.tsx
"use client";

import { useAppContext } from '@/context/AppContext';
import { ChevronDown, ChevronUp, Download, Pause, Play, SkipBack, SkipForward, ThumbsUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

const FooterPlayer = memo(function FooterPlayer() {
    const { data: session } = useSession();
    const {
        currentTrack,
        isPlaying,
        togglePlayPause,
        nextTrack,
        previousTrack,
        handleLike,
        handleDownload,
        likedTracks,
        downloadedTracks,
        setIsPlaying
    } = useAppContext();

    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<any>(null);
    const [isMinimized, setIsMinimized] = useState(false);

    // Verificar se o usuário está logado e é VIP
    const isUserLoggedAndVip = session?.user && session.user.is_vip;

    // Se não estiver logado ou não for VIP, não renderizar o player
    if (!isUserLoggedAndVip || !currentTrack) return null;

    const initializeWavesurfer = useCallback(async () => {
        if (waveformRef.current && currentTrack) {
            const WaveSurfer = (await import('wavesurfer.js')).default;

            if (wavesurfer.current) wavesurfer.current.destroy();

            wavesurfer.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#4A5568', // Cor cinza para o tema escuro
                progressColor: '#3B82F6', // Azul para o progresso
                cursorWidth: 1,
                barWidth: 2,
                barGap: 2,
                barRadius: 2,
                height: 40,
                hideScrollbar: true,
                interact: true, // Permitir interação com a waveform
                autoplay: false, // Não iniciar automaticamente
            });

            wavesurfer.current.on('play', () => setIsPlaying(true));
            wavesurfer.current.on('pause', () => setIsPlaying(false));
            wavesurfer.current.on('finish', nextTrack);

            wavesurfer.current.load(currentTrack.previewUrl);

            // Sincroniza o estado de play/pause do contexto com o wavesurfer
            if (isPlaying) {
                wavesurfer.current.play();
            } else {
                wavesurfer.current.pause();
            }

        } else if (!currentTrack && wavesurfer.current) {
            wavesurfer.current.destroy();
            setIsPlaying(false);
        }
    }, [currentTrack, nextTrack, setIsPlaying, isPlaying]);

    useEffect(() => {
        initializeWavesurfer();
        return () => wavesurfer.current?.destroy();
    }, [currentTrack, initializeWavesurfer]);

    // Efeito para controlar play/pause a partir do contexto
    useEffect(() => {
        if (wavesurfer.current) {
            if (isPlaying) {
                wavesurfer.current.play();
            } else {
                wavesurfer.current.pause();
            }
        }
    }, [isPlaying]);

    const isLiked = likedTracks.includes(currentTrack.id);
    const isDownloaded = downloadedTracks.includes(currentTrack.id);

    return (
        <footer className={`fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 text-zinc-200 z-20 shadow-lg transition-all duration-300 ease-in-out ${isMinimized ? 'h-16' : 'h-28'}`}>
            <div className="container mx-auto px-6 py-2 flex flex-col justify-center h-full">
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="absolute top-0 right-4 p-1 text-zinc-400 hover:text-blue-400 transition-colors z-30"
                    title={isMinimized ? "Maximizar Player" : "Minimizar Player"}
                >
                    {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                <div className={`flex items-center gap-4 transition-opacity duration-300 ${isMinimized ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                    <img src={currentTrack.imageUrl} alt={currentTrack.songName} className="w-14 h-14 rounded-md shadow-sm flex-shrink-0 object-cover" />
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <button onClick={previousTrack} className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"><SkipBack size={20} className="text-zinc-300" /></button>
                        <button onClick={togglePlayPause} className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md">
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <button onClick={nextTrack} className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"><SkipForward size={20} className="text-zinc-300" /></button>
                    </div>
                    <div ref={waveformRef} className="flex-grow w-full min-w-0"></div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handleLike(currentTrack.id)} className="p-3 rounded-full hover:bg-zinc-800 transition-colors" title="Like">
                            <ThumbsUp size={20} className={`transition-colors ${isLiked ? 'text-blue-500' : 'text-zinc-400'}`} />
                        </button>
                        <button onClick={() => handleDownload(currentTrack)} className="p-3 rounded-full hover:bg-zinc-800 transition-colors" title="Download">
                            <Download size={20} className={`transition-colors ${isDownloaded ? 'text-green-500' : 'text-blue-500'}`} />
                        </button>
                    </div>
                </div>

                {isMinimized && (
                    <div className="flex items-center justify-between h-full px-4">
                        <div className="flex items-center gap-4">
                            <img src={currentTrack.imageUrl} alt={currentTrack.songName} className="w-10 h-10 rounded-md flex-shrink-0 object-cover" />
                            <p className="font-semibold text-zinc-200 truncate max-w-[200px]">{currentTrack.songName}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={previousTrack} className="p-1 rounded-full text-zinc-400 hover:text-blue-400"><SkipBack size={16} /></button>
                            <button onClick={togglePlayPause} className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700">
                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            <button onClick={nextTrack} className="p-1 rounded-full text-zinc-400 hover:text-blue-400"><SkipForward size={16} /></button>
                        </div>
                    </div>
                )}
            </div>
        </footer>
    );
});

export default FooterPlayer;