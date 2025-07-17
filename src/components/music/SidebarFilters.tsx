"use client";

import { memo } from 'react';
import { Play, Download, ThumbsUp } from 'lucide-react';

type Track = {
  id: number;
  songName: string;
  artist: string;
  style: string;
  version: string;
  imageUrl: string;
};

const MusicTable = memo(function MusicTable({ tracks, onPlay, onLike, onDownload, likedTracks, downloadedTracks, currentTrackId }: { tracks: Track[], onPlay: (track: Track) => void, onLike: (trackId: number) => void, onDownload: (track: Track) => void, likedTracks: number[], downloadedTracks: number[], currentTrackId: number | null }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm table-fixed">
        <colgroup>
          <col style={{ width: '10%' }} />
          <col style={{ width: '35%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <tbody>
          {tracks.map((track) => {
            const isLiked = likedTracks.includes(track.id);
            const isDownloaded = downloadedTracks.includes(track.id);
            const isPlaying = track.id === currentTrackId;

            return (
              <tr key={track.id} className="border-b border-gray-200 group">
                <td className="p-3">
                  <div className={`relative w-14 h-14 rounded-lg overflow-hidden cursor-pointer shadow-lg ${isPlaying ? 'ring-2 ring-blue-500' : ''}`} onClick={() => onPlay(track)}>
                    <img src={track.imageUrl} alt={track.songName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isPlaying ? <span className="text-white text-xs font-bold">TOCANDO</span> : <Play size={24} className="text-white" />}
                    </div>
                  </div>
                </td>
                <td className="p-3 truncate">
                  <div className="font-bold text-gray-800 truncate">{track.songName}</div>
                </td>
                <td className="p-3 truncate text-gray-500">{track.artist}</td>
                <td className="p-3">
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{track.version}</span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end items-center gap-3">
                    <button onClick={() => onLike(track.id)} className="p-2 rounded-full hover:bg-blue-500/10" title="Like">
                      <ThumbsUp size={18} className={`transition-colors ${isLiked ? 'text-blue-500 fill-current' : 'text-gray-500'}`} />
                    </button>
                    <button onClick={() => onDownload(track)} className="p-2 rounded-full hover:bg-green-500/10" title="Download">
                      <Download size={18} className={isDownloaded ? 'text-green-500' : 'text-blue-600'} />
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
});

export default MusicTable;
