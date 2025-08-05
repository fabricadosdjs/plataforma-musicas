"use client";
import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Flame,
    Star,
    ArrowUp,
    ArrowDown,
    Minus,
    Target,
    Zap,
    Activity
} from 'lucide-react';

interface Top100TrendsProps {
    tracks: any[];
}

const Top100Trends = ({ tracks }: Top100TrendsProps) => {
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

    const risingTracks = tracks.filter(track => track.change === 'up').slice(0, 5);
    const fallingTracks = tracks.filter(track => track.change === 'down').slice(0, 5);
    const newTracks = tracks.filter(track => track.change === 'new').slice(0, 5);
    const hotTracks = tracks.filter(track => track.trend === 'hot').slice(0, 5);

    return (
        <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-black/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center space-x-3 mb-6">
                <Activity className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Tendências do Ranking</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Subindo */}
                <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl p-4 border border-green-700/50">
                    <div className="flex items-center space-x-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        <h4 className="font-semibold text-white">Subindo</h4>
                    </div>
                    <div className="space-y-2">
                        {risingTracks.map((track) => (
                            <div key={track.id} className="flex items-center p-2 bg-green-900/30 rounded-lg">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <span className="text-sm font-bold text-white flex-shrink-0">#{track.position}</span>
                                    <span className="text-xs text-gray-300 truncate flex-1">{track.songName}</span>
                                </div>
                                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                    {getChangeIcon(track.change)}
                                    <span className="text-xs text-green-500 font-bold">
                                        +{track.changeAmount || 1}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {risingTracks.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-2">Nenhuma música subindo</p>
                        )}
                    </div>
                </div>

                {/* Caindo */}
                <div className="bg-gradient-to-br from-red-900/50 to-red-800/50 rounded-xl p-4 border border-red-700/50">
                    <div className="flex items-center space-x-2 mb-4">
                        <TrendingDown className="h-5 w-5 text-red-400" />
                        <h4 className="font-semibold text-white">Caindo</h4>
                    </div>
                    <div className="space-y-2">
                        {fallingTracks.map((track) => (
                            <div key={track.id} className="flex items-center p-2 bg-red-900/30 rounded-lg">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <span className="text-sm font-bold text-white flex-shrink-0">#{track.position}</span>
                                    <span className="text-xs text-gray-300 truncate flex-1">{track.songName}</span>
                                </div>
                                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                    {getChangeIcon(track.change)}
                                    <span className="text-xs text-red-500 font-bold">
                                        -{track.changeAmount || 1}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {fallingTracks.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-2">Nenhuma música caindo</p>
                        )}
                    </div>
                </div>

                {/* Novas Entradas */}
                <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 rounded-xl p-4 border border-yellow-700/50">
                    <div className="flex items-center space-x-2 mb-4">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <h4 className="font-semibold text-white">Novas</h4>
                    </div>
                    <div className="space-y-2">
                        {newTracks.map((track) => (
                            <div key={track.id} className="flex items-center p-2 bg-yellow-900/30 rounded-lg">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <span className="text-sm font-bold text-white flex-shrink-0">#{track.position}</span>
                                    <span className="text-xs text-gray-300 truncate flex-1">{track.songName}</span>
                                </div>
                                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                    {getChangeIcon(track.change)}
                                    <span className="text-xs text-yellow-500 font-bold">NEW</span>
                                </div>
                            </div>
                        ))}
                        {newTracks.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-2">Nenhuma nova entrada</p>
                        )}
                    </div>
                </div>

                {/* Hot Tracks */}
                <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 rounded-xl p-4 border border-orange-700/50">
                    <div className="flex items-center space-x-2 mb-4">
                        <Flame className="h-5 w-5 text-orange-400" />
                        <h4 className="font-semibold text-white">Hot</h4>
                    </div>
                    <div className="space-y-2">
                        {hotTracks.map((track) => (
                            <div key={track.id} className="flex items-center p-2 bg-orange-900/30 rounded-lg">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <span className="text-sm font-bold text-white flex-shrink-0">#{track.position}</span>
                                    <span className="text-xs text-gray-300 truncate flex-1">{track.songName}</span>
                                </div>
                                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                    {getTrendIcon(track.trend)}
                                    <span className="text-xs text-orange-500 font-bold">HOT</span>
                                </div>
                            </div>
                        ))}
                        {hotTracks.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-2">Nenhuma música hot</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Resumo das tendências */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-lg p-3 text-center">
                    <p className="text-green-400 font-bold text-lg">{risingTracks.length}</p>
                    <p className="text-gray-400 text-xs">Subindo</p>
                </div>
                <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-lg p-3 text-center">
                    <p className="text-red-400 font-bold text-lg">{fallingTracks.length}</p>
                    <p className="text-gray-400 text-xs">Caindo</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-lg p-3 text-center">
                    <p className="text-yellow-400 font-bold text-lg">{newTracks.length}</p>
                    <p className="text-gray-400 text-xs">Novas</p>
                </div>
                <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 rounded-lg p-3 text-center">
                    <p className="text-orange-400 font-bold text-lg">{hotTracks.length}</p>
                    <p className="text-gray-400 text-xs">Hot</p>
                </div>
            </div>
        </div>
    );
};

export default Top100Trends; 