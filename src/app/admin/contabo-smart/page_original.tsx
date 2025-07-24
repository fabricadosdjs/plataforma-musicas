'use client';

import {
    AlertCircle,
    Brain,
    CheckCircle, Clock,
    Database,
    Download,
    FileAudio,
    Music,
    Plus,
    RefreshCw,
    Search,
    Trash2,
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
                setNewTracks(result.newTracks);
            }
        } catch (error) {
            console.error('Erro ao detectar novos arquivos:', error);
        } finally {
            setDetecting(false);
        }
    };

    const smartImport = async () => {
        setImporting(true);
        setImportResult(null);

        try {
            const response = await fetch('/api/contabo/smart-import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    importDate: importDate === 'current' ? new Date().toISOString() : new Date(customDate).toISOString()
                })
            });

            const result: ImportResult = await response.json();
            setImportResult(result);

            if (result.success) {
                // Atualizar detecção após importação bem-sucedida
                setTimeout(() => {
                    detectNewFiles();
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Brain className="h-8 w-8 text-purple-600" />
                                Importação Inteligente
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Detecta e importa músicas automaticamente do Contabo Storage
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={autoDetectEnabled}
                                    onChange={(e) => setAutoDetectEnabled(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                Auto-detectar
                            </label>

                            <button
                                onClick={detectNewFiles}
                                disabled={detecting}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {detecting ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                                Procurar Novos
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total no Storage</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {detectionResult?.totalFiles || 0}
                                </p>
                            </div>
                            <FileAudio className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Já no Banco</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {detectionResult?.existingFiles || 0}
                                </p>
                            </div>
                            <Database className="h-8 w-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Novos Arquivos</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {detectionResult?.newFiles || 0}
                                </p>
                            </div>
                            <Plus className="h-8 w-8 text-orange-600" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Última Atualização</p>
                                <p className="text-sm text-gray-900">
                                    {detectionResult?.lastUpdate
                                        ? new Date(detectionResult.lastUpdate).toLocaleTimeString()
                                        : 'Nunca'
                                    }
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Importação Inteligente */}
                {newTracks.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                Importação Inteligente
                            </h2>

                            <div className="flex items-center gap-4">
                                {/* Seleção de Data */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">Data:</label>
                                    <select
                                        value={importDate}
                                        onChange={(e) => setImportDate(e.target.value)}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    >
                                        <option value="current">Data Atual</option>
                                        <option value="custom">Data Personalizada</option>
                                    </select>

                                    {importDate === 'custom' && (
                                        <input
                                            type="date"
                                            value={customDate}
                                            onChange={(e) => setCustomDate(e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 text-sm ml-2"
                                        />
                                    )}
                                </div>

                                <button
                                    onClick={smartImport}
                                    disabled={importing || newTracks.length === 0}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {importing ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Brain className="h-4 w-4" />
                                    )}
                                    Importar {newTracks.length} Músicas
                                </button>
                            </div>
                        </div>

                        {/* Preview das novas músicas */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {newTracks.map((track, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Music className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {track.preview.artist} - {track.preview.title}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {track.preview.version} • {(track.size / 1024 / 1024).toFixed(1)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {track.filename}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resultado da Importação */}
                {importResult && (
                    <div className={`rounded-lg p-6 mb-6 ${importResult.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                        }`}>
                        <div className="flex items-center gap-2 mb-3">
                            {importResult.success ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                            <h3 className={`font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {importResult.message}
                            </h3>
                        </div>

                        {importResult.success && importResult.statistics && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <p className="text-sm text-green-700">
                                        <strong>Importadas:</strong> {importResult.imported} músicas
                                    </p>
                                    <p className="text-sm text-green-700">
                                        <strong>Total no banco:</strong> {importResult.statistics.totalInDatabase}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-green-700 mb-2">
                                        <strong>Por estilo:</strong>
                                    </p>
                                    <div className="space-y-1">
                                        {importResult.statistics.byStyle.map((style) => (
                                            <div key={style.style} className="flex justify-between text-xs text-green-600">
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
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Arquivos no Storage</h2>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar arquivos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={loadFiles}
                                disabled={loading}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
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
                            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {file.isAudio ? (
                                        <Music className="h-5 w-5 text-blue-600" />
                                    ) : (
                                        <FileAudio className="h-5 w-5 text-gray-400" />
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">{file.filename}</p>
                                        <p className="text-sm text-gray-600">
                                            {(file.size / 1024 / 1024).toFixed(1)} MB •
                                            {new Date(file.lastModified).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg">
                                        <Download className="h-4 w-4" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-red-600 rounded-lg">
                                        <Trash2 className="h-4 w-4" />
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
        </div>
    );
}
