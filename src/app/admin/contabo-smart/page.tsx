// Clean, single copy of the smart import page (from page_new.tsx)
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
    Zap,
    Trash2
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

    // Carrega arquivos do storage e detecta novas músicas
    const loadFiles = async () => {
        setLoading(true);
        setDetectionResult(null);
        setNewTracks([]);
        try {
            const response = await fetch('/api/contabo/detect-new');
            const data = await response.json();
            if (data.success) {
                setFiles(data.allFiles || []);
                setDetectionResult(data);
                setNewTracks(data.newTracks || []);
            } else {
                alert(data.error || 'Erro ao detectar novas músicas');
            }
        } catch (err) {
            alert('Erro ao buscar arquivos do storage');
        } finally {
            setLoading(false);
        }
    };

    // Importa as músicas novas usando a API smart-import
    const smartImport = async () => {
        if (newTracks.length === 0) return;
        setImporting(true);
        setImportResult(null);
        try {
            const dateToSend = importDate === 'custom' ? customDate : undefined;
            const response = await fetch('/api/contabo/smart-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tracks: newTracks,
                    importDate: dateToSend,
                    useSpotifyMetadata: spotifyEnhanceEnabled
                })
            });
            const data = await response.json();
            setImportResult(data);
            if (data.success) {
                setNewTracks([]);
                loadFiles();
            }
        } catch (err) {
            alert('Erro ao importar músicas');
        } finally {
            setImporting(false);
        }
    };

    // Filtro de busca
    const filteredFiles = files.filter(f =>
        f.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Carregar arquivos ao montar
    useEffect(() => {
        loadFiles();
    }, []);


    return (
        <div>
            <div>
                <select
                    value={importDate}
                    onChange={(e) => setImportDate(e.target.value)}
                    className="border border-gray-600 rounded px-2 py-1 text-sm bg-[#181818] text-white"
                >
                    <option value="current">Data Atual</option>
                    <option value="custom">Data Personalizada</option>
                </select>
                {importDate === 'custom' && (
                    <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="border border-gray-600 rounded px-2 py-1 text-sm ml-2 bg-[#181818] text-white"
                    />
                )}
                <button
                    onClick={smartImport}
                    disabled={importing || newTracks.length === 0}
                    className="bg-gradient-to-r from-purple-700 to-pink-700 text-white px-6 py-2 rounded-lg hover:from-purple-800 hover:to-pink-800 disabled:opacity-50 flex items-center gap-2"
                >
                    {importing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                        <Brain className="h-4 w-4" />
                    )}
                    Importar {newTracks.length} Músicas
                </button>
            </div>
            {/* Preview das novas músicas */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {newTracks.map((track, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#222] rounded-lg">
                        <div className="flex items-center gap-3">
                            <Music className="h-5 w-5 text-blue-400" />
                            <div>
                                <p className="font-medium text-white">
                                    {track.preview.artist} - {track.preview.title}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {track.preview.version} • {(track.size / 1024 / 1024).toFixed(1)} MB
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-400">
                            {track.filename}
                        </div>
                    </div>
                ))}
            </div>
            {/* Resultado da Importação */}
            {importResult && (
                <div className={`rounded-lg p-6 mb-6 border ${importResult.success
                    ? 'bg-green-900 border-green-700'
                    : 'bg-red-900 border-red-700'
                    }`}>
                    <div className="flex items-center gap-2 mb-3">
                        {importResult.success ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-400" />
                        )}
                        <h3 className={`font-medium ${importResult.success ? 'text-green-200' : 'text-red-200'}`}>{importResult.message}</h3>
                    </div>
                    {importResult.success && importResult.statistics && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <p className="text-sm text-green-200">
                                    <strong>Importadas:</strong> {importResult.imported} músicas
                                </p>
                                <p className="text-sm text-green-200">
                                    <strong>Total no banco:</strong> {importResult.statistics.totalInDatabase}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-green-200 mb-2">
                                    <strong>Por estilo:</strong>
                                </p>
                                <div className="space-y-1">
                                    {importResult.statistics.byStyle.map((style: { style: string; _count: number }) => (
                                        <div key={style.style} className="flex justify-between text-xs text-green-200">
                                            <span>{style.style}</span>
                                            <span>{style._count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* Arquivos no Storage */}
            <div className="bg-[#232323] rounded-lg shadow-sm p-6 border border-[#333]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Arquivos no Storage</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Pesquisar arquivos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#181818] text-white"
                            />
                        </div>
                        <button
                            onClick={loadFiles}
                            disabled={loading}
                            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
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
                {/* Lista de arquivos */}
                <div className="space-y-2">
                    {filteredFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 hover:bg-[#222] rounded-lg">
                            <div className="flex items-center gap-3">
                                {file.isAudio ? (
                                    <Music className="h-5 w-5 text-blue-400" />
                                ) : (
                                    <FileAudio className="h-5 w-5 text-gray-400" />
                                )}
                                <div>
                                    <p className="font-medium text-white">{file.filename}</p>
                                    <p className="text-sm text-gray-400">
                                        {(file.size / 1024 / 1024).toFixed(1)} MB •
                                        {new Date(file.lastModified).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="p-2 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 shadow-lg"
                                    title="Baixar arquivo"
                                    onClick={async () => {
                                        // Download forçado sem abrir nova aba
                                        try {
                                            const response = await fetch(file.url);
                                            const blob = await response.blob();
                                            const link = document.createElement('a');
                                            link.href = window.URL.createObjectURL(blob);
                                            link.download = file.filename;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        } catch (err) {
                                            alert('Erro ao baixar arquivo!');
                                        }
                                    }}
                                >
                                    <Download className="h-5 w-5 text-white drop-shadow" />
                                </button>
                                <button
                                    className="p-2 rounded-full bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 shadow-lg"
                                    title="Excluir arquivo"
                                    onClick={async () => {
                                        if (!window.confirm(`Excluir o arquivo "${file.filename}" do Storage?`)) return;
                                        try {
                                            const res = await fetch('/api/contabo/delete', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ key: file.key })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                alert('Arquivo excluído com sucesso!');
                                                loadFiles();
                                            } else {
                                                alert('Erro ao excluir arquivo: ' + (data.error || 'Erro desconhecido'));
                                            }
                                        } catch (err) {
                                            alert('Erro ao excluir arquivo!');
                                        }
                                    }}
                                >
                                    <Trash2 className="h-5 w-5 text-white drop-shadow" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredFiles.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        <FileAudio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum arquivo encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
}
