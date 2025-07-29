import { Track } from "@/types/track";
import { Bug, Copyright, Download, Heart, Music2, Play } from "lucide-react";

interface Props {
    tracks: Track[];
    onPlay: (track: Track) => void;
    onLike: (trackId: number) => void;
    onDownload: (track: Track) => void;
    onReportBug: (track: Track) => void;
    onReportCopyright: (track: Track) => void;
    likedTracks: number[];
    downloadedTracks: number[];
    currentTrackId: number | null;
    isPlaying: boolean;
}

export default function MusicTableMinimal({
    tracks = [],
    onPlay,
    onLike,
    onDownload,
    onReportBug,
    onReportCopyright,
    likedTracks,
    downloadedTracks,
    currentTrackId,
    isPlaying,
}: Props) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="min-w-full table-auto bg-[#18181c] rounded-xl shadow-xl">
                <thead>
                    <tr className="bg-[#23232b]">
                        <th className="w-12 px-4 py-3 text-center font-semibold text-white">Play</th>
                        <th className="px-4 py-3 text-left font-semibold text-white">Track / Artist</th>
                        <th className="px-4 py-3 text-left font-semibold text-white">Style</th>
                        <th className="px-4 py-3 text-center font-semibold text-white">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tracks.map((track) => {
                        const isPlayingTrack = track.id === currentTrackId;
                        const isLiked = likedTracks.includes(track.id);
                        const isDownloaded = downloadedTracks.includes(track.id);
                        return (
                            <tr
                                key={track.id}
                                onClick={() => onPlay(track)}
                                className={`group transition-all duration-300 cursor-pointer border-b border-gray-800 last:border-b-0 ${isPlayingTrack
                                        ? "bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 text-white shadow-lg"
                                        : "bg-[#18181c] text-white hover:bg-[#23232b]"
                                    } ${isPlayingTrack ? "font-bold" : ""}`}
                            >
                                {/* Play Button */}
                                <td className="px-4 py-3 text-center align-middle">
                                    <div className="flex items-center justify-center">
                                        {isPlayingTrack && isPlaying ? (
                                            <Music2 size={22} className="text-purple-400 animate-pulse" />
                                        ) : (
                                            <button
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-purple-700 hover:bg-purple-800 rounded-full p-2 shadow-lg"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onPlay(track);
                                                }}
                                                title="Play"
                                            >
                                                <Play size={18} className="text-white" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                                {/* Track/Artist */}
                                <td className="px-4 py-3 align-middle">
                                    <div className="flex flex-col">
                                        <span className="text-base font-semibold text-white">{track.songName}</span>
                                        <span className="text-sm text-gray-400">{track.artist}</span>
                                    </div>
                                </td>
                                {/* Style/Genre */}
                                <td className="px-4 py-3 align-middle">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-purple-400 text-white shadow-md">
                                        {track.style}
                                    </span>
                                </td>
                                {/* Actions */}
                                <td className="px-4 py-3 text-center align-middle">
                                    <div className="flex items-center justify-center gap-2">
                                        {/* Download */}
                                        <button
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 hover:bg-purple-700 rounded-full p-2 shadow-lg ${isDownloaded ? "ring-2 ring-purple-400" : ""
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDownload(track);
                                            }}
                                            title="Download"
                                        >
                                            <Download size={16} className="text-white" />
                                        </button>
                                        {/* Like */}
                                        <button
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 hover:bg-pink-600 rounded-full p-2 shadow-lg ${isLiked ? "ring-2 ring-pink-400" : ""
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onLike(track.id);
                                            }}
                                            title="Like"
                                        >
                                            <Heart size={16} className={isLiked ? "text-pink-400 fill-pink-400" : "text-white"} />
                                        </button>
                                        {/* Report Bug */}
                                        <button
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 hover:bg-yellow-600 rounded-full p-2 shadow-lg"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onReportBug(track);
                                            }}
                                            title="Report Bug"
                                        >
                                            <Bug size={16} className="text-yellow-400" />
                                        </button>
                                        {/* Copyright Claim */}
                                        <button
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 hover:bg-red-700 rounded-full p-2 shadow-lg"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onReportCopyright(track);
                                            }}
                                            title="Copyright Claim"
                                        >
                                            <Copyright size={16} className="text-red-400" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
