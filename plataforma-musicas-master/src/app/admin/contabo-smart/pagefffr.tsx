'use client';

import { spotifyAPI, SpotifyTrack } from '@/lib/spotify';
import {
    AlertCircle,
    Brain,
    CheckCircle,
    Clock,
    Database,
    Download,
    ExternalLink,
    FileAudio,
    Music,
    Plus,
    RefreshCw,
    Search,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
    spotifyMatch?: SpotifyTrack;
    spotifyMetadata?: any;
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
    const [spotifySearching, setSpotifySearching] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
    const [spotifyEnhanceEnabled, setSpotifyEnhanceEnabled] = useState(true);
    const [importDate, setImportDate] = useState('current');
    const [customDate, setCustomDate] = useState('2024-12-01');
    const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

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
        try {
            const response = await fetch('/api/contabo/detect-new');
            const result: DetectionResult = await response.json();

            if (result.success) {
                setDetectionResult(result);
                let tracksWithSpotify = result.newTracks;

                // Buscar metadados do Spotify se habilitado
                if (spotifyEnhanceEnabled && result.newTracks.length > 0) {
                    tracksWithSpotify = await enhanceWithSpotify(result.newTracks);
                }

                setNewTracks(tracksWithSpotify);
            }
        } catch (error) {
            console.error('Erro ao detectar novos arquivos:', error);
        } finally {
            setDetecting(false);
        }
    };

    const enhanceWithSpotify = async (tracks: NewTrackPreview[]): Promise<NewTrackPreview[]> => {
        setSpotifySearching(true);
        const enhancedTracks = [];

        for (const track of tracks) {
            try {
                const spotifyMatch = await spotifyAPI.searchByArtistAndTitle(
                    track.preview.artist,
                    track.preview.title
                );

                if (spotifyMatch) {
                    const metadata = spotifyAPI.extractMetadata(spotifyMatch);
                    enhancedTracks.push({
                        ...track,
                        spotifyMatch,
                        spotifyMetadata: metadata
                    });
                } else {
                    enhancedTracks.push(track);
                }
            } catch (error) {
                console.error(`Erro ao buscar no Spotify para ${track.filename}:`, error);
                enhancedTracks.push(track);
            }
        }

        setSpotifySearching(false);
        return enhancedTracks;
    };

    const smartImport = async () => {
        setImporting(true);
        setImportResult(null);

        try {
            // Preparar dados com metadados do Spotify
            const tracksToImport = newTracks
                .filter(track => selectedTracks.size === 0 || selectedTracks.has(track.filename))
                .map(track => ({
                    ...track,
                    spotifyMetadata: track.spotifyMetadata || null
                }));

            const response = await fetch('/api/contabo/smart-import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    importDate: importDate === 'current' ? new Date().toISOString() : new Date(customDate).toISOString(),
                    tracks: tracksToImport,
                    useSpotifyMetadata: spotifyEnhanceEnabled
                })
            });

            const result: ImportResult = await response.json();
            setImportResult(result);

            if (result.success) {
                setTimeout(() => {
                    detectNewFiles();
                    setSelectedTracks(new Set());
                }, 1000);
            }
        } catch (error) {
            console.error('Erro na importação inteligente:', error);
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

    const toggleTrackSelection = (filename: string) => {
        const newSelection = new Set(selectedTracks);
        if (newSelection.has(filename)) {
            newSelection.delete(filename);
        } else {
            newSelection.add(filename);
        }
        setSelectedTracks(newSelection);
    };

    const selectAllTracks = () => {
        if (selectedTracks.size === newTracks.length) {
            setSelectedTracks(new Set());
        } else {
            setSelectedTracks(new Set(newTracks.map(t => t.filename)));
        }
    };

    const loadFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/contabo/files');
            const data = await response.json();
            if (data.success) {
                setFiles(data.files);
            }
        } catch (error) {
            console.error('Erro ao carregar arquivos:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFiles = files.filter(file =>
        file.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const audioFiles = filteredFiles.filter(file => file.isAudio);

    return (
        <div className="min-h-screen bg-[#212121] text-white">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6 mb-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                                    <Brain className="h-8 w-8 text-white" />
                                </div>
                                Importação Inteligente
                            </h1>
                            <p className="text-gray-400 mt-2 flex items-center gap-2">
                                <Music className="h-4 w-4" />
                                Detecta músicas e enriquece com metadados do Spotify
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-300 bg-[#333] px-3 py-2 rounded-lg border border-[#444]">
                                <input
                                    type="checkbox"
                                    checked={autoDetectEnabled}
                                    onChange={(e) => setAutoDetectEnabled(e.target.checked)}
                                    className="rounded border-gray-500 bg-[#333] text-blue-600 focus:ring-blue-500"
                                />
                                Auto-detectar
                            </label>

                            <label className="flex items-center gap-2 text-sm text-gray-300 bg-[#333] px-3 py-2 rounded-lg border border-[#444]">
                                <input
                                    type="checkbox"
                                    checked={spotifyEnhanceEnabled}
                                    onChange={(e) => setSpotifyEnhanceEnabled(e.target.checked)}
                                    className="rounded border-gray-500 bg-[#333] text-green-600 focus:ring-green-500"
                                />
                                🎵 Spotify API
                            </label>

                            <button
                                onClick={detectNewFiles}
                                disabled={detecting || spotifySearching}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg transition-all duration-200"
                            >
                                {detecting ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : spotifySearching ? (
                                    <Music className="h-4 w-4 animate-pulse" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                                {spotifySearching ? 'Buscando Spotify...' : 'Procurar Novos'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Total no Storage</p>
                                <p className="text-2xl font-bold text-white">
                                    {detectionResult?.totalFiles || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-600/20 rounded-lg">
                                <FileAudio className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Já no Banco</p>
                                <p className="text-2xl font-bold text-green-400">
                                    {detectionResult?.existingFiles || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-green-600/20 rounded-lg">
                                <Database className="h-6 w-6 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Novos Arquivos</p>
                                <p className="text-2xl font-bold text-orange-400">
                                    {detectionResult?.newFiles || 0}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-600/20 rounded-lg">
                                <Plus className="h-6 w-6 text-orange-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#2a2a2a] border border-[#3a3a3a] p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Última Atualização</p>
                                <p className="text-sm text-gray-300">
                                    {detectionResult?.lastUpdate
                                        ? new Date(detectionResult.lastUpdate).toLocaleTimeString()
                                        : 'Nunca'
                                    }
                                </p>
                            </div>
                            <div className="p-3 bg-gray-600/20 rounded-lg">
                                <Clock className="h-6 w-6 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Importação Inteligente */}
                {newTracks.length > 0 && (
                    <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl p-6 mb-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                                    <Zap className="h-5 w-5 text-white" />
                                </div>
                                Importação Inteligente
                                <span className="text-sm font-normal text-gray-400">
                                    ({selectedTracks.size > 0 ? selectedTracks.size : newTracks.length} músicas)
                                </span>
                            </h2>

                            <div className="flex items-center gap-4">
                                {/* Seleção de Data */}
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-medium text-gray-300">Data:</label>
                                    <select
                                        value={importDate}
                                        onChange={(e) => setImportDate(e.target.value)}
                                        className="bg-[#333] border border-[#444] rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="current">Data Atual</option>
                                        <option value="custom">Data Personalizada</option>
                                    </select>

                                    {importDate === 'custom' && (
                                        <input
                                            type="date"
                                            value={customDate}
                                            onChange={(e) => setCustomDate(e.target.value)}
                                            className="bg-[#333] border border-[#444] rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                </div>

                                <button
                                    onClick={selectAllTracks}
                                    className="bg-[#333] hover:bg-[#404040] border border-[#444] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {selectedTracks.size === newTracks.length ? 'Nenhuma' : 'Todas'}
                                </button>

                                <button
                                    onClick={smartImport}
                                    disabled={importing}
                                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg transition-all duration-200"
                                >
                                    {importing ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    Importar Selecionadas
                                </button>
                            </div>
                        </div>

                        {/* Lista de Novas Músicas */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {newTracks.map((track, index) => (
                                <div
                                    key={track.filename}
                                    className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${selectedTracks.has(track.filename)
                                            ? 'bg-blue-600/20 border-blue-500'
                                            : 'bg-[#333] border-[#444] hover:bg-[#3a3a3a]'
                                        }`}
                                    onClick={() => toggleTrackSelection(track.filename)}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Checkbox e Info Básica */}
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedTracks.has(track.filename)}
                                                onChange={() => toggleTrackSelection(track.filename)}
                                                className="w-4 h-4 text-blue-600 bg-[#333] border-gray-500 rounded focus:ring-blue-500"
                                            />
                                            <div className="p-2 bg-purple-600/20 rounded-lg">
                                                <Music className="h-4 w-4 text-purple-400" />
                                            </div>
                                        </div>

                                        {/* Informações da Música Local */}
                                        <div className="flex-1">
                                            <h4 className="font-medium text-white">
                                                {track.preview.title}
                                            </h4>
                                            <p className="text-sm text-gray-400">
                                                {track.preview.artist} • {track.preview.version}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(track.size / (1024 * 1024)).toFixed(1)} MB
                                            </p>
                                        </div>

                                        {/* Metadados do Spotify */}
                                        {track.spotifyMetadata ? (
                                            <div className="flex items-center gap-3">
                                                {track.spotifyMetadata.imageUrl && (
                                                    <img
                                                        src={track.spotifyMetadata.imageUrl}
                                                        alt="Album Cover"
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                )}
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2 text-green-400 text-sm">
                                                        <CheckCircle className="h-4 w-4" />
                                                        <span>Spotify Match</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400">
                                                        {track.spotifyMetadata.album}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Popularidade: {track.spotifyMetadata.popularity}%
                                                    </p>
                                                </div>
                                                <a
                                                    href={track.spotifyMetadata.spotifyUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <ExternalLink className="h-4 w-4 text-green-400" />
                                                </a>
                                            </div>
                                        ) : spotifyEnhanceEnabled ? (
                                            <div className="flex items-center gap-2 text-yellow-400 text-sm">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>Sem match no Spotify</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resultado da Importação */}
                {importResult && (
                    <div className={`p-6 rounded-xl border mb-6 ${importResult.success
                            ? 'bg-green-900/20 border-green-600'
                            : 'bg-red-900/20 border-red-600'
                        }`}>
                        <div className="flex items-center gap-3 mb-4">
                            {importResult.success ? (
                                <CheckCircle className="h-6 w-6 text-green-400" />
                            ) : (
                                <AlertCircle className="h-6 w-6 text-red-400" />
                            )}
                            <h3 className="text-lg font-bold text-white">
                                {importResult.success ? 'Importação Concluída!' : 'Erro na Importação'}
                            </h3>
                        </div>

                        <p className="text-gray-300 mb-4">{importResult.message}</p>

                        {importResult.success && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[#2a2a2a] p-4 rounded-lg">
                                    <p className="text-sm text-gray-400">Músicas Importadas</p>
                                    <p className="text-2xl font-bold text-green-400">
                                        {importResult.imported}
                                    </p>
                                </div>
                                <div className="bg-[#2a2a2a] p-4 rounded-lg">
                                    <p className="text-sm text-gray-400">Total Processadas</p>
                                    <p className="text-2xl font-bold text-white">
                                        {importResult.total}
                                    </p>
                                </div>
                                <div className="bg-[#2a2a2a] p-4 rounded-lg">
                                    <p className="text-sm text-gray-400">Total no Sistema</p>
                                    <p className="text-2xl font-bold text-blue-400">
                                        {importResult.statistics?.totalInDatabase || 0}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Explorador de Arquivos */}
                <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                                <FileAudio className="h-5 w-5 text-white" />
                            </div>
                            Explorador de Arquivos
                        </h2>

                        <div className="flex items-center gap-4">
                            <input
                                type="text"
                                placeholder="Buscar arquivos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-[#333] border border-[#444] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 w-64"
                            />
                            <button
                                onClick={loadFiles}
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-all duration-200"
                            >
                                {loading ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                                Atualizar
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
                            <p className="text-gray-400">Carregando arquivos...</p>
                        </div>
                    ) : audioFiles.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {audioFiles.map((file) => (
                                <div key={file.key} className="flex items-center justify-between p-3 bg-[#333] rounded-lg border border-[#444] hover:bg-[#3a3a3a] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Music className="h-4 w-4 text-blue-400" />
                                        <div>
                                            <p className="font-medium text-white">{file.filename}</p>
                                            <p className="text-sm text-gray-400">
                                                {(file.size / (1024 * 1024)).toFixed(1)} MB •
                                                {new Date(file.lastModified).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4 text-blue-400" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileAudio className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400">
                                {searchTerm ? 'Nenhum arquivo encontrado' : 'Clique em "Atualizar" para ver os arquivos'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
