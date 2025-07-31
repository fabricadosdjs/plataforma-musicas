"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminMessagesDisplay from '@/components/ui/AdminMessagesDisplay';

export default function AdminMessagesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user?.isAdmin) {
            router.push('/access-denied');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Carregando...</div>
            </div>
        );
    }

    if (!session?.user?.isAdmin) {
        return null; // Será redirecionado pelo useEffect
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="container mx-auto px-4 py-8 pt-20">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">Gerenciar Recados da Administração</h1>
                    <p className="text-gray-300">
                        Crie, edite e gerencie os recados que aparecem na página inicial para todos os usuários.
                    </p>
                </div>

                <AdminMessagesDisplay showAdminControls={true} />
            </div>
        </div>
    );
} 