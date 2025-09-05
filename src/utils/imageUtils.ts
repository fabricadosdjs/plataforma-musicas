// Utilitários para tratamento de imagens

/**
 * Verifica se uma URL de imagem é válida
 */
export const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;

    const invalidValues = ['', 'undefined', 'null', 'false'];
    if (invalidValues.includes(url.toLowerCase())) return false;

    try {
        const urlObj = new URL(url);

        // Rejeitar URLs localhost em produção
        if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
            console.warn('URL localhost rejeitada para imagem:', url);
            return false;
        }

        // Verificar se é um protocolo válido
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
};

/**
 * Gera cores de gradiente baseadas no nome da música e artista
 */
export const generateGradientColors = (songName: string, artist: string): string => {
    const colors = [
        'from-red-500 to-pink-600',
        'from-blue-500 to-cyan-600',
        'from-green-500 to-emerald-600',
        'from-yellow-500 to-orange-600',
        'from-purple-500 to-indigo-600',
        'from-pink-500 to-rose-600',
        'from-indigo-500 to-purple-600',
        'from-cyan-500 to-blue-600',
        'from-orange-500 to-red-600',
        'from-emerald-500 to-teal-600'
    ];

    const hash = (songName + artist).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);

    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

/**
 * Gera iniciais baseadas no nome da música e artista
 */
export const generateInitials = (songName: string, artist: string): string => {
    if (!songName || !artist) return '?';

    const songInitial = songName.charAt(0).toUpperCase();
    const artistInitial = artist.charAt(0).toUpperCase();

    return songInitial + artistInitial;
};

/**
 * Pré-carrega uma imagem para verificar se é válida
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            // Verificar se a imagem realmente carregou
            if (img.complete && img.naturalWidth > 0) {
                resolve(img);
            } else {
                reject(new Error('Imagem não carregou corretamente'));
            }
        };

        img.onerror = () => {
            reject(new Error('Falha ao carregar imagem'));
        };

        // Configurações para evitar problemas de CORS e cache
        img.crossOrigin = 'anonymous';
        img.src = src;
    });
};

/**
 * Aplica lazy loading com intersection observer
 */
export const setupLazyLoading = (
    element: HTMLElement,
    callback: () => void,
    options: IntersectionObserverInit = {}
) => {
    if (!('IntersectionObserver' in window)) {
        // Fallback para navegadores antigos
        callback();
        return null;
    }

    const defaultOptions: IntersectionObserverInit = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                callback();
                observer.unobserve(entry.target);
            }
        });
    }, defaultOptions);

    observer.observe(element);

    return observer;
};

/**
 * Otimiza URLs de imagem adicionando parâmetros de qualidade
 */
export const optimizeImageUrl = (url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
} = {}): string => {
    if (!isValidImageUrl(url)) return url;

    try {
        const urlObj = new URL(url);

        // Para serviços de imagem conhecidos, adicionar parâmetros de otimização
        if (urlObj.hostname.includes('ibb.co')) {
            // ImgBB não suporta parâmetros de otimização nativamente
            return url;
        }

        if (urlObj.hostname.includes('cloudinary.com')) {
            // Cloudinary suporte
            const { width, height, quality = 80, format = 'webp' } = options;
            let path = urlObj.pathname;

            if (width || height || quality || format) {
                const transformations = [];
                if (width) transformations.push(`w_${width}`);
                if (height) transformations.push(`h_${height}`);
                if (quality) transformations.push(`q_${quality}`);
                if (format) transformations.push(`f_${format}`);

                path = path.replace('/image/upload/', `/image/upload/${transformations.join(',')}/`);
                urlObj.pathname = path;
            }
        }

        return urlObj.toString();
    } catch {
        return url;
    }
};
