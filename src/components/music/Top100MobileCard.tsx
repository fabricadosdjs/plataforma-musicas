"use client";
import React from 'react';
import {
    Play,
    Pause,
    Download,
    Heart,
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowUp,
    ArrowDown,
    Star,
    Flame,
    Crown,
    Target
} from 'lucide-react';
import { Track } from '@/types/track';

interface Top100MobileCardProps {
    track: any;
    index: number;
    isPlaying: boolean;
    isCurrentTrack: boolean;
    isLiked: boolean;
    isDownloaded: boolean;
    onPlayPause: (track: any) => void;
    onLike: (trackId: number) => void;
    onDownload: (track: any) => void;
    canDownload: boolean;
}

const Top100MobileCard = ({
    track,
    index,
    isPlaying,
    isCurrentTrack,
    isLiked,
    isDownloaded,
    onPlayPause,
    onLike,
    onDownload,
    canDownload
}: Top100MobileCardProps) => {
    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'hot': return <Flame className="h-4 w-4 text-orange-500" />;
            case 'rising': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'falling': return <TrendingDown className="h-4 w-4 text-red-500" />;
            default: return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    const getChangeIcon = (change: string) => {
        switch (change) {
            case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
            case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
            case 'new': return <Star className="h-4 w-4 text-yellow-500" />;
            default: return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    const getPositionColor = (position: number) => {
        if (position <= 3) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
        if (position <= 10) return 'bg-gradient-to-r from-gray-600 to-gray-700';
        return 'bg-gray-800';
    };

    return (
        <div className={`bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-black/80 rounded-xl border border-gray-700/50 shadow-xl backdrop-blur-sm ${isCurrentTrack ? 'ring-2 ring-blue-500/50' : ''
            }`}>
            {/* Header com posição e status */}
            <div className="p-4 border-b border-gray-700/30">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${getPositionColor(track.position)}`}>
                            {track.position}
                        </div>
                        <div className="flex flex-col items-center">
                            {getChangeIcon(track.change)}
                            {track.changeAmount && track.changeAmount > 0 && (
                                <span className={`text-xs font-bold ${track.change === 'up' ? 'text-green-500' :
                                    track.change === 'down' ? 'text-red-500' : 'text-gray-500'
                                    }`}>
                                    {track.changeAmount}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {getTrendIcon(track.trend)}
                        {track.isExclusive && (
                            <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
                                EXCLUSIVA
                            </span>
                        )}
                        {track.isNew && (
                            <span className="px-2 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold rounded-full">
                                NOVA
                            </span>
                        )}
                    </div>
                </div>

                {/* Informações da música */}
                <div className="flex items-center space-x-3">
                    <div className="relative flex-shrink-0 w-16 h-16 group">
                        <img
                            src={track.imageUrl}
                            alt={track.songName}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-600/50 shadow-lg"
                            style={{ minWidth: '64px', minHeight: '64px', maxWidth: '64px', maxHeight: '64px' }}
                        />
                        <button
                            onClick={() => onPlayPause(track)}
                            className={`absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-300 ${isCurrentTrack && isPlaying
                                ? 'bg-blue-600/80 text-white'
                                : 'bg-black/60 text-gray-200 hover:bg-blue-600/80 hover:text-white'
                                }`}
                        >
                            {isCurrentTrack && isPlaying ?
                                <Pause size={24} /> : <Play size={24} className="ml-1" />
                            }
                        </button>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-lg truncate mb-1">{track.songName}</h3>
                        <p className="text-gray-300 text-sm mb-2 truncate">{track.artist}</p>

                        <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                {track.genre}
                            </span>
                            <span className="text-gray-400 text-xs">{track.bpm} BPM</span>
                            <span className="text-gray-400 text-xs">{track.key}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{track.label}</span>
                            {track.remixers && (
                                <>
                                    <span>•</span>
                                    <span>{track.remixers}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Estatísticas e métricas */}
            <div className="p-4 border-b border-gray-700/30">
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-gray-400 text-xs">Views</p>
                        <p className="text-white font-semibold">{track.views.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Plays</p>
                        <p className="text-white font-semibold">{track.plays.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Likes</p>
                        <p className="text-white font-semibold">{track.likes.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Downloads</p>
                        <p className="text-white font-semibold">{track.downloads.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Ações */}
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => onLike(track.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${isLiked
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                            <span className="text-sm font-medium">
                                {isLiked ? 'Curtido' : 'Curtir'}
                            </span>
                        </button>

                        <button
                            onClick={() => onDownload(track)}
                            disabled={!canDownload || isDownloaded}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${!canDownload || isDownloaded
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            <Download size={16} />
                            <span className="text-sm font-medium">
                                {isDownloaded ? 'Baixado' : 'Download'}
                            </span>
                        </button>
                    </div>

                    <div className="text-right">
                        <p className="text-green-400 font-semibold text-lg">{track.price}</p>
                        <p className="text-gray-400 text-xs">{track.releaseDate}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Top100MobileCard; 