// src/components/layout/MainLayout.tsx
"use client";

import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Music, Search, Info, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { memo, useCallback, useEffect, useMemo, useState, useRef } from 'react';

// Importar componentes separados dos seus caminhos CORRETOS
import FooterPlayer from '@/components/player/FooterPlayer';
import Header from '@/components/layout/Header';
import SiteFooter from '@/components/SiteFooter';
import Alert from '@/components/Alert';


// --- Tipos ---
type Track = {
  id: number;
  songName: string;
  artist: string;
  style: string;
  version: 'Original' | 'Remix' | 'Dirty' | 'Clean' | 'Instrumental' | 'Acapella' | 'Intro' | 'Extended' | 'Radio Edit' | 'Remix Extended';
  imageUrl: string;
  previewUrl: string;
  downloadUrl: string;
  releaseDate: string;
  isCopyrightProtected?: boolean;
};

// ***** DADOS MOCK DAS MÚSICAS E VARIÁVEIS DE DATA/IMAGEM DEFINIDAS AQUI (GLOBALMENTE NO ARQUIVO) *****
// Isso garante que elas sejam inicializadas uma vez e estejam disponíveis para os useMemo abaixo.
const today = new Date();
const todayDate = today.toISOString().split('T')[0];

const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdayDate = yesterday.toISOString().split('T')[0];

const rebekaImage = 'https://i.ibb.co/5qVv4TK/20250603-1839-Capa-Sertanejo-Rom-ntico-simple-compose-01jwvvpxkaet6b797dee9nr3py.png';
const davidGuettaImage: string = 'https://i.ibb.co/Qv0Wr0w0/davidguetta.jpg';

