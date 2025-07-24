"use client";

import { Brain, Cloud, LayoutDashboard, Music, PlusCircle, Users } from 'lucide-react';
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
    <div className="min-h-screen bg-[#202124] text-white">
      <header className="p-4" style={{ backgroundColor: '#2d2f32' }}>
        <div className="flex items-center justify-between">
          <Link href="/new" className="flex items-center gap-2">
            <Music size={24} />
            <span className="text-xl font-bold">DJ Pool - Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <span>Olá, {user?.name || user?.email}</span>
            <Link href="/new" className="bg-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
              Voltar ao Site
            </Link>
          </div>
        </div>
      </header>

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/add-music" className="p-6 rounded-lg transition-colors" style={{ backgroundColor: '#2d2f32' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2d2f32'}>
            <PlusCircle size={48} className="mb-4 text-blue-400" />
            <h2 className="text-xl font-semibold mb-2">Adicionar Música</h2>
            <p className="text-gray-400">Adicionar novas músicas ao catálogo</p>
          </Link>

          <Link href="/admin/users" className="p-6 rounded-lg transition-colors" style={{ backgroundColor: '#2d2f32' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2d2f32'}>
            <Users size={48} className="mb-4 text-green-400" />
            <h2 className="text-xl font-semibold mb-2">Gerenciar Usuários</h2>
            <p className="text-gray-400">Promover usuários para VIP e gerenciar permissões</p>
          </Link>

          <Link href="/admin/dashboard" className="p-6 rounded-lg transition-colors" style={{ backgroundColor: '#2d2f32' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2d2f32'}>
            <LayoutDashboard size={48} className="mb-4 text-purple-400" />
            <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
            <p className="text-gray-400">Estatísticas completas e relatórios em tempo real</p>
          </Link>

          <Link href="/admin/contabo" className="p-6 rounded-lg transition-colors" style={{ backgroundColor: '#2d2f32' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2d2f32'}>
            <Cloud size={48} className="mb-4 text-cyan-400" />
            <h2 className="text-xl font-semibold mb-2">Contabo Storage</h2>
            <p className="text-gray-400">Gerenciar arquivos e importar músicas automaticamente</p>
          </Link>

          <Link href="/admin/contabo-smart" className="p-6 rounded-lg transition-colors" style={{ backgroundColor: '#2d2f32' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2d2f32'}>
            <Brain size={48} className="mb-4 text-purple-400" />
            <h2 className="text-xl font-semibold mb-2">Importação Inteligente</h2>
            <p className="text-gray-400">IA detecta e importa músicas automaticamente com metadados</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
