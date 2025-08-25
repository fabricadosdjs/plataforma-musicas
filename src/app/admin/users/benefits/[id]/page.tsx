'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Crown, ArrowLeft, Save, Check, X } from 'lucide-react';

export default function UserBenefitsPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            // Simular dados do usuário por enquanto
            setUser({
                id: userId,
                name: 'Usuário Exemplo',
                planType: 'BÁSICO',
                valor: 61.56,
                status: 'ativo',
                deemix: true,
                deezerPremium: false,
                isUploader: false,
                dailyDownloadCount: 3,
                weeklyPackRequests: 2,
                weeklyPlaylistDownloads: 1
            });
            setLoading(false);
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1B1C1D] flex items-center justify-center">
                <div className="text-white text-lg">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1B1C1D] text-white">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <Crown className="w-8 h-8 text-purple-400" />
                                <div>
                                    <h1 className="text-xl font-semibold">Personalizar Benefícios</h1>
                                    <p className="text-sm text-gray-400">
                                        {user?.name} - {user?.planType || 'Plano VIP'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                            <Save className="w-4 h-4" />
                            Salvar
                        </button>
                    </div>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* 1ª SEÇÃO: Uso Atual dos Benefícios */}
                    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-950 border-b border-gray-700">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                📊 Uso Atual dos Benefícios
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Monitoramento em tempo real do uso dos benefícios
                            </p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Downloads Diários */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-300">⬇️ Downloads Diários</span>
                                    <span className="text-xs text-gray-400">Hoje</span>
                                </div>
                                <div className="text-2xl font-bold text-white mb-2">
                                    {user?.dailyDownloadCount || 0}
                                </div>
                                <div className="text-xs text-gray-400">
                                    Último reset: Nunca
                                </div>
                            </div>

                            {/* Packs Semanais */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-300">🎚️ Packs Semanais</span>
                                    <span className="text-xs text-gray-400">Esta semana</span>
                                </div>
                                <div className="text-2xl font-bold text-white mb-2">
                                    {user?.weeklyPackRequests || 0} / 4
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(100, ((user?.weeklyPackRequests || 0) / 4) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Playlists Semanais */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-300">🎵 Playlists Semanais</span>
                                    <span className="text-xs text-gray-400">Esta semana</span>
                                </div>
                                <div className="text-2xl font-bold text-white mb-2">
                                    {user?.weeklyPlaylistDownloads || 0} / 7
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(100, ((user?.weeklyPlaylistDownloads || 0) / 7) * 100)}%`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Status do Plano */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-300">👑 Status do Plano</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        user?.status === 'ativo' 
                                            ? 'bg-green-900/20 text-green-300 border border-green-700'
                                            : 'bg-red-900/20 text-red-300 border border-red-700'
                                    }`}>
                                        {user?.status === 'ativo' ? 'ATIVO' : 'INATIVO'}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-300 space-y-1">
                                    <div>Plano: {user?.planType || 'VIP'}</div>
                                    <div>Valor: R$ {user?.valor?.toFixed(2) || '0.00'}</div>
                                    <div>Deemix: {user?.deemix ? 'Sim' : 'Não'}</div>
                                    <div>Deezer Premium: {user?.deezerPremium ? 'Sim' : 'Não'}</div>
                                    <div>Uploader: {user?.isUploader ? 'Sim' : 'Não'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2ª SEÇÃO: Personalizar Benefícios */}
                    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-950 border-b border-gray-700">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                ⚙️ Personalizar Benefícios
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Configure os benefícios específicos para este usuário
                            </p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Benefícios Automáticos */}
                            <div className="space-y-4">
                                <h3 className="text-md font-medium text-gray-300 border-b border-gray-700 pb-2">
                                    🚀 Benefícios Automáticos
                                </h3>
                                
                                {/* Acesso ao Drive Mensal */}
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-white">📁 Acesso ao Drive Mensal</label>
                                            <p className="text-xs text-gray-400">Sempre ativo para usuários VIP</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-green-400">
                                            <Check className="w-4 h-4" />
                                            <span className="text-sm font-medium">Sim</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Conteúdos Avulsos */}
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-white">🎯 Conteúdos Avulsos</label>
                                            <p className="text-xs text-gray-400">Acesso a músicas individuais</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-green-400">
                                            <Check className="w-4 h-4" />
                                            <span className="text-sm font-medium">Sim</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Packs Extras */}
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-white">🎁 Packs Extras</label>
                                            <p className="text-xs text-gray-400">Packs adicionais disponíveis</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-green-400">
                                            <Check className="w-4 h-4" />
                                            <span className="text-sm font-medium">Sim</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Benefícios Configuráveis */}
                            <div className="space-y-4">
                                <h3 className="text-md font-medium text-gray-300 border-b border-gray-700 pb-2">
                                    ⚙️ Benefícios Configuráveis
                                </h3>
                                
                                {/* Solicitação de Packs */}
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <label className="text-sm font-medium text-white mb-2 block">
                                        🎚️ Solicitação de Packs (por semana)
                                    </label>
                                    <select className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm">
                                        <option value={4}>4 packs (Básico)</option>
                                        <option value={7}>7 packs (Padrão)</option>
                                        <option value={10}>10 packs (Completo)</option>
                                        <option value={15}>15 packs (Personalizado)</option>
                                        <option value={20}>20 packs (Personalizado)</option>
                                    </select>
                                </div>

                                {/* Download de Playlists */}
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <label className="text-sm font-medium text-white mb-2 block">
                                        🎵 Download de Playlists (por semana)
                                    </label>
                                    <select className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm">
                                        <option value={7}>7 playlists (Básico)</option>
                                        <option value={14}>14 playlists (Padrão)</option>
                                        <option value={21}>21 playlists (Completo)</option>
                                        <option value={30}>30 playlists (Personalizado)</option>
                                        <option value={50}>50 playlists (Personalizado)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Benefícios Removidos */}
                            <div className="space-y-4">
                                <h3 className="text-md font-medium text-gray-300 border-b border-gray-700 pb-2">
                                    🚫 Benefícios Removidos
                                </h3>
                                
                                {/* Deezer Premium Grátis */}
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-400 line-through">🎧 Deezer Premium Grátis</label>
                                            <p className="text-xs text-gray-500">Benefício removido</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <X className="w-4 h-4" />
                                            <span className="text-sm font-medium">Removido</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Desconto no Deemix */}
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-400 line-through">💎 Desconto no Deemix</label>
                                            <p className="text-xs text-gray-500">Benefício removido</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <X className="w-4 h-4" />
                                            <span className="text-sm font-medium">Removido</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ARL Premium para Deemix */}
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-400 line-through">🔑 ARL Premium para Deemix</label>
                                            <p className="text-xs text-gray-500">Benefício removido</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <X className="w-4 h-4" />
                                            <span className="text-sm font-medium">Removido</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Produção da sua Música */}
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-400 line-through">🎼 Produção da sua Música</label>
                                            <p className="text-xs text-gray-500">Benefício removido</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <X className="w-4 h-4" />
                                            <span className="text-sm font-medium">Removido</span>
                                        </div>
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
