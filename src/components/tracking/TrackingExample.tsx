"use client";

import React from 'react';
import { useTracking } from '@/context/TrackingContext';
import { Download, Play, Heart, Share2 } from 'lucide-react';

interface TrackingExampleProps {
    songId: number;
    songTitle: string;
}

export const TrackingExample: React.FC<TrackingExampleProps> = ({
    songId,
    songTitle
}) => {
    const { trackEvent, pendingCount } = useTracking();

    const handleDownload = () => {
        trackEvent(songId, 'download', {
            title: songTitle,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        console.log(`📥 Download registrado para: ${songTitle}`);
    };

    const handlePlay = () => {
        trackEvent(songId, 'play', {
            title: songTitle,
            timestamp: new Date().toISOString()
        });
        console.log(`▶️ Play registrado para: ${songTitle}`);
    };

    const handleLike = () => {
        trackEvent(songId, 'like', {
            title: songTitle,
            timestamp: new Date().toISOString()
        });
        console.log(`❤️ Like registrado para: ${songTitle}`);
    };

    const handleShare = () => {
        trackEvent(songId, 'share', {
            title: songTitle,
            timestamp: new Date().toISOString(),
            platform: 'web'
        });
        console.log(`📤 Share registrado para: ${songTitle}`);
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">{songTitle}</h3>

            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Download className="h-4 w-4" />
                    Download
                </button>

                <button
                    onClick={handlePlay}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                    <Play className="h-4 w-4" />
                    Play
                </button>

                <button
                    onClick={handleLike}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    <Heart className="h-4 w-4" />
                    Like
                </button>

                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                    <Share2 className="h-4 w-4" />
                    Share
                </button>
            </div>

            {/* Status do Tracking */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Eventos pendentes: {pendingCount}</p>
                <p className="text-xs mt-1">
                    Os eventos são enviados automaticamente a cada 10 ações ou a cada 24 horas
                </p>
            </div>
        </div>
    );
};

export default TrackingExample;


