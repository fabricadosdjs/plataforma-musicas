"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionLoadingProps {
    children: React.ReactNode;
}

export const PageTransitionLoading: React.FC<PageTransitionLoadingProps> = ({ children }) => {
    const pathname = usePathname();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayPath, setDisplayPath] = useState(pathname);

    useEffect(() => {
        if (pathname !== displayPath) {
            setIsTransitioning(true);

            // Simular transição de página
            setTimeout(() => {
                setDisplayPath(pathname);
                setIsTransitioning(false);
            }, 300);
        }
    }, [pathname, displayPath]);

    return (
        <>
            {/* Overlay de transição */}
            {isTransitioning && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white text-lg font-medium">Carregando página...</p>
                    </div>
                </div>
            )}

            {/* Conteúdo da página com fade */}
            <div
                className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}
            >
                {children}
            </div>
        </>
    );
};
