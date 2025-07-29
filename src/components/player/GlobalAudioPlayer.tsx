import { useAppContext } from '@/context/AppContext';
import { useEffect, useRef } from 'react';

export default function GlobalAudioPlayer() {
    const { currentTrack, isPlaying } = useAppContext();
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]);

    if (!currentTrack || !(currentTrack.previewUrl || currentTrack.downloadUrl)) return null;

    return (
        <audio
            ref={audioRef}
            src={currentTrack.previewUrl || currentTrack.downloadUrl}
            autoPlay={isPlaying}
            style={{ display: 'none' }}
        />
    );
}
