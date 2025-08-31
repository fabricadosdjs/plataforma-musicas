"use client";

import { useSession } from "next-auth/react";
import type { User } from '@/types/user';
import { Loader2, User as UserIcon, Crown, Mail, Smartphone, DollarSign, Calendar, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const user = session?.user as User | undefined;

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#1B1C1D] flex flex-col items-center justify-center text-white z-0" style={{ zIndex: 0 }}>
                <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-4" />
                <div className="text-white text-lg">Carregando...</div>
            </div>
        );
    }
    if (!user) {
        return (
            <div className="min-h-screen bg-[#1B1C1D] flex flex-col items-center justify-center text-white z-0" style={{ zIndex: 0 }}>
                <XCircle className="w-10 h-10 text-red-500 mb-4" />
                <div className="text-white text-lg">Usuário não encontrado ou não logado.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1B1C1D] text-white z-0" style={{ zIndex: 0 }}>
            {/* Header Mobile */}
            <div className="bg-[#181818] border-b border-[#282828] px-4 py-3 sm:hidden">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-[#282828] rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-lg font-semibold text-white">Meu Perfil</h1>
                </div>
            </div>

            <div className="py-6 sm:py-10 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto space-y-4 sm:space-y-8">
                    {/* Card principal */}
                    <div className="bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                                {user.image ? (
                                    <img src={user.image} alt="Avatar" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border" />
                                ) : (
                                    <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl sm:text-3xl font-bold text-white mb-2">{user.name || user.email}</h2>
                                {user.id && <p className="text-gray-400 text-xs sm:text-sm mb-1">ID: {user.id}</p>}
                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                    {user.is_vip ? (
                                        <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs sm:text-sm">
                                            <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                                            VIP
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs sm:text-sm">
                                            Usuário Regular
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bloco de informações de contato */}
                    <div className="grid grid-cols-1 gap-3 sm:gap-6">
                        <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-6 sm:h-6 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs sm:text-sm text-gray-400 mb-1">E-mail</div>
                                    <div className="text-sm sm:text-lg font-bold text-white truncate">{user.email}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-6 sm:h-6 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Smartphone className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs sm:text-sm text-gray-400 mb-1">WhatsApp</div>
                                    <div className="text-sm sm:text-lg font-bold text-white">{user.whatsapp || "-"}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bloco de assinatura/planos */}
                    <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-8 h-8 sm:w-6 sm:h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs sm:text-sm text-gray-400 mb-1">Valor Assinatura</div>
                                <div className="text-sm sm:text-lg font-bold text-white mb-2">{user.valor ? `R$ ${user.valor}` : "-"}</div>
                                <div className="text-xs sm:text-sm text-gray-400">
                                    Status: {user.status === "ativo" ? (
                                        <span className="text-green-400 font-bold">ATIVO</span>
                                    ) : (
                                        <span className="text-red-400 font-bold">INATIVO</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bloco de datas */}
                    <div className="grid grid-cols-1 gap-3 sm:gap-6">
                        <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-6 sm:h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs sm:text-sm text-gray-400 mb-1">Vencimento</div>
                                    <div className="text-sm sm:text-lg font-bold text-white">{user.vencimento ? new Date(user.vencimento).toLocaleDateString("pt-BR") : "-"}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-6 sm:h-6 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-pink-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs sm:text-sm text-gray-400 mb-1">Data Pagamento</div>
                                    <div className="text-sm sm:text-lg font-bold text-white">{user.dataPagamento ? new Date(user.dataPagamento).toLocaleDateString("pt-BR") : "-"}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bloco de permissões */}
                    <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-8 h-8 sm:w-6 sm:h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs sm:text-sm text-gray-400 mb-2">Permissões</div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${user.deemix ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                        <span className="text-sm sm:text-lg font-bold text-white">
                                            {user.deemix ? "Acesso Deemix" : "Sem acesso Deemix"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${user.is_vip ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                                        <span className="text-sm sm:text-lg font-bold text-white">
                                            {user.is_vip ? "VIP" : "Regular"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
