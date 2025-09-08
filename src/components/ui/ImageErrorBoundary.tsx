"use client";

import React, { Component, ReactNode, useEffect } from 'react';
import { initializeImageProtection } from '@/utils/imageProtection';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

// Interceptor global para erros de imagem
const setupGlobalImageErrorInterceptor = () => {
    if (typeof window === 'undefined') return;

    // Interceptar erros globais relacionados a imagens
    const originalErrorHandler = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
        // Verificar se é um erro relacionado a imagem
        if (typeof message === 'string' && (
            message.includes('drawImage') ||
            message.includes('CanvasRenderingContext2D') ||
            message.includes('HTMLImageElement') ||
            message.includes('broken state') ||
            message.includes('Failed to load resource') ||
            message.includes('404 (Not Found)')
        )) {
            console.warn('Erro de imagem interceptado globalmente:', {
                message,
                source,
                lineno,
                colno,
                error
            });

            // Tentar limpar imagens problemáticas
            cleanupBrokenImagesGlobally();

            // Retornar true para indicar que o erro foi tratado
            return true;
        }

        // Chamar handler original se existir
        if (originalErrorHandler) {
            return originalErrorHandler(message, source, lineno, colno, error);
        }

        return false;
    };

    // Interceptar erros de Promise não tratados
    const originalUnhandledRejectionHandler = window.onunhandledrejection;
    window.onunhandledrejection = function (event) {
        const reason = event.reason;

        // Verificar se é um erro relacionado a imagem
        if (reason && typeof reason === 'object' && reason.message && (
            reason.message.includes('drawImage') ||
            reason.message.includes('CanvasRenderingContext2D') ||
            reason.message.includes('HTMLImageElement') ||
            reason.message.includes('broken state') ||
            reason.message.includes('Failed to load resource') ||
            reason.message.includes('404 (Not Found)')
        )) {
            console.warn('Promise rejection de imagem interceptado:', reason);

            // Tentar limpar imagens problemáticas
            cleanupBrokenImagesGlobally();

            // Prevenir que o erro seja tratado como não tratado
            event.preventDefault();
            return;
        }

        // Nota: Handler original não é chamado para evitar problemas de tipo
        // Se necessário, pode ser implementado de forma diferente
    };

    // Interceptar erros de recursos (como imagens 404)
    if (typeof window.addEventListener === 'function') {
        window.addEventListener('error', (event) => {
            const target = event.target as HTMLElement;

            if (target && target.tagName === 'IMG') {
                console.warn('Erro de carregamento de imagem interceptado:', event);

                // Marcar a imagem como quebrada
                const img = target as HTMLImageElement;
                if (img.src && (img.src.includes('404') || img.naturalWidth === 0)) {
                    // Importar e usar a função de proteção
                    import('@/utils/imageProtection').then(({ markImageAsBroken }) => {
                        markImageAsBroken(img);
                    }).catch(() => {
                        // Fallback se não conseguir importar
                        img.style.display = 'none';
                        img.setAttribute('data-error', 'true');
                    });
                }
            }
        }, true);
    }
};

// Função global para limpar imagens quebradas
const cleanupBrokenImagesGlobally = () => {
    try {
        // Encontrar todas as imagens com erro ou que podem estar causando problemas
        const images = document.querySelectorAll('img[data-error="true"], img[data-no-process="true"], img[data-cleaned="true"]');

        images.forEach(img => {
            try {
                const imgElement = img as HTMLImageElement;

                // Verificar se a imagem está em estado quebrado
                if (imgElement.naturalWidth === 0 || imgElement.complete === false) {
                    // Apenas marcar para extensões, não esconder
                    imgElement.setAttribute('data-cleaned', 'true');
                    imgElement.setAttribute('data-no-process', 'true');
                    // NÃO esconder a imagem - deixar o fallback funcionar
                }
            } catch (cleanupError) {
                console.warn('Erro ao limpar imagem globalmente:', cleanupError);
            }
        });

        // Também marcar imagens que podem estar causando problemas de CORS
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
            try {
                const imgElement = img as HTMLImageElement;

                // Se a imagem tem erro de CORS ou está quebrada
                if (imgElement.complete && imgElement.naturalWidth === 0 && imgElement.src && imgElement.src !== '') {
                    imgElement.setAttribute('data-no-process', 'true');
                    // NÃO esconder - deixar o fallback funcionar
                }
            } catch (error) {
                // Ignorar erros individuais
            }
        });
    } catch (error) {
        console.warn('Erro ao limpar imagens quebradas globalmente:', error);
    }
};

