// src/components/layout/MainLayout.tsx
"use client";

import Header from '@/components/layout/Header';

import Alert from '@/components/ui/Alert';
import { useAppContext } from '@/context/AppContext';
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

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <Header />
            <Alert message={alertMessage} type={alertType} onClose={closeAlert} />

            <main className="flex-grow">
                {children}
            </main>


        </div>
    );
}
