const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Criar app Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    // Configuração CORS completa
    const corsOptions = {
        origin: function (origin, callback) {
            // Permitir todas as origens em desenvolvimento
            if (dev || !origin) {
                callback(null, true);
            } else {
                // Em produção, você pode restringir as origens
                callback(null, true);
            }
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
    };

    // Aplicar CORS
    server.use(cors(corsOptions));

    // Middleware para adicionar headers CORS adicionais
    server.use((req, res, next) => {
        // Headers CORS básicos
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range, Accept-Ranges, Content-Range, User-Agent, Accept-Encoding, Cache-Control, Pragma');
        res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Type, CF-Cache-Status, CF-RAY, Server, Cache-Control, ETag');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '86400');

        // Headers específicos para APIs de áudio
        if (req.path.startsWith('/api/audio-') ||
            req.path.startsWith('/api/cloudflare-') ||
            req.path.includes('audio')) {

            res.header('Accept-Ranges', 'bytes');
            res.header('Cache-Control', 'public, max-age=3600');
            res.header('X-Audio-Proxy', 'enabled');
        }

        // Tratar preflight OPTIONS
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        next();
    });

    // Rota de teste para CORS
    server.get('/api/cors-test', (req, res) => {
        res.json({
            message: 'CORS está funcionando!',
            timestamp: new Date().toISOString(),
            headers: req.headers,
            cors: 'enabled'
        });
    });

    // Rota de teste para áudio
    server.get('/api/audio-test', (req, res) => {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'public, max-age=3600');

        // Retornar um áudio de teste (silêncio de 1 segundo)
        const silentAudio = Buffer.from([
            0xFF, 0xFB, 0x90, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]);

        res.send(silentAudio);
    });

    // Todas as outras rotas vão para o Next.js
    server.all('*', (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    // Iniciar servidor
    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`🚀 Servidor Express com CORS rodando em http://${hostname}:${port}`);
        console.log(`📱 CORS configurado para todas as origens`);
        console.log(`🎵 Headers de áudio otimizados`);
        console.log(`🔧 Modo: ${dev ? 'Desenvolvimento' : 'Produção'}`);
    });
});
