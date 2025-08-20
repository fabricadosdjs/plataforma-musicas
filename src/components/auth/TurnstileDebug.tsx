"use client";

import { useState } from 'react';
import { TurnstileWidget } from './TurnstileDynamic';
import { useTurnstile } from '@/hooks/useTurnstile';

export function TurnstileDebug() {
    const { token, isVerified, error, isClient, handleVerify, handleError, handleExpire, reset } = useTurnstile();
    const [debugInfo, setDebugInfo] = useState<string>('');

    const testVerification = async () => {
        if (!token) {
            setDebugInfo('❌ Nenhum token disponível');
            return;
        }

        try {
            console.log('🔍 Testando verificação com token:', token.substring(0, 20) + '...');

            const response = await fetch('/api/auth/verify-turnstile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const result = await response.json();
            console.log('📡 Resposta da API:', result);

            if (result.success) {
                setDebugInfo('✅ Verificação bem-sucedida!');
            } else {
                setDebugInfo(`❌ Erro: ${result.error}`);
            }
        } catch (error) {
            console.error('💥 Erro na requisição:', error);
            setDebugInfo(`💥 Erro na requisição: ${error}`);
        }
    };

    const checkEnvironment = () => {
        const envInfo = {
            NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || 'NÃO CONFIGURADO',
            TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
            NODE_ENV: process.env.NODE_ENV,
            isClient,
            hasToken: !!token,
            isVerified,
            hasError: !!error
        };

        console.log('🔧 Informações do Ambiente:', envInfo);
        setDebugInfo(`🔧 Ambiente: ${JSON.stringify(envInfo, null, 2)}`);
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white">🐛 Debug do Turnstile</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">Cliente:</span>
                        <span className={isClient ? 'text-green-400' : 'text-red-400'}>
                            {isClient ? '✅ Sim' : '❌ Não'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">Token:</span>
                        <span className={token ? 'text-green-400' : 'text-red-400'}>
                            {token ? `${token.substring(0, 20)}...` : 'Não disponível'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">Verificado:</span>
                        <span className={isVerified ? 'text-green-400' : 'text-red-400'}>
                            {isVerified ? '✅ Sim' : '❌ Não'}
                        </span>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">Erro:</span>
                            <span className="text-red-400">{error}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <button
                        onClick={testVerification}
                        disabled={!isVerified}
                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-sm"
                    >
                        🧪 Testar Verificação
                    </button>

                    <button
                        onClick={checkEnvironment}
                        className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                    >
                        🔧 Verificar Ambiente
                    </button>

                    <button
                        onClick={reset}
                        className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"
                    >
                        🔄 Resetar
                    </button>
                </div>
            </div>

            {debugInfo && (
                <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-white mb-2">📊 Informações de Debug:</h3>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">{debugInfo}</pre>
                </div>
            )}

            <div className="mt-4">
                <h3 className="text-sm font-medium text-white mb-2">🎯 Widget Turnstile:</h3>
                <TurnstileWidget
                    onVerify={handleVerify}
                    onError={handleError}
                    onExpire={handleExpire}
                    theme="dark"
                    language="pt-BR"
                    size="normal"
                />
            </div>
        </div>
    );
}
