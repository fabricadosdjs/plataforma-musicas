"use client";

import { useState } from 'react';
import { TurnstileWidget } from '@/components/auth/TurnstileDynamic';
import { useTurnstile } from '@/hooks/useTurnstile';
import { TurnstileDebug } from '@/components/auth/TurnstileDebug';

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

                <TurnstileDebug />

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
