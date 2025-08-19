import { useState, useEffect, useRef } from 'react';

interface UseMobileAudioReturn {
    isMobile: boolean;
    hasUserInteracted: boolean;
    canPlayAudio: boolean;
    requestAudioPermission: () => Promise<boolean>;
}

/**
 * Hook personalizado para gerenciar reprodução de áudio em dispositivos móveis
 * Resolve problemas comuns de autoplay e permissões
 */
export const useMobileAudio = (): UseMobileAudioReturn => {
    const [isMobile, setIsMobile] = useState(false);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [canPlayAudio, setCanPlayAudio] = useState(false);
    const audioTestRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Detectar dispositivo móvel
        const checkMobile = () => {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobile(mobile);
            return mobile;
        };

        const mobile = checkMobile();
        if (!mobile) return;

        console.log('🎵 useMobileAudio: Dispositivo móvel detectado');

        // Função para marcar interação do usuário
        const markInteraction = () => {
            if (!hasUserInteracted) {
                setHasUserInteracted(true);
                console.log('🎵 useMobileAudio: Usuário interagiu');

                // Testar se o áudio pode ser reproduzido
                testAudioCapability();
            }
        };

        // Eventos de interação
        const events = ['touchstart', 'click', 'keydown', 'scroll'];
        events.forEach(event => {
            document.addEventListener(event, markInteraction, { once: true, passive: true });
        });

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, markInteraction);
            });
        };
    }, [hasUserInteracted]);

    // Testar capacidade de reprodução de áudio
    const testAudioCapability = async () => {
        if (!isMobile) return;

        try {
            // Criar elemento de áudio temporário para teste
            const testAudio = new Audio();
            testAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
            testAudio.volume = 0;
            testAudio.muted = true;

            // Tentar reproduzir (deve falhar silenciosamente)
            await testAudio.play();
            testAudio.pause();

            setCanPlayAudio(true);
            console.log('🎵 useMobileAudio: Capacidade de áudio confirmada');
        } catch (error) {
            console.warn('🎵 useMobileAudio: Capacidade de áudio limitada:', error);
            setCanPlayAudio(false);
        }
    };

    // Solicitar permissão de áudio (especialmente para iOS)
    const requestAudioPermission = async (): Promise<boolean> => {
        if (!isMobile) return true;

        try {
            // Para iOS, tentar reproduzir um áudio silencioso
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                console.log('🎵 useMobileAudio: Solicitando permissão iOS');

                const testAudio = new Audio();
                testAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
                testAudio.volume = 0;
                testAudio.muted = true;

                await testAudio.play();
                testAudio.pause();

                console.log('🎵 useMobileAudio: Permissão iOS concedida');
                return true;
            }

            // Para Android, geralmente não há restrições
            return true;
        } catch (error) {
            console.warn('🎵 useMobileAudio: Permissão negada:', error);
            return false;
        }
    };

    return {
        isMobile,
        hasUserInteracted,
        canPlayAudio,
        requestAudioPermission
    };
};
