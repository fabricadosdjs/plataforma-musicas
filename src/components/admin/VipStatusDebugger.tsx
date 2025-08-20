import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

export const VipStatusDebugger: React.FC = () => {
    const { data: session } = useSession();
    const [email, setEmail] = useState('');
    const [result, setResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const forceVipUpdate = async () => {
        if (!email) {
            setResult('❌ Email é obrigatório');
            return;
        }

        setIsLoading(true);
        setResult('🔄 Atualizando status VIP...');

        try {
            const response = await fetch('/api/admin/force-vip-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setResult(`✅ ${data.message}\n\nDados do usuário:\n${JSON.stringify(data.user, null, 2)}`);
            } else {
                setResult(`❌ Erro: ${data.error}`);
            }
        } catch (error) {
            console.error('❌ Erro ao forçar atualização VIP:', error);
            setResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Só mostrar para administradores
    if (!session?.user?.id || !(session.user as any).isAdmin) {
        return null;
    }

    return (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-white font-bold mb-3">🔧 Debug Status VIP</h3>

            <div className="space-y-3">
                <div>
                    <label className="block text-sm text-gray-300 mb-1">
                        Email do Usuário:
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@exemplo.com"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                    />
                </div>

                <button
                    onClick={forceVipUpdate}
                    disabled={isLoading || !email}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? '🔄 Atualizando...' : '🔄 Forçar Atualização VIP'}
                </button>

                {result && (
                    <div className="mt-4 p-3 bg-gray-700 rounded text-sm">
                        <pre className="text-gray-200 whitespace-pre-wrap">{result}</pre>
                    </div>
                )}
            </div>

            <div className="mt-3 text-xs text-gray-400">
                <p>👤 Admin: {session.user.email}</p>
                <p>🆔 ID: {session.user.id}</p>
            </div>
        </div>
    );
};


