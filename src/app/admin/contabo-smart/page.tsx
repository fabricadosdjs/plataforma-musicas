'use client';

import {
    AlertCircle,
    Brain,
    CheckCircle,
    Clock,
    Database,
    Download,
    FileAudio,
    Music,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Zap,
    Copy,
    Check,
    Edit,
    Calendar,
    Settings,
    Link,
    Eye,
    EyeOff,
    Save,
    X,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Heart,
    Copyright,
    Filter,
    SortAsc,
    SortDesc,
    Info,
    AlertTriangle,
    FileText,
    Upload,
    Target,
    Sparkles
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { AdminAuth } from '@/components/admin/AdminAuth';

interface StorageFile {
    key: string;
    url: string;
    size: number;
    lastModified: string;
    isAudio: boolean;
    filename: string;
}

interface NewTrackPreview {
    filename: string;
    size: number;
    lastModified: string;
    url: string;
    preview: {
        artist: string;
        title: string;
        version: string;
        style?: string;
        pool?: string;
    };
    selected?: boolean;
    customTitle?: string;
    customVersion?: string;
    customDate?: string;
    customStyle?: string;
    customPool?: string;
    downloadedEver?: boolean;
    downloadedToday?: boolean;
    liked?: boolean;
    confidence?: number; // Confiança da detecção (0-100)
    processingStatus?: 'pending' | 'processing' | 'success' | 'error';
}

interface DetectionResult {
    success: boolean;
    totalFiles: number;
    existingFiles: number;
    newFiles: number;
    newTracks: NewTrackPreview[];
    lastUpdate: string;
    statistics: {
        byStyle: Array<{ style: string; count: number }>;
        byPool: Array<{ pool: string; count: number }>;
        averageConfidence: number;
    };
}

interface ImportResult {
    success: boolean;
    message: string;
    imported: number;
    total: number;
    newTracks: any[];
    statistics: {
        totalInDatabase: number;
        byStyle: Array<{ style: string; _count: number }>;
        byPool: Array<{ pool: string; _count: number }>;
    };
}

export default function ContaboSmartAdmin() {
    // Estados principais
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [newTracks, setNewTracks] = useState<NewTrackPreview[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    // Valores padrão seguros para evitar erros de undefined
    const safeDetectionResult = detectionResult || {
        success: false,
        totalFiles: 0,
        existingFiles: 0,
        newFiles: 0,
        newTracks: [],
        lastUpdate: '',
        statistics: {
            byStyle: [],
            byPool: [],
            averageConfidence: 0
        }
    };

    const safeImportResult = importResult || {
        success: false,
        message: '',
        imported: 0,
        total: 0,
        newTracks: [],
        statistics: {
            totalInDatabase: 0,
            byStyle: [],
            byPool: []
        }
    };

    // Estados de configuração
    const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
    const [importDate, setImportDate] = useState('current');
    const [customDate, setCustomDate] = useState('2024-12-01');
    const [showLinks, setShowLinks] = useState(true);
    const [editingTrack, setEditingTrack] = useState<number | null>(null);
    const [allSelected, setAllSelected] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Estados de filtros e ordenação
    const [filterStyle, setFilterStyle] = useState('all');
    const [filterPool, setFilterPool] = useState('all');
    const [sortBy, setSortBy] = useState<'filename' | 'size' | 'date' | 'confidence'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Estados do player
    const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activePlayerIndex, setActivePlayerIndex] = useState<number | null>(null);
    const [volume, setVolume] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Auto-detectar novos arquivos ao carregar
    useEffect(() => {
        if (autoDetectEnabled) {
            detectNewFiles();
        }
    }, []);

    // Auto-detectar a cada 30 segundos se habilitado
    useEffect(() => {
        if (!autoDetectEnabled) return;

        const interval = setInterval(() => {
            detectNewFiles();
        }, 30000);

        return () => clearInterval(interval);
    }, [autoDetectEnabled]);

    // Função para detectar novos arquivos
    const detectNewFiles = async () => {
        setDetecting(true);
        try {
            const response = await fetch('/api/contabo/detect-new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    autoDetect: true,
                    includeMetadata: true,
                }),
            });

            if (response.ok) {
                const result: DetectionResult = await response.json();
                setDetectionResult(result);
                setNewTracks(result.newTracks || []);

                // Auto-selecionar tracks com alta confiança
                const updatedTracks = result.newTracks.map(track => ({
                    ...track,
                    selected: Boolean(track.confidence && track.confidence > 70)
                }));
                setNewTracks(updatedTracks);
            } else {
                console.error('Erro na detecção:', await response.text());
            }
        } catch (error) {
            console.error('Erro na detecção:', error);
        } finally {
            setDetecting(false);
        }
    };

    // Função para importação inteligente
    const smartImport = async () => {
        setImporting(true);
        setImportResult(null);

        const selectedTracks = newTracks.filter(track => track.selected);

        if (selectedTracks.length === 0) {
            setImportResult({
                success: false,
                message: 'Nenhuma track selecionada para importação',
                imported: 0,
                total: 0,
                newTracks: [],
                statistics: { totalInDatabase: 0, byStyle: [], byPool: [] }
            });
            setImporting(false);
            return;
        }

        try {
            const response = await fetch('/api/contabo/smart-import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tracks: selectedTracks,
                    importDate: importDate,
                    customDate: customDate,
                    autoDetectStyles: true,
                    autoDetectPools: true,
                }),
            });

            const result: ImportResult = await response.json();
            setImportResult(result);

            if (result.success) {
                // Limpar tracks importadas
                setNewTracks([]);
                setDetectionResult(null);
            }
        } catch (error) {
            setImportResult({
                success: false,
                message: 'Erro na importação: ' + (error as Error).message,
                imported: 0,
                total: 0,
                newTracks: [],
                statistics: { totalInDatabase: 0, byStyle: [], byPool: [] }
            });
        } finally {
            setImporting(false);
        }
    };

    // Função para filtrar e ordenar tracks
    const filteredTracks = newTracks.filter(track => {
        const matchesSearch = track.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
            track.preview.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
            track.preview.title.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStyle = filterStyle === 'all' || track.preview.style === filterStyle;
        const matchesPool = filterPool === 'all' || track.preview.pool === filterPool;

        return matchesSearch && matchesStyle && matchesPool;
    }).sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case 'filename':
                comparison = a.filename.localeCompare(b.filename);
                break;
            case 'size':
                comparison = a.size - b.size;
                break;
            case 'date':
                comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
                break;
            case 'confidence':
                comparison = (a.confidence || 0) - (b.confidence || 0);
                break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Função para alternar seleção de track
    const toggleTrackSelection = (index: number) => {
        const updatedTracks = [...newTracks];
        updatedTracks[index].selected = Boolean(!updatedTracks[index].selected);
        setNewTracks(updatedTracks);
    };

    // Função para selecionar/desselecionar todas
    const toggleAllSelection = () => {
        const updatedTracks = newTracks.map(track => ({
            ...track,
            selected: Boolean(!allSelected)
        }));
        setNewTracks(updatedTracks);
        setAllSelected(!allSelected);
    };

    // Função para editar track
    const editTrack = (index: number) => {
        setEditingTrack(index);
    };

    // Função para salvar edição
    const saveTrackEdit = (index: number) => {
        const updatedTracks = [...newTracks];
        const track = updatedTracks[index];

        if (track.customTitle) track.preview.title = track.customTitle;
        if (track.customVersion) track.preview.version = track.customVersion;
        if (track.customStyle) track.preview.style = track.customStyle;
        if (track.customPool) track.preview.pool = track.customPool;

        setNewTracks(updatedTracks);
        setEditingTrack(null);
    };

    // Função para copiar link
    const copyLink = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('Erro ao copiar link:', error);
        }
    };

    // Funções do player de áudio
    const playTrack = (index: number, url: string) => {
        if (currentPlayingIndex === index) {
            if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
            } else {
                audioRef.current?.play();
                setIsPlaying(true);
            }
        } else {
            setCurrentPlayingIndex(index);
            setActivePlayerIndex(index);
            setIsPlaying(true);
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
            }
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentPlayingIndex(null);
        setActivePlayerIndex(null);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <AdminAuth>
            <div className="min-h-screen bg-black text-white p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 border border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-white flex items-center gap-4 tracking-tight">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                                        <Brain className="h-8 w-8 text-white" />
                                    </div>
                                    Importação Inteligente
                                </h1>
                                <p className="text-gray-300 mt-3 text-lg">
                                    Sistema automático e inteligente para detectar e importar músicas do Contabo Storage
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-3 text-white bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700 hover:bg-gray-800 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={autoDetectEnabled}
                                        onChange={(e) => setAutoDetectEnabled(e.target.checked)}
                                        className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                                    />
                                    <span className="font-medium">Auto-detectar</span>
                                </label>
                                <button
                                    onClick={() => setShowLinks(!showLinks)}
                                    className="bg-gray-800/50 text-white px-6 py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 flex items-center gap-3 border border-gray-700 transition-all shadow-lg font-semibold"
                                >
                                    {showLinks ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    {showLinks ? 'Ocultar Links' : 'Mostrar Links'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Controles principais */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Detecção */}
                        <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <Search className="h-5 w-5 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold">Detecção</h3>
                            </div>
                            <p className="text-gray-400 mb-4">Detecta novos arquivos automaticamente</p>
                            <button
                                onClick={detectNewFiles}
                                disabled={detecting}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {detecting ? (
                                    <>
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        Detectando...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-5 w-5" />
                                        Detectar Novos
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Importação */}
                        <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                    <Upload className="h-5 w-5 text-green-400" />
                                </div>
                                <h3 className="text-xl font-semibold">Importação</h3>
                            </div>
                            <p className="text-gray-400 mb-4">Importa tracks selecionadas</p>
                            <button
                                onClick={smartImport}
                                disabled={importing || newTracks.filter(t => t.selected).length === 0}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {importing ? (
                                    <>
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        Importando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5" />
                                        Importar ({newTracks.filter(t => t.selected).length})
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Estatísticas */}
                        <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <Database className="h-5 w-5 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-semibold">Estatísticas</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total detectado:</span>
                                    <span className="font-semibold">{newTracks.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Selecionadas:</span>
                                    <span className="font-semibold text-green-400">{newTracks.filter(t => t.selected).length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Confiança média:</span>
                                    <span className="font-semibold text-blue-400">
                                        {newTracks.length > 0
                                            ? Math.round(newTracks.reduce((acc, t) => acc + (t.confidence || 0), 0) / newTracks.length)
                                            : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtros e busca */}
                    <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Busca */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar tracks..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Filtro por estilo */}
                            <select
                                value={filterStyle}
                                onChange={(e) => setFilterStyle(e.target.value)}
                                className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">Todos os estilos</option>
                                {safeDetectionResult.statistics.byStyle.map(style => (
                                    <option key={style.style} value={style.style}>
                                        {style.style} ({style.count})
                                    </option>
                                )) || []}
                            </select>

                            {/* Filtro por pool */}
                            <select
                                value={filterPool}
                                onChange={(e) => setFilterPool(e.target.value)}
                                className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">Todos os pools</option>
                                {safeDetectionResult.statistics.byPool.map(pool => (
                                    <option key={pool.pool} value={pool.pool}>
                                        {pool.pool} ({pool.count})
                                    </option>
                                )) || []}
                            </select>

                            {/* Ordenação */}
                            <div className="flex gap-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="date">Data</option>
                                    <option value="filename">Nome</option>
                                    <option value="size">Tamanho</option>
                                    <option value="confidence">Confiança</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white hover:bg-gray-800 transition-all"
                                >
                                    {sortOrder === 'asc' ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lista de tracks */}
                    {filteredTracks.length > 0 && (
                        <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-semibold">Tracks Detectadas ({filteredTracks.length})</h3>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={toggleAllSelection}
                                        className="bg-gray-800/50 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2"
                                    >
                                        {allSelected ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                        {allSelected ? 'Desselecionar Todas' : 'Selecionar Todas'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredTracks.map((track, index) => (
                                    <div
                                        key={index}
                                        className={`bg-gray-800/50 rounded-xl p-4 border transition-all ${track.selected ? 'border-green-500 bg-green-500/10' : 'border-gray-700 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={track.selected}
                                                onChange={() => toggleTrackSelection(index)}
                                                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
                                            />

                                            {/* Informações da track */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-semibold text-lg">
                                                        {track.preview.artist} - {track.preview.title}
                                                    </h4>
                                                    {track.confidence && (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${track.confidence > 80 ? 'bg-green-500/20 text-green-400' :
                                                                track.confidence > 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {track.confidence}% confiança
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <span>Versão: {track.preview.version}</span>
                                                    {track.preview.style && <span>Estilo: {track.preview.style}</span>}
                                                    {track.preview.pool && <span>Pool: {track.preview.pool}</span>}
                                                    <span>Tamanho: {formatFileSize(track.size)}</span>
                                                    <span>Data: {new Date(track.lastModified).toLocaleDateString()}</span>
                                                </div>

                                                {/* Player de áudio */}
                                                <div className="flex items-center gap-2 mt-3">
                                                    <button
                                                        onClick={() => playTrack(index, track.url)}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-all"
                                                    >
                                                        {currentPlayingIndex === index && isPlaying ? (
                                                            <Pause className="h-4 w-4" />
                                                        ) : (
                                                            <Play className="h-4 w-4" />
                                                        )}
                                                    </button>

                                                    {currentPlayingIndex === index && (
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                                                            <div className="flex-1 bg-gray-700 rounded-full h-1">
                                                                <div
                                                                    className="bg-purple-500 h-1 rounded-full transition-all"
                                                                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-400">{formatTime(duration)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Ações */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => editTrack(index)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-all flex items-center gap-1"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                    Editar
                                                </button>

                                                {showLinks && (
                                                    <button
                                                        onClick={() => copyLink(track.url)}
                                                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-all flex items-center gap-1"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                        Copiar Link
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Modal de edição */}
                                        {editingTrack === index && (
                                            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
                                                        <input
                                                            type="text"
                                                            value={track.customTitle || track.preview.title}
                                                            onChange={(e) => {
                                                                const updatedTracks = [...newTracks];
                                                                updatedTracks[index].customTitle = e.target.value;
                                                                setNewTracks(updatedTracks);
                                                            }}
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Versão</label>
                                                        <input
                                                            type="text"
                                                            value={track.customVersion || track.preview.version}
                                                            onChange={(e) => {
                                                                const updatedTracks = [...newTracks];
                                                                updatedTracks[index].customVersion = e.target.value;
                                                                setNewTracks(updatedTracks);
                                                            }}
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Estilo</label>
                                                        <input
                                                            type="text"
                                                            value={track.customStyle || track.preview.style || ''}
                                                            onChange={(e) => {
                                                                const updatedTracks = [...newTracks];
                                                                updatedTracks[index].customStyle = e.target.value;
                                                                setNewTracks(updatedTracks);
                                                            }}
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Pool</label>
                                                        <input
                                                            type="text"
                                                            value={track.customPool || track.preview.pool || ''}
                                                            onChange={(e) => {
                                                                const updatedTracks = [...newTracks];
                                                                updatedTracks[index].customPool = e.target.value;
                                                                setNewTracks(updatedTracks);
                                                            }}
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4">
                                                    <button
                                                        onClick={() => saveTrackEdit(index)}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                        Salvar
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingTrack(null)}
                                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resultado da importação */}
                    {importResult && (
                        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50`}>
                            <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-gray-800">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${importResult.success ? 'bg-green-500/20' : 'bg-red-500/20'
                                        }`}>
                                        {importResult.success ? (
                                            <CheckCircle className="h-6 w-6 text-green-400" />
                                        ) : (
                                            <AlertCircle className="h-6 w-6 text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-semibold">
                                            {importResult.success ? 'Importação Concluída' : 'Erro na Importação'}
                                        </h3>
                                        <p className="text-gray-400">{importResult.message}</p>
                                    </div>
                                </div>

                                {importResult.success && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-800/50 rounded-xl p-4">
                                                <h4 className="font-semibold text-green-400 mb-2">Importadas</h4>
                                                <p className="text-2xl font-bold">{importResult.imported}</p>
                                            </div>
                                            <div className="bg-gray-800/50 rounded-xl p-4">
                                                <h4 className="font-semibold text-blue-400 mb-2">Total no Banco</h4>
                                                <p className="text-2xl font-bold">{importResult.statistics.totalInDatabase}</p>
                                            </div>
                                        </div>

                                        {safeImportResult.statistics.byStyle.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold mb-3">Por Estilo</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {safeImportResult.statistics.byStyle.map((style, index) => (
                                                        <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                                                            <span className="text-sm text-gray-400">{style.style}</span>
                                                            <p className="font-semibold">{style._count}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={() => setImportResult(null)}
                                    className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-all"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Player de áudio oculto */}
                    <audio
                        ref={audioRef}
                        onEnded={handleAudioEnded}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleTimeUpdate}
                        className="hidden"
                    />
                </div>
            </div>
        </AdminAuth>
    );
}
