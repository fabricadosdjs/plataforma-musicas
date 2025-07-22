// src/components/layout/MainLayout.tsx
"use client";

import Header from '@/components/layout/Header';
import SiteFooter from '@/components/layout/SiteFooter';
import FooterPlayer from '@/components/player/FooterPlayer';
import Alert from '@/components/ui/Alert';
import { useAppContext } from '@/context/AppContext';
import React from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const {
        currentTrack,
        nextTrack,
        previousTrack,
        handleLike,
        handleDownload,
        isPlaying,
        setIsPlaying,
        likedTracks,
        downloadedTracks,
        alertMessage,
        closeAlert
    } = useAppContext();

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <Header onSearchChange={() => { }} />
            <Alert message={alertMessage} onClose={closeAlert} />

            <main className="flex-grow">
                {children}
            </main>

            <SiteFooter />

            {currentTrack && (
                <FooterPlayer />
            )}
        </div>
    );
}
