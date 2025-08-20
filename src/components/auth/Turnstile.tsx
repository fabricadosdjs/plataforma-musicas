"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

interface TurnstileProps {
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    theme?: 'light' | 'dark';
    language?: string;
    size?: 'normal' | 'compact' | 'invisible';
}

declare global {
    interface Window {
        turnstile: {
            render: (
                container: string | HTMLElement,
                options: {
                    sitekey: string;
                    callback: (token: string) => void;
                    'expired-callback'?: () => void;
                    'error-callback'?: () => void;
                    theme?: 'light' | 'dark';
                    language?: string;
                    size?: 'normal' | 'compact' | 'invisible';
                }
            ) => string;
            reset: (widgetId: string) => void;
        };
    }
}

export function TurnstileWidget({
    onVerify,
    onError,
    onExpire,
    theme = 'dark',
    language = 'pt-BR',
    size = 'normal'
}: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string>('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        // Carregar script do Turnstile se não estiver carregado
        if (!window.turnstile) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

            script.onload = () => {
                renderTurnstile();
            };
        } else {
            renderTurnstile();
        }

        function renderTurnstile() {
            if (!containerRef.current || !window.turnstile) return;

            try {
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAABkMYinukE8NnX', // Fallback para teste
                    callback: onVerify,
                    'expired-callback': onExpire,
                    'error-callback': onError,
                    theme,
                    language,
                    size
                });
            } catch (error) {
                console.error('Erro ao renderizar Turnstile:', error);
            }
        }

        return () => {
            // Cleanup do widget
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.reset(widgetIdRef.current);
                } catch (error) {
                    console.error('Erro ao resetar Turnstile:', error);
                }
            }
        };
    }, [isClient, onVerify, onError, onExpire, theme, language, size]);

    // Não renderizar no servidor
    if (!isClient) {
        return (
            <div className="flex justify-center my-4">
                <div className="w-64 h-12 bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Carregando captcha...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center my-4">
            <div
                ref={containerRef}
                className="turnstile-container"
                data-testid="turnstile-widget"
            />
        </div>
    );
}

export default TurnstileWidget;
