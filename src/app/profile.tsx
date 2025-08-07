"use client";

import { useSession } from "next-auth/react";
import { Loader2, User, Crown, Mail, Smartphone, DollarSign, Calendar, CheckCircle, XCircle } from "lucide-react";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const user = session?.user as any; // 'as any' to allow custom fields from backend

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
        <div className="min-h-screen bg-[#1B1C1D] text-white py-10 px-4 z-0" style={{ zIndex: 0 }}>
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Card principal */}
                <div className="bg-gray-900 rounded-2xl shadow-lg p-8 flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
                        {user.image ? (
                            <img src={user.image} alt="Avatar" className="w-12 h-12 rounded-full border" />
                        ) : (
                            <User className="w-12 h-12 text-white" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{user.name || user.email}</h2>
                        {user.id && <p className="text-gray-400 text-sm">ID: {user.id}</p>}
                        <p className="text-gray-400 text-sm">{user.is_vip ? <><Crown className="inline w-4 h-4 text-yellow-400 mr-1" />VIP</> : "Usuário Regular"}</p>
                    </div>
                </div>

                {/* Bloco de informações de contato */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-xl p-6 flex items-center gap-4">
                        <Mail className="w-6 h-6 text-blue-400" />
                        <div>
                            <div className="text-sm text-gray-400">E-mail</div>
                            <div className="text-lg font-bold text-white">{user.email}</div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-6 flex items-center gap-4">
                        <Smartphone className="w-6 h-6 text-green-400" />
                        <div>
                            <div className="text-sm text-gray-400">WhatsApp</div>
                            <div className="text-lg font-bold text-white">{user.whatsapp || "-"}</div>
                        </div>
                    </div>
                </div>

                {/* Bloco de assinatura/planos */}
                <div className="bg-gray-800 rounded-xl p-6 flex items-center gap-4">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                    <div>
                        <div className="text-sm text-gray-400">Valor Assinatura</div>
                        <div className="text-lg font-bold text-white">{user.valor ? `R$ ${user.valor}` : "-"}</div>
                        <div className="text-sm text-gray-400 mt-2">Status: {user.status === "ativo" ? <span className="text-green-400 font-bold">ATIVO</span> : <span className="text-red-400 font-bold">INATIVO</span>}</div>
                    </div>
                </div>

                {/* Bloco de datas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-xl p-6 flex items-center gap-4">
                        <Calendar className="w-6 h-6 text-yellow-400" />
                        <div>
                            <div className="text-sm text-gray-400">Vencimento</div>
                            <div className="text-lg font-bold text-white">{user.vencimento ? new Date(user.vencimento).toLocaleDateString("pt-BR") : "-"}</div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-6 flex items-center gap-4">
                        <Calendar className="w-6 h-6 text-pink-400" />
                        <div>
                            <div className="text-sm text-gray-400">Data Pagamento</div>
                            <div className="text-lg font-bold text-white">{user.dataPagamento ? new Date(user.dataPagamento).toLocaleDateString("pt-BR") : "-"}</div>
                        </div>
                    </div>
                </div>

                {/* Bloco de permissões */}
                <div className="bg-gray-800 rounded-xl p-6 flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-purple-400" />
                    <div>
                        <div className="text-sm text-gray-400">Permissões</div>
                        <div className="text-lg font-bold text-white">{user.deemix ? "Acesso Deemix" : "Sem acesso Deemix"}</div>
                        <div className="text-lg font-bold text-white">{user.is_vip ? "VIP" : "Regular"}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
