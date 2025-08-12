"use client";

import { useStopMusicOnRouteChange } from '@/hooks/useStopMusicOnRouteChange';

export default function MusicRouteHandler() {
    useStopMusicOnRouteChange();

    // This component doesn't render anything, it just handles the side effect
    return null;
} 