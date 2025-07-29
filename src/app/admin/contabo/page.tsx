"use client";

import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Cloud,
    Download,
    File,
    Folder,
    HardDrive,
    Image as ImageIcon,
    Import,
    Loader2,
    Music,
    RefreshCw,
    Search,
    Trash2,
    Upload,
    Volume2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getAllStyleNames } from '@/lib/music-style-detector';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

interface StorageFile {
    key: string;
    url: string;
    size: number;
    lastModified: string;
    isAudio: boolean;
    filename: string;
}

interface ImportableFile {
    file: StorageFile;
    parsed: {
        artist: string;
        songName: string;
        version?: string;
        style?: string;
    };
    importData: {
        songName: string;
        artist: string;
        style: string;
        version?: string;
        imageUrl: string;
        previewUrl: string;
        downloadUrl: string;
        releaseDate: string;
    };
}

export default function ContaboStoragePage() {
    const { data: session, status } = useSession();
    const user = session?.user;
    const isLoaded = status !== 'loading';

    const [files, setFiles] = useState<StorageFile[]>([]);
    const [importableFiles, setImportableFiles] = useState<ImportableFile[]>([]);
    const [styleOptions, setStyleOptions] = useState<string[]>([]);
    const [versionOptions, setVersionOptions] = useState<string[]>(["Original", "Extended Mix", "Radio Edit", "Club Mix", "Vocal Mix", "Instrumental", "Dub Mix", "Remix", "VIP Mix", "Acoustic"]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [currentView, setCurrentView] = useState<'files' | 'import'>('files');

    if (isLoaded && !user) {
        redirect('/auth/sign-in');
    }


    useEffect(() => {
        loadFiles();
        setStyleOptions(getAllStyleNames());
    }, []);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/contabo/files?audioOnly=false');
            const data = await response.json();

            if (data.success) {
                setFiles(data.files);
                showMessage(`${data.files.length} arquivos carregados (${data.audioCount} áudios)`, 'success');
            } else {
                showMessage(data.error || 'Erro ao carregar arquivos', 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar arquivos:', error);
            showMessage('Erro de conexão com o storage', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadImportableFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/contabo/import');
            const data = await response.json();

            if (data.success) {
                setImportableFiles(data.files || []);
                showMessage(`${data.importableCount} arquivos prontos para importação`, 'success');
            } else {
                showMessage(data.error || 'Erro ao analisar arquivos', 'error');
            }
        } catch (error) {
            console.error('Erro ao analisar arquivos:', error);
            showMessage('Erro ao analisar arquivos para importação', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'music'); // Pasta padrão para músicas

            const response = await fetch('/api/contabo/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                showMessage('Arquivo enviado com sucesso!', 'success');
                loadFiles(); // Recarrega a lista
            } else {
                showMessage(data.error || 'Erro no upload', 'error');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            showMessage('Erro durante o upload', 'error');
        } finally {
            setUploading(false);
            // Reset input
            event.target.value = '';
        }
    };

    const importSelectedFiles = async () => {
        const filesToImport = importableFiles.filter(item => selectedFiles.includes(item.file.key));
        if (filesToImport.length === 0) {
            showMessage('Selecione pelo menos um arquivo para importar', 'error');
            return;
        }

        setImporting(true);
        try {
            const response = await fetch('/api/contabo/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    files: filesToImport
                })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(data.message, 'success');
                setImportableFiles([]); // Limpa a lista após importação
                setCurrentView('files'); // Volta para a lista de arquivos
                setSelectedFiles([]);
            } else {
                showMessage(data.error || 'Erro na importação', 'error');
            }
        } catch (error) {
            console.error('Erro na importação:', error);
            showMessage('Erro durante a importação', 'error');
        } finally {
            setImporting(false);
        }
    };

    const deleteFile = async (key: string) => {
        if (!confirm('Tem certeza que deseja deletar este arquivo?')) return;

        try {
            const response = await fetch(`/api/contabo/upload?key=${encodeURIComponent(key)}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                showMessage('Arquivo deletado com sucesso', 'success');
                loadFiles();
            } else {
                showMessage(data.error || 'Erro ao deletar', 'error');
            }
        } catch (error) {
            console.error('Erro ao deletar:', error);
            showMessage('Erro ao deletar arquivo', 'error');
        }
    };

    const showMessage = (msg: string, type: 'success' | 'error') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const formatFileSize = (bytes: number) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    const filteredFiles = files.filter(file =>
        file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.key.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const audioFiles = filteredFiles.filter(f => f.isAudio);
    const otherFiles = filteredFiles.filter(f => !f.isAudio);


    // Handler to update style for a specific importable file
    const handleStyleChange = (index: number, newStyle: string) => {
        setImportableFiles((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                importData: {
                    ...updated[index].importData,
                    style: newStyle
                }
            };
            return updated;
        });
    };

    // Handler to update version for a specific importable file
    const handleVersionChange = (index: number, newVersion: string) => {
        setImportableFiles((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                importData: {
                    ...updated[index].importData,
                    version: newVersion
                }
            };
            return updated;
        });
    };

    // Handler to add a new style to the dropdown
    const handleAddNewStyle = (newStyle: string) => {
        if (newStyle && !styleOptions.includes(newStyle)) {
            setStyleOptions((prev) => [...prev, newStyle]);
        }
    };

    // Handler to add a new version to the dropdown
    const handleAddNewVersion = (newVersion: string) => {
        if (newVersion && !versionOptions.includes(newVersion)) {
            setVersionOptions((prev) => [...prev, newVersion]);
        }
    };

    return (
        <div className="min-h-screen bg-[#202124] text-white">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-800 rounded-xl flex items-center justify-center">
                            <Cloud className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Contabo Object Storage</h1>
                            <p className="text-gray-400 mt-1">Gerencie arquivos de música no cloud</p>
                        </div>
                    </div>
                    <Link
                        href="/admin"
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        Voltar ao Admin
                    </Link>
                </div>

                {/* Message Alert */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${messageType === 'success'
                        ? 'bg-green-600/20 border border-green-600/30 text-green-400'
                        : 'bg-red-600/20 border border-red-600/30 text-red-400'
                        }`}>
                        {messageType === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        {message}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-600/20 rounded-lg">
                                <HardDrive className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Total de Arquivos</p>
                                <p className="text-2xl font-bold text-white">{files.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-600/20 rounded-lg">
                                <Volume2 className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Arquivos de Áudio</p>
                                <p className="text-2xl font-bold text-purple-400">{audioFiles.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-600/20 rounded-lg">
                                <ImageIcon className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Outros Arquivos</p>
                                <p className="text-2xl font-bold text-green-400">{otherFiles.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-600/20 rounded-lg">
                                <Import className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Prontos p/ Importação</p>
                                <p className="text-2xl font-bold text-orange-400">{importableFiles.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Upload */}
                        <div className="relative">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileUpload}
                                accept="audio/*,image/*"
                                disabled={uploading}
                            />
                            <label
                                htmlFor="file-upload"
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${uploading
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white`}
                            >
                                {uploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                                {uploading ? 'Enviando...' : 'Upload Arquivo'}
                            </label>
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={loadFiles}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Atualizar
                        </button>

                        {/* View Toggle */}
                        <div className="flex bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setCurrentView('files')}
                                className={`px-4 py-2 rounded-md transition-colors ${currentView === 'files'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:text-white'
                                    }`}
                            >
                                <File className="w-4 h-4 inline mr-2" />
                                Arquivos
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentView('import');
                                    if (importableFiles.length === 0) {
                                        loadImportableFiles();
                                    }
                                }}
                                className={`px-4 py-2 rounded-md transition-colors ${currentView === 'import'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-300 hover:text-white'
                                    }`}
                            >
                                <Import className="w-4 h-4 inline mr-2" />
                                Importar ({importableFiles.length})
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 max-w-md ml-auto">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar arquivos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                {currentView === 'files' ? (
                    /* Files View */
                    <div className="bg-gray-800 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Folder className="w-5 h-5 text-blue-300" />
                                Arquivos no Storage ({filteredFiles.length})
                            </h3>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
                                <p className="text-gray-400">Carregando arquivos...</p>
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            <div className="p-8 text-center">
                                <Cloud className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                                    {files.length === 0 ? 'Nenhum arquivo encontrado' : 'Nenhum resultado'}
                                </h3>
                                <p className="text-gray-500">
                                    {files.length === 0
                                        ? 'Faça upload de alguns arquivos para começar'
                                        : 'Tente ajustar sua busca'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-700">
                                {filteredFiles.map((file) => (
                                    <div key={file.key} className="p-4 hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`p-2 rounded-lg ${file.isAudio
                                                    ? 'bg-purple-600/20 text-purple-400'
                                                    : 'bg-gray-600/20 text-gray-400'
                                                    }`}>
                                                    {file.isAudio ? (
                                                        <Volume2 className="w-5 h-5" />
                                                    ) : (
                                                        <File className="w-5 h-5" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-white truncate">
                                                        {file.filename}
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                                        <span>{formatFileSize(file.size)}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(file.lastModified).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {file.isAudio && (
                                                    <button
                                                        onClick={() => window.open(file.url, '_blank')}
                                                        className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                                                        title="Ouvir prévia"
                                                    >
                                                        <Volume2 className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => window.open(file.url, '_blank')}
                                                    className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => deleteFile(file.key)}
                                                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                                                    title="Deletar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Import View */
                    <div className="bg-gray-800 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 bg-gray-700 border-b border-gray-600 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Import className="w-5 h-5 text-purple-300" />
                                Importar Músicas ({importableFiles.length})
                            </h3>

                            {importableFiles.length > 0 && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={importSelectedFiles}
                                        disabled={importing || selectedFiles.length === 0}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {importing ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Import className="w-4 h-4" />
                                        )}
                                        {importing ? 'Importando...' : `Importar (marcadas)`}
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Importar todas
                                            setSelectedFiles(importableFiles.map(f => f.file.key));
                                            setTimeout(importSelectedFiles, 0);
                                        }}
                                        disabled={importing}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Import className="w-4 h-4" />
                                        Importar Todas
                                    </button>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
                                <p className="text-gray-400">Analisando arquivos para importação...</p>
                            </div>
                        ) : importableFiles.length === 0 ? (
                            <div className="p-8 text-center">
                                <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                                    Nenhum arquivo para importar
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Todos os arquivos de áudio do storage já estão no banco de dados
                                </p>
                                <button
                                    onClick={loadImportableFiles}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Verificar Novamente
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-700">
                                {importableFiles.map((item, index) => (
                                    <div key={item.file.key} className="p-4 flex items-start gap-4">
                                        {/* Checkbox para seleção */}
                                        <input
                                            type="checkbox"
                                            className="mt-2 mr-2 w-5 h-5 accent-purple-600"
                                            checked={selectedFiles.includes(item.file.key)}
                                            onChange={e => {
                                                setSelectedFiles(prev =>
                                                    e.target.checked
                                                        ? [...prev, item.file.key]
                                                        : prev.filter(k => k !== item.file.key)
                                                );
                                            }}
                                        />
                                        <div className="p-2 bg-purple-600/20 rounded-lg">
                                            <Music className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium text-white mb-2">Arquivo Original</h4>
                                                    <p className="text-sm text-gray-300">{item.file.filename}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(item.file.size)} •
                                                        {new Date(item.file.lastModified).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-white mb-2">Dados Detectados</h4>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-500">Música:</span>
                                                            <input
                                                                type="text"
                                                                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white w-48"
                                                                value={item.importData.songName}
                                                                onChange={e => {
                                                                    const newName = e.target.value;
                                                                    setImportableFiles((prev) => {
                                                                        const updated = [...prev];
                                                                        updated[index] = {
                                                                            ...updated[index],
                                                                            importData: {
                                                                                ...updated[index].importData,
                                                                                songName: newName
                                                                            }
                                                                        };
                                                                        return updated;
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                        <p className="text-gray-300">
                                                            <span className="text-gray-500">Artista:</span> {item.parsed.artist}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-500">Versão:</span>
                                                            <select
                                                                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                                                                value={item.importData.version && item.importData.version !== "__new" ? item.importData.version : versionOptions[0]}
                                                                onChange={e => {
                                                                    if (e.target.value === "__new") {
                                                                        handleVersionChange(index, "__new");
                                                                    } else {
                                                                        handleVersionChange(index, e.target.value);
                                                                    }
                                                                }}
                                                            >
                                                                {versionOptions.map((ver) => (
                                                                    <option key={ver} value={ver}>{ver}</option>
                                                                ))}
                                                                <option value="__new">Adicionar novo...</option>
                                                            </select>
                                                            {item.importData.version === "__new" && (
                                                                <input
                                                                    type="text"
                                                                    className="ml-2 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                                                                    placeholder="Nova versão"
                                                                    autoFocus
                                                                    onBlur={e => {
                                                                        const val = e.target.value.trim();
                                                                        if (val) {
                                                                            handleAddNewVersion(val);
                                                                            handleVersionChange(index, val);
                                                                        } else {
                                                                            handleVersionChange(index, versionOptions[0] || "");
                                                                        }
                                                                    }}
                                                                    onKeyDown={e => {
                                                                        if (e.key === 'Enter') {
                                                                            const val = (e.target as HTMLInputElement).value.trim();
                                                                            if (val) {
                                                                                handleAddNewVersion(val);
                                                                                handleVersionChange(index, val);
                                                                                (e.target as HTMLInputElement).blur();
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-500">Estilo:</span>
                                                            <select
                                                                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                                                                value={item.importData.style && item.importData.style !== "__new" ? item.importData.style : styleOptions[0]}
                                                                onChange={e => {
                                                                    if (e.target.value === "__new") {
                                                                        handleStyleChange(index, "__new");
                                                                    } else {
                                                                        handleStyleChange(index, e.target.value);
                                                                    }
                                                                }}
                                                            >
                                                                {styleOptions.map((style) => (
                                                                    <option key={style} value={style}>{style}</option>
                                                                ))}
                                                                <option value="__new">Adicionar novo...</option>
                                                            </select>
                                                            {item.importData.style === "__new" && (
                                                                <input
                                                                    type="text"
                                                                    className="ml-2 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                                                                    placeholder="Novo estilo"
                                                                    autoFocus
                                                                    onBlur={e => {
                                                                        const val = e.target.value.trim();
                                                                        if (val) {
                                                                            handleAddNewStyle(val);
                                                                            handleStyleChange(index, val);
                                                                        } else {
                                                                            handleStyleChange(index, styleOptions[0] || "Club");
                                                                        }
                                                                    }}
                                                                    onKeyDown={e => {
                                                                        if (e.key === 'Enter') {
                                                                            const val = (e.target as HTMLInputElement).value.trim();
                                                                            if (val) {
                                                                                handleAddNewStyle(val);
                                                                                handleStyleChange(index, val);
                                                                                (e.target as HTMLInputElement).blur();
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
