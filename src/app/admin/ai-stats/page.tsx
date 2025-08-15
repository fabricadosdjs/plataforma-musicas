'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SEOHead } from '@/components/seo/SEOHead';
import { AdminAuth } from '@/components/admin/AdminAuth';
import {
    Brain,
    BarChart3,
    TrendingUp,
    Target,
    Zap,
    RefreshCw,
    Activity,
    PieChart,
    Clock,
    Star
} from 'lucide-react';

interface AIStats {
    totalDetections: number;
    averageConfidence: number;
    styleDistribution: Record<string, number>;
    recentDetections: Array<{
        filename: string;
        style: string;
        confidence: number;
    }>;
    systemInfo: {
        version: string;
        features: string[];
    };
}

export default function AIStatsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<AIStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user?.is_vip) {
            router.push('/');
            return;
        }

        loadAIStats();
    }, [session, status, router]);

    const loadAIStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/contabo/smart-import');

            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
            } else {
                console.error('Erro ao carregar estatísticas da IA');
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas da IA:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = async () => {
        setRefreshing(true);
        await loadAIStats();
        setRefreshing(false);
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Brain className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-pulse" />
                    <h2 className="text-xl text-white font-semibold">Carregando estatísticas da IA...</h2>
                </div>
            </div>
        );
    }

    if (!session?.user?.is_vip) {
        return <AdminAuth />;
    }

    return (
        <AdminAuth>
            <SEOHead
                title="Estatísticas da IA - Plataforma de Músicas"
                description="Monitore a precisão e performance da IA de detecção de estilos musicais"
                keywords="IA, inteligência artificial, detecção de estilos, música, estatísticas"
            />

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
                <div className="container mx-auto px-4 py-8 pt-20">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Brain className="h-12 w-12 text-blue-400" />
                            <h1 className="text-4xl font-bold text-white">Estatísticas da IA</h1>
                        </div>
                        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                            Monitore a precisão e performance da nossa IA avançada de detecção de estilos musicais
                        </p>
                    </div>

                    {/* Botão de atualização */}
                    <div className="flex justify-center mb-8">
                        <button
                            onClick={refreshStats}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Atualizando...' : 'Atualizar Estatísticas'}
                        </button>
                    </div>

                    {stats && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {/* Estatísticas Gerais */}
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <BarChart3 className="h-8 w-8 text-blue-400" />
                                    <h3 className="text-xl font-semibold text-white">Visão Geral</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">Total de Detecções:</span>
                                        <span className="text-white font-semibold text-lg">{stats.totalDetections}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">Confiança Média:</span>
                                        <span className="text-white font-semibold text-lg">
                                            {(stats.averageConfidence * 100).toFixed(1)}%
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300">Versão da IA:</span>
                                        <span className="text-white font-semibold text-sm">{stats.systemInfo.version}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Distribuição de Estilos */}
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <PieChart className="h-8 w-8 text-green-400" />
                                    <h3 className="text-xl font-semibold text-white">Distribuição de Estilos</h3>
                                </div>

                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {Object.entries(stats.styleDistribution)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([style, count]) => (
                                            <div key={style} className="flex justify-between items-center">
                                                <span className="text-gray-300 text-sm">{style}</span>
                                                <span className="text-white font-semibold">{count}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Detecções Recentes */}
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="h-8 w-8 text-purple-400" />
                                    <h3 className="text-xl font-semibold text-white">Detecções Recentes</h3>
                                </div>

                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {stats.recentDetections.map((detection, index) => (
                                        <div key={index} className="border-l-2 border-purple-400 pl-3">
                                            <div className="text-white text-sm font-medium truncate">
                                                {detection.filename}
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-400">{detection.style}</span>
                                                <span className="text-purple-400">
                                                    {(detection.confidence * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recursos da IA */}
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 lg:col-span-2 xl:col-span-3">
                                <div className="flex items-center gap-3 mb-4">
                                    <Zap className="h-8 w-8 text-yellow-400" />
                                    <h3 className="text-xl font-semibold text-white">Recursos da IA</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {stats.systemInfo.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2 text-gray-300">
                                            <Star className="h-4 w-4 text-yellow-400" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Indicadores de Performance */}
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <Activity className="h-8 w-8 text-red-400" />
                                    <h3 className="text-xl font-semibold text-white">Performance</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-300 text-sm">Precisão Geral</span>
                                            <span className="text-white text-sm font-medium">
                                                {(stats.averageConfidence * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${stats.averageConfidence * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white mb-1">
                                            {stats.totalDetections > 0 ? '🟢' : '⚪'} Ativo
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                            Sistema funcionando perfeitamente
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensagem quando não há dados */}
                    {!stats && !loading && (
                        <div className="text-center py-12">
                            <Target className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-xl text-gray-400 font-medium mb-2">
                                Nenhuma estatística disponível
                            </h3>
                            <p className="text-gray-500">
                                Execute algumas importações para ver as estatísticas da IA
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminAuth>
    );
}
