// Script para testar conexões das principais APIs internas do projeto
// Roda via: node test-api-connections.js

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Configuração de autenticação (preencha se necessário)
// Exemplo de uso:
// const AUTH_TOKEN = 'seu_token_jwt_aqui';
// const AUTH_COOKIE = 'next-auth.session-token=seu_cookie_aqui';
const AUTH_TOKEN = '';
const AUTH_COOKIE = '';

const endpoints = [
    { path: '/api/tracks', method: 'GET' },
    { path: '/api/likes', method: 'GET' },
    { path: '/api/register', method: 'POST', body: { email: 'teste@exemplo.com', password: '123456' } },
    { path: '/api/user-data', method: 'GET' },
    // Enviando dados completos para bug
    {
        path: '/api/report-bug', method: 'POST', body: {
            message: 'Teste de bug',
            url: '/',
            music: { id: 1, name: 'Música Teste', artist: 'Artista Teste' }
        }
    },
    // Enviando dados completos para copyright
    {
        path: '/api/report-copyright', method: 'POST', body: {
            message: 'Teste copyright',
            url: '/',
            music: { id: 1, name: 'Música Teste', artist: 'Artista Teste' }
        }
    },
    { path: '/api/download', method: 'GET' },
    { path: '/api/downloads', method: 'GET' },
    { path: '/api/extract', method: 'GET' },
    // Testando query e artist+title em spotify/search
    { path: '/api/spotify/search', method: 'GET', params: { query: 'avicii' } },
    { path: '/api/spotify/search', method: 'GET', params: { artist: 'avicii', title: 'wake me up' } },
    { path: '/api/play', method: 'POST', body: { trackId: 1 } },
];

const baseUrl = 'http://localhost:3000'; // Altere se necessário

async function testEndpoints() {
    for (const endpoint of endpoints) {
        let url = baseUrl + endpoint.path;
        let options = { method: endpoint.method, headers: {} };
        if (AUTH_TOKEN) options.headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
        if (AUTH_COOKIE) options.headers['Cookie'] = AUTH_COOKIE;
        if (endpoint.body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(endpoint.body);
        }
        if (endpoint.params) {
            const params = new URLSearchParams(endpoint.params).toString();
            url += '?' + params;
        }
        try {
            const res = await fetch(url, options);
            const status = res.status;
            let msg = '';
            try {
                msg = await res.text();
            } catch { }
            console.log(`${endpoint.method} ${endpoint.path}: status ${status} ${msg ? '- ' + msg.slice(0, 100) : ''}`);
        } catch (err) {
            console.error(`${endpoint.method} ${endpoint.path}: erro de conexão`, err.message);
        }
    }
}

testEndpoints();
node test - api - connections.js