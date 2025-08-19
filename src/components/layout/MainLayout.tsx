// src/components/layout/MainLayout.tsx
"use client";

import Sidebar from '@/components/layout/Sidebar';
import Alert from '@/components/ui/Alert';
import { useAppContext } from '@/context/AppContext';
import { MobileAudioHandler } from '@/components/audio/MobileAudioHandler';
import React from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const {
        alertMessage,
        alertType,
        closeAlert
    } = useAppContext();

    // Sidebar sempre aberto - não pode ser fechado
    const sidebarCollapsed = false;

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            {/* Sidebar - SEMPRE ABERTO */}
            <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => { }} />

            {/* Conteúdo Principal - SEMPRE com margem para sidebar aberto */}
            <div className="flex-1 transition-all duration-300 ease-in-out lg:ml-64">
                <Alert message={alertMessage} type={alertType} onClose={closeAlert} />

                <main className="flex-grow">
                    {children}
                </main>
            </div>

            {/* Handler específico para dispositivos móveis */}
            <MobileAudioHandler />
        </div>
    );
}
