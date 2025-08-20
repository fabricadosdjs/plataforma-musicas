"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useBatchTracking } from '@/hooks/useBatchTracking';

interface TrackingContextType {
    trackEvent: (songId: number, event: 'download' | 'play' | 'like' | 'share', metadata?: Record<string, any>) => void;
    pendingCount: number;
    isProcessing: boolean;
    forceSend: () => void;
    clearEvents: () => void;
    lastSent: number;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

interface TrackingProviderProps {
    children: ReactNode;
}

export const TrackingProvider: React.FC<TrackingProviderProps> = ({ children }) => {
    const tracking = useBatchTracking({
        maxBatchSize: 10, // Enviar a cada 10 eventos
        maxWaitTime: 24 * 60 * 60 * 1000, // Ou a cada 24 horas
        endpoint: '/api/tracking/batch'
    });

    return (
        <TrackingContext.Provider value={tracking}>
            {children}
        </TrackingContext.Provider>
    );
};

export const useTracking = (): TrackingContextType => {
    const context = useContext(TrackingContext);
    if (context === undefined) {
        throw new Error('useTracking deve ser usado dentro de um TrackingProvider');
    }
    return context;
};


