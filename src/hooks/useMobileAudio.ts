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
        // Detectar dispositivo móvel (apenas no cliente)
        const checkMobile = () => {
            if (typeof window === 'undefined' || typeof navigator === 'undefined') {
                setIsMobile(false);
                return false;
            }
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

    // Solicitar permissão de áudio (especialmente para iOS e Android Chrome)
    const requestAudioPermission = async (): Promise<boolean> => {
        if (!isMobile) return true;

        try {
            // Detectar especificamente Android Chrome
            const isAndroidChrome = /Android/i.test(navigator.userAgent) && /Chrome/i.test(navigator.userAgent);
            console.log('🎵 useMobileAudio: Android Chrome detectado:', isAndroidChrome);

            // Para iOS, tentar reproduzir um áudio silencioso
            if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
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

            // Para Android Chrome, usar estratégia específica
            if (isAndroidChrome) {
                console.log('🎵 useMobileAudio: Solicitando permissão Android Chrome');

                try {
                    // Estratégia 1: Tentar criar um contexto de áudio silencioso
                    if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
                        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                        const audioContext = new AudioContextClass();

                        // Criar um oscilador silencioso para "desbloquear" o contexto
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();

                        gainNode.gain.value = 0; // Volume 0 (silencioso)
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);

                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + 0.001);

                        console.log('🎵 useMobileAudio: Contexto de áudio Android Chrome ativado');

                        // Aguardar um pouco para o contexto ser estabelecido
                        await new Promise(resolve => setTimeout(resolve, 150));

                        // Fechar o contexto para liberar recursos
                        audioContext.close();
                    }
                } catch (audioContextError) {
                    console.log('🎵 useMobileAudio: Erro no contexto de áudio Android:', audioContextError);
                }

                try {
                    // Estratégia 2: Tentar reproduzir um áudio de teste silencioso
                    const testAudio = new Audio();
                    testAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
                    testAudio.volume = 0;
                    testAudio.muted = true;
                    testAudio.preload = 'none';

                    // Aguardar um pouco antes de tentar reproduzir
                    await new Promise(resolve => setTimeout(resolve, 100));

                    await testAudio.play();
                    testAudio.pause();

                    console.log('🎵 useMobileAudio: Permissão Android Chrome concedida via áudio de teste');
                    return true;
                } catch (testAudioError) {
                    console.log('🎵 useMobileAudio: Erro no áudio de teste Android:', testAudioError);
                }

                // Se chegou até aqui, assumir que tem permissão (Android é menos restritivo)
                console.log('🎵 useMobileAudio: Assumindo permissão Android Chrome');
                return true;
            }

            // Para outros dispositivos móveis, geralmente não há restrições
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
