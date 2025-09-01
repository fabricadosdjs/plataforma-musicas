// Componente para melhorar a reprodução de áudio com fallbacks inteligentes
import { useEffect, useState } from 'react';
import { useToastContext } from '@/context/ToastContext';

interface SmartAudioPlayerProps {
    audioRef: React.RefObject<HTMLAudioElement>;
    track: any;
    onPlaySuccess?: () => void;
    onPlayError?: (error: string) => void;
}

export const SmartAudioPlayer: React.FC<SmartAudioPlayerProps> = ({
    audioRef,
    track,
    onPlaySuccess,
    onPlayError
}) => {
    const { showToast } = useToastContext();
    const [retryCount, setRetryCount] = useState(0);
    const [fallbackUrls, setFallbackUrls] = useState<string[]>([]);

    // Gerar URLs de fallback para a mesma música
    const generateFallbackUrls = (originalUrl: string): string[] => {
        if (!originalUrl || !originalUrl.includes('contabostorage.com')) {
            return [];
        }

        const fallbacks: string[] = [];
        
        try {
            const url = new URL(originalUrl);
            const pathname = url.pathname;
            
            // Fallback 1: URL direta sem parâmetros
            fallbacks.push(`https://usc1.contabostorage.com${pathname}`);
            
            // Fallback 2: URL com diferentes endpoints (caso haja mirror/CDN)
            fallbacks.push(`https://eu2.contabostorage.com${pathname}`);
            
            // Fallback 3: URL original (como último recurso)
            fallbacks.push(originalUrl);
            
        } catch (error) {
            console.warn('Erro ao gerar URLs de fallback:', error);
        }
        
        return fallbacks;
    };

    // Tentar reproduzir com diferentes URLs
    const attemptPlay = async (urls: string[], currentIndex = 0): Promise<boolean> => {
        if (currentIndex >= urls.length || !audioRef.current) {
            return false;
        }

        const audio = audioRef.current;
        const currentUrl = urls[currentIndex];
        
        return new Promise((resolve) => {
            const handleSuccess = () => {
                console.log(`✅ Áudio carregado com sucesso usando URL ${currentIndex + 1}:`, currentUrl);
                cleanup();
                onPlaySuccess?.();
                resolve(true);
            };

            const handleError = async () => {
                console.warn(`❌ Falha na URL ${currentIndex + 1}:`, currentUrl);
                cleanup();
                
                // Tentar próxima URL
                const nextSuccess = await attemptPlay(urls, currentIndex + 1);
                resolve(nextSuccess);
            };

            const cleanup = () => {
                audio.removeEventListener('canplay', handleSuccess);
                audio.removeEventListener('error', handleError);
            };

            audio.addEventListener('canplay', handleSuccess, { once: true });
            audio.addEventListener('error', handleError, { once: true });

            // Configurar nova fonte
            audio.src = currentUrl;
            audio.load();
        });
    };

    // Tentar reproduzir a música com fallbacks
    const playWithFallbacks = async () => {
        if (!track || !audioRef.current) return;

        const primaryUrl = track.downloadUrl || track.previewUrl || track.url;
        if (!primaryUrl) {
            onPlayError?.('URL de áudio não encontrada');
            return;
        }

        // Gerar URLs de fallback
        const urls = generateFallbackUrls(primaryUrl);
        if (urls.length === 0) {
            urls.push(primaryUrl); // Usar URL original como única opção
        }

        console.log(`🎵 SmartAudioPlayer: Tentando reproduzir com ${urls.length} URLs disponíveis`);

        // Tentar todas as URLs
        const success = await attemptPlay(urls);
        
        if (!success) {
            const errorMsg = 'Não foi possível carregar o áudio. Tente novamente.';
            console.error('❌ SmartAudioPlayer: Todas as URLs falharam');
            onPlayError?.(errorMsg);
            showToast('⚠️ Problema ao carregar áudio. Tente novamente.', 'warning');
        }
    };

    // Usar o hook quando o track mudar
    useEffect(() => {
        if (track) {
            playWithFallbacks();
        }
    }, [track?.id]); // Apenas quando o ID da track mudar

    return null; // Componente sem interface visual
};

export default SmartAudioPlayer;
