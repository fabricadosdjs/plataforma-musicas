/**
 * Utilitários para proteger imagens de extensões do navegador
 * que tentam processar imagens quebradas
 */

// Atributos para marcar imagens como protegidas
export const PROTECTION_ATTRIBUTES = {
    NO_PROCESS: 'data-no-process',
    ERROR: 'data-error',
    CLEANED: 'data-cleaned',
    PROTECTED: 'data-protected',
    FAILED_LOAD: 'data-failed-load'
} as const;

// Função para marcar uma imagem como protegida (menos agressiva)
export const protectImage = (img: HTMLImageElement): void => {
    try {
        // Adicionar atributos de proteção básicos
        img.setAttribute(PROTECTION_ATTRIBUTES.PROTECTED, 'true');
        img.setAttribute(PROTECTION_ATTRIBUTES.NO_PROCESS, 'true');

        // Adicionar listener para prevenir modificações apenas em caso de erro
        img.addEventListener('load', () => {
            // Se a imagem carregou com sucesso, remover proteções de erro
            img.removeAttribute(PROTECTION_ATTRIBUTES.ERROR);
            img.removeAttribute(PROTECTION_ATTRIBUTES.CLEANED);
            img.removeAttribute(PROTECTION_ATTRIBUTES.FAILED_LOAD);
        });

        img.addEventListener('error', () => {
            // Se a imagem falhou, aplicar proteções apenas para extensões
            markImageAsBroken(img);
        });

        // Verificar se a imagem já está em estado de erro (apenas se for realmente quebrada)
        if (img.complete && img.naturalWidth === 0 && img.src && img.src !== '') {
            markImageAsBroken(img);
        }

    } catch (error) {
        console.warn('Erro ao proteger imagem:', error);
    }
};

// Função para marcar uma imagem como quebrada (apenas para extensões)
export const markImageAsBroken = (img: HTMLImageElement): void => {
    try {
        // Marcar como quebrada para extensões
        img.setAttribute(PROTECTION_ATTRIBUTES.ERROR, 'true');
        img.setAttribute(PROTECTION_ATTRIBUTES.NO_PROCESS, 'true');
        img.setAttribute(PROTECTION_ATTRIBUTES.FAILED_LOAD, 'true');

        // NÃO limpar o src - deixar a imagem tentar carregar normalmente
        // Apenas adicionar atributos para prevenir processamento por extensões

        // Adicionar atributo para prevenir reprocessamento por extensões
        img.setAttribute(PROTECTION_ATTRIBUTES.CLEANED, 'true');

        // NÃO esconder a imagem - deixar o fallback do componente funcionar
        // Apenas marcar para extensões não processarem

    } catch (error) {
        console.warn('Erro ao marcar imagem como quebrada:', error);
    }
};

// Função para interceptar e prevenir carregamento de imagens problemáticas
export const interceptImageLoading = (): void => {
    if (typeof window === 'undefined') return;

    // Interceptar criação de elementos img
    const originalCreateElement = document.createElement;
    document.createElement = function (tagName: string): HTMLElement {
        const element = originalCreateElement.call(this, tagName);

        if (tagName.toLowerCase() === 'img') {
            const img = element as HTMLImageElement;

            // Proteger a imagem imediatamente (apenas com atributos)
            protectImage(img);

            // Interceptar mudanças no src (apenas para URLs realmente inválidas)
            const originalSetAttribute = img.setAttribute;
            img.setAttribute = function (name: string, value: string): void {
                if (name === 'src' || name === 'srcset') {
                    // Verificar se a URL é realmente inválida
                    if (value && !isValidImageUrl(value)) {
                        console.warn('Tentativa de definir URL inválida:', value);
                        markImageAsBroken(img);
                        return;
                    }
                }

                originalSetAttribute.call(this, name, value);
            };

            // Interceptar mudanças diretas na propriedade src
            Object.defineProperty(img, 'src', {
                set: function (value: string) {
                    if (value && !isValidImageUrl(value)) {
                        console.warn('Tentativa de definir src inválido:', value);
                        markImageAsBroken(img);
                        return;
                    }
                    img.setAttribute('src', value);
                },
                get: function () {
                    return img.getAttribute('src') || '';
                }
            });
        }

        return element;
    };
};

// Função para verificar se uma URL de imagem é válida
const isValidImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;

    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
};

// Função para limpar todas as imagens quebradas (apenas para extensões)
export const cleanupAllBrokenImages = (): void => {
    try {
        const selectors = Object.values(PROTECTION_ATTRIBUTES)
            .map(attr => `img[${attr}="true"]`)
            .join(', ');

        const images = document.querySelectorAll(selectors);

        images.forEach(img => {
            try {
                const imgElement = img as HTMLImageElement;

                // Verificar se a imagem está realmente quebrada
                if (imgElement.complete && imgElement.naturalWidth === 0 && imgElement.src && imgElement.src !== '') {
                    // Apenas marcar para extensões, não esconder
                    markImageAsBroken(imgElement);
                }
            } catch (error) {
                console.warn('Erro ao limpar imagem individual:', error);
            }
        });

        console.log(`Limpeza concluída: ${images.length} imagens processadas`);

    } catch (error) {
        console.warn('Erro ao limpar imagens quebradas:', error);
    }
};

// Função para verificar se uma imagem está protegida
export const isImageProtected = (img: HTMLImageElement): boolean => {
    return img.hasAttribute(PROTECTION_ATTRIBUTES.PROTECTED) ||
        img.hasAttribute(PROTECTION_ATTRIBUTES.NO_PROCESS) ||
        img.hasAttribute(PROTECTION_ATTRIBUTES.ERROR) ||
        img.hasAttribute(PROTECTION_ATTRIBUTES.CLEANED) ||
        img.hasAttribute(PROTECTION_ATTRIBUTES.FAILED_LOAD);
};

// Função para remover proteções de uma imagem
export const removeImageProtection = (img: HTMLImageElement): void => {
    try {
        Object.values(PROTECTION_ATTRIBUTES).forEach(attr => {
            img.removeAttribute(attr);
        });
    } catch (error) {
        console.warn('Erro ao remover proteções da imagem:', error);
    }
};

// Observer para monitorar novas imagens e protegê-las automaticamente
export const setupImageProtectionObserver = (): (() => void) => {
    if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
        return () => { };
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;

                        // Verificar se é uma imagem
                        if (element.tagName === 'IMG') {
                            protectImage(element as HTMLImageElement);
                        }

                        // Verificar se contém imagens
                        const images = element.querySelectorAll('img');
                        images.forEach(img => protectImage(img as HTMLImageElement));
                    }
                });
            }
        });
    });

    // Observar mudanças no DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Retornar função para desconectar o observer
    return () => observer.disconnect();
};

// Função para inicializar proteção global de imagens
export const initializeImageProtection = (): (() => void) => {
    if (typeof window === 'undefined') {
        return () => { };
    }

    console.log('Inicializando proteção de imagens (modo não-agressivo)...');

    // Interceptar criação de elementos img
    interceptImageLoading();

    // Proteger imagens existentes
    const existingImages = document.querySelectorAll('img');
    existingImages.forEach(img => protectImage(img as HTMLImageElement));

    // Configurar observer para novas imagens
    const disconnectObserver = setupImageProtectionObserver();

    // Configurar limpeza periódica
    const cleanupInterval = setInterval(cleanupAllBrokenImages, 10000); // A cada 10 segundos

    // Retornar função de cleanup
    return () => {
        clearInterval(cleanupInterval);
        disconnectObserver();
        console.log('Proteção de imagens desativada');
    };
};
