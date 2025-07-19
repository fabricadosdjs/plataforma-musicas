// src/components/player/FooterPlayer.tsx
"use client";

import { Download, Pause, Play, SkipBack, SkipForward, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import { memo, useEffect, useRef, useState, useCallback } from 'react';

type Track = {
    id: number;
    songName: string;
    artist: string;
    imageUrl: string;
    previewUrl: string;
    isCopyrightProtected?: boolean;
};

const FooterPlayer = memo(function FooterPlayer({ track, onNext, onPrevious, onLike, onDownload, isLiked, isDownloaded }: { track: Track | null, onNext: () => void, onPrevious: () => void, onLike: (trackId: number) => void, onDownload: (track: Track) => void, isLiked: boolean, isDownloaded: boolean }) {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const initializeWavesurfer = useCallback(async () => {
        if (waveformRef.current && track) {
            const WaveSurfer = (await import('wavesurfer.js')).default;

            if (wavesurfer.current) wavesurfer.current.destroy();

            wavesurfer.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#E2E8F0',
                progressColor: '#007BFF',
                cursorWidth: 1,
                barWidth: 2,
                barGap: 2,
                barRadius: 2,
                height: 40,
                responsive: true,
                hideScrollbar: true,
                interact: false,
                autoplay: false,
            });

            wavesurfer.current.on('play', () => setIsPlaying(true));
            wavesurfer.current.on('pause', () => setIsPlaying(false));
            wavesurfer.current.on('finish', onNext);

            wavesurfer.current.load(track.previewUrl);
            wavesurfer.current.on('ready', () => {
                if (!wavesurfer.current.isPlaying()) {
                    wavesurfer.current.play();
                }
            });
        } else if (!track && wavesurfer.current) {
            wavesurfer.current.destroy();
            setIsPlaying(false);
        }
    }, [onNext, track]);

    useEffect(() => {
        initializeWavesurfer();
        return () => wavesurfer.current?.destroy();
    }, [track, initializeWavesurfer]);

    const handlePlayPause = () => {
        if (wavesurfer.current) {
            wavesurfer.current.playPause();
        }
    };

    if (!track) return null;

    return (
        <footer className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 text-gray-700 z-20 shadow-md transition-all duration-300 ease-in-out ${isMinimized ? 'h-16' : 'h-28'}`}> {/* Fundo branco e borda cinza */}
            <div className="container mx-auto px-6 py-2 flex flex-col justify-center h-full">
                {/* Botão de minimizar/maximizar */}
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="absolute top-0 right-4 p-1 text-gray-500 hover:text-blue-500 transition-colors z-30"
                    title={isMinimized ? "Maximizar Player" : "Minimizar Player"}
                >
                    {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                <div className={`flex items-center gap-4 ${isMinimized ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                    <img src={track.imageUrl} alt={track.songName} className="w-14 h-14 rounded-md shadow-sm flex-shrink-0" /> {/* Thumbnail visível */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <button onClick={onPrevious} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><SkipBack size={20} className="text-gray-700" /></button>
                        <button onClick={handlePlayPause} className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-md">
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <button onClick={onNext} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><SkipForward size={20} className="text-gray-700" /></button>
                    </div>
                    <div className="flex-grow flex flex-col justify-center gap-1 w-full min-w-0">
                        <div className="truncate">
                            <p className="font-semibold text-lg text-gray-800 truncate">{track.songName}</p>
                            <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                        </div>
                        {/* Removido o waveform visível */}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => onLike(track.id)} className="p-3 rounded-full hover:bg-gray-100 transition-colors" title="Like">
                            <ThumbsUp size={20} className={`transition-colors ${isLiked ? 'text-blue-500' : 'text-gray-500'}`} />
                        </button>
                        <button onClick={() => onDownload(track)} className="p-3 rounded-full hover:bg-gray-100 transition-colors" title="Download">
                            <Download size={20} className={`transition-colors ${isDownloaded ? 'text-green-500' : 'text-blue-500'}`} />
                        </button>
                    </div>
                </div>

                {/* Conteúdo minimizado */}
                {isMinimized && (
                    <div className="flex items-center justify-between h-full px-4">
                        <div className="flex items-center gap-4">
                            <img src={track.imageUrl} alt={track.songName} className="w-10 h-10 rounded-md flex-shrink-0" /> {/* Thumbnail na versão minimizada */}
                            <p className="font-semibold text-gray-800 truncate max-w-[200px]">{track.songName}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={onPrevious} className="p-1 rounded-full text-gray-500 hover:text-blue-500"><SkipBack size={16} /></button>
                            <button onClick={handlePlayPause} className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600">
                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            <button onClick={onNext} className="p-1 rounded-full text-gray-500 hover:text-blue-500"><SkipForward size={16} /></button>
                        </div>
                    </div>
                )}
            </div>
        </footer>
    );
});

export default FooterPlayer;