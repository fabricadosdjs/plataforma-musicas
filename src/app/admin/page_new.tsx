"use client";

import { LayoutDashboard, Music, PlusCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function AdminPage() {
    const { data: session, status } = useSession();
    const user = session?.user;
    const isLoaded = status !== 'loading';

    if (isLoaded && !user) {
        redirect('/auth/sign-in');
    }

    // TODO: Implementar verificação de role de admin quando tivermos o sistema completo

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 p-4">
                <div className="flex items-center justify-between">
                    <Link href="/new" className="flex items-center gap-2">
                        <Music size={24} />
                        <span className="text-xl font-bold">DJ Pool - Admin</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span>Olá, {user?.name || user?.email}</span>
                        <Link href="/new" className="bg-blue-600 px-4 py-2 rounded text-sm">
                            Voltar ao Site
                        </Link>
                    </div>
                </div>
            </header>

            <div className="p-8">
                <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/add-music" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
                        <PlusCircle size={48} className="mb-4 text-blue-400" />
                        <h2 className="text-xl font-semibold mb-2">Adicionar Música</h2>
                        <p className="text-gray-400">Adicionar novas músicas ao catálogo</p>
                    </Link>

                    <div className="bg-gray-800 p-6 rounded-lg">
                        <LayoutDashboard size={48} className="mb-4 text-green-400" />
                        <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
                        <p className="text-gray-400">Estatísticas e relatórios (em breve)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