export class ImageErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Atualizar o estado para mostrar o fallback
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log do erro
        console.warn('ImageErrorBoundary capturou um erro:', error, errorInfo);

        // Chamar callback de erro se fornecido
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Verificar se é um erro relacionado a imagem
        if ((error as Error).message.includes('drawImage') || (error as Error).message.includes('CanvasRenderingContext2D')) {
            console.warn('Erro de imagem detectado - provavelmente causado por extensão do navegador');

            // Tentar limpar elementos de imagem problemáticos
            this.cleanupBrokenImages();
        }
    }

    private cleanupBrokenImages() {
        try {
            // Encontrar todas as imagens com erro
            const images = document.querySelectorAll('img[data-error="true"], img[data-no-process="true"]');

            images.forEach(img => {
                try {
                    const imgElement = img as HTMLImageElement;

                    // Apenas marcar para extensões, não esconder
                    imgElement.setAttribute('data-cleaned', 'true');
                    // NÃO esconder a imagem - deixar o fallback funcionar
                } catch (cleanupError) {
                    console.warn('Erro ao limpar imagem:', cleanupError);
                }
            });
        } catch (error) {
            console.warn('Erro ao limpar imagens quebradas:', error);
        }
    }

    private resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            // Renderizar fallback ou botão de retry
            if (this.props.fallback) {
                return (
                    <div className="image-error-fallback">
                        {this.props.fallback}
                        <button
                            onClick={this.resetError}
                            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                            Tentar novamente
                        </button>
                    </div>
                );
            }

            // Fallback padrão
            return (
                <div className="image-error-fallback p-4 bg-gray-100 rounded border text-center">
                    <p className="text-gray-600 mb-2">Erro ao carregar imagem</p>
                    <button
                        onClick={this.resetError}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                        Tentar novamente
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Hook para usar o ImageErrorBoundary em componentes funcionais
export const useImageErrorBoundary = () => {
    const [hasError, setHasError] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
        console.warn('Erro de imagem capturado:', error, errorInfo);
        setError(error);
        setHasError(true);
    }, []);

    const resetError = React.useCallback(() => {
        setHasError(false);
        setError(null);
    }, []);

    return {
        hasError,
        error,
        handleError,
        resetError
    };
};

// Componente para configurar interceptores globais
export const GlobalImageErrorInterceptor: React.FC = () => {
    useEffect(() => {
        setupGlobalImageErrorInterceptor();

        // Inicializar proteção de imagens
        const cleanupImageProtection = initializeImageProtection();

        // Executar script inline para proteção imediata
        const script = document.createElement('script');
        script.textContent = `
            (function() {
                'use strict';
                
                // Proteger imagens existentes imediatamente (modo não-agressivo)
                function protectExistingImages() {
                    const images = document.querySelectorAll('img');
                    images.forEach(function(img) {
                        if (img.complete && img.naturalWidth === 0 && img.src && img.src !== '') {
                            // Imagem quebrada - marcar para extensões não processarem
                            img.setAttribute('data-error', 'true');
                            img.setAttribute('data-no-process', 'true');
                            img.setAttribute('data-protected', 'true');
                            // NÃO esconder - deixar o fallback funcionar
                        }
                    });
                }
                
                // Executar proteção imediatamente
                protectExistingImages();
                
                // Executar novamente após um pequeno delay
                setTimeout(protectExistingImages, 100);
                
                // Interceptar criação de novas imagens (modo não-agressivo)
                const originalCreateElement = document.createElement;
                document.createElement = function(tagName) {
                    const element = originalCreateElement.call(this, tagName);
                    
                    if (tagName.toLowerCase() === 'img') {
                        const img = element;
                        
                        // Adicionar listener de erro (apenas para extensões)
                        img.addEventListener('error', function() {
                            // Marcar para extensões não processarem
                            this.setAttribute('data-error', 'true');
                            this.setAttribute('data-no-process', 'true');
                            this.setAttribute('data-protected', 'true');
                            // NÃO esconder - deixar o fallback funcionar
                        });
                        
                        // Verificar se já está quebrada (apenas se tiver src)
                        if (img.complete && img.naturalWidth === 0 && img.src && img.src !== '') {
                            img.setAttribute('data-error', 'true');
                            img.setAttribute('data-no-process', 'true');
                            img.setAttribute('data-protected', 'true');
                            // NÃO esconder - deixar o fallback funcionar
                        }
                    }
                    
                    return element;
                };
                
                console.log('Proteção de imagens ativada (script inline - modo não-agressivo)');
            })();
        `;

        document.head.appendChild(script);

        // Cleanup ao desmontar
        return () => {
            // Restaurar handlers originais se necessário
            if (typeof window !== 'undefined') {
                window.onerror = null;
                window.onunhandledrejection = null;
            }

            // Limpar proteção de imagens
            cleanupImageProtection();

            // Remover script inline
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return null;
};
