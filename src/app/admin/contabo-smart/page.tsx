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
    X
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
    selected?: boolean;
    customTitle?: string;
    customVersion?: string;
    customDate?: string;
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

    // Funções para seleção múltipla
    const toggleSelectAll = () => {
        const newAllSelected = !allSelected;
        setAllSelected(newAllSelected);
        setNewTracks(prev => prev.map(track => ({ ...track, selected: newAllSelected })));
    };

    const toggleTrackSelection = (index: number) => {
        setNewTracks(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], selected: !updated[index].selected };

            // Verificar se todos estão selecionados
            const allNowSelected = updated.every(track => track.selected);
            setAllSelected(allNowSelected);

            return updated;
        });
    };

    // Função para copiar todas as músicas selecionadas
    const copySelectedTracks = async () => {
        const selectedTracks = newTracks.filter(track => track.selected);
        if (selectedTracks.length === 0) return;

        const tracksText = selectedTracks.map(track => {
            const title = track.customTitle || `${track.preview.artist} - ${track.preview.title}`;
            const version = track.customVersion || track.preview.version;
            return `${title} (${version})\n${track.url}`;
        }).join('\n\n');

        try {
            await navigator.clipboard.writeText(tracksText);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('Erro ao copiar:', error);
        }
    };

    // Função para salvar edições de uma música
    const saveTrackEdit = (index: number) => {
        setEditingTrack(null);
        // Aqui você pode adicionar lógica para salvar no backend se necessário
    };

    // Função para personalizar data
    const updateTrackField = (index: number, field: string, value: string) => {
        setNewTracks(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    return (
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
                                onClick={detectNewFiles}
                                disabled={detecting}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 flex items-center gap-3 shadow-xl font-semibold transition-all"
                            >
                                {detecting ? (
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Search className="h-5 w-5" />
                                )}
                                Procurar Novos
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-blue-300 mb-2">Total no Storage</p>
                                <p className="text-3xl font-bold text-white">
                                    {detectionResult?.totalFiles || 0}
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                <FileAudio className="h-8 w-8 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-green-300 mb-2">Já no Banco</p>
                                <p className="text-3xl font-bold text-white">
                                    {detectionResult?.existingFiles || 0}
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                                <Database className="h-8 w-8 text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-orange-300 mb-2">Novos Arquivos</p>
                                <p className="text-3xl font-bold text-white">
                                    {detectionResult?.newFiles || 0}
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                                <Plus className="h-8 w-8 text-orange-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-purple-300 mb-2">Última Atualização</p>
                                <p className="text-sm font-medium text-white">
                                    {detectionResult?.lastUpdate
                                        ? new Date(detectionResult.lastUpdate).toLocaleTimeString('pt-BR')
                                        : 'Nunca'
                                    }
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                                <Clock className="h-8 w-8 text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Importação Inteligente */}
                {newTracks.length > 0 && (
                    <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8 border border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                Importação Inteligente
                            </h2>

                            <div className="flex items-center gap-4 flex-wrap">
                                {/* Controles de Seleção */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 font-semibold shadow-lg transition-all"
                                    >
                                        {/* Ícone substituto para SelectAll */}
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                                            <path d="M9 12l2 2l4 -4" stroke="currentColor" strokeWidth="2" fill="none" />
                                        </svg>
                                        {allSelected ? 'Desmarcar Todas' : 'Selecionar Todas'}
                                    </button>

                                    <button
                                        onClick={copySelectedTracks}
                                        disabled={!newTracks.some(track => track.selected)}
                                        className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-teal-700 disabled:opacity-50 flex items-center gap-2 font-semibold shadow-lg transition-all"
                                    >
                                        {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copySuccess ? 'Copiado!' : 'Copiar Selecionadas'}
                                    </button>
                                </div>

                                {/* Seleção de Data */}
                                <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <label className="text-sm font-medium text-white">Data:</label>
                                    <select
                                        value={importDate}
                                        onChange={(e) => setImportDate(e.target.value)}
                                        className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-sm text-white focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="current">Data Atual</option>
                                        <option value="custom">Data Personalizada</option>
                                    </select>

                                    {importDate === 'custom' && (
                                        <input
                                            type="date"
                                            value={customDate}
                                            onChange={(e) => setCustomDate(e.target.value)}
                                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-sm text-white focus:ring-2 focus:ring-purple-500"
                                        />
                                    )}
                                </div>

                                <button
                                    onClick={smartImport}
                                    disabled={importing || newTracks.length === 0}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-3 font-bold shadow-2xl transition-all"
                                >
                                    {importing ? (
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Brain className="h-5 w-5" />
                                    )}
                                    Importar {newTracks.filter(track => track.selected !== false).length} Músicas
                                </button>
                            </div>
                        </div>

                        {/* Preview das novas músicas com funcionalidades avançadas */}
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
                            {newTracks.map((track, index) => (
                                <div key={index} className={`p-6 rounded-2xl border transition-all duration-300 ${track.selected
                                    ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 shadow-lg'
                                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                    }`}>
                                    <div className="flex items-start gap-4">
                                        {/* Checkbox de seleção */}
                                        <input
                                            type="checkbox"
                                            checked={track.selected || false}
                                            onChange={() => toggleTrackSelection(index)}
                                            className="mt-2 w-5 h-5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                                        />

                                        {/* Ícone da música */}
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Music className="h-6 w-6 text-white" />
                                        </div>

                                        {/* Informações da música */}
                                        <div className="flex-1 min-w-0">
                                            {editingTrack === index ? (
                                                // Modo de edição
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">Título Personalizado</label>
                                                            <input
                                                                type="text"
                                                                value={track.customTitle || `${track.preview.artist} - ${track.preview.title}`}
                                                                onChange={(e) => updateTrackField(index, 'customTitle', e.target.value)}
                                                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
                                                                placeholder="Título personalizado"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">Versão Personalizada</label>
                                                            <input
                                                                type="text"
                                                                value={track.customVersion || track.preview.version}
                                                                onChange={(e) => updateTrackField(index, 'customVersion', e.target.value)}
                                                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
                                                                placeholder="Versão personalizada"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">Data de Postagem</label>
                                                            <input
                                                                type="date"
                                                                value={track.customDate || customDate}
                                                                onChange={(e) => updateTrackField(index, 'customDate', e.target.value)}
                                                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => saveTrackEdit(index)}
                                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold"
                                                        >
                                                            <Save className="h-4 w-4" />
                                                            Salvar
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingTrack(null)}
                                                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 font-semibold"
                                                        >
                                                            <X className="h-4 w-4" />
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Modo de visualização
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-bold text-white text-lg">
                                                            {track.customTitle || `${track.preview.artist} - ${track.preview.title}`}
                                                        </h3>
                                                        <button
                                                            onClick={() => setEditingTrack(index)}
                                                            className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-300 mb-2 font-medium">
                                                        {track.customVersion || track.preview.version}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                                        <span className="bg-gray-700/50 px-3 py-1 rounded-full">
                                                            {(track.size / 1024 / 1024).toFixed(1)} MB
                                                        </span>
                                                        <span className="bg-gray-700/50 px-3 py-1 rounded-full">
                                                            {track.filename}
                                                        </span>
                                                        {track.customDate && (
                                                            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                                                                {new Date(track.customDate).toLocaleDateString('pt-BR')}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Link da música */}
                                                    {showLinks && (
                                                        <div className="bg-gray-800/80 rounded-lg p-3 mt-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Link className="h-4 w-4 text-blue-400" />
                                                                <span className="text-sm font-medium text-gray-300">Link do arquivo:</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <code className="flex-1 text-xs bg-gray-900 text-blue-300 p-2 rounded border break-all">
                                                                    {track.url}
                                                                </code>
                                                                <button
                                                                    onClick={() => navigator.clipboard.writeText(track.url)}
                                                                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                                                                >
                                                                    <Copy className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resultado da Importação */}
                {importResult && (
                    <div className={`rounded-2xl p-6 mb-8 border shadow-2xl ${importResult.success
                        ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30'
                        : 'bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/30'
                        }`}>
                        <div className="flex items-center gap-3 mb-4">
                            {importResult.success ? (
                                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-red-400" />
                                </div>
                            )}
                            <h3 className={`font-bold text-lg ${importResult.success ? 'text-green-300' : 'text-red-300'
                                }`}>
                                {importResult.message}
                            </h3>
                        </div>

                        {importResult.success && importResult.statistics && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                                    <h4 className="font-bold text-green-300 mb-3">Estatísticas da Importação</h4>
                                    <div className="space-y-2">
                                        <p className="text-green-200">
                                            <strong>Importadas:</strong> {importResult.imported} músicas
                                        </p>
                                        <p className="text-green-200">
                                            <strong>Total no banco:</strong> {importResult.statistics.totalInDatabase}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                                    <h4 className="font-bold text-green-300 mb-3">Por Estilo Musical</h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {importResult.statistics.byStyle.map((style) => (
                                            <div key={style.style} className="flex justify-between text-sm bg-green-500/5 px-3 py-1 rounded-lg">
                                                <span className="text-green-200">{style.style}</span>
                                                <span className="text-green-300 font-semibold">{style._count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Arquivos no Storage */}
                <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-800">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center">
                                <Database className="h-6 w-6 text-white" />
                            </div>
                            Arquivos no Storage
                        </h2>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar arquivos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 min-w-80"
                                />
                            </div>

                            <button
                                onClick={loadFiles}
                                disabled={loading}
                                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 flex items-center gap-3 font-semibold shadow-lg transition-all"
                            >
                                {loading ? (
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-5 w-5" />
                                )}
                                Atualizar
                            </button>
                        </div>
                    </div>

                    {/* Lista de arquivos */}
                    <div className="space-y-4">
                        {filteredFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-6 bg-gray-800/50 border border-gray-700 hover:bg-gray-800 rounded-2xl transition-all duration-200">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${file.isAudio
                                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                        : 'bg-gradient-to-br from-gray-500 to-gray-600'
                                        }`}>
                                        {file.isAudio ? (
                                            <Music className="h-6 w-6 text-white" />
                                        ) : (
                                            <FileAudio className="h-6 w-6 text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white text-lg">{file.filename}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-sm text-gray-300 bg-gray-700/50 px-3 py-1 rounded-full">
                                                {(file.size / 1024 / 1024).toFixed(1)} MB
                                            </span>
                                            <span className="text-sm text-gray-300 bg-gray-700/50 px-3 py-1 rounded-full">
                                                {new Date(file.lastModified).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>

                                        {/* Link do arquivo */}
                                        {showLinks && (
                                            <div className="mt-3 bg-gray-800/80 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <code className="flex-1 text-xs bg-gray-900 text-blue-300 p-2 rounded border break-all">
                                                        {file.url}
                                                    </code>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(file.url)}
                                                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
                                        <Download className="h-5 w-5" />
                                    </button>
                                    <button className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredFiles.length === 0 && !loading && (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileAudio className="h-10 w-10 text-gray-500" />
                            </div>
                            <p className="text-gray-400 text-lg font-medium">Nenhum arquivo encontrado</p>
                            <p className="text-gray-500 text-sm mt-2">Tente ajustar sua pesquisa ou carregue os arquivos</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
