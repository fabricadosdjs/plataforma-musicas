// cors.config.js - Configuração CORS para o servidor
module.exports = {
    // Configurações CORS básicas
    basic: {
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'Range',
            'Accept-Ranges',
            'Content-Range',
            'User-Agent',
            'Accept-Encoding',
            'Cache-Control',
            'Pragma'
        ],
        exposedHeaders: [
            'Content-Length',
            'Content-Range',
            'Accept-Ranges',
            'Content-Type',
            'CF-Cache-Status',
            'CF-RAY',
            'Server',
            'Cache-Control',
            'ETag'
        ],
        maxAge: 86400, // 24 horas
        preflightContinue: false,
        optionsSuccessStatus: 200
    },

    // Configurações CORS específicas para áudio
    audio: {
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'Range',
            'Accept-Ranges',
            'Content-Range',
            'User-Agent',
            'Accept-Encoding',
            'Cache-Control',
            'Pragma',
            'If-Match',
            'If-None-Match',
            'If-Modified-Since',
            'If-Unmodified-Since'
        ],
        exposedHeaders: [
            'Content-Length',
            'Content-Range',
            'Accept-Ranges',
            'Content-Type',
            'CF-Cache-Status',
            'CF-RAY',
            'Server',
            'Cache-Control',
            'ETag',
            'Last-Modified',
            'X-Audio-Proxy',
            'X-Streaming-Enabled'
        ],
        maxAge: 86400,
        preflightContinue: false,
        optionsSuccessStatus: 200
    },

    // Configurações CORS para desenvolvimento
    development: {
        origin: function (origin, callback) {
            // Permitir todas as origens em desenvolvimento
            callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'Range',
            'Accept-Ranges',
            'Content-Range',
            'User-Agent',
            'Accept-Encoding',
            'Cache-Control',
            'Pragma',
            'X-Debug',
            'X-Test'
        ],
        exposedHeaders: [
            'Content-Length',
            'Content-Range',
            'Accept-Ranges',
            'Content-Type',
            'CF-Cache-Status',
            'CF-RAY',
            'Server',
            'Cache-Control',
            'ETag',
            'X-Debug',
            'X-Test'
        ],
        maxAge: 86400,
        preflightContinue: false,
        optionsSuccessStatus: 200
    },

    // Configurações CORS para produção
    production: {
        origin: function (origin, callback) {
            // Em produção, você pode restringir as origens
            const allowedOrigins = [
                'https://yourdomain.com',
                'https://www.yourdomain.com',
                'https://app.yourdomain.com'
            ];

            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'Range',
            'Accept-Ranges',
            'Content-Range',
            'User-Agent',
            'Accept-Encoding'
        ],
        exposedHeaders: [
            'Content-Length',
            'Content-Range',
            'Accept-Ranges',
            'Content-Type',
            'Cache-Control',
            'ETag'
        ],
        maxAge: 86400,
        preflightContinue: false,
        optionsSuccessStatus: 200
    }
};
