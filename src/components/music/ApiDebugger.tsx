import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

export const ApiDebugger: React.FC = () => {
    const { data: session } = useSession();
    const [testResult, setTestResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const testApi = async () => {
        if (!session?.user?.id) {
            setTestResult('❌ Usuário não autenticado');
            return;
        }

        setIsLoading(true);
        setTestResult('🔄 Testando API...');

        try {
            // Testar rota de teste primeiro
            const testResponse = await fetch('/api/tracks/test');
            const testData = await testResponse.text();
            console.log('🧪 Teste da API:', testResponse.status, testData);

            // Testar rota principal
            const response = await fetch('/api/tracks');
            const data = await response.text();

            console.log('🔍 Resposta da API /tracks:', response.status, data);

            if (response.ok) {
                try {
                    const jsonData = JSON.parse(data);
                    setTestResult(`✅ API funcionando! Status: ${response.status}\nDados: ${JSON.stringify(jsonData, null, 2)}`);
                } catch (parseError) {
                    setTestResult(`⚠️ API respondeu mas JSON inválido: ${data}`);
                }
            } else {
                setTestResult(`❌ Erro na API: ${response.status} ${response.statusText}\nResposta: ${data}`);
            }
        } catch (error) {
            console.error('❌ Erro no teste:', error);
            setTestResult(`❌ Erro no teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!session?.user?.id) {
        return (
            <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-gray-400">🔐 Faça login para testar a API</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-bold mb-2">🐛 Debug da API</h3>
            <button
                onClick={testApi}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {isLoading ? '🔄 Testando...' : '🧪 Testar API /tracks'}
            </button>

            {testResult && (
                <div className="mt-4 p-3 bg-gray-700 rounded text-sm">
                    <pre className="text-gray-200 whitespace-pre-wrap">{testResult}</pre>
                </div>
            )}

            <div className="mt-2 text-xs text-gray-400">
                <p>👤 Usuário: {session.user.email}</p>
                <p>🆔 ID: {session.user.id}</p>
            </div>
        </div>
    );
};


