"use client";

import { AlertCircle, CheckCircle, User, UserX } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface UserPermissions {
    is_vip: boolean;
    deemix: boolean;
    status: string;
    name: string;
}

export default function PermissionStatus() {
    const { data: session } = useSession();
    const [permissions, setPermissions] = useState<UserPermissions | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPermissions = async () => {
        try {
            const response = await fetch('/api/user-permissions');
            if (response.ok) {
                const data = await response.json();
                setPermissions(data);
            }
        } catch (error) {
            console.error('Erro ao buscar permissões:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user) {
            fetchPermissions();
            // Atualizar permissões a cada 30 segundos para demonstrar tempo real
            const interval = setInterval(fetchPermissions, 30000);
            return () => clearInterval(interval);
        }
    }, [session]);

    if (!session?.user) {
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <UserX className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">Não logado</span>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-600 rounded animate-pulse"></div>
                    <span className="text-gray-400">Verificando permissões...</span>
                </div>
            </div>
        );
    }

    if (!permissions) {
        return (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">Erro ao carregar permissões</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">{permissions.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${permissions.status === 'ativo'
                        ? 'bg-green-900/30 text-green-400 border border-green-700'
                        : 'bg-red-900/30 text-red-400 border border-red-700'
                    }`}>
                    {permissions.status.toUpperCase()}
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-gray-300">Acesso VIP (Músicas)</span>
                    <div className="flex items-center gap-2">
                        {permissions.is_vip ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={permissions.is_vip ? 'text-green-400' : 'text-red-400'}>
                            {permissions.is_vip ? 'ATIVO' : 'INATIVO'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-gray-300">Acesso Deemix</span>
                    <div className="flex items-center gap-2">
                        {permissions.deemix ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={permissions.deemix ? 'text-green-400' : 'text-red-400'}>
                            {permissions.deemix ? 'ATIVO' : 'INATIVO'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                    ⚡ Atualização em tempo real - Mudanças feitas pelo admin são aplicadas imediatamente
                </p>
            </div>
        </div>
    );
}
