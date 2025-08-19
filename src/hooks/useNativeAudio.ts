import { useState, useEffect, useRef } from 'react';

interface NativeAudioCapabilities {
    hasWebAudioAPI: boolean;
    hasMediaSessionAPI: boolean;
    hasAudioContext: boolean;
    hasGetUserMedia: boolean;
    hasAudioWorklet: boolean;
    hasSharedArrayBuffer: boolean;
}

interface UseNativeAudioReturn {
    capabilities: NativeAudioCapabilities;
    createAudioContext: () => AudioContext | null;
    playWithWebAudio: (audioUrl: string) => Promise<boolean>;
    playWithMediaSession: (audioUrl: string, metadata: any) => Promise<boolean>;
    requestMicrophoneAccess: () => Promise<MediaStream | null>;
    isSupported: boolean;
}

/**
 * Hook para detectar e usar APIs nativas de áudio em dispositivos móveis
 * Resolve problemas de compatibilidade com HTML5 Audio padrão
 */
export const useNativeAudio = (): UseNativeAudioReturn => {
    const [capabilities, setCapabilities] = useState<NativeAudioCapabilities>({
        hasWebAudioAPI: false,
        hasMediaSessionAPI: false,
        hasAudioContext: false,
        hasGetUserMedia: false,
        hasAudioWorklet: false,
        hasSharedArrayBuffer: false
    });

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        // Detectar capacidades disponíveis
        const detectCapabilities = () => {
            const hasWebAudioAPI = typeof window !== 'undefined' && 'AudioContext' in window;
            const hasMediaSessionAPI = typeof navigator !== 'undefined' && 'mediaSession' in navigator;
            const hasAudioContext = hasWebAudioAPI;
            const hasGetUserMedia = typeof navigator !== 'undefined' && 'mediaDevices' in navigator;
            const hasAudioWorklet = hasWebAudioAPI && 'audioWorklet' in (window.AudioContext?.prototype || {});
            const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';

            setCapabilities({
                hasWebAudioAPI,
                hasMediaSessionAPI,
                hasAudioContext,
                hasGetUserMedia,
                hasAudioWorklet,
                hasSharedArrayBuffer
            });
        };

        detectCapabilities();
    }, []);

    // Criar AudioContext (Web Audio API)
    const createAudioContext = (): AudioContext | null => {
        if (!capabilities.hasWebAudioAPI) return null;

        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            return audioContextRef.current;
        } catch (error) {
            console.error('Erro ao criar AudioContext:', error);
            return null;
        }
    };

    // Reproduzir áudio usando Web Audio API
    const playWithWebAudio = async (audioUrl: string): Promise<boolean> => {
        if (!capabilities.hasWebAudioAPI) return false;

        try {
            const audioContext = createAudioContext();
            if (!audioContext) return false;

            // Resumir contexto se estiver suspenso (iOS)
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            // Carregar áudio
            const response = await fetch(audioUrl);
            const arrayBuffer = await response.arrayBuffer();
            audioBufferRef.current = await audioContext.decodeAudioData(arrayBuffer);

            // Criar source node
            sourceNodeRef.current = audioContext.createBufferSource();
            sourceNodeRef.current.buffer = audioBufferRef.current;

            // Conectar ao destino (alto-falantes)
            sourceNodeRef.current.connect(audioContext.destination);

            // Reproduzir
            sourceNodeRef.current.start(0);

            console.log('🎵 NativeAudio: Áudio reproduzido via Web Audio API');
            return true;

        } catch (error) {
            console.error('Erro ao reproduzir com Web Audio API:', error);
            return false;
        }
    };

    // Reproduzir usando Media Session API (controle de mídia nativo)
    const playWithMediaSession = async (audioUrl: string, metadata: any): Promise<boolean> => {
        if (!capabilities.hasMediaSessionAPI) return false;

        try {
            // Configurar metadados da sessão de mídia
            if (navigator.mediaSession) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: metadata.title || 'Música',
                    artist: metadata.artist || 'Artista',
                    album: metadata.album || 'Álbum',
                    artwork: metadata.artwork ? [
                        { src: metadata.artwork, sizes: '512x512', type: 'image/png' }
                    ] : []
                });

                // Configurar handlers de controle
                navigator.mediaSession.setActionHandler('play', () => {
                    console.log('🎵 NativeAudio: Play solicitado via Media Session');
                });

                navigator.mediaSession.setActionHandler('pause', () => {
                    console.log('🎵 NativeAudio: Pause solicitado via Media Session');
                });

                navigator.mediaSession.setActionHandler('stop', () => {
                    console.log('🎵 NativeAudio: Stop solicitado via Media Session');
                });

                // Tentar reproduzir com HTML5 Audio como fallback
                const audio = new Audio(audioUrl);
                audio.play();

                console.log('🎵 NativeAudio: Áudio reproduzido via Media Session + HTML5 Audio');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erro ao reproduzir com Media Session API:', error);
            return false;
        }
    };

    // Solicitar acesso ao microfone (para interação do usuário)
    const requestMicrophoneAccess = async (): Promise<MediaStream | null> => {
        if (!capabilities.hasGetUserMedia) return null;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('🎵 NativeAudio: Acesso ao microfone concedido');
            return stream;
        } catch (error) {
            console.error('Erro ao solicitar acesso ao microfone:', error);
            return null;
        }
    };

    // Verificar se alguma API nativa está disponível
    const isSupported = capabilities.hasWebAudioAPI || capabilities.hasMediaSessionAPI;

    return {
        capabilities,
        createAudioContext,
        playWithWebAudio,
        playWithMediaSession,
        requestMicrophoneAccess,
        isSupported
    };
};
