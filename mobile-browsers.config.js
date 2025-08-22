// mobile-browsers.config.js - Configurações específicas para navegadores mobile
module.exports = {
    // Configurações para Chrome Android
    chrome: {
        name: 'Chrome Android',
        icon: '🟠',
        unmuteDelay: 200,
        preload: 'metadata',
        events: ['touchstart', 'click'],
        headers: {
            'X-Browser-Type': 'chrome-android',
            'X-Audio-Strategy': 'muted-first'
        },
        features: {
            supportsRangeRequests: true,
            supportsPreload: true,
            supportsCrossOrigin: true,
            supportsUserInteraction: true
        }
    },

    // Configurações para Safari iOS
    safari: {
        name: 'Safari iOS',
        icon: '🔵',
        unmuteDelay: 300, // Safari precisa de mais tempo
        preload: 'metadata',
        events: ['touchstart'], // Safari responde melhor apenas a touchstart
        headers: {
            'X-Browser-Type': 'safari-ios',
            'X-Audio-Strategy': 'muted-first-delayed',
            'X-Safari-Optimized': 'true'
        },
        features: {
            supportsRangeRequests: true,
            supportsPreload: true,
            supportsCrossOrigin: false, // Safari tem limitações de CORS
            supportsUserInteraction: true,
            requiresTouchStart: true
        }
    },

    // Configurações para Firefox Mobile
    firefox: {
        name: 'Firefox Mobile',
        icon: '🟠',
        unmuteDelay: 250,
        preload: 'auto',
        events: ['touchstart', 'click'],
        headers: {
            'X-Browser-Type': 'firefox-mobile',
            'X-Audio-Strategy': 'muted-first'
        },
        features: {
            supportsRangeRequests: true,
            supportsPreload: true,
            supportsCrossOrigin: true,
            supportsUserInteraction: true
        }
    },

    // Configurações para Edge Mobile
    edge: {
        name: 'Edge Mobile',
        icon: '🔵',
        unmuteDelay: 200,
        preload: 'metadata',
        events: ['touchstart', 'click'],
        headers: {
            'X-Browser-Type': 'edge-mobile',
            'X-Audio-Strategy': 'muted-first'
        },
        features: {
            supportsRangeRequests: true,
            supportsPreload: true,
            supportsCrossOrigin: true,
            supportsUserInteraction: true
        }
    },

    // Configurações para Opera Mobile
    opera: {
        name: 'Opera Mobile',
        icon: '🔴',
        unmuteDelay: 200,
        preload: 'auto',
        events: ['touchstart', 'click'],
        headers: {
            'X-Browser-Type': 'opera-mobile',
            'X-Audio-Strategy': 'muted-first'
        },
        features: {
            supportsRangeRequests: true,
            supportsPreload: true,
            supportsCrossOrigin: true,
            supportsUserInteraction: true
        }
    },

    // Configurações para Samsung Internet
    samsung: {
        name: 'Samsung Internet',
        icon: '🔵',
        unmuteDelay: 250,
        preload: 'metadata',
        events: ['touchstart', 'click'],
        headers: {
            'X-Browser-Type': 'samsung-internet',
            'X-Audio-Strategy': 'muted-first'
        },
        features: {
            supportsRangeRequests: true,
            supportsPreload: true,
            supportsCrossOrigin: true,
            supportsUserInteraction: true
        }
    },

    // Configurações para UC Browser
    uc: {
        name: 'UC Browser',
        icon: '🟡',
        unmuteDelay: 300,
        preload: 'auto',
        events: ['touchstart', 'click'],
        headers: {
            'X-Browser-Type': 'uc-browser',
            'X-Audio-Strategy': 'muted-first-delayed'
        },
        features: {
            supportsRangeRequests: false, // UC Browser tem limitações
            supportsPreload: false,
            supportsCrossOrigin: false,
            supportsUserInteraction: true
        }
    },

    // Função para detectar navegador automaticamente
    detectBrowser: (userAgent) => {
        const ua = userAgent.toLowerCase();

        if (ua.includes('chrome') && ua.includes('android')) return 'chrome';
        if (ua.includes('safari') && (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod'))) return 'safari';
        if (ua.includes('firefox') && (ua.includes('android') || ua.includes('iphone') || ua.includes('ipad'))) return 'firefox';
        if (ua.includes('edg') && (ua.includes('android') || ua.includes('iphone') || ua.includes('ipad'))) return 'edge';
        if ((ua.includes('opr') || ua.includes('opera')) && (ua.includes('android') || ua.includes('iphone') || ua.includes('ipad'))) return 'opera';
        if (ua.includes('samsungbrowser') || ua.includes('samsung')) return 'samsung';
        if (ua.includes('ucbrowser') || ua.includes('ucweb')) return 'uc';

        return 'chrome'; // Fallback para Chrome
    },

    // Função para obter configurações do navegador
    getBrowserConfig: (browserType) => {
        return module.exports[browserType] || module.exports.chrome;
    },

    // Função para obter headers específicos do navegador
    getBrowserHeaders: (browserType) => {
        const config = module.exports.getBrowserConfig(browserType);
        return {
            ...config.headers,
            'X-Detected-Browser': config.name,
            'X-Audio-Delay': config.unmuteDelay.toString(),
            'X-Supports-Range': config.features.supportsRangeRequests.toString(),
            'X-Supports-Preload': config.features.supportsPreload.toString()
        };
    }
};
