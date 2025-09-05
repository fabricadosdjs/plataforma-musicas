"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import MusicList from '@/components/music/MusicList';
import BatchDownloadButtons from '@/components/download/BatchDownloadButtons';
import { Track } from '@/types/track';
import { useToastContext } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LabelPage() {
    const params = useParams();
    const labelName = decodeURIComponent(params.labelName as string);
    const { showToast } = useToastContext();
    const { data: session } = useSession();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalTracks: 0 });
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);

    // Paginação
    const [limit] = useState(100);
    const [offset] = useState(0);

    useEffect(() => {
        const fetchLabelTracks = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/tracks/label/${encodeURIComponent(labelName)}?limit=${limit}&offset=${offset}`);
                if (response.ok) {
                    const data = await response.json();
                    setTracks(data.tracks || []);
                    setFilteredTracks(data.tracks || []);
                    setStats({ totalTracks: data.tracks?.length || 0 });
                } else {
                    setTracks([]);
                    setFilteredTracks([]);
                    setStats({ totalTracks: 0 });
                }
            } catch (e) {
                setTracks([]);
                setFilteredTracks([]);
                setStats({ totalTracks: 0 });
            } finally {
                setLoading(false);
            }
        };
        if (labelName) fetchLabelTracks();
    }, [labelName, limit, offset]);

    // Filtros por estilo
    const availableStyles = useMemo(() => {
        if (!tracks.length) return [];
        return Array.from(new Set(tracks.map(track => track.style).filter(Boolean))).sort();
    }, [tracks]);

    useEffect(() => {
        if (selectedStyle) {
            setFilteredTracks(tracks.filter(track => track.style === selectedStyle));
        } else {
            setFilteredTracks(tracks);
        }
    }, [selectedStyle, tracks]);

    return (
        <div className="min-h-screen bg-[#121212] overflow-x-hidden">
            <Header />
            <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-center">Label: {labelName}</h1>
                <div className="mb-4 text-center text-[#b3b3b3]">Total de músicas: {stats.totalTracks}</div>
                {availableStyles.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-2 justify-center">
                        <button onClick={() => setSelectedStyle(null)} className={`px-3 py-1 rounded-lg text-sm font-medium ${selectedStyle === null ? 'bg-[#8b5cf6] text-white' : 'bg-[#282828] text-[#b3b3b3] hover:bg-[#3e3e3e] hover:text-white'}`}>Todos ({tracks.length})</button>
                        {availableStyles.map(style => (
                            <button key={style} onClick={() => setSelectedStyle(style)} className={`px-3 py-1 rounded-lg text-sm font-medium ${selectedStyle === style ? 'bg-[#8b5cf6] text-white' : 'bg-[#282828] text-[#b3b3b3] hover:bg-[#3e3e3e] hover:text-white'}`}>{style} ({tracks.filter(t => t.style === style).length})</button>
                        ))}
                    </div>
                )}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-[#8b5cf6] border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-[#b3b3b3] text-lg">Carregando músicas da label {labelName}...</p>
                        </div>
                    </div>
                ) : filteredTracks.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-[#181818] rounded-2xl p-8 max-w-md mx-auto border border-[#282828]">
                            <div className="text-6xl mb-4">📁</div>
                            <h3 className="text-xl font-bold text-white mb-2">Nenhuma música encontrada</h3>
                            <p className="text-[#b3b3b3] mb-6">Não encontramos músicas para a label "{labelName}".</p>
                            <Link href="/label" className="px-6 py-2 bg-[#8b5cf6] text-white rounded-lg hover:bg-[#9333ea] transition-colors font-medium">Voltar</Link>
                        </div>
                    </div>
                ) : (
                    <MusicList tracks={filteredTracks} downloadedTrackIds={[]} setDownloadedTrackIds={() => { }} showDate={true} enableInfiniteScroll={false} />
                )}
            </div>
        </div>
    );
}
