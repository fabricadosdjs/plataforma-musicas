import { Track } from '@/types/track';
import { motion } from 'framer-motion';
import { AlertTriangle, Copyright, Download, Heart, Music, Pause, Play } from 'lucide-react';
import { useState } from 'react';

interface MusicTableModernProps {
    tracks: Track[];
    onPlay: (track: Track) => void;
    onDownload: (track: Track) => void;
    onLike: (trackId: number) => void;
    onReport: (track: Track) => void;
    onCopyright: (track: Track) => void;
    currentTrackId?: string | number | null;
    isPlaying: boolean;
    likedTracks?: number[];
    downloadedTracks?: number[];
}

export default function MusicTableModern({
    tracks,
    onPlay,
    onDownload,
    onLike,
    onReport,
    onCopyright,
    currentTrackId,
    isPlaying,
    likedTracks = [],
    downloadedTracks = [],
}: MusicTableModernProps) {
    const [hoveredRow, setHoveredRow] = useState<string | number | null>(null);

    return (
        <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#18181b] via-[#232526] to-[#18181b]" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 300, fontSize: 15 }}>
                <thead className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
                    <tr>
                        <th className="px-6 py-4 font-bold uppercase border-b border-gray-700">Música</th>
                        <th className="px-6 py-4 font-bold uppercase border-b border-gray-700">Artista</th>
                        <th className="px-6 py-4 font-bold uppercase border-b border-gray-700">Gênero</th>
                        <th className="px-6 py-4 font-bold uppercase border-b border-gray-700 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {tracks.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center py-16 text-gray-400">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                                        <Music size={32} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-medium">Nenhuma música encontrada</p>
                                        <p className="text-base text-gray-500">Tente ajustar os filtros de busca ou aguarde o carregamento</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        tracks.map((track, index) => {
                            const isCurrent = String(track.id) === String(currentTrackId);
                            const isLiked = likedTracks.includes(track.id);
                            const isDownloaded = downloadedTracks.includes(track.id);
                            return (
                                <motion.tr
                                    key={track.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.03 }}
                                    onMouseEnter={() => setHoveredRow(track.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    className={`transition-all duration-300 border-b border-gray-700/50 ${isDownloaded ? 'bg-green-600/10' : (index % 2 === 0 ? 'bg-black/60' : 'bg-gray-900/60')}`}
                                    style={{ fontFamily: 'Lato, sans-serif', fontWeight: 300 }}
                                >
                                    <td className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-4">
                                            <div className="relative min-w-[56px] min-h-[56px] w-14 h-14 flex-shrink-0">
                                                {track.imageUrl && (
                                                    <motion.img
                                                        src={track.imageUrl}
                                                        alt={track.songName + ' thumbnail'}
                                                        className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-xl object-cover border border-gray-700 shadow-lg"
                                                        style={{ aspectRatio: '1/1' }}
                                                        whileHover={{ scale: 1.08 }}
                                                    />
                                                )}
                                                <motion.button
                                                    whileTap={{ scale: 0.92 }}
                                                    onClick={() => onPlay(track)}
                                                    className={`absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer bg-black/40 hover:bg-green-700/60 ${isCurrent && isPlaying ? 'text-white' : 'text-gray-200'}`}
                                                    style={{ zIndex: 2 }}
                                                    title={isCurrent && isPlaying ? 'Pausar' : 'Tocar'}
                                                >
                                                    {isCurrent && isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-0.5" />}
                                                </motion.button>
                                            </div>
                                            <span className="font-bold text-white tracking-wide" style={{ fontSize: 15, fontWeight: 700 }}>
                                                {track.songName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <span className="text-gray-300 tracking-wide" style={{ fontSize: 14, fontWeight: 400 }}>
                                            {track.artist}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-middle">
                                        <span className="inline-flex items-center px-3 py-1 rounded text-xs font-sans font-bold bg-gray-800 text-gray-300 border border-gray-700 tracking-wide">
                                            {track.style}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 align-middle text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <motion.button
                                                whileTap={{ scale: 0.92 }}
                                                onClick={() => onDownload(track)}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-sans font-semibold transition-all duration-200 min-w-[70px] justify-center cursor-pointer tracking-wide border-2 bg-gray-800 text-white border-gray-700 hover:bg-blue-700`}
                                                style={{ borderWidth: 2 }}
                                                title="Baixar música"
                                            >
                                                <Download size={18} />
                                                Baixar
                                            </motion.button>
                                            <motion.button
                                                whileTap={{ scale: 0.92 }}
                                                onClick={() => onLike(track.id)}
                                                className={`inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-sans font-semibold transition-all duration-200 min-w-[38px] cursor-pointer tracking-wide border-2 ${isLiked ? 'bg-red-600 text-white border-red-500 hover:bg-pink-700' : 'bg-gray-600 text-white border-gray-500 hover:bg-red-600'}`}
                                                title={isLiked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                            >
                                                <Heart size={18} className={isLiked ? 'fill-red-200 text-red-200' : 'text-gray-300'} />
                                            </motion.button>
                                            <motion.button
                                                whileTap={{ scale: 0.92 }}
                                                onClick={() => onReport(track)}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-sans font-semibold transition-all duration-200 min-w-[38px] justify-center cursor-pointer tracking-wide border-2 bg-gray-700 text-gray-100 border-gray-600 hover:bg-yellow-600"
                                                title="Reportar problema com a música"
                                            >
                                                <AlertTriangle size={16} />
                                            </motion.button>
                                            <motion.button
                                                whileTap={{ scale: 0.92 }}
                                                onClick={() => onCopyright(track)}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-sans font-semibold transition-all duration-200 min-w-[38px] justify-center cursor-pointer tracking-wide border-2 bg-gray-700 text-gray-100 border-gray-600 hover:bg-purple-700"
                                                title="Reportar problema de copyright"
                                            >
                                                <Copyright size={16} />
                                            </motion.button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