const newTracksData: Track[] = [
    { id: 1, songName: 'VERSACE ON THE FLOOR (BRUNO MARS VS. DAVID GUETTA)', artist: 'BRUNO MARS', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/7zuvp6.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1QO7J4Mo_GaF92FTBrtS8XcczLekjiBDV', releaseDate: todayDate, isCopyrightProtected: true },
    { id: 2, songName: '2U (ROBIN SCHULZ REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/7sd93f.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1s0muvpEw3JV7mbplP7Liqvu_LKx93oRJ', releaseDate: todayDate },
    { id: 3, songName: '2U (TUJAMO REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/1ap9ny.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1PPEKoHJulNLrkY8-o3uCFkh-V0-vmhxX', releaseDate: todayDate, isCopyrightProtected: true },
    { id: 4, songName: 'BABY DON\'T HURT ME (BORAI & DENHAM AUDIO REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/0x9hyw.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1050PV8ZqkXUQhKslQ-bK1GTvYw_Bk1GL', releaseDate: todayDate },
    { id: 5, songName: 'BABY DON\'T HURT ME (CEDRIC GERVAIS REMIX EXTENDED)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix Extended', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/w47hs7.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1_z5ZqfLUci_JHQYxshITsb-Z8gt6zc6l', releaseDate: todayDate, isCopyrightProtected: true },
    { id: 6, songName: 'BABY DON\'T HURT ME (CEDRIC GERVAIS REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/vfnb1o.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1qMWJnUgDqq_wtg2g8bKu8lIUVwEaZD6D', releaseDate: todayDate },
    { id: 7, songName: 'BABY DON\'T HURT ME (DJS FROM MARS REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/pwd36q.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1MHlBX2xpAZ0MaX9qe8YImarIxcRK0TOr', releaseDate: todayDate, isCopyrightProtected: true },
    { id: 8, songName: 'BABY DON\'T HURT ME (EXTENDED)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Extended', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/st4qyq.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1jc9e_NyKVpH0ZvJHgTN9khTpOjDfrl8D', releaseDate: todayDate },
    { id: 9, songName: 'BABY DON\'T HURT ME (HYPATON & GIUSEPPE OTTAVIANI REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/mt3vnc.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1bjkobwWew6fSpNdA0WAobIuWlQx1laNG', releaseDate: todayDate, isCopyrightProtected: true },
    { id: 10, songName: 'BABY DON\'T HURT ME (OZONE & DIAGNOSTIX REMIX EXTENDED)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix Extended', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/3o2m7c.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1rDVH00qfUBDspfBdBgLgGRjmav8RIp4e', releaseDate: todayDate },
    { id: 18, songName: 'BABY DON\'T HURT ME (OZONE & DIAGNOSTIX REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/n50ur1.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1iTSIm8NkEU9tH20QOL_SHkj88jGmIPs5', releaseDate: yesterdayDate },
    { id: 19, songName: 'BABY DON\'T HURT ME', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Original', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/z0nkod.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1miwJsdvgqYRMsDjuf71iJ6TO3IMAmrt8', releaseDate: yesterdayDate },
    { id: 20, songName: 'BAD (RADIO EDIT)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Radio Edit', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/drjwv0.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1vapxPTSsHRtyQux02vFpAR6WnxpLbhhs', releaseDate: yesterdayDate },
    { id: 21, songName: 'BANG MY HEAD', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Original', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/m675i0.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1g5KXKM8IRdoQrZY5-zWPKpePXrnetAE4', releaseDate: yesterdayDate },
    { id: 22, songName: 'BEAUTIFUL PEOPLE (D.O.D REMIX EXTENDED)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix Extended', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/krgmp2.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=111PcczQK3NsiMmgMjybdQZE9MA_pp3gg', releaseDate: yesterdayDate },
    { id: 23, songName: 'BEAUTIFUL PEOPLE (D.O.D REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/9f9uls.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1zVltsN2F227AbStpZFj42cgxm5zdQQF4', releaseDate: yesterdayDate },
    { id: 24, songName: 'BEAUTIFUL PEOPLE (KAAZE REMIX EXTENDED)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix Extended', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/w8v6tf.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=11G-a-E44xXrnm9agaR-k7CECipGH7kD8', releaseDate: yesterdayDate },
    { id: 25, songName: 'BEAUTIFUL PEOPLE (KAAZE REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/nwy208.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1baNWLnkCS53qImCdE6mE1eC4lPXPet2F', releaseDate: yesterdayDate },
    { id: 26, songName: 'BEAUTIFUL PEOPLE (RAFFI SAINT REMIX EXTENDED)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix Extended', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/eomdyv.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1WQTfqEqSYpTsiSU-azw1uFBxtGnTZ6dO', releaseDate: yesterdayDate },
    { id: 27, songName: 'BEAUTIFUL PEOPLE (RAFFI SAINT REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/4lh2oh.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1Kfsh3TmgA30KYCPFcFZ6u2uOCz4rTy3l', releaseDate: yesterdayDate },
    { id: 28, songName: 'CHOOSE', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Original', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/p9lron.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1mWPa9V-Vg3txtAPqBjFrolKUBLc50OJy', releaseDate: yesterdayDate },
    { id: 29, songName: 'CRAZY WHAT LOVE CAN DO (GRAFIX EXTENDED REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix Extended', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/ujb5hq.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1WZm3WKIpFeaKuCzoxULCN913wW-skjPc', releaseDate: yesterdayDate },
    { id: 30, songName: 'CRAZY WHAT LOVE CAN DO (WITH BECKY HILL) (GRAFIX REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/kdi0im.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=13O2hYCrvEUhuYOmHZrFgyW4IEfMUs62P', releaseDate: yesterdayDate },
    { id: 31, songName: 'CRAZY WHAT LOVE CAN DO', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Original', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/4mpbbx.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1Asea3BCxWt8y2g1hXjeUXkNnic5KlDwe', releaseDate: yesterdayDate },
    { id: 32, songName: 'DANGEROUS (ROBIN SCHULZ REMIX; RADIO EDIT)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix Radio Edit', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/h91294.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1nSIlDAe4ZfRDi-Oambc6sah_sGyfgm9-', releaseDate: yesterdayDate },
    { id: 33, songName: 'DANGEROUS', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Original', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/mqyp5f.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=16hYvDHwCeJCuo8Z1GccRqbe-t594fla1', releaseDate: yesterdayDate },
    { id: 34, songName: 'DON\'T LEAVE ME ALONE (DAVID GUETTA REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/255knk.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1Hg0gYmysyz_Ftu6hvGsOh0kK7f92fX89', releaseDate: yesterdayDate },
    { id: 35, songName: 'DON\'T LEAVE ME ALONE (R3HAB REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/v1idf7.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1h1Sp1E0BoBt0QYlp6Hjku5sdP6yQLLhJ', releaseDate: yesterdayDate },
    { id: 36, songName: 'DON\'T LEAVE ME ALONE (SIDNEY SAMSON REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/rufe8c.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1ZZoQD4j-wnCnEe05EEPMvCERF8nbxg__', releaseDate: yesterdayDate },
    { id: 37, songName: 'DON\'T LEAVE ME ALONE (TOM STAAR REMIX)', artist: 'DAVID GUETTA', style: 'Eletronica', version: 'Remix', imageUrl: davidGuettaImage, previewUrl: 'https://files.catbox.moe/10hmmb.mp3', downloadUrl: 'https://drive.google.com/uc?export=download&id=1UZkKbSoezMgxNN3aUUO2HNCVWI8yyHkY', releaseDate: yesterdayDate },
    { id: 38, songName: 'VERSACE ON THE FLOOR (Bruno Mars vs. David Guetta)', artist: 'BRUNO MARS', style: 'Eletronica', version: 'Remix', imageUrl: 'https://placehold.co/64x64/A52A2A/ffffff?text=BM', previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', releaseDate: todayDate },
    { id: 39, songName: 'Coração em Silêncio', artist: 'Rebeka Sanches', style: 'Sertanejo', version: 'Original', imageUrl: rebekaImage, previewUrl: 'https://files.catbox.moe/59s0sn.mp3', downloadUrl: 'https://files.catbox.moe/59s0sn.mp3', releaseDate: todayDate },
    { id: 40, songName: 'Coração que Não Esquece', artist: 'Rebeka Sanches', style: 'Sertanejo', version: 'Original', imageUrl: rebekaImage, previewUrl: 'https://files.catbox.moe/bmm8uo.mp3', downloadUrl: 'https://files.catbox.moe/bmm8uo.mp3', releaseDate: todayDate },
    { id: 41, songName: 'Foi Deus Quem Fez', artist: 'Rebeka Sanches', style: 'Sertanejo', version: 'Original', imageUrl: rebekaImage, previewUrl: 'https://files.catbox.moe/nojq78.mp3', downloadUrl: 'https://files.catbox.moe/nojq78.mp3', releaseDate: todayDate },
];

const oldTracksData: Track[] = useMemo(() => [
    { id: 42, songName: 'TÚ ME DAS TUM TUM', artist: 'Dj Jéssika Luana', style: 'House', version: 'Remix', imageUrl: 'https://i.ibb.co/Y7K8ksd2/1b96dfec-11da-4705-8b51-6a55ea03dd62.png', previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', releaseDate: '2025-07-16' },
    { id: 43, songName: 'Out Of Sight Of You', artist: 'Interview', style: 'Pop', version: 'Original', imageUrl: 'https://i.ibb.co/L6vjWd3/img-1.jpg', previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', releaseDate: '2025-07-16' },
    { id: 44, songName: 'Jigga Boo', artist: 'Tyrell The God', style: 'Trap Hip Hop', version: 'Dirty', imageUrl: 'https://i.ibb.co/hH4vjJg/img-2.jpg', previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', releaseDate: '2025-07-15' },
], []);

const mockTracks = useMemo(() => [...newTracksData, ...oldTracksData], [newTracksData, oldTracksData]);


const filteredTracks = useMemo(() => {
    return mockTracks.filter(track => {
        const searchMatch = searchTerm === '' ||
                            track.songName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            track.artist.toLowerCase().includes(searchTerm.toLowerCase());
        return searchMatch;
    });
}, [searchTerm, mockTracks]); // Adicionado mockTracks à dependência


const handleNextTrack = useCallback(() => {
    if (!currentTrack) return;
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % filteredTracks.length;
        if (filteredTracks[nextIndex]) setCurrentTrack(filteredTracks[nextIndex]);
    }
}, [currentTrack, filteredTracks]);

const handlePreviousTrack = useCallback(() => {
    if (!currentTrack) return;
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1) {
        const prevIndex = (currentIndex - 1 + filteredTracks.length) % filteredTracks.length;
        if (filteredTracks[prevIndex]) setCurrentTrack(filteredTracks[prevIndex]);
    }
}, [currentTrack, filteredTracks]);


useEffect(() => {
    if (isLoaded && user) {
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/user-data');
                if (!response.ok) throw new Error('Falha ao buscar dados do usuário');
                const data = await response.json();
                setLikedTracks(data.likedTrackIds || []);
                setDownloadedTracks(data.downloadedTrackIds || []);
                setDownloadCount(data.downloadCount || 0);
            } catch (error) { console.error("Erro:", error); }
            finally { setIsUserDataLoaded(true); }
        };
        fetchUserData();
    } else if (isLoaded && !user) {
        setLikedTracks([]);
        setDownloadedTracks([]);
        setDownloadCount(0);
        setIsUserDataLoaded(true);
    }
}, [user, isLoaded]);

const handleAuthAction = useCallback((message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(''), 4000);
}, []);

const handleLike = useCallback((trackId: number) => {
    if (!user) { handleAuthAction("Faça login para curtir músicas."); return; }
    const newLikedTracks = likedTracks.includes(trackId) ? likedTracks.filter(id => id !== trackId) : [...likedTracks, trackId];
    setLikedTracks(newLikedTracks);
    fetch('/api/likes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId }) })
        .catch(error => { console.error("Falha ao salvar like:", error); setLikedTracks(likedTracks); });
}, [user, likedTracks, handleAuthAction]);

const handleDownload = useCallback((track: Track) => {
    if (!user) { handleAuthAction("Faça login para baixar músicas."); return; }

    if (track.isCopyrightProtected) {
        setAlertMessage(`Esta música (${track.songName}) está protegida por direitos autorais e não pode ser baixada.`);
        setTimeout(() => setAlertMessage(''), 4000);
        return;
    }

    const initiateDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasActivePlan = false;
    const DOWNLOAD_LIMIT = 5;

    const filename = `${track.artist} - ${track.songName}.mp3`;

    if (hasActivePlan || downloadedTracks.includes(track.id)) {
        initiateDownload(track.downloadUrl, filename);
    } else {
        if (downloadCount < DOWNLOAD_LIMIT) {
            const newCount = downloadCount + 1;
            const newDownloadedTracks = [...downloadedTracks, track.id];
            setDownloadCount(newCount);
            setDownloadedTracks(newDownloadedTracks);
            fetch('/api/downloads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId: track.id }) })
                .catch(error => { console.error("Falha:", error); setDownloadCount(downloadCount); setDownloadedTracks(downloadedTracks); });
            initiateDownload(track.downloadUrl, filename);
            handleAuthAction(`Download realizado! Você tem ${DOWNLOAD_LIMIT - newCount} downloads restantes.`);
        } else {
            handleAuthAction(`Você atingiu seu limite de ${DOWNLOAD_LIMIT} downloads gratuitos.`);
        }
    }
}, [user, downloadCount, downloadedTracks, handleAuthAction]);

const sharedProps = {
    isUserDataLoaded,
    likedTracks,
    downloadedTracks,
    currentTrackId: currentTrack?.id || null,
    onPlay: setCurrentTrack,
    onLike: handleLike,
    onDownload: handleDownload,
    searchTerm,
    onSearchChange: setSearchTerm,
    onNextTrack: handleNextTrack,
    onPreviousTrack: handlePreviousTrack,
    alertMessage: alertMessage,
    setAlertMessage: setAlertMessage,
    mockTracks: mockTracks,
    filteredTracks,
};

return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
        <Header onSearchChange={setSearchTerm} />
        <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

        {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, sharedProps);
            }
            return child;
        })}

        <SiteFooter />
        <FooterPlayer
            track={currentTrack}
            onNext={handleNextTrack}
            onPrevious={handlePreviousTrack}
            onLike={handleLike}
            onDownload={handleDownload}
            isLiked={currentTrack ? likedTracks.includes(currentTrack.id) : false}
            isDownloaded={currentTrack ? downloadedTracks.includes(currentTrack.id) : false}
        />
    </div>
);
}