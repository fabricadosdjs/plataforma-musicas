'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Image, CheckCircle, AlertTriangle, Download, Play } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

const DEFAULT_THUMBNAIL = 'https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png';

export default function FixThumbnailsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
    const [results, setResults] = useState<any[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [stats, setStats] = useState({ total: 0, withoutThumbnail: 0, withThumbnail: 0 });

    // Verificar autenticação e redirecionar se necessário
    useEffect(() => {
        if (status === 'loading') return; // Aguardar carregamento

        if (!session?.user || !session.user.is_vip) {
            router.push('/');
        }
    }, [session, status, router]);

    // Carregar estatísticas das músicas
    useEffect(() => {
        if (session?.user?.is_vip) {
            loadTrackStats();
        }
    }, [session]);

    const loadTrackStats = async () => {
        try {
            const response = await fetch('/api/admin/tracks');
            if (response.ok) {
                const tracks = await response.json();
                const total = tracks.length;
                const withoutThumbnail = tracks.filter((track: any) =>
                    !track.imageUrl ||
                    track.imageUrl === '' ||
                    track.imageUrl === null ||
                    track.imageUrl === 'undefined'
                ).length;
                const withThumbnail = total - withoutThumbnail;

                setStats({ total, withoutThumbnail, withThumbnail });
            }
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
        }
    };

    // Mostrar loading enquanto verifica autenticação
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-white">Carregando...</div>
            </div>
        );
    }

    // Não renderizar se não for VIP
    if (!session?.user || !session.user.is_vip) {
        return null;
    }

    // Função para atualizar thumbnail de uma música
    const updateTrackThumbnail = async (trackId: number, imageUrl: string) => {
        try {
            const response = await fetch('/api/admin/update-track-thumbnail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackId,
                    imageUrl
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error(`❌ Erro ao atualizar música ${trackId}:`, error);
            return null;
        }
    };

    // Função para atualizar múltiplas músicas em lote
    const updateMultipleTrackThumbnails = async (trackIds: number[], imageUrl: string) => {
        try {
            const response = await fetch('/api/admin/update-track-thumbnail', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackIds,
                    imageUrl
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Erro ao atualizar músicas em lote:', error);
            return null;
        }
    };

    // Função para obter todas as músicas
    const getAllTracks = async () => {
        try {
            console.log('🎵 Buscando músicas da API...');
            const response = await fetch('/api/admin/tracks', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Usuário não autorizado. Faça login novamente.');
                } else if (response.status === 403) {
                    throw new Error('Acesso negado. Você precisa ser usuário VIP.');
                } else {
                    throw new Error(`Erro do servidor: ${response.status}`);
                }
            }

            const tracks = await response.json();
            console.log(`✅ ${tracks.length} músicas encontradas`);
            return tracks;
        } catch (error: any) {
            console.error('❌ Erro ao buscar músicas:', error);
            showToast(`❌ Erro ao buscar músicas: ${(error as Error).message}`, 'error');
            return [];
        }
    };

    // Função principal para corrigir thumbnails
    const fixThumbnails = async () => {
        setIsLoading(true);
        setProgress({ current: 0, total: 0, percentage: 0 });
        setResults([]);
        setIsComplete(false);

        try {
            showToast('🎵 Iniciando correção de thumbnails...', 'info');

            // Obter todas as músicas
            const tracks = await getAllTracks();

            if (tracks.length === 0) {
                showToast('⚠️ Nenhuma música encontrada ou erro na busca', 'warning');
                setIsLoading(false);
                return;
            }

            console.log(`📊 Total de músicas: ${tracks.length}`);

            // Filtrar músicas sem thumbnail
            const tracksWithoutThumbnail = tracks.filter((track: any) =>
                !track.imageUrl ||
                track.imageUrl === '' ||
                track.imageUrl === null ||
                track.imageUrl === 'undefined'
            );

            console.log(`🔍 Músicas sem thumbnail: ${tracksWithoutThumbnail.length}`);

            if (tracksWithoutThumbnail.length === 0) {
                showToast('✅ Todas as músicas já têm thumbnail!', 'success');
                setIsLoading(false);
                return;
            }

            setProgress({ current: 0, total: tracksWithoutThumbnail.length, percentage: 0 });

            // Atualizar em lotes de 10
            const batchSize = 10;
            const batches = [];

            for (let i = 0; i < tracksWithoutThumbnail.length; i += batchSize) {
                batches.push(tracksWithoutThumbnail.slice(i, i + batchSize));
            }

            console.log(`📦 Processando em ${batches.length} lotes de ${batchSize}`);

            let totalUpdated = 0;
            let totalErrors = 0;
            const newResults: any[] = [];

            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                const trackIds = batch.map((track: any) => track.id);

                console.log(`📦 Processando lote ${i + 1}/${batches.length} (${batch.length} músicas)`);

                try {
                    const result = await updateMultipleTrackThumbnails(trackIds, DEFAULT_THUMBNAIL);

                    if (result && result.success) {
                        totalUpdated += batch.length;
                        newResults.push({
                            batch: i + 1,
                            status: 'success',
                            message: `Lote ${i + 1} atualizado com sucesso`,
                            tracks: batch.length
                        });
                        console.log(`✅ Lote ${i + 1} processado com sucesso`);
                    } else {
                        totalErrors += batch.length;
                        newResults.push({
                            batch: i + 1,
                            status: 'error',
                            message: `Erro no lote ${i + 1}`,
                            tracks: batch.length
                        });
                        console.log(`❌ Erro no lote ${i + 1}`);
                    }
                } catch (error: any) {
                    totalErrors += batch.length;
                    newResults.push({
                        batch: i + 1,
                        status: 'error',
                        message: `Erro no lote ${i + 1}: ${(error as Error).message}`,
                        tracks: batch.length
                    });
                    console.error(`❌ Erro no lote ${i + 1}:`, error);
                }

                // Atualizar progresso
                const current = (i + 1) * batchSize;
                const percentage = Math.min((current / tracksWithoutThumbnail.length) * 100, 100);
                setProgress({ current, total: tracksWithoutThumbnail.length, percentage });
                setResults([...newResults]);

                // Aguardar um pouco entre os lotes para não sobrecarregar o servidor
                if (i < batches.length - 1) {
                    console.log('⏳ Aguardando 1 segundo...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            // Resumo final
            const finalMessage = `✅ ${totalUpdated} thumbnails atualizadas, ❌ ${totalErrors} com erro`;
            showToast(finalMessage, totalErrors === 0 ? 'success' : 'warning');

            console.log(`📊 RESUMO FINAL: ${totalUpdated} atualizadas, ${totalErrors} com erro`);

            // Atualizar estatísticas após a correção
            await loadTrackStats();

            setIsComplete(true);
            setIsLoading(false);

        } catch (error: any) {
            console.error('❌ Erro durante a correção de thumbnails:', error);
            showToast(`❌ Erro durante a correção: ${(error as Error).message}`, 'error');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-4">🔧 Corrigir Thumbnails das Músicas</h1>
                    <p className="text-gray-400">
                        Este utilitário corrige todas as músicas que não têm thumbnail, aplicando uma imagem padrão.
                    </p>
                </div>

                {/* Informações */}
                <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">📸 Informações</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-400 mb-2">Imagem padrão:</p>
                            <div className="flex items-center gap-3">
                                <img
                                    src={DEFAULT_THUMBNAIL}
                                    alt="Thumbnail padrão"
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="text-sm text-gray-300">
                                    <p>URL: {DEFAULT_THUMBNAIL}</p>
                                    <p className="text-xs text-gray-500 mt-1">Capa eletrônica padrão</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-400 mb-2">Funcionalidades:</p>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li>• Atualiza músicas sem thumbnail</li>
                                <li>• Processamento em lotes de 10</li>
                                <li>• Progresso em tempo real</li>
                                <li>• Relatório detalhado</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Estatísticas das Músicas */}
                <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">📊 Estatísticas das Músicas</h2>
                        <button
                            onClick={loadTrackStats}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                        >
                            🔄 Atualizar
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                            <div className="text-2xl font-bold text-blue-400 mb-2">{stats.total.toLocaleString()}</div>
                            <div className="text-sm text-gray-300">Total de Músicas</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                            <div className="text-2xl font-bold text-yellow-400 mb-2">{stats.withoutThumbnail.toLocaleString()}</div>
                            <div className="text-sm text-gray-300">Sem Thumbnail</div>
                        </div>
                        <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                            <div className="text-2xl font-bold text-green-400 mb-2">{stats.withThumbnail.toLocaleString()}</div>
                            <div className="text-sm text-gray-300">Com Thumbnail</div>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-400">
                            {stats.withoutThumbnail > 0
                                ? `Clique em "Iniciar Correção" para atualizar ${stats.withoutThumbnail.toLocaleString()} músicas sem thumbnail`
                                : '✅ Todas as músicas já têm thumbnail!'
                            }
                        </p>
                    </div>
                </div>

                {/* Botão de ação */}
                <div className="text-center mb-8">
                    <button
                        onClick={fixThumbnails}
                        disabled={isLoading || stats.withoutThumbnail === 0}
                        className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${isLoading || stats.withoutThumbnail === 0
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span>Corrigindo Thumbnails...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Image className="h-6 w-6" />
                                <span>
                                    {stats.withoutThumbnail > 0
                                        ? `Iniciar Correção (${stats.withoutThumbnail.toLocaleString()} músicas)`
                                        : 'Todas as músicas já têm thumbnail!'
                                    }
                                </span>
                            </div>
                        )}
                    </button>
                    {stats.withoutThumbnail === 0 && (
                        <p className="text-green-400 text-sm mt-2">🎉 Sistema já está atualizado!</p>
                    )}
                </div>

                {/* Barra de progresso */}
                {isLoading && (
                    <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold mb-4">📊 Progresso</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Processando...</span>
                                <span>{progress.current} / {progress.total}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                                <div
                                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${progress.percentage}%` }}
                                ></div>
                            </div>
                            <div className="text-center text-sm text-gray-400">
                                {progress.percentage.toFixed(1)}% concluído
                            </div>
                        </div>
                    </div>
                )}

                {/* Resultados */}
                {results.length > 0 && (
                    <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold mb-4">📋 Resultados</h3>
                        <div className="space-y-3">
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center gap-3 p-3 rounded-lg ${result.status === 'success'
                                        ? 'bg-green-900/20 border border-green-500/30'
                                        : 'bg-red-900/20 border border-red-500/30'
                                        }`}
                                >
                                    {result.status === 'success' ? (
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                    ) : (
                                        <AlertTriangle className="h-5 w-5 text-red-400" />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium">{result.message}</p>
                                        <p className="text-sm text-gray-400">
                                            {result.tracks} músicas processadas
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Conclusão */}
                {isComplete && (
                    <div className="bg-gray-800/50 rounded-lg p-6 text-center">
                        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">🎉 Correção Concluída!</h3>
                        <p className="text-gray-400">
                            Todas as thumbnails foram processadas. Verifique os resultados acima.
                        </p>
                    </div>
                )}

                {/* Voltar */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        ← Voltar
                    </button>
                </div>
            </div>
        </div>
    );
}
