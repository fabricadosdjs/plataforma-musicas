"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, Mail, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ADMIN_EMAIL = 'edersonleonardo@nexorrecords.com.br';
const ADMIN_SESSION_KEY = 'admin_access';

interface AdminAuthProps {
    children: React.ReactNode;
}

export function AdminAuth({ children }: AdminAuthProps) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check if admin access is already granted
        const adminAccess = localStorage.getItem(ADMIN_SESSION_KEY);
        if (adminAccess === 'granted') {
            setIsAuthorized(true);
        }
        setLoading(false);
    }, []);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            localStorage.setItem(ADMIN_SESSION_KEY, 'granted');
            setIsAuthorized(true);
            toast.success('✅ Acesso administrativo liberado!');
        } else {
            toast.error('❌ Email incorreto. Acesso negado.');
            setEmail('');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setIsAuthorized(false);
        setEmail('');
        toast.success('🚪 Sessão administrativa encerrada');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    {/* Back button */}
                    <button
                        onClick={() => router.push('/new')}
                        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar ao site
                    </button>

                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-800">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Acesso Administrativo</h1>
                            <p className="text-gray-400">
                                Insira o email autorizado para acessar o painel administrativo
                            </p>
                        </div>

                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div className="relative">
                                <Mail className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Digite o email administrativo"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                            >
                                <Lock className="h-5 w-5" />
                                Acessar Painel Admin
                            </button>
                        </form>

                        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                            <p className="text-purple-300 text-sm text-center">
                                🔒 Área restrita: Apenas emails autorizados podem acessar as funcionalidades administrativas
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Admin header with logout */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 shadow-lg">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-white">
                        <Shield className="h-5 w-5" />
                        <span className="font-semibold">Modo Administrativo Ativo</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        Sair do Admin
                    </button>
                </div>
            </div>
            {children}
        </div>
    );
}

// Helper hook for admin access
export function useAdminAccess() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminAccess = () => {
            const adminAccess = localStorage.getItem(ADMIN_SESSION_KEY);
            setIsAdmin(adminAccess === 'granted');
        };

        checkAdminAccess();

        // Listen for storage changes (for multiple tabs)
        window.addEventListener('storage', checkAdminAccess);

        return () => {
            window.removeEventListener('storage', checkAdminAccess);
        };
    }, []);

    return isAdmin;
}
