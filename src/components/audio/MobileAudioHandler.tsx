"use client";

import React, { useEffect, useRef } from 'react';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';

/**
 * Componente específico para dispositivos móveis que ajuda com:
 * - Detecção de interação do usuário
 * - Configurações específicas para iOS/Android
 * - Tratamento de autoplay policies
 */
export const MobileAudioHandler: React.FC = () => {
    const { audioRef } = useGlobalPlayer();
    const hasUserInteracted = useRef(false);
    const isMobile = useRef(false);

    useEffect(() => {
        // Detectar se é dispositivo móvel (apenas no cliente)
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
            isMobile.current = false;
            return;
        }
        isMobile.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (!isMobile.current) return;

        console.log('🎵 MobileAudioHandler: Dispositivo móvel detectado');

        // Função para marcar que o usuário interagiu
        const markUserInteraction = () => {
            if (!hasUserInteracted.current) {
                hasUserInteracted.current = true;
                console.log('🎵 MobileAudioHandler: Usuário interagiu - áudio liberado');

                // Configurar áudio para mobile
                if (audioRef.current) {
                    const audio = audioRef.current;

                    // Configurações específicas para mobile
                    audio.volume = 1.0;
                    audio.muted = false;

                    // Para iOS, garantir reprodução inline
                    if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                        console.log('🎵 MobileAudioHandler: Configurando iOS para reprodução inline');
                        // O atributo playsInline já está definido no elemento audio
                    }

                    // Para Android, garantir que o áudio seja carregado
                    if (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)) {
                        console.log('🎵 MobileAudioHandler: Configurando Android');
                        // Android geralmente tem menos restrições
                    }
                }
            }
        };

        // Eventos que indicam interação do usuário
        const interactionEvents = [
            'touchstart',
            'touchend',
            'click',
            'keydown',
            'scroll'
        ];

        // Adicionar listeners para detectar interação
        interactionEvents.forEach(event => {
            document.addEventListener(event, markUserInteraction, {
                once: true,
                passive: true
            });
        });

        // Cleanup
        return () => {
            interactionEvents.forEach(event => {
                document.removeEventListener(event, markUserInteraction);
            });
        };
    }, [audioRef]);

    // Este componente não renderiza nada visível
    return null;
};
