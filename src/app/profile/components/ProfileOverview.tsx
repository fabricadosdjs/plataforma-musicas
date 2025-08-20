"use client";

import { useSession } from "next-auth/react";
import { useDownloadsCache } from "@/hooks/useDownloadsCache";
import {
    Crown,
    Download,
    Heart,
    Calendar,
    Star,
    TrendingUp,
    Music,
    Clock,
    Award,
    Users,
    User,
    Zap
} from 'lucide-react';

export default function ProfileOverview() {
    const { data: session } = useSession();
    const downloadsCache = useDownloadsCache();

    const getVipStatus = () => {
        if (!session?.user) return { isVip: false, plan: 'Free', hasValidVencimento: false };

        const isVipByField = session.user.is_vip;
        const vencimento = (session.user as any).vencimento;
        const hasValidVencimento = vencimento && new Date(vencimento) > new Date();
        const isVipReal = isVipByField || hasValidVencimento;

        let plan = 'Free';
        if (isVipReal) {
            if ((session.user as any).plan) {
                plan = (session.user as any).plan;
            } else if (hasValidVencimento) {
                plan = 'BÁSICO';
            } else {
                plan = 'VIP';
            }
        }

        return { isVip: isVipReal, plan, hasValidVencimento, vencimento };
    };

    const vipStatus = getVipStatus();

    if (!session?.user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Crown className="h-8 w-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
                    <p className="text-gray-400">Você precisa estar logado para acessar esta página.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header da Página */}
            <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-cyan-900/20 border-b border-gray-800/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Visão Geral
                        </h1>
                        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl">
                            Resumo do status da conta, informações principais e estatísticas rápidas
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                    {/* Status VIP */}
                    <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group border border-gray-800/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                                <Crown className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="text-sm text-gray-400 font-medium">Status VIP</p>
                                <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{vipStatus.plan}</p>
                            </div>
                        </div>
                    </div>

                    {/* Downloads */}
                    <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group border border-gray-800/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                                <Download className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="text-sm text-gray-400 font-medium">Downloads</p>
                                <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{downloadsCache.downloadedTrackIds.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Músicas Favoritas */}
                    <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group border border-gray-800/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                                <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="text-sm text-gray-400 font-medium">Favoritos</p>
                                <p className="text-xl sm:text-2xl font-black text-white tracking-tight">0</p>
                            </div>
                        </div>
                    </div>

                    {/* Tempo de Membro */}
                    <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group border border-gray-800/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                                <Calendar className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="text-sm text-gray-400 font-medium">Membro desde</p>
                                <p className="text-xl sm:text-2xl font-black text-white tracking-tight">2024</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informações do Usuário */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Perfil do Usuário */}
                    <div className="bg-black rounded-2xl p-6 border border-gray-800/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{session.user.name || 'Usuário'}</h3>
                                <p className="text-gray-400">{session.user.email}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                                <span className="text-gray-400">Status da Conta</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${vipStatus.isVip ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                    {vipStatus.isVip ? 'Ativa' : 'Básica'}
                                </span>
                            </div>

                            {vipStatus.hasValidVencimento && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-800/30">
                                    <span className="text-gray-400">Vencimento VIP</span>
                                    <span className="text-white font-medium">
                                        {new Date((session.user as any).vencimento).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-400">Último Login</span>
                                <span className="text-white font-medium">Hoje</span>
                            </div>
                        </div>
                    </div>

                    {/* Estatísticas Detalhadas */}
                    <div className="bg-black rounded-2xl p-6 border border-gray-800/50">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-400" />
                            Estatísticas
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Total de Downloads</span>
                                <span className="text-white font-bold">{downloadsCache.downloadedTrackIds.length}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Downloads este mês</span>
                                <span className="text-white font-bold">0</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Músicas favoritas</span>
                                <span className="text-white font-bold">0</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Playlists criadas</span>
                                <span className="text-white font-bold">0</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ações Rápidas */}
                <div className="bg-black rounded-2xl p-6 border border-gray-800/50">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-400" />
                        Ações Rápidas
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
                            <Music className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-white font-medium">Nova Playlist</span>
                        </button>

                        <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group">
                            <Download className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform" />
                            <span className="text-white font-medium">Baixar Música</span>
                        </button>

                        <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300 group">
                            <Heart className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform" />
                            <span className="text-white font-medium">Ver Favoritos</span>
                        </button>

                        <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group">
                            <Crown className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                            <span className="text-white font-medium">Upgrade VIP</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
