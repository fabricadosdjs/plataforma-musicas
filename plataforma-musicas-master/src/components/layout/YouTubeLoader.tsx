'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface YouTubeLoaderProps {
    loading?: boolean;
}

export default function YouTubeLoader({ loading: externalLoading }: YouTubeLoaderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        if (externalLoading !== undefined) {
            setIsLoading(externalLoading);
            if (externalLoading) {
                setProgress(0);
                const interval = setInterval(() => {
                    setProgress(prev => {
                        if (prev >= 90) {
                            clearInterval(interval);
                            return 90;
                        }
                        return prev + Math.random() * 15;
                    });
                }, 100);

                return () => clearInterval(interval);
            } else {
                setProgress(100);
                setTimeout(() => {
                    setProgress(0);
                    setIsLoading(false);
                }, 300);
            }
            return;
        }

        // Auto-detect route changes
        setIsLoading(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 100);

        const timer = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setProgress(0);
                setIsLoading(false);
            }, 300);
        }, 800);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [pathname, externalLoading]);

    if (!isLoading && progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1">
            <div
                className="h-full bg-gradient-to-r from-red-500 via-red-400 to-red-600 transition-all duration-300 ease-out shadow-lg"
                style={{
                    width: `${progress}%`,
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
                }}
            />
        </div>
    );
}
