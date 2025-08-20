"use client";

import { useState } from 'react';
import { TurnstileDebug } from '@/components/auth/TurnstileDebug';

export default function TurnstileSetupPage() {
    const [siteKey, setSiteKey] = useState('');
    const [secretKey, setSecretKey] = useState('');

    const generateEnvFile = () => {
        const envContent = `# 🔧 CONFIGURAÇÃO TURNSTILE
NEXT_PUBLIC_TURNSTILE_SITE_KEY=${siteKey}
TURNSTILE_SECRET_KEY=${secretKey}

# 📝 INSTRUÇÕES:
# 1. Copie estas variáveis para seu arquivo .env.local
# 2. Ou configure no Cloudflare Pages (Environment Variables)
# 3. Reinicie o servidor após configurar
`;

        const blob = new Blob([envContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'turnstile-config.env';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">
                    ⚙️ Configuração do Turnstile
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Configuração */}
                    <div className="space-y-6">
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">🔑 Configuração</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Site Key (Pública)
                                    </label>
                                    <input
                                        type="text"
                                        value={siteKey}
                                        onChange={(e) => setSiteKey(e.target.value)}
                                        placeholder="0x4AAAAAAABkMYinukE8NnX"
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Chave pública que aparece no frontend
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Secret Key (Privada)
                                    </label>
                                    <input
                                        type="password"
                                        value={secretKey}
                                        onChange={(e) => setSecretKey(e.target.value)}
                                        placeholder="Sua secret key aqui"
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Chave secreta para validação no backend
                                    </p>
                                </div>

                                <button
                                    onClick={generateEnvFile}
                                    disabled={!siteKey || !secretKey}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg"
                                >
                                    📥 Gerar Arquivo .env
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">📋 Instruções</h2>

                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                                <li>Acesse o <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener" className="text-blue-400 hover:underline">Cloudflare Dashboard</a></li>
                                <li>Vá em <strong>Security</strong> → <strong>Turnstile</strong></li>
                                <li>Clique em <strong>Add site</strong></li>
                                <li>Configure o domínio: <code className="bg-gray-700 px-2 py-1 rounded">djpools.nexorrecords.com.br</code></li>
                                <li>Widget type: <strong>Managed</strong></li>
                                <li>Copie a <strong>Site Key</strong> e <strong>Secret Key</strong></li>
                                <li>Cole as chaves nos campos acima</li>
                                <li>Gere o arquivo .env e configure no seu projeto</li>
                            </ol>
                        </div>
                    </div>

                    {/* Teste */}
                    <div className="space-y-6">
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">🧪 Teste</h2>
                            <p className="text-gray-300 text-sm mb-4">
                                Configure as chaves acima e teste o funcionamento do Turnstile:
                            </p>

                            <TurnstileDebug />
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">🔍 Troubleshooting</h2>

                            <div className="space-y-3 text-sm">
                                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                                    <strong className="text-red-400">❌ Widget não aparece:</strong>
                                    <p className="text-red-300 mt-1">Verificar NEXT_PUBLIC_TURNSTILE_SITE_KEY</p>
                                </div>

                                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                                    <strong className="text-red-400">❌ Validação falha:</strong>
                                    <p className="text-red-300 mt-1">Verificar TURNSTILE_SECRET_KEY</p>
                                </div>

                                <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                                    <strong className="text-yellow-400">⚠️ Domínio não configurado:</strong>
                                    <p className="text-yellow-300 mt-1">Adicionar domínio no Cloudflare Turnstile</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
