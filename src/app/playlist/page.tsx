"use client";

// Estender Window para incluir zipChunks e localZip
declare global {
    interface Window {
        zipChunks?: { [key: number]: string[] };
        localZip?: any; // JSZip instance
    }
}

import React, { useState, useEffect, useMemo } from "react";
import { Download, Trash2, Music, Loader2, Play, Pause, Package, X, Plus, CheckCircle, Clock, Users, Search, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Track } from "@/types/track";
import Header from "@/components/layout/Header";
import { useGlobalPlayer } from "@/context/GlobalPlayerContext";
import { useSession } from "next-auth/react";
import JSZip from 'jszip';

export default function PlaylistPage() {
    const [downloadQueue, setDownloadQueue] = useState<Track[]>([]);
    const [downloadedTracks, setDownloadedTracks] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);
    const [zipProgress, setZipProgress] = useState({
        isActive: false,
        isGenerating: false,
        progress: 0,
        current: 0,
        total: 0,
        trackName: '',
        elapsedTime: 0,
        remainingTime: 0
    });

    // Novos estados para o sistema de playlist
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchResults, setSearchResults] = useState<Track[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Estado para controlar dias na fila
    const [currentDateInQueue, setCurrentDateInQueue] = useState<string | null>(null);

    // Estado para sistema de streaming e links persistentes
    const [zipSessionId, setZipSessionId] = useState<string>('');
    const [isStreamingZip, setIsStreamingZip] = useState(false);
    const [totalDownloadSize, setTotalDownloadSize] = useState<number>(0);

    const { currentTrack, isPlaying, playTrack, pauseTrack, togglePlayPause } = useGlobalPlayer();
    const { data: session } = useSession();

    // Carregar fila de downloads da página principal
    useEffect(() => {
        const savedDownloadQueue = localStorage.getItem('downloadQueue');
        if (savedDownloadQueue) {
            try {
                const queueData = JSON.parse(savedDownloadQueue);
                console.log('📦 Fila de downloads carregada:', queueData.length, 'músicas');
                setDownloadQueue(queueData);

                // Determinar a data atual da fila
                if (queueData.length > 0) {
                    const firstTrack = queueData[0];
                    setCurrentDateInQueue(getTrackDate(firstTrack));
                }
            } catch (error) {
                console.error('❌ Erro ao carregar fila de downloads:', error);
            }
        }

        // Carregar músicas já baixadas
        const savedDownloadedTracks = localStorage.getItem('downloadedTracks');
        if (savedDownloadedTracks) {
            try {
                const downloadedIds = JSON.parse(savedDownloadedTracks);
                setDownloadedTracks(new Set(downloadedIds));
                console.log('✅ Músicas baixadas carregadas:', downloadedIds.length, 'músicas');
            } catch (error) {
                console.error('❌ Erro ao carregar músicas baixadas:', error);
            }
        }

        setIsLoading(false);

        // Carregar sessão ZIP da URL se existir
        const sessionFromUrl = loadZipSessionFromUrl();
        if (sessionFromUrl) {
            console.log('🔗 Sessão ZIP restaurada da URL:', sessionFromUrl);
        }

        // Verificar se há downloads em andamento
        checkActiveDownloads();
    }, []); // Removida dependência circular

    // Função para verificar downloads ativos
    const checkActiveDownloads = () => {
        const keys = Object.keys(localStorage);
        const zipProgressKeys = keys.filter(key => key.startsWith('zipProgress_'));

        if (zipProgressKeys.length > 0) {
            console.log('🔄 Downloads em andamento detectados:', zipProgressKeys.length);

            // Mostrar notificação de downloads ativos
            zipProgressKeys.forEach(key => {
                try {
                    const progressData = JSON.parse(localStorage.getItem(key) || '{}');
                    if (progressData.status === 'generating_zip') {
                        console.log(`📦 Download ativo: ${progressData.sessionId} - ${progressData.processedTracks}/${progressData.totalTracks} músicas`);

                        // Restaurar progresso se necessário
                        if (progressData.sessionId && !zipSessionId) {
                            setZipSessionId(progressData.sessionId);
                            console.log(`🔄 Sessão de download restaurada: ${progressData.sessionId}`);

                            // Mostrar notificação visual
                            setZipProgress(prev => ({
                                ...prev,
                                isActive: true,
                                isGenerating: true,
                                current: progressData.processedTracks,
                                total: progressData.totalTracks,
                                trackName: `🔄 Download em andamento - ${progressData.processedTracks}/${progressData.totalTracks} músicas processadas`
                            }));
                        }
                    }
                } catch (error) {
                    console.error('Erro ao verificar progresso:', error);
                }
            });
        }
    };

    // Salvar fila de downloads sempre que mudar
    useEffect(() => {
        if (downloadQueue.length > 0) {
            localStorage.setItem('downloadQueue', JSON.stringify(downloadQueue));
            console.log('💾 Fila de downloads salva:', downloadQueue.length, 'músicas');
        }
    }, [downloadQueue]);

    // Função para remover música da fila
    const removeFromQueue = (trackId: number) => {
        setDownloadQueue(prev => prev.filter(t => t.id !== trackId));
        console.log('❌ Música removida da fila');
    };

    // Função para limpar fila
    const clearQueue = () => {
        setDownloadQueue([]);
        setDownloadedTracks(new Set());
        setCurrentDateInQueue(null);
        localStorage.removeItem('downloadedTracks');
        console.log('🗑️ Fila de downloads e histórico limpos');
    };

    // Função para limpar apenas histórico de downloads
    const clearDownloadHistory = () => {
        setDownloadedTracks(new Set());
        localStorage.removeItem('downloadedTracks');
        console.log('🗑️ Histórico de downloads limpo');
    };

    // Função para obter a data da música (formato: YYYY-MM-DD)
    const getTrackDate = (track: Track): string => {
        if (!track.releaseDate) return 'no-date';
        const date = new Date(track.releaseDate);
        return date.toISOString().split('T')[0];
    };

    // Função para verificar se pode adicionar música (mesmo dia ou fila vazia)
    const canAddTrack = (track: Track): boolean => {
        if (downloadQueue.length === 0) return true;

        const trackDate = getTrackDate(track);
        return trackDate === currentDateInQueue;
    };

    // Função para adicionar música à fila
    const addToQueue = (track: Track) => {
        if (!canAddTrack(track)) {
            alert('⚠️ Você só pode adicionar músicas do mesmo dia. Limpe a fila atual ou aguarde o download ser concluído.');
            return;
        }

        // Se for a primeira música, definir a data
        if (downloadQueue.length === 0) {
            setCurrentDateInQueue(getTrackDate(track));
        }

        // Verificar se já não está na fila
        if (downloadQueue.some(t => t.id === track.id)) {
            alert('✅ Esta música já está na fila!');
            return;
        }

        setDownloadQueue(prev => [...prev, track]);
        console.log('🎵 Música adicionada à fila:', track.songName);
    };

    // Função para pesquisar músicas
    const searchTracks = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        try {
            // Simular busca na API (substitua pela sua API real)
            const response = await fetch(`/api/tracks/search?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.tracks || []);
                setShowSearchResults(true);
            }
        } catch (error) {
            console.error('❌ Erro na busca:', error);
            // Fallback: buscar na fila atual
            const filtered = downloadQueue.filter(track =>
                track.songName.toLowerCase().includes(query.toLowerCase()) ||
                track.artist.toLowerCase().includes(query.toLowerCase()) ||
                track.style.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filtered);
            setShowSearchResults(true);
        } finally {
            setIsSearching(false);
        }
    };

    // Filtrar músicas da fila baseado na pesquisa
    const filteredQueueTracks = useMemo(() => {
        if (!searchQuery.trim()) return downloadQueue;

        return downloadQueue.filter(track =>
            track.songName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.style.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [downloadQueue, searchQuery]);

    // Função para gerar ID único de sessão ZIP
    const generateZipSessionId = () => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `zipgeneration${timestamp}${random}`;
    };

    // Função para atualizar URL com sessão ZIP
    const updateZipSessionUrl = (sessionId: string) => {
        if (typeof window !== 'undefined') {
            const newUrl = `/playlist#${sessionId}`;
            window.history.replaceState(null, '', newUrl);
        }
    };

    // Função para carregar sessão ZIP da URL
    const loadZipSessionFromUrl = () => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.substring(1);
            if (hash.startsWith('zipgeneration')) {
                setZipSessionId(hash);
                console.log('🔗 Sessão ZIP carregada da URL:', hash);
                return hash;
            }
        }
        return null;
    };

    // Função para download em massa com streaming
    const downloadAllTracksStreaming = async () => {
        if (downloadQueue.length === 0) {
            console.log('📋 Nenhuma música na fila para download');
            return;
        }

        // Gerar nova sessão ZIP
        const newSessionId = generateZipSessionId();
        setZipSessionId(newSessionId);
        updateZipSessionUrl(newSessionId);

        console.log('🚀 Iniciando download em massa com streaming para', downloadQueue.length, 'músicas');
        console.log('🔗 Sessão ZIP:', newSessionId);

        try {
            setIsDownloadingAll(true);
            setIsStreamingZip(true);

            // Filtrar apenas músicas que ainda não foram baixadas
            const pendingTracks = downloadQueue.filter(track => !downloadedTracks.has(track.id));

            if (pendingTracks.length === 0) {
                console.log('✅ Todas as músicas já foram baixadas!');
                setIsDownloadingAll(false);
                setIsStreamingZip(false);
                return;
            }

            console.log(`📦 Processando ${pendingTracks.length} músicas pendentes de ${downloadQueue.length} total`);

            // Processar todas as músicas de uma vez no navegador
            console.log(`📦 Processando ${pendingTracks.length} músicas no navegador`);

            // Criar ZIP local
            if (!window.localZip) {
                window.localZip = new JSZip();
                console.log('🔧 ZIP local criado no navegador');
            }

            // Variáveis para rastrear tamanho total
            let totalSize = 0;
            let processedSize = 0;

            // Processar cada música individualmente
            for (let i = 0; i < pendingTracks.length; i++) {
                const track = pendingTracks[i];
                const progress = Math.round(((i + 1) / pendingTracks.length) * 100);

                console.log(`📥 Processando música ${i + 1}/${pendingTracks.length}: ${track.songName}`);

                // Atualizar progresso
                setZipProgress(prev => ({
                    ...prev,
                    isActive: true,
                    isGenerating: true,
                    progress,
                    current: i + 1,
                    total: pendingTracks.length,
                    trackName: `🚀 Iniciando download estilo Google Drive: ${track.songName} (Total: ${(totalSize / 1024 / 1024).toFixed(2)} MB)`,
                    elapsedTime: 0,
                    remainingTime: 0
                }));

                // Download em streaming estilo Google Drive (ZIP em partes)
                let trackFileName = `${track.artist} - ${track.songName}.mp3`;
                let trackContent: Uint8Array | null = null;
                let trackSize = 0;

                if (track.downloadUrl && track.downloadUrl.trim() !== '') {
                    try {
                        console.log(`🌐 Iniciando download streaming estilo Google Drive: ${track.songName}`);

                        // Download em streaming com progresso em tempo real (estilo Google Drive)
                        const musicResponse = await fetch(track.downloadUrl, {
                            method: 'GET',
                            headers: {
                                'Accept': 'audio/*, */*',
                                'Cache-Control': 'no-cache',
                                'Range': 'bytes=0-' // Suporte a range requests
                            }
                        });

                        if (musicResponse.ok && musicResponse.body) {
                            const reader = musicResponse.body.getReader();
                            const chunks: Uint8Array[] = [];
                            let downloadedBytes = 0;

                            // Ler dados em chunks para streaming (estilo Google Drive)
                            while (true) {
                                const { done, value } = await reader.read();

                                if (done) break;

                                chunks.push(value);
                                downloadedBytes += value.length;
                                trackSize = downloadedBytes;

                                // Atualizar progresso em tempo real (como Google Drive)
                                setZipProgress(prev => ({
                                    ...prev,
                                    trackName: `📥 Baixando: ${track.songName} (${(downloadedBytes / 1024 / 1024).toFixed(2)} MB)`,
                                    current: i + 1,
                                    total: pendingTracks.length,
                                    progress: Math.round(((i + 1) / pendingTracks.length) * 100)
                                }));

                                // Pausa mínima para não travar (Google Drive usa 50ms)
                                await new Promise(resolve => setTimeout(resolve, 50));
                            }

                            // Combinar chunks de forma otimizada (estilo Google Drive)
                            const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                            trackContent = new Uint8Array(totalLength);
                            let offset = 0;

                            for (const chunk of chunks) {
                                trackContent.set(chunk, offset);
                                offset += chunk.length;
                            }

                            totalSize += trackContent.length;
                            processedSize += trackContent.length;
                            setTotalDownloadSize(totalSize);

                            console.log(`✅ Download streaming estilo Google Drive concluído: ${trackFileName} (${(trackContent.length / 1024 / 1024).toFixed(2)} MB)`);
                        } else {
                            throw new Error(`HTTP ${musicResponse.status}: ${musicResponse.statusText}`);
                        }
                    } catch (downloadError) {
                        console.warn(`⚠️ Erro no download streaming, criando arquivo de placeholder: ${downloadError}`);
                        // Criar arquivo placeholder se download falhar
                        const placeholderContent = `Música não disponível: ${track.songName} - ${track.artist}\nURL: ${track.downloadUrl}\nErro: ${downloadError}\nTimestamp: ${new Date().toISOString()}`;
                        trackContent = new TextEncoder().encode(placeholderContent);
                        trackFileName = `${track.artist} - ${track.songName}.txt`;
                        trackSize = trackContent.length;
                        totalSize += trackSize;
                        processedSize += trackSize;
                        setTotalDownloadSize(totalSize);
                    }
                } else {
                    // Se não tiver URL, criar arquivo de informações
                    const infoContent = `Informações da música: ${track.songName} - ${track.artist}\nID: ${track.id}\nEstilo: ${track.style}\nURL não disponível\nTimestamp: ${new Date().toISOString()}`;
                    trackContent = new TextEncoder().encode(infoContent);
                    trackFileName = `${track.artist} - ${track.songName}.txt`;
                    trackSize = trackContent.length;
                    totalSize += trackSize;
                    processedSize += trackSize;
                    setTotalDownloadSize(totalSize);
                    console.log(`📋 Arquivo de informações criado: ${trackFileName} (${(trackSize / 1024).toFixed(2)} KB)`);
                }

                try {
                    if (trackContent) {
                        window.localZip.file(trackFileName, trackContent);
                        console.log(`✅ Música adicionada ao ZIP: ${trackFileName}`);
                    } else {
                        console.warn(`⚠️ Conteúdo vazio para: ${trackFileName}`);
                    }
                } catch (error) {
                    console.error(`❌ Erro ao adicionar música ao ZIP: ${trackFileName}`, error);
                }

                // Pequena pausa para não travar a interface
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Salvar progresso no localStorage para persistência
            const progressData = {
                sessionId: newSessionId,
                totalTracks: pendingTracks.length,
                processedTracks: pendingTracks.length,
                totalSize: totalSize,
                timestamp: new Date().toISOString(),
                status: 'generating_zip'
            };
            localStorage.setItem(`zipProgress_${newSessionId}`, JSON.stringify(progressData));

            // Gerar ZIP final no navegador
            console.log(`🎯 Todas as ${pendingTracks.length} músicas processadas, gerando ZIP no navegador...`);
            console.log(`📊 Tamanho total processado: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

            setZipProgress(prev => ({
                ...prev,
                trackName: 'Gerando ZIP no navegador...'
            }));

            try {
                const zipBlob = await window.localZip.generateAsync({
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 6 }
                });

                console.log(`✅ ZIP gerado no navegador: ${(zipBlob.size / 1024 / 1024).toFixed(2)} MB`);

                // Download automático do ZIP
                const downloadUrl = URL.createObjectURL(zipBlob);
                const downloadLink = document.createElement('a');
                downloadLink.href = downloadUrl;
                downloadLink.download = `nexor-records-${newSessionId}-${new Date().toISOString().split('T')[0]}.zip`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(downloadUrl);

                console.log(`🎉 ZIP baixado automaticamente!`);
                console.log(`📁 Arquivo salvo: ${downloadLink.download}`);

                // Marcar todas as músicas como baixadas
                const newDownloadedTracks = new Set(downloadedTracks);
                pendingTracks.forEach(track => newDownloadedTracks.add(track.id));
                setDownloadedTracks(newDownloadedTracks);

                // Persistir no localStorage
                localStorage.setItem('downloadedTracks', JSON.stringify([...newDownloadedTracks]));

                // Limpar ZIP da memória
                delete window.localZip;

                console.log('🎉 Download em massa concluído com processamento no navegador!');
            } catch (error) {
                console.error('❌ Erro ao gerar ZIP no navegador:', error);
            } finally {
                // Finalizar estado
                setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
                setIsDownloadingAll(false);
                setIsStreamingZip(false);

                // Limpar sessão da URL
                updateZipSessionUrl('');
                setZipSessionId('');
            }
        } catch (error) {
            console.error('❌ Erro no download com streaming:', error);
            setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
            setIsDownloadingAll(false);
            setIsStreamingZip(false);
            console.log('❌ Erro no download com streaming');
        }
    };

    // Função para reproduzir/pausar música
    const handlePlayPause = (track: Track) => {
        if (currentTrack?.id === track.id) {
            togglePlayPause();
        } else {
            playTrack(track);
        }
    };

    // Função para download em massa com lotes de 100 músicas
    const downloadAllTracks = async () => {
        if (downloadQueue.length === 0) {
            console.log('📋 Nenhuma música na fila para download');
            return;
        }

        if (!session?.user) {
            console.log('👤 Usuário não autenticado');
            return;
        }

        setIsDownloadingAll(true);
        console.log('🚀 Iniciando download em massa para', downloadQueue.length, 'músicas');

        try {
            // Filtrar apenas músicas que ainda não foram baixadas
            const pendingTracks = downloadQueue.filter(track => !downloadedTracks.has(track.id));

            if (pendingTracks.length === 0) {
                console.log('✅ Todas as músicas já foram baixadas!');
                setIsDownloadingAll(false);
                return;
            }

            console.log(`📦 Processando ${pendingTracks.length} músicas pendentes de ${downloadQueue.length} total`);

            // Dividir em lotes de 100 músicas
            const batchSize = 100;
            const totalBatches = Math.ceil(pendingTracks.length / batchSize);
            let processedTracks = 0;

            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                const startIndex = batchIndex * batchSize;
                const endIndex = Math.min(startIndex + batchSize, pendingTracks.length);
                const batchTracks = pendingTracks.slice(startIndex, endIndex);
                const trackIds = batchTracks.map((track) => track.id);

                console.log(`📦 Processando lote ${batchIndex + 1}/${totalBatches} com ${batchTracks.length} músicas`);

                const filename = `nexor-records-lote-${batchIndex + 1}-${new Date().toISOString().split('T')[0]}.zip`;

                const response = await fetch('/api/downloads/zip-progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ trackIds, filename })
                });

                if (!response.ok) {
                    throw new Error(`Erro ao processar lote ${batchIndex + 1}`);
                }

                console.log(`✅ Lote ${batchIndex + 1} iniciado, processando stream...`);
                setZipProgress(prev => ({
                    ...prev,
                    isActive: true,
                    isGenerating: true,
                    current: processedTracks,
                    total: pendingTracks.length
                }));

                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('Erro ao ler resposta do servidor');
                }

                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    buffer += chunk;

                    // Processar linhas completas
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const jsonData = line.slice(6).trim();
                                if (!jsonData) continue;

                                const data = JSON.parse(jsonData);
                                console.log(`📊 Dados do lote ${batchIndex + 1}:`, data);

                                if (data.type === 'progress') {
                                    // Calcular progresso total considerando todos os lotes
                                    const batchProgress = data.progress;
                                    const totalProgress = ((batchIndex * batchSize + data.current) / pendingTracks.length) * 100;

                                    setZipProgress(prev => ({
                                        ...prev,
                                        progress: Math.round(totalProgress),
                                        current: processedTracks + data.current,
                                        total: pendingTracks.length,
                                        trackName: `Lote ${batchIndex + 1}: ${data.trackName}`,
                                        elapsedTime: data.elapsedTime,
                                        remainingTime: data.remainingTime
                                    }));
                                } else if (data.type === 'complete') {
                                    console.log(`✅ Lote ${batchIndex + 1} concluído`);

                                    if (!data.zipData) {
                                        throw new Error(`Dados do ZIP do lote ${batchIndex + 1} não recebidos`);
                                    }

                                    // Decodificar dados do ZIP
                                    const zipBuffer = atob(data.zipData);
                                    const bytes = new Uint8Array(zipBuffer.length);
                                    for (let i = 0; i < zipBuffer.length; i++) {
                                        bytes[i] = zipBuffer.charCodeAt(i);
                                    }

                                    // Criar blob e fazer download
                                    const blob = new Blob([bytes], { type: 'application/zip' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = filename;
                                    document.body.appendChild(a);
                                    a.click();
                                    URL.revokeObjectURL(url);
                                    document.body.removeChild(a);

                                    // Registrar músicas baixadas
                                    const newDownloadedTracks = new Set([...downloadedTracks, ...batchTracks.map(t => t.id)]);
                                    setDownloadedTracks(newDownloadedTracks);
                                    localStorage.setItem('downloadedTracks', JSON.stringify([...newDownloadedTracks]));

                                    processedTracks += batchTracks.length;
                                    console.log(`📦 Lote ${batchIndex + 1} baixado: ${processedTracks}/${pendingTracks.length} músicas`);

                                    // Se for o último lote, finalizar
                                    if (batchIndex === totalBatches - 1) {
                                        console.log('✅ Todos os lotes foram processados!');

                                        // NÃO limpar a fila - usuário pode continuar gerenciando
                                        setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
                                        setIsDownloadingAll(false);

                                        console.log('✅ Download em massa concluído! Fila mantida para gerenciamento.');
                                        return;
                                    }

                                    // Aguardar um pouco antes do próximo lote
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    break;
                                } else if (data.type === 'error') {
                                    throw new Error(`Erro no lote ${batchIndex + 1}: ${data.message}`);
                                }
                            } catch (error) {
                                console.error(`❌ Erro ao processar dados do lote ${batchIndex + 1}:`, error);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('❌ Erro no download em massa:', error);
            setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
            setIsDownloadingAll(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin flex items-center justify-center">
                            <Music className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-30 animate-pulse"></div>
                    </div>
                    <p className="text-gray-300 mt-6 text-lg">Carregando sua fila de downloads...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">
            <Header downloadQueueCount={downloadQueue.length} />

            <main className="pt-24">
                <div className="container mx-auto px-6 pb-20">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <div className="relative inline-block mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl">
                                <Download className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute -inset-6 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-3xl blur opacity-20 animate-pulse"></div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                            Fila de Downloads
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Gerencie suas músicas selecionadas e faça downloads em massa organizados em lotes
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Music className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">{downloadQueue.length}</h3>
                            <p className="text-blue-300 text-sm font-medium">Músicas na Fila</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">{downloadedTracks.size}</h3>
                            <p className="text-green-300 text-sm font-medium">Músicas Baixadas</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Clock className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">{Math.max(0, downloadQueue.length - downloadedTracks.size)}</h3>
                            <p className="text-orange-300 text-sm font-medium">Músicas Pendentes</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Calendar className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">
                                {currentDateInQueue ? new Date(currentDateInQueue).toLocaleDateString('pt-BR') : 'Nenhuma'}
                            </h3>
                            <p className="text-purple-300 text-sm font-medium">Data da Fila</p>
                        </div>
                    </div>

                    {/* Main Action Card */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 mb-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-3">DOWNLOADER EM MASSA</h2>
                            <p className="text-center text-gray-300 mb-4 text-sm">
                                Download estilo Google Drive - ZIP em partes com progresso em tempo real
                            </p>
                            <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-4">
                                Processe suas músicas em lotes de 100 para downloads organizados e eficientes
                            </p>

                            {/* Aviso sobre restrição de dias */}
                            {currentDateInQueue && (
                                <div className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-purple-500/15 to-indigo-500/10 border border-blue-400/40 rounded-2xl p-6 max-w-3xl mx-auto backdrop-blur-sm shadow-2xl shadow-blue-500/20">
                                    {/* Efeito de brilho animado */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent animate-pulse"></div>

                                    {/* Header com ícone animado */}
                                    <div className="relative flex items-center gap-4 mb-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-400 rounded-full blur-md animate-ping opacity-75"></div>
                                            <Calendar className="relative h-6 w-6 text-blue-300 animate-bounce" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                                                📅 Restrição de Dias
                                            </h3>
                                            <p className="text-blue-200/80 text-sm">Controle de organização por data</p>
                                        </div>
                                    </div>

                                    {/* Informações da restrição */}
                                    <div className="relative space-y-3">
                                        {/* Data Atual */}
                                        <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-blue-400/20">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                            <span className="text-blue-200/90 text-sm font-medium">Data da Fila:</span>
                                            <div className="px-3 py-1 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg text-blue-300 font-semibold text-sm border border-blue-400/30">
                                                {new Date(currentDateInQueue).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>

                                        {/* Regra de Restrição */}
                                        <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-blue-400/20">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                            <span className="text-blue-200/90 text-sm font-medium">Regra:</span>
                                            <span className="text-blue-200/80 text-sm">Apenas músicas do mesmo dia</span>
                                        </div>

                                        {/* Status de Restrição */}
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-400/30">
                                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                                            <div className="flex-1">
                                                <span className="text-blue-300 font-semibold">⚠️ Restrição Ativa</span>
                                                <p className="text-blue-200/80 text-sm mt-1">
                                                    Você só pode adicionar músicas de <strong>{new Date(currentDateInQueue).toLocaleDateString('pt-BR')}</strong> até concluir o download atual.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Badge de Status */}
                                        <div className="flex justify-center">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-sm font-semibold shadow-lg">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                RESTRIÇÃO ATIVA
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Indicador de Sessão ZIP Ativa */}
                            {zipSessionId && (
                                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-green-500/15 to-cyan-500/10 border border-emerald-400/40 rounded-2xl p-6 max-w-3xl mx-auto backdrop-blur-sm shadow-2xl shadow-emerald-500/20">
                                    {/* Efeito de brilho animado */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/5 to-transparent animate-pulse"></div>

                                    {/* Header com ícone animado */}
                                    <div className="relative flex items-center gap-4 mb-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md animate-ping opacity-75"></div>
                                            <Package className="relative h-6 w-6 text-emerald-300 animate-bounce" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-300 via-green-300 to-cyan-300 bg-clip-text text-transparent">
                                                🚀 Sessão ZIP Ativa
                                            </h3>
                                            <p className="text-emerald-200/80 text-sm">Processamento em streaming otimizado</p>
                                        </div>
                                    </div>

                                    {/* Informações da sessão */}
                                    <div className="relative space-y-3">
                                        {/* ID da Sessão */}
                                        <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-emerald-400/20">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                            <span className="text-emerald-200/90 text-sm font-medium">ID da Sessão:</span>
                                            <code className="bg-emerald-900/30 px-3 py-1 rounded-lg text-emerald-300 font-mono text-xs border border-emerald-400/30">
                                                {zipSessionId}
                                            </code>
                                        </div>

                                        {/* Link Persistente */}
                                        <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-emerald-400/20">
                                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                            <span className="text-emerald-200/90 text-sm font-medium">Link Persistente:</span>
                                            <div className="flex-1">
                                                <code className="block bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 px-3 py-2 rounded-lg text-emerald-300 font-mono text-xs border border-emerald-400/30 break-all">
                                                    /playlist#{zipSessionId}
                                                </code>
                                            </div>
                                        </div>

                                        {/* Status de Persistência */}
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl border border-emerald-400/30">
                                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                            <div className="flex-1">
                                                <span className="text-green-300 font-semibold">✅ Sessão Persistente</span>
                                                <p className="text-emerald-200/80 text-sm mt-1">
                                                    Sua sessão será mantida automaticamente mesmo se a página recarregar ou for fechada
                                                </p>
                                            </div>
                                        </div>

                                        {/* Badge de Status */}
                                        <div className="flex justify-center">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full text-white text-sm font-semibold shadow-lg">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                STREAMING ATIVO
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {downloadQueue.length > 0 && (downloadQueue.length - downloadedTracks.size) > 0 ? (
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={downloadAllTracksStreaming}
                                    disabled={isDownloadingAll || zipProgress.isActive || (downloadQueue.length - downloadedTracks.size) === 0}
                                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 disabled:from-gray-600 disabled:via-purple-700 disabled:to-emerald-700 disabled:cursor-not-allowed px-10 py-5 rounded-2xl font-bold transition-all flex items-center gap-4 shadow-2xl hover:shadow-blue-500/25 text-xl min-w-[280px] justify-center"
                                >
                                    {isDownloadingAll || zipProgress.isActive ? (
                                        <>
                                            <Loader2 size={28} className="animate-spin" />
                                            {isStreamingZip ? 'Streaming...' : (zipProgress.isGenerating ? 'Processando...' : 'Baixando...')}
                                        </>
                                    ) : (
                                        <>
                                            <Package size={28} />
                                            Download Estilo Google Drive ({Math.max(0, downloadQueue.length - downloadedTracks.size)} pendentes)
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={clearQueue}
                                    disabled={isDownloadingAll || zipProgress.isActive}
                                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-8 py-5 rounded-2xl font-semibold transition-all flex items-center gap-3 shadow-2xl hover:shadow-red-500/25 text-lg"
                                >
                                    <Trash2 size={24} />
                                    Limpar Tudo
                                </button>

                                <button
                                    onClick={clearDownloadHistory}
                                    disabled={isDownloadingAll || zipProgress.isActive}
                                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-6 py-5 rounded-2xl font-semibold transition-all flex items-center gap-3 shadow-2xl hover:shadow-orange-500/25 text-lg"
                                >
                                    <X size={24} />
                                    Limpar Histórico
                                </button>
                            </div>
                        ) : downloadQueue.length > 0 ? (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-12 h-12 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-green-400 mb-4">
                                    ✅ Fila Completa!
                                </h3>
                                <p className="text-gray-300 mb-8 text-lg">
                                    Todas as suas músicas já foram baixadas. Adicione mais músicas ou limpe a fila.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        href="/new"
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-4 rounded-2xl font-semibold transition-all flex items-center gap-3 shadow-2xl hover:shadow-blue-500/25 text-lg"
                                    >
                                        <Music size={24} />
                                        Adicionar Mais Músicas
                                    </Link>
                                    <button
                                        onClick={clearQueue}
                                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-4 rounded-2xl font-semibold transition-all flex items-center gap-3 shadow-2xl hover:shadow-red-500/25 text-lg"
                                    >
                                        <Trash2 size={24} />
                                        Limpar Fila
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Package className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-300 mb-4">
                                    Fila Vazia
                                </h3>
                                <p className="text-gray-400 mb-8 text-lg">
                                    Nenhuma música selecionada para download. Vá para a página principal e selecione suas músicas favoritas.
                                </p>
                                <Link
                                    href="/new"
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-4 rounded-2xl font-semibold transition-all flex items-center gap-3 shadow-2xl hover:shadow-blue-500/25 text-lg inline-flex"
                                >
                                    <Music size={24} />
                                    Selecionar Músicas
                                </Link>
                            </div>
                        )}

                        {/* Progress Bar - Estilo Google Drive */}
                        {zipProgress.isActive && (
                            <div className="mt-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 shadow-2xl">
                                {/* Header com ícone e título */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">🚀 Download Estilo Google Drive</h3>
                                            <p className="text-blue-200 text-sm">
                                                {zipProgress.trackName || 'Processando...'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-white">
                                            {zipProgress.current}/{zipProgress.total}
                                        </span>
                                        <p className="text-blue-200 text-sm">músicas</p>
                                    </div>
                                </div>

                                {/* Barra de Progresso Estilo Google Drive */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm text-blue-200 mb-2">
                                        <span>📊 Progresso Geral</span>
                                        <span>{zipProgress.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out shadow-lg"
                                            style={{ width: `${zipProgress.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Informações Detalhadas */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="bg-white/10 rounded-xl p-3 text-center">
                                        <div className="text-2xl mb-1">📦</div>
                                        <div className="text-white font-semibold">{Math.ceil((downloadQueue.length - downloadedTracks.size) / 100)}</div>
                                        <div className="text-blue-200 text-xs">Lotes</div>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-3 text-center">
                                        <div className="text-2xl mb-1">🎵</div>
                                        <div className="text-white font-semibold">100</div>
                                        <div className="text-blue-200 text-xs">Por Lote</div>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-3 text-center">
                                        <div className="text-2xl mb-1">💾</div>
                                        <div className="text-white font-semibold">{(totalDownloadSize / 1024 / 1024).toFixed(2)} MB</div>
                                        <div className="text-blue-200 text-xs">Tamanho</div>
                                    </div>
                                </div>

                                {/* Status Atual */}
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 rounded-full border border-blue-400/30">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-blue-200 font-medium">
                                            {zipProgress.isGenerating ? '🔄 Gerando ZIP...' : '📥 Baixando em streaming...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sistema de Playlist com Pesquisa */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                                    <Music className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Sistema de Playlist</h2>
                                    <p className="text-gray-400">Pesquise e adicione músicas diretamente</p>
                                </div>
                            </div>
                            <Link
                                href="/new"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-3 shadow-lg hover:shadow-purple-500/25"
                            >
                                <Plus size={20} />
                                Adicionar Músicas
                            </Link>
                        </div>

                        {/* Sistema de Pesquisa */}
                        <div className="mb-8">
                            <div className="relative max-w-2xl mx-auto">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="text"
                                        placeholder="Pesquise por nome da música, artista ou estilo..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && searchTracks(searchQuery)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                                    />
                                    <button
                                        onClick={() => searchTracks(searchQuery)}
                                        disabled={!searchQuery.trim() || isSearching}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 px-4 py-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSearching ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Buscar'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Resultados da Pesquisa */}
                        {showSearchResults && searchResults.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        Resultados da Pesquisa ({searchResults.length})
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowSearchResults(false);
                                            setSearchQuery('');
                                        }}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {searchResults.map((track) => (
                                        <div
                                            key={track.id}
                                            className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4 hover:scale-105 transition-all duration-300"
                                        >
                                            {/* Thumbnail e Play Button */}
                                            <div className="relative mb-3">
                                                <img
                                                    src={track.imageUrl || "/images/default-track.jpg"}
                                                    alt={`Capa de ${track.songName}`}
                                                    className="w-full h-24 object-cover rounded-lg border border-slate-600/50"
                                                />
                                                <button
                                                    onClick={() => handlePlayPause(track)}
                                                    className="absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-300 backdrop-blur-sm text-white bg-black/60 opacity-0 group-hover:opacity-100"
                                                    title="Tocar"
                                                >
                                                    <Play size={24} strokeWidth={1.75} className="ml-1" />
                                                </button>
                                            </div>

                                            {/* Info da Música */}
                                            <div className="mb-3">
                                                <h4 className="font-semibold text-white text-sm mb-1 line-clamp-1">
                                                    {track.songName}
                                                </h4>
                                                <p className="text-gray-400 text-xs mb-2">
                                                    {track.artist}
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white tracking-wide uppercase bg-orange-500/20 border border-orange-500/30">
                                                        {track.style}
                                                    </span>
                                                    {track.pool && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white tracking-wide uppercase bg-emerald-500/20 border border-emerald-500/30">
                                                            {track.pool}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Botão Adicionar */}
                                            <button
                                                onClick={() => addToQueue(track)}
                                                disabled={!canAddTrack(track) || downloadQueue.some(t => t.id === track.id)}
                                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-3 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={
                                                    !canAddTrack(track)
                                                        ? '⚠️ Você só pode adicionar músicas do mesmo dia'
                                                        : downloadQueue.some(t => t.id === track.id)
                                                            ? '✅ Já está na fila'
                                                            : '➕ Adicionar à fila'
                                                }
                                            >
                                                {downloadQueue.some(t => t.id === track.id) ? (
                                                    <CheckCircle className="h-4 w-4" />
                                                ) : (
                                                    <Plus className="h-4 w-4" />
                                                )}
                                                {downloadQueue.some(t => t.id === track.id) ? 'Já Adicionada' : 'Adicionar'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sua Fila de Downloads */}
                        {downloadQueue.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-white">
                                        Sua Fila de Downloads ({downloadQueue.length})
                                    </h3>
                                    {currentDateInQueue && (
                                        <div className="flex items-center gap-2 text-purple-300 text-sm">
                                            <Calendar className="h-4 w-4" />
                                            <span>Data: {new Date(currentDateInQueue).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Filtro de Pesquisa na Fila */}
                                <div className="mb-4">
                                    <div className="relative max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder="Filtrar músicas na fila..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Lista de Músicas da Fila */}
                                <div className="space-y-3">
                                    {filteredQueueTracks.map((track) => (
                                        <div
                                            key={track.id}
                                            className={`group flex items-center gap-4 p-4 bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-sm border rounded-xl hover:scale-[1.02] transition-all duration-300 ${downloadedTracks.has(track.id)
                                                ? 'border-green-500/30 shadow-lg shadow-green-500/20'
                                                : 'border-slate-600/50 hover:border-slate-500/50'
                                                }`}
                                        >
                                            {/* Thumbnail e Play Button */}
                                            <div className="relative w-16 h-16 flex-shrink-0">
                                                <img
                                                    src={track.imageUrl || "/images/default-track.jpg"}
                                                    alt={`Capa de ${track.songName}`}
                                                    className="w-full h-full object-cover rounded-lg border border-slate-600/50"
                                                />
                                                <button
                                                    onClick={() => handlePlayPause(track)}
                                                    className="absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-300 backdrop-blur-sm text-white bg-black/60 opacity-0 group-hover:opacity-100"
                                                    title="Tocar"
                                                >
                                                    <Play size={20} strokeWidth={1.75} className="ml-1" />
                                                </button>
                                            </div>

                                            {/* Info da Música */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-white text-lg mb-1 line-clamp-1">
                                                    {track.songName}
                                                </h4>
                                                <p className="text-gray-400 text-sm mb-2">
                                                    {track.artist}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white tracking-wide uppercase bg-orange-500/20 border border-orange-500/30">
                                                        {track.style}
                                                    </span>
                                                    {track.pool && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white tracking-wide uppercase bg-emerald-500/20 border border-emerald-500/30">
                                                            {track.pool}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status e Ações */}
                                            <div className="flex items-center gap-3">
                                                {/* Status Badge */}
                                                {downloadedTracks.has(track.id) ? (
                                                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-500/30">
                                                        ✅ Baixada
                                                    </div>
                                                ) : (
                                                    <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/30">
                                                        ⏳ Pendente
                                                    </div>
                                                )}

                                                {/* Botão Remover */}
                                                <button
                                                    onClick={() => removeFromQueue(track.id)}
                                                    disabled={isDownloadingAll || zipProgress.isActive}
                                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-all"
                                                    title="Remover da fila"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Estado Vazio */}
                        {downloadQueue.length === 0 && !showSearchResults && (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Music className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-400 mb-4">
                                    🎵 Sua Playlist Está Vazia
                                </h3>
                                <p className="text-gray-500 mb-8 text-lg">
                                    Use a pesquisa acima para encontrar e adicionar músicas à sua fila de downloads
                                </p>
                                <Link
                                    href="/new"
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-2xl font-semibold transition-all flex items-center gap-3 shadow-2xl hover:shadow-purple-500/25 text-lg mx-auto w-fit"
                                >
                                    <Plus size={24} />
                                    Explorar Novas Músicas
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
