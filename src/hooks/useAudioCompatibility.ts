import { useState, useEffect, useCallback } from 'react';

interface AudioCompatibilityInfo {
    isCompatible: boolean;
    format: string;
    codec: string;
    contentType: string;
    recommendations: string[];
    warnings: string[];
}

interface UseAudioCompatibilityReturn {
    checkCompatibility: (audioUrl: string) => Promise<AudioCompatibilityInfo>;
    isChecking: boolean;
    lastResult: AudioCompatibilityInfo | null;
}

/**
 * Hook para verificar automaticamente a compatibilidade de áudio
 * Especialmente útil para dispositivos móveis
 */
export const useAudioCompatibility = (): UseAudioCompatibilityReturn => {
    const [isChecking, setIsChecking] = useState(false);
    const [lastResult, setLastResult] = useState<AudioCompatibilityInfo | null>(null);

    const checkCompatibility = useCallback(async (audioUrl: string): Promise<AudioCompatibilityInfo> => {
        if (!audioUrl) {
            return {
                isCompatible: false,
                format: 'unknown',
                codec: 'unknown',
                contentType: 'unknown',
                recommendations: ['URL de áudio inválida'],
                warnings: ['URL não fornecida']
            };
        }

        setIsChecking(true);

        try {
            // 1. Verificar cabeçalhos HTTP
            const response = await fetch(audioUrl, { method: 'HEAD' });
            const contentType = response.headers.get('content-type') || 'unknown';
            const contentLength = response.headers.get('content-length') || '0';

            // 2. Analisar formato e codec
            const format = getAudioFormat(audioUrl, contentType);
            const codec = getAudioCodec(contentType);

            // 3. Verificar compatibilidade
            const compatibility = await checkAudioCompatibility(audioUrl, format, codec, contentType);

            // 4. Gerar recomendações e avisos
            const { recommendations, warnings } = generateRecommendations(format, codec, contentType, compatibility);

            const result: AudioCompatibilityInfo = {
                isCompatible: compatibility.isSupported,
                format,
                codec,
                contentType,
                recommendations,
                warnings
            };

            setLastResult(result);
            return result;

        } catch (error) {
            const errorResult: AudioCompatibilityInfo = {
                isCompatible: false,
                format: 'unknown',
                codec: 'unknown',
                contentType: 'unknown',
                recommendations: ['Verificar conectividade de rede', 'Verificar se a URL está acessível'],
                warnings: [`Erro na verificação: ${error instanceof Error ? error.message : 'Desconhecido'}`]
            };

            setLastResult(errorResult);
            return errorResult;
        } finally {
            setIsChecking(false);
        }
    }, []);

    // Determinar formato baseado na URL e Content-Type
    const getAudioFormat = (url: string, contentType: string): string => {
        if (contentType.includes('audio/mpeg') || url.includes('.mp3')) return 'MP3';
        if (contentType.includes('audio/aac') || url.includes('.aac')) return 'AAC';
        if (contentType.includes('audio/wav') || url.includes('.wav')) return 'WAV';
        if (contentType.includes('audio/ogg') || url.includes('.ogg')) return 'OGG';
        if (contentType.includes('audio/mp4') || url.includes('.m4a')) return 'M4A';
        if (contentType.includes('audio/flac') || url.includes('.flac')) return 'FLAC';
        return 'Unknown';
    };

    // Determinar codec baseado no Content-Type
    const getAudioCodec = (contentType: string): string => {
        if (contentType.includes('audio/mpeg')) return 'MPEG-1 Layer 3';
        if (contentType.includes('audio/aac')) return 'AAC';
        if (contentType.includes('audio/wav')) return 'PCM';
        if (contentType.includes('audio/ogg')) return 'Vorbis';
        if (contentType.includes('audio/mp4')) return 'AAC/MPEG-4';
        if (contentType.includes('audio/flac')) return 'FLAC';
        return 'Unknown';
    };

    // Verificar compatibilidade do áudio
    const checkAudioCompatibility = async (
        audioUrl: string,
        format: string,
        codec: string,
        contentType: string
    ): Promise<{ isSupported: boolean; error?: string }> => {
        try {
            // Criar elemento de áudio para teste
            const audio = new Audio();
            audio.src = audioUrl;

            // Aguardar carregamento com timeout
            await Promise.race([
                new Promise<void>((resolve) => {
                    audio.addEventListener('loadedmetadata', () => resolve());
                }),
                new Promise<void>((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout')), 5000);
                })
            ]);

            // Tentar reproduzir por um milissegundo para testar compatibilidade
            audio.currentTime = 0;
            audio.volume = 0;
            await audio.play();
            audio.pause();

            return { isSupported: true };

        } catch (error) {
            return {
                isSupported: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    };

    // Gerar recomendações baseadas na análise
    const generateRecommendations = (
        format: string,
        codec: string,
        contentType: string,
        compatibility: { isSupported: boolean; error?: string }
    ): { recommendations: string[]; warnings: string[] } => {
        const recommendations: string[] = [];
        const warnings: string[] = [];

        // Verificar formato
        if (format === 'MP3') {
            recommendations.push('✅ Formato MP3 é o mais compatível com dispositivos móveis');
        } else if (format === 'AAC' || format === 'M4A') {
            recommendations.push('✅ Formato AAC/M4A tem boa compatibilidade com iOS');
        } else if (format === 'WAV' || format === 'FLAC') {
            warnings.push('⚠️ Formato WAV/FLAC pode não ser suportado em todos os dispositivos');
            recommendations.push('🔄 Considere converter para MP3 para máxima compatibilidade');
        }

        // Verificar Content-Type
        if (contentType.includes('audio/')) {
            recommendations.push('✅ Content-Type correto configurado no servidor');
        } else {
            warnings.push('❌ Content-Type incorreto - servidor não está enviando tipo MIME correto');
            recommendations.push('🔧 Configure o servidor para enviar Content-Type correto');
        }

        // Verificar compatibilidade
        if (compatibility.isSupported) {
            recommendations.push('✅ Arquivo testado e funcionando no navegador atual');
        } else {
            warnings.push('❌ Arquivo não pôde ser reproduzido no navegador atual');
            if (compatibility.error) {
                warnings.push(`🔍 Erro específico: ${compatibility.error}`);
            }
        }

        // Recomendações específicas para mobile
        recommendations.push('📱 Para dispositivos móveis, sempre teste após interação do usuário');
        recommendations.push('🎵 Use bitrates de 128-320 kbps para MP3');

        return { recommendations, warnings };
    };

    return {
        checkCompatibility,
        isChecking,
        lastResult
    };
};
