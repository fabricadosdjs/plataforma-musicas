'use client';

import { useSession } from 'next-auth/react';

export const SessionDebug = () => {
    const { data: session, status } = useSession();

    return (
        <div className="fixed top-20 right-4 bg-black/80 text-white p-4 rounded-lg border border-white/20 text-xs max-w-sm z-50">
            <h3 className="font-bold mb-2">🔍 Debug - Sessão</h3>
            <div className="space-y-1">
                <div>Status: {status}</div>
                <div>Logado: {session ? 'Sim' : 'Não'}</div>
                <div>User ID: {session?.user?.id || 'N/A'}</div>
                <div>Email: {session?.user?.email || 'N/A'}</div>
                <div>VIP: {session?.user?.is_vip ? 'Sim' : 'Não'}</div>
                <div>Admin: {session?.user?.isAdmin ? 'Sim' : 'Não'}</div>
            </div>
        </div>
    );
};
