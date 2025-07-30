"use client";
import { useAppContext } from '@/context/AppContext';
import { useEffect, useRef } from 'react';

export default function GlobalAudioPlayer() {
    const { currentTrack, isPlaying, nextTrack } = useAppContext();
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        console.log('GlobalAudioPlayer: currentTrack changed:', currentTrack);
        console.log('GlobalAudioPlayer: isPlaying changed:', isPlaying);

        if (audioRef.current) {
            if (isPlaying) {
                console.log('GlobalAudioPlayer: Playing audio');
                audioRef.current.play();
            } else {
                console.log('GlobalAudioPlayer: Pausing audio');
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]);

    if (!currentTrack || !(currentTrack.previewUrl || currentTrack.downloadUrl)) {
        console.log('GlobalAudioPlayer: No track or no URL, returning null');
        return null;
    }

    console.log('GlobalAudioPlayer: Rendering audio element with src:', currentTrack.previewUrl || currentTrack.downloadUrl);

    return (
        <audio
            ref={audioRef}
            src={currentTrack.previewUrl || currentTrack.downloadUrl}
            autoPlay={isPlaying}
            style={{ display: 'none' }}
            onEnded={() => {
                console.log('GlobalAudioPlayer: Audio ended, calling nextTrack');
                // Sempre avança para a próxima track se não estiver pausado
                if (isPlaying && typeof nextTrack === 'function') {
                    nextTrack();
                }
            }}
        />
    );
}
