"use client";

import { useState } from 'react';
import { TurnstileWidget } from '@/components/auth/TurnstileDynamic';
import { useTurnstile } from '@/hooks/useTurnstile';

export default function TestTurnstilePage() {
    const { token, isVerified, error, handleVerify, handleError, handleExpire, reset } = useTurnstile();
    const [testResult, setTestResult] = useState<string>('');

    const testTurnstile = async () => {
        if (!token) {
            setTestResult('❌ Nenhum token disponível');
            return;
        }

        try {
            const response = await fetch('/api/auth/verify-turnstile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const result = await response.json();

            if (result.success) {
                setTestResult('✅ Turnstile verificado com sucesso!');
            } else {
                setTestResult(`❌ Erro: ${result.error}`);
            }
        } catch (error) {
            setTestResult(`❌ Erro na requisição: ${error}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">
                    🧪 Teste do Turnstile
                </h1>

                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Status do Widget</h2>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">Token:</span>
                            <span className={`font-mono text-sm ${token ? 'text-green-400' : 'text-red-400'}`}>
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

                    <div className="flex gap-2">
                        <button
                            onClick={testTurnstile}
                            disabled={!isVerified}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg"
                        >
                            Testar Verificação
                        </button>

                        <button
                            onClick={reset}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                        >
                            Resetar
                        </button>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Widget Turnstile</h2>

                    <TurnstileWidget
                        onVerify={handleVerify}
                        onError={handleError}
                        onExpire={handleExpire}
                        theme="dark"
                        language="pt-BR"
                        size="normal"
                    />
                </div>

                {testResult && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Resultado do Teste</h2>
                        <div className="p-4 bg-gray-700 rounded-lg">
                            <pre className="whitespace-pre-wrap">{testResult}</pre>
                        </div>
                    </div>
                )}

                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Instruções</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-300">
                        <li>Complete o captcha acima</li>
                        <li>Verifique se o status muda para "Verificado: ✅ Sim"</li>
                        <li>Clique em "Testar Verificação" para validar no backend</li>
                        <li>Use "Resetar" para limpar o estado</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
