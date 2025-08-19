"use client";

import { useState, useCallback, useRef } from 'react';
import { Track } from '@/types/track';
import { useToast } from '@/hooks/useToast';
import { useSession } from 'next-auth/react';

interface DownloadError {
    trackName: string;
    attempts: number;
    lastError: string;
    timestamp: number;
}

interface BatchDownloadState {
    isActive: boolean;
    isPaused: boolean;
    totalTracks: number;
    downloadedCount: number;
    failedCount: number;
    skippedCount: number; // Nova propriedade para tracks puladas
    currentTrackName: string;
    estimatedTimeRemaining: string;
    downloadSpeed: string;
    contextName: string;
    contextType: 'genre' | 'pool';
    startTime: number;
    retryCount: number;
    currentAttempt: number;
    downloadErrors: DownloadError[];
}

interface BatchDownloadHistory {
    id: string;
    contextName: string;
    contextType: 'genre' | 'pool';
    totalTracks: number;
    downloadedCount: number;
    failedCount: number;
    startTime: number;
    endTime?: number;
    status: 'completed' | 'cancelled' | 'failed';
}

// Função para fazer download real do arquivo
const downloadFile = async (url: string, filename: string) => {
    try {
        // Limpar nome do arquivo de caracteres inválidos
        const cleanFilename = filename.replace(/[<>:"/\\|?*]/g, '_');

        // Se a URL é externa (Google Drive, etc.), usar redirecionamento direto
        if (url.includes('drive.google.com') || url.includes('dropbox.com') || url.includes('http')) {
            const link = document.createElement('a');
            link.href = url;
            link.download = cleanFilename;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // Para URLs locais, fazer fetch e criar blob
        const response = await fetch(url, {
            mode: 'cors',
            credentials: 'same-origin'
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = cleanFilename;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('Erro ao fazer download do arquivo:', error);
        throw error;
    }
};

export function useBatchDownload() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const abortControllerRef = useRef<AbortController | null>(null);

    const [state, setState] = useState<BatchDownloadState>({
        isActive: false,
        isPaused: false,
        totalTracks: 0,
        downloadedCount: 0,
        failedCount: 0,
        skippedCount: 0,
        currentTrackName: '',
        estimatedTimeRemaining: '',
        downloadSpeed: '',
        contextName: '',
        contextType: 'genre',
        startTime: 0,
        retryCount: 0,
        currentAttempt: 1,
        downloadErrors: []
    });

    const updateDownloadHistory = useCallback((historyEntry: BatchDownloadHistory) => {
        if (!session?.user?.id) return;

        try {
            const existingHistory = JSON.parse(localStorage.getItem('batchDownloadHistory') || '[]');
            const newHistory = [historyEntry, ...existingHistory].slice(0, 50); // Manter apenas os últimos 50
            localStorage.setItem('batchDownloadHistory', JSON.stringify(newHistory));
        } catch (error) {
            console.error('Erro ao salvar histórico de download:', error);
        }
    }, [session]);

    const calculateStats = useCallback((downloaded: number, total: number, startTime: number) => {
        const now = Date.now();
        const elapsedSeconds = (now - startTime) / 1000;
        const downloadsPerSecond = downloaded / elapsedSeconds;
        const remaining = total - downloaded;

        const estimatedSeconds = downloadsPerSecond > 0 ? remaining / downloadsPerSecond : 0;
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);

        const speed = `${downloadsPerSecond.toFixed(1)} tracks/s`;
        const timeRemaining = estimatedMinutes > 0 ? `${estimatedMinutes} min` : 'Calculando...';

        return { speed, timeRemaining };
    }, []);

    const startBatchDownload = useCallback(async (
        tracks: Track[],
        contextName: string,
        contextType: 'genre' | 'pool'
    ) => {
        if (!session) {
            showToast('🔐 Faça login para baixar músicas', 'warning');
            return;
        }

        if (state.isActive) {
            showToast('⚠️ Já existe um download em lote em andamento', 'warning');
            return;
        }

        // Criar novo AbortController
        abortControllerRef.current = new AbortController();

        const startTime = Date.now();
        setState({
            isActive: true,
            isPaused: false,
            totalTracks: tracks.length,
            downloadedCount: 0,
            failedCount: 0,
            skippedCount: 0,
            currentTrackName: '',
            estimatedTimeRemaining: 'Calculando...',
            downloadSpeed: '',
            contextName,
            contextType,
            startTime,
            retryCount: 0,
            currentAttempt: 1,
            downloadErrors: []
        });

        showToast(`🚀 Iniciando download de ${tracks.length} músicas de ${contextName}`, 'success');

        try {
            const batchSize = 10;
            let downloaded = 0;
            let failed = 0;
            let skipped = 0;

            for (let i = 0; i < tracks.length; i += batchSize) {
                // Verificar se foi cancelado
                if (abortControllerRef.current?.signal.aborted) {
                    break;
                }

                // Aguardar se pausado
                while (state.isPaused && !abortControllerRef.current?.signal.aborted) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                const batch = tracks.slice(i, i + batchSize);

                for (const track of batch) {
                    if (abortControllerRef.current?.signal.aborted) break;

                    setState(prev => ({
                        ...prev,
                        currentTrackName: track.songName,
                        currentAttempt: 1
                    }));

                    let success = false;
                    let attempts = 0;
                    const maxAttempts = 3;
                    let lastErrorMessage = 'Erro desconhecido';

                    // Sistema de retry para downloads que falharam
                    while (!success && attempts < maxAttempts && !abortControllerRef.current?.signal.aborted) {
                        attempts++;

                        setState(prev => ({
                            ...prev,
                            currentAttempt: attempts,
                            retryCount: attempts > 1 ? prev.retryCount + 1 : prev.retryCount
                        }));

                        try {
                            const response = await fetch('/api/tracks/download', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ trackId: track.id.toString() }),
                                signal: abortControllerRef.current?.signal
                            });

                            if (response.ok) {
                                const downloadData = await response.json();

                                // Fazer o download real do arquivo se houver URL
                                if (downloadData.downloadUrl) {
                                    try {
                                        await downloadFile(downloadData.downloadUrl, `${downloadData.artist} - ${downloadData.trackName}.mp3`);
                                    } catch (downloadError) {
                                        console.warn(`⚠️ Erro ao baixar arquivo: ${track.songName}`, downloadError);
                                    }
                                }

                                downloaded++;
                                success = true;

                                // Log de sucesso para debugging
                                console.log(`✅ Download sucesso: ${track.songName} (tentativa ${attempts})`);
                            } else {
                                try {
                                    const errorData = await response.json();
                                    lastErrorMessage = errorData.error || `HTTP ${response.status}`;
                                } catch {
                                    lastErrorMessage = `HTTP ${response.status}`;
                                }

                                console.warn(`⚠️ Download falhou: ${track.songName} (tentativa ${attempts}/${maxAttempts}) - ${lastErrorMessage}`);

                                // CASO ESPECIAL: Se o erro é de "já baixou nas últimas 24h", pular (não contar como sucesso nem falha)
                                if (lastErrorMessage.includes('já baixou esta música nas últimas 24 horas')) {
                                    skipped++;
                                    success = true; // Isso fará o while loop parar naturalmente
                                    console.log(`⏭️ Download pulado: ${track.songName} (já baixada nas últimas 24h)`);
                                    // Não fazer break aqui, deixar o while loop terminar naturalmente
                                } else {
                                    // Log detalhado do erro para debugging (apenas para erros reais)
                                    console.log(`🔍 Erro detalhado para ${track.songName}:`, {
                                        status: response.status,
                                        error: lastErrorMessage,
                                        attempt: attempts,
                                        maxAttempts
                                    });

                                    // Se não é a última tentativa, aguarda antes de tentar novamente
                                    if (attempts < maxAttempts) {
                                        await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Backoff exponencial
                                    }
                                }
                            }
                        } catch (error: any) {
                            if (error.name === 'AbortError') break;

                            lastErrorMessage = error.message || 'Erro de rede';
                            console.error(`❌ Erro de rede: ${track.songName} (tentativa ${attempts}/${maxAttempts})`, error.message);

                            // Se não é a última tentativa, aguarda antes de tentar novamente
                            if (attempts < maxAttempts) {
                                await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Backoff maior para erros de rede
                            }
                        }
                    }

                    // Se todas as tentativas falharam
                    if (!success) {
                        failed++;
                        console.error(`🚫 Download definitivamente falhou: ${track.songName} após ${maxAttempts} tentativas`);

                        // Adicionar ao log de erros com a mensagem de erro específica
                        setState(prev => ({
                            ...prev,
                            downloadErrors: [...prev.downloadErrors, {
                                trackName: track.songName,
                                attempts: maxAttempts,
                                lastError: lastErrorMessage,
                                timestamp: Date.now()
                            }]
                        }));
                    }

                    // Atualizar estado
                    const { speed, timeRemaining } = calculateStats(downloaded, tracks.length, startTime);

                    setState(prev => ({
                        ...prev,
                        downloadedCount: downloaded,
                        failedCount: failed,
                        skippedCount: skipped,
                        downloadSpeed: speed,
                        estimatedTimeRemaining: timeRemaining
                    }));

                    // Pequena pausa entre downloads para não sobrecarregar
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                // Pausa entre lotes
                if (i + batchSize < tracks.length) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            const wasAborted = abortControllerRef.current?.signal.aborted;
            const endTime = Date.now();

            // Registrar no histórico
            updateDownloadHistory({
                id: `${contextType}_${contextName}_${startTime}`,
                contextName,
                contextType,
                totalTracks: tracks.length,
                downloadedCount: downloaded,
                failedCount: failed,
                startTime,
                endTime,
                status: wasAborted ? 'cancelled' : (failed === 0 ? 'completed' : 'failed')
            });

            setState(prev => ({
                ...prev,
                isActive: false,
                currentTrackName: ''
            }));

            if (wasAborted) {
                const message = skipped > 0
                    ? `⏹️ Download cancelado. ${downloaded} baixadas, ${skipped} puladas de ${contextName}`
                    : `⏹️ Download cancelado. ${downloaded} músicas baixadas de ${contextName}`;
                showToast(message, 'warning');
            } else {
                const message = skipped > 0
                    ? `✅ Download concluído! ${downloaded} baixadas, ${skipped} puladas de ${contextName}`
                    : `✅ Download concluído! ${downloaded} músicas baixadas de ${contextName}`;
                showToast(message, 'success');
            }

        } catch (error) {
            console.error('Erro no download em lote:', error);
            setState(prev => ({
                ...prev,
                isActive: false
            }));
            showToast('❌ Erro durante o download em lote', 'error');
        }
    }, [session, state.isActive, state.isPaused, showToast, calculateStats, updateDownloadHistory]);

    const pauseDownload = useCallback(() => {
        setState(prev => ({ ...prev, isPaused: true }));
        showToast('⏸️ Download pausado', 'info');
    }, [showToast]);

    const resumeDownload = useCallback(() => {
        setState(prev => ({ ...prev, isPaused: false }));
        showToast('▶️ Download retomado', 'info');
    }, [showToast]);

    const cancelDownload = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        showToast('🛑 Cancelando download...', 'warning');
    }, [showToast]);

    const getDownloadHistory = useCallback((): BatchDownloadHistory[] => {
        if (!session?.user?.id) return [];

        try {
            return JSON.parse(localStorage.getItem('batchDownloadHistory') || '[]');
        } catch {
            return [];
        }
    }, [session]);

    return {
        state,
        startBatchDownload,
        pauseDownload,
        resumeDownload,
        cancelDownload,
        getDownloadHistory
    };
}
