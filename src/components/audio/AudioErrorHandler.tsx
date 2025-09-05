import { useEffect, useState } from 'react';
import { useToastContext } from '@/context/ToastContext';

interface AudioErrorHandlerProps {
    audioRef: React.RefObject<HTMLAudioElement>;
}

export const AudioErrorHandler: React.FC<AudioErrorHandlerProps> = ({ audioRef }) => {
    const { showToast } = useToastContext();
    const [errorCount, setErrorCount] = useState(0);
    const [lastErrorTime, setLastErrorTime] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleError = (event: Event) => {
            const now = Date.now();

            // Evitar spam de erros - só processar se passou mais de 5 segundos
            if (now - lastErrorTime < 5000) {
                return;
            }

            setLastErrorTime(now);
            setErrorCount(prev => prev + 1);

            // Diferentes estratégias baseadas no número de erros
            if (errorCount < 3) {
                console.warn('🎵 AudioErrorHandler: Tentativa de recuperação automática');

                // Tentar recarregar o áudio após um pequeno delay
                setTimeout(() => {
                    if (audio && audio.src) {
                        audio.load();
                    }
                }, 2000);
            } else {
                // Após muitos erros, mostrar uma mensagem mais permanente
                showToast(
                    '⚠️ Problemas persistentes com o áudio. Verifique sua conexão ou tente mais tarde.',
                    'warning'
                );
            }
        };

        const handleCanPlay = () => {
            // Reset contador quando áudio carrega com sucesso
            setErrorCount(0);
        };

        audio.addEventListener('error', handleError);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('canplay', handleCanPlay);
        };
    }, [audioRef, errorCount, lastErrorTime, showToast]);

    return null; // Componente invisível
};

export default AudioErrorHandler;
