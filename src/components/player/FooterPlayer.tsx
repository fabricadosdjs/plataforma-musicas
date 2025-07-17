"use client";

import { Download, Pause, Play, SkipBack, SkipForward, ThumbsUp } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';

type Track = {
    id: number;
    songName: string;
    artist: string;
    imageUrl: string;
    previewUrl: string;
};

const FooterPlayer = memo(function FooterPlayer({ track, onNext, onPrevious, onLike, onDownload }: { track: Track | null, onNext: () => void, onPrevious: () => void, onLike: (trackId: number) => void, onDownload: (track: Track) => void }) {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const createWaveSurfer = async () => {
            if (waveformRef.current) {
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
                });

                if (track) {
                    wavesurfer.current.load(track.previewUrl);
                    wavesurfer.current.on('ready', () => wavesurfer.current.play());
                    wavesurfer.current.on('play', () => setIsPlaying(true));
                    wavesurfer.current.on('pause', () => setIsPlaying(false));
                    wavesurfer.current.on('finish', onNext);
                }
            }
        };

        if (track) createWaveSurfer();
        return () => wavesurfer.current?.destroy();
    }, [track, onNext]);

    if (!track) return null;

    const handlePlayPause = () => wavesurfer.current?.playPause();

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.08)]">
            <div className="container mx-auto px-6 py-3 flex items-center gap-4">
                <img src={track.imageUrl} alt={track.songName} className="w-14 h-14 rounded-lg shadow-sm flex-shrink-0" />
                <div className="flex items-center gap-4 flex-shrink-0">
                    <button onClick={onPrevious} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"><SkipBack size={20} className="text-gray-700" /></button>
                    <button onClick={handlePlayPause} className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button onClick={onNext} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"><SkipForward size={20} className="text-gray-700" /></button>
                </div>
                <div className="flex-grow flex flex-col justify-center gap-1 w-full min-w-0">
                    <div className="truncate">
                        <p className="font-bold text-gray-900 truncate">{track.songName}</p>
                        <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                    </div>
                    <div ref={waveformRef} className="w-full h-[40px]"></div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => onLike(track.id)} className="p-3 rounded-full hover:bg-blue-500/10" title="Like">
                        <ThumbsUp size={20} className="text-blue-500" />
                    </button>
                    <button onClick={() => onDownload(track)} className="p-3 rounded-full hover:bg-green-500/10" title="Download">
                        <Download size={20} className="text-green-500" />
                    </button>
                </div>
            </div>
        </footer>
    );
});

export default FooterPlayer;
