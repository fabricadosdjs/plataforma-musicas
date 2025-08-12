"use client";

import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export default function PWAInstaller() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Verificar se já está instalado
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Registrar service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        }

        // Listener para o evento beforeinstallprompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Mostrar banner após 2 minutos se não estiver instalado
            setTimeout(() => {
                if (!isInstalled) {
                    setShowInstallBanner(true);
                }
            }, 120000); // 2 minutos
        };

        // Listener para quando o app é instalado
        const handleAppInstalled = () => {
            console.log('PWA was installed');
            setIsInstalled(true);
            setShowInstallBanner(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [isInstalled]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        setDeferredPrompt(null);
        setShowInstallBanner(false);
    };

    const handleDismiss = () => {
        setShowInstallBanner(false);
        // Não mostrar novamente por 24 horas
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        localStorage.setItem('pwa-install-dismissed', tomorrow.toISOString());
    };

    // Não mostrar se já foi dispensado nas últimas 24 horas
    useEffect(() => {
        const dismissedUntil = localStorage.getItem('pwa-install-dismissed');
        if (dismissedUntil) {
            const dismissedDate = new Date(dismissedUntil);
            const now = new Date();
            if (now < dismissedDate) {
                setShowInstallBanner(false);
            } else {
                // Limpar se já passou das 24 horas
                localStorage.removeItem('pwa-install-dismissed');
            }
        }
    }, []);

    if (!showInstallBanner || !deferredPrompt || isInstalled) {
        return null;
    }

    return (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:w-96 bg-black/90 backdrop-blur-xl border border-gray-800/50 rounded-xl p-4 z-50 shadow-2xl">
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Download className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">Instalar Nexor Records Pools</h3>
                    <p className="text-gray-400 text-sm mb-3">
                        Adicione à tela inicial para acesso rápido e experiência nativa
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={handleInstallClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            Instalar
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                            Agora não
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-gray-800/50 rounded-lg transition-colors flex-shrink-0"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>
        </div>
    );
}
