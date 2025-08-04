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
    Copyright
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
    };
    selected?: boolean;
    customTitle?: string;
    customVersion?: string;
    customDate?: string;
    downloadedEver?: boolean;
    downloadedToday?: boolean;
    liked?: boolean; // Adicionado para funcionalidade de like
}

interface DetectionResult {
    success: boolean;
    totalFiles: number;
    existingFiles: number;
    newFiles: number;
    newTracks: NewTrackPreview[];
    lastUpdate: string;
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
    };
}

export default function ContaboSmartAdmin() {
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [newTracks, setNewTracks] = useState<NewTrackPreview[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
    const [importDate, setImportDate] = useState('current'); // 'current' ou data específica
    const [customDate, setCustomDate] = useState('2024-12-01'); // Data padrão dezembro 2024

    // Novos estados para funcionalidades avançadas
    const [showLinks, setShowLinks] = useState(true);
    const [editingTrack, setEditingTrack] = useState<number | null>(null);
    const [allSelected, setAllSelected] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Estados para player de música
    const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activePlayerIndex, setActivePlayerIndex] = useState<number | null>(null);
    const [volume, setVolume] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    // const [loading, setLoading] = useState(false); // Loading state for file fetching

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

    const detectNewFiles = async () => {
        setDetecting(true);
        // TODO: implement detection logic here
        setDetecting(false);
    };

    const smartImport = async () => {
        setImporting(true);
        setImportResult(null);
        try {
            const response = await fetch('/api/contabo/smart-import', {
                method: 'POST',
            });
            const result: ImportResult = await response.json();
            setImportResult(result);
        } catch (error) {
            setImportResult({
                success: false,
                message: 'Erro na importação: ' + (error as Error).message,
                imported: 0,
                total: 0,
                newTracks: [],
                statistics: { totalInDatabase: 0, byStyle: [] }
            });
        } finally {
            setImporting(false);
        }
    };

    // TODO: implement filteredFiles and toggleTrackSelection logic

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
                                <button
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-3 font-bold shadow-2xl transition-all"
                                >
                                    <Zap className="h-6 w-6 text-white" />
                                    Importação Inteligente
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Preview das novas músicas */}
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
                        {newTracks.map((track, index) => (
                            <div key={index} className={`p-6 rounded-2xl border transition-all duration-300 ${track.selected ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 shadow-lg' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="checkbox"
                                        checked={track.selected || false}
                                        onChange={() => {/* TODO: implement toggleTrackSelection */ }}
                                        className="mt-2 w-5 h-5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                                    />
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <Music className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {editingTrack === index ? (
                                            <div className="space-y-4">
                                                {/* ...edit mode code... */}
                                            </div>
                                        ) : (
                                            <div>
                                                {/* ...view mode code... */}
                                            </div>
                                        )}
                                    </div>
                                    {/* Coluna de Ações */}
                                    <div className="flex items-center gap-2 ml-4">
                                        {/* Download: copia o link da música */}
                                        <button
                                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                                            title="Download"
                                            onClick={() => navigator.clipboard.writeText(track.url)}
                                        >
                                            <Download className="h-5 w-5" />
                                        </button>
                                        {/* Like: incrementa localmente */}
                                        <button
                                            className={`bg-pink-600 text-white p-2 rounded-lg hover:bg-pink-700 transition-colors ${track.liked ? 'ring-2 ring-pink-400' : ''}`}
                                            title="Like"
                                            onClick={() => {
                                                setNewTracks(prev => {
                                                    const updated = [...prev];
                                                    updated[index] = { ...updated[index], liked: !updated[index].liked };
                                                    return updated;
                                                });
                                            }}
                                        >
                                            <Heart className="h-5 w-5" />
                                        </button>
                                        {/* Report: exibe alerta */}
                                        <button
                                            className="bg-yellow-600 text-white p-2 rounded-lg hover:bg-yellow-700 transition-colors"
                                            title="Reportar"
                                            onClick={() => alert('Report enviado para análise!')}
                                        >
                                            <AlertCircle className="h-5 w-5" />
                                        </button>
                                        {/* Copyright: exibe modal de direitos autorais */}
                                        <button
                                            className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                                            title="Copyright"
                                            onClick={() => alert('Informações de direitos autorais desta música.')}
                                        >
                                            <Copyright className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Resultado da Importação */}
                    {importResult && (
                        <div className={`rounded-2xl p-6 mb-8 border shadow-2xl ${importResult.success ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30' : 'bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/30'}`}>
                            {/* ...import result code... */}
                        </div>
                    )}
                    {/* Arquivos no Storage */}
                    <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-800">
                        <div className="flex items-center justify-between mb-8">
                            {/* ...storage header code... */}
                        </div>
                        <div className="space-y-4">
                            {/* TODO: implement filteredFiles.map */}
                        </div>
                        {/* TODO: implement empty state */}
                    </div>
                </div>
            </div>
        </AdminAuth>
    );
}
