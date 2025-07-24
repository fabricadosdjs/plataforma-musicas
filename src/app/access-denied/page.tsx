
"use client";
import { AlertCircle, Lock, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function AccessDeniedContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reason = searchParams?.get('reason');
    const [message, setMessage] = useState({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para acessar esta área.',
        icon: Lock
    });

    useEffect(() => {
        switch (reason) {
            case 'vip':
                setMessage({
                    title: 'Acesso VIP Necessário',
                    description: 'Esta funcionalidade está disponível apenas para usuários VIP. Entre em contato com o administrador para upgrade.',
                    icon: Lock
                });
                break;
            case 'deemix':
                setMessage({
                    title: 'Acesso Deemix Necessário',
                    description: 'Você não tem permissão para usar o sistema Deemix. Entre em contato com o administrador.',
                    icon: X
                });
                break;
            default:
                setMessage({
                    title: 'Conta Inativa',
                    description: 'Sua conta não está ativa ou foi suspensa. Entre em contato com o suporte.',
                    icon: AlertCircle
                });
        }
    }, [reason]);

    const IconComponent = message.icon;

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                <div className="flex justify-center mb-6">
                    <IconComponent className="w-16 h-16 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">
                    {message.title}
                </h1>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    {message.description}
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => router.back()}
                        className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                    >
                        Voltar
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Ir para Início
                    </button>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-800">
                    <p className="text-sm text-gray-500">
                        Precisa de ajuda? Entre em contato com o suporte.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AccessDenied() {
    return (
        <Suspense>
            <AccessDeniedContent />
        </Suspense>
    );
}
