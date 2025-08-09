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
    const [currentView, setCurrentView] = useState<'files' | 'import' | 'duplicates'>('files');

    // Estados de paginação para a aba de importação
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(50);

    // Estados para gerenciamento de pastas
    const [folders, setFolders] = useState<string[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [showFolderSelector, setShowFolderSelector] = useState(false);

    // Estados para detector de duplicatas
    const [duplicateGroups, setDuplicateGroups] = useState<any[]>([]);
    const [selectedDuplicates, setSelectedDuplicates] = useState<string[]>([]);
    const [detectingDuplicates, setDetectingDuplicates] = useState(false);
    const [deletingDuplicates, setDeletingDuplicates] = useState(false);
    const [duplicateStats, setDuplicateStats] = useState<any>(null);

    // Estados para arquivos existentes no banco de dados
    const [existingFiles, setExistingFiles] = useState<any[]>([]);
    const [selectedExistingFiles, setSelectedExistingFiles] = useState<string[]>([]);
    const [detectingExisting, setDetectingExisting] = useState(false);
    const [deletingExisting, setDeletingExisting] = useState(false);
    const [existingStats, setExistingStats] = useState<any>(null);

    if (isLoaded && !user) {
        redirect('/auth/sign-in');
    }


    useEffect(() => {
        loadFiles();
        setStyleOptions(getAllStyleNames());
    }, []);

    // Carrega automaticamente os arquivos importáveis quando a página é acessada
    useEffect(() => {
        loadImportableFiles();
    }, []);

    // Reset da página quando a lista de músicas importáveis muda
    useEffect(() => {
        if (currentView === 'import') {
            setCurrentPage(0);
        }
    }, [importableFiles.length, currentView]);

    // Carrega as pastas quando a aba de importação é acessada
    useEffect(() => {
        if (currentView === 'import' && folders.length === 0) {
            loadFolders();
        }
    }, [currentView, folders.length]);

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

    const loadImportableFiles = async (folder?: string) => {
        setLoading(true);
        try {
            const url = folder
                ? `/api/contabo/import?prefix=${encodeURIComponent(folder)}`
                : '/api/contabo/import';

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setImportableFiles(data.files || []);
                showMessage(`${data.importableCount} arquivos prontos para importação`, 'success');

                // Automaticamente detecta arquivos existentes após carregar importáveis
                await detectExistingFiles();
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

    const handleLoadImportableFiles = () => {
        loadImportableFiles();
    };

    const loadFolders = async () => {
        try {
            const response = await fetch('/api/contabo/files?audioOnly=false');
            const data = await response.json();

            if (data.success) {
                // Extrai pastas únicas dos arquivos
                const folderSet = new Set<string>();
                data.files.forEach((file: StorageFile) => {
                    const pathParts = file.key.split('/');
                    if (pathParts.length > 1) {
                        // Remove o nome do arquivo, mantém apenas o caminho
                        const folderPath = pathParts.slice(0, -1).join('/');
                        if (folderPath) {
                            folderSet.add(folderPath);
                        }
                    }
                });

                const folderList = Array.from(folderSet).sort();
                setFolders(folderList);
            }
        } catch (error) {
            console.error('Erro ao carregar pastas:', error);
        }
    };

    const selectFolder = async (folder: string) => {
        setSelectedFolder(folder);
        setShowFolderSelector(false);
        await loadImportableFiles(folder);
        setCurrentPage(0); // Reset para primeira página
    };

    const handleSelectFolder = (folder: string) => () => {
        selectFolder(folder);
    };

    const selectAllFromFolder = () => {
        if (selectedFolder) {
            const folderFiles = importableFiles.filter(item =>
                item.file.key.startsWith(selectedFolder + '/')
            );
            const folderFileKeys = folderFiles.map(item => item.file.key);
            setSelectedFiles(folderFileKeys);
        }
    };

    const clearFolderSelection = async () => {
        setSelectedFolder('');
        await loadImportableFiles();
        setCurrentPage(0);
    };

    const handleClearFolderSelection = () => {
        clearFolderSelection();
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

                // Remove as músicas importadas da lista
                const remainingFiles = importableFiles.filter(item => !selectedFiles.includes(item.file.key));
                setImportableFiles(remainingFiles);

                // Ajusta a página atual se necessário
                const totalPages = Math.ceil(remainingFiles.length / itemsPerPage);
                if (currentPage >= totalPages && totalPages > 0) {
                    setCurrentPage(Math.max(0, totalPages - 1));
                }

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
                // Se estamos na aba de importação, também recarrega os arquivos importáveis
                if (currentView === 'import') {
                    loadImportableFiles(selectedFolder);
                }
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

    // Funções para detector de duplicatas
    const detectDuplicates = async () => {
        setDetectingDuplicates(true);
        try {
            const response = await fetch('/api/contabo/detect-duplicates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                setDuplicateGroups(data.duplicates || []);
                setDuplicateStats(data.summary);
                showMessage(`Encontradas ${data.duplicateGroups} grupos de duplicatas (${data.totalDuplicates} arquivos)`, 'success');
            } else {
                showMessage(data.error || 'Erro ao detectar duplicatas', 'error');
            }
        } catch (error) {
            console.error('Erro ao detectar duplicatas:', error);
            showMessage('Erro ao detectar duplicatas', 'error');
        } finally {
            setDetectingDuplicates(false);
        }
    };

    const toggleDuplicateSelection = (fileKey: string) => {
        setSelectedDuplicates(prev =>
            prev.includes(fileKey)
                ? prev.filter(key => key !== fileKey)
                : [...prev, fileKey]
        );
    };

    const selectAllDuplicates = () => {
        const allDuplicateKeys = duplicateGroups.flatMap(group =>
            group.files.slice(1).map((file: any) => file.key) // Manter o primeiro arquivo de cada grupo
        );
        setSelectedDuplicates(allDuplicateKeys);
    };

    const clearDuplicateSelection = () => {
        setSelectedDuplicates([]);
    };

    const deleteSelectedDuplicates = async () => {
        if (selectedDuplicates.length === 0) {
            showMessage('Nenhuma duplicata selecionada', 'error');
            return;
        }

        console.log('🗑️ Iniciando exclusão de duplicatas selecionadas:', selectedDuplicates);

        setDeletingDuplicates(true);
        try {
            const requestBody = {
                filesToDelete: selectedDuplicates
            };

            console.log('📤 Enviando requisição para API:', requestBody);

            const response = await fetch('/api/contabo/delete-duplicates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            console.log('📥 Resposta da API:', data);

            if (data.success) {
                showMessage(data.message, 'success');
                setSelectedDuplicates([]);
                // Recarregar duplicatas para atualizar a lista
                await detectDuplicates();
            } else {
                showMessage(data.error || 'Erro ao excluir duplicatas', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir duplicatas:', error);
            showMessage('Erro ao excluir duplicatas', 'error');
        } finally {
            setDeletingDuplicates(false);
        }
    };

    // Funções para detectar e gerenciar arquivos existentes no banco de dados
    const detectExistingFiles = async () => {
        setDetectingExisting(true);
        try {
            const url = selectedFolder
                ? `/api/contabo/detect-existing?prefix=${encodeURIComponent(selectedFolder)}`
                : '/api/contabo/detect-existing';

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setExistingFiles(data.existingFiles || []);
                setExistingStats({
                    totalFiles: data.totalFiles,
                    existingCount: data.existingCount
                });
                showMessage(`${data.existingCount} arquivos já existem no banco de dados`, 'success');
            } else {
                showMessage(data.error || 'Erro ao detectar arquivos existentes', 'error');
            }
        } catch (error) {
            console.error('Erro ao detectar arquivos existentes:', error);
            showMessage('Erro ao detectar arquivos existentes', 'error');
        } finally {
            setDetectingExisting(false);
        }
    };

    const toggleExistingFileSelection = (fileKey: string) => {
        setSelectedExistingFiles(prev =>
            prev.includes(fileKey)
                ? prev.filter(key => key !== fileKey)
                : [...prev, fileKey]
        );
    };

    const selectAllExistingFiles = () => {
        const allExistingKeys = existingFiles.map(file => file.file.key);
        setSelectedExistingFiles(allExistingKeys);
    };

    const clearExistingFileSelection = () => {
        setSelectedExistingFiles([]);
    };

    const deleteSelectedExistingFiles = async () => {
        if (selectedExistingFiles.length === 0) {
            showMessage('Nenhum arquivo existente selecionado', 'error');
            return;
        }

        console.log('🗑️ Iniciando exclusão de arquivos existentes selecionados:', selectedExistingFiles);

        setDeletingExisting(true);
        try {
            const requestBody = {
                filesToDelete: selectedExistingFiles
            };

            console.log('📤 Enviando requisição para API:', requestBody);

            const response = await fetch('/api/contabo/delete-duplicates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            console.log('📥 Resposta da API:', data);

            if (data.success) {
                showMessage(data.message, 'success');
                setSelectedExistingFiles([]);
                // Recarregar arquivos existentes para atualizar a lista
                await detectExistingFiles();
            } else {
                showMessage(data.error || 'Erro ao excluir arquivos existentes', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir arquivos existentes:', error);
            showMessage('Erro ao excluir arquivos existentes', 'error');
        } finally {
            setDeletingExisting(false);
        }
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
                                    setCurrentPage(0); // Reset para primeira página
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
                            <button
                                onClick={() => {
                                    setCurrentView('duplicates');
                                    if (duplicateGroups.length === 0) {
                                        detectDuplicates();
                                    }
                                }}
                                className={`px-4 py-2 rounded-md transition-colors ${currentView === 'duplicates'
                                    ? 'bg-red-600 text-white'
                                    : 'text-gray-300 hover:text-white'
                                    }`}
                            >
                                <Trash2 className="w-4 h-4 inline mr-2" />
                                Duplicatas ({duplicateGroups.length})
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
                {(() => {
                    if (currentView === 'files') {
                        return (
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
                        );
                    } else if (currentView === 'import') {
                        return (
                            /* Import View */
                            <div className="bg-gray-800 rounded-xl overflow-hidden">
                                <div className="px-6 py-4 bg-gray-700 border-b border-gray-600 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Import className="w-5 h-5 text-purple-300" />
                                        Importar Músicas ({importableFiles.length})
                                        {selectedFolder && (
                                            <span className="text-sm text-purple-400 ml-2">
                                                - Pasta: {selectedFolder}
                                            </span>
                                        )}
                                    </h3>

                                    <div className="flex gap-2 flex-wrap items-center">
                                        {/* Seletor de Pasta */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowFolderSelector(!showFolderSelector)}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors border border-gray-600"
                                            >
                                                <Folder className="w-4 h-4" />
                                                {selectedFolder ? 'Trocar Pasta' : 'Selecionar Pasta'}
                                            </button>

                                            {showFolderSelector && (
                                                <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto min-w-64">
                                                    <div className="p-2">
                                                        <button
                                                            onClick={handleClearFolderSelection}
                                                            className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-white text-sm"
                                                        >
                                                            📁 Todas as Pastas
                                                        </button>
                                                        <div className="border-t border-gray-600 my-1"></div>
                                                        {folders.map((folder) => (
                                                            <button
                                                                key={folder}
                                                                onClick={handleSelectFolder(folder)}
                                                                className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-white text-sm"
                                                            >
                                                                📁 {folder}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Selecionar Todas da Pasta */}
                                        {selectedFolder && (
                                            <button
                                                onClick={selectAllFromFolder}
                                                disabled={importing}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Folder className="w-4 h-4" />
                                                Selecionar Todas da Pasta
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                // Calcula os itens da página atual
                                                const startIndex = currentPage * itemsPerPage;
                                                const endIndex = startIndex + itemsPerPage;
                                                const currentPageItems = importableFiles.slice(startIndex, endIndex);
                                                const currentPageKeys = currentPageItems.map(f => f.file.key);

                                                // Verifica se todas as músicas da página atual estão selecionadas
                                                const allCurrentPageSelected = currentPageKeys.every(key => selectedFiles.includes(key));

                                                if (allCurrentPageSelected) {
                                                    // Desmarca todas as músicas da página atual
                                                    setSelectedFiles(prev => prev.filter(key => !currentPageKeys.includes(key)));
                                                } else {
                                                    // Marca todas as músicas da página atual (mantendo as já selecionadas)
                                                    setSelectedFiles(prev => {
                                                        const newSelection = [...prev];
                                                        currentPageKeys.forEach(key => {
                                                            if (!newSelection.includes(key)) {
                                                                newSelection.push(key);
                                                            }
                                                        });
                                                        return newSelection;
                                                    });
                                                }
                                            }}
                                            disabled={importing}
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors disabled:opacity-50 border border-gray-600"
                                            title="Marcar/Desmarcar todas as músicas da página atual"
                                        >
                                            Marcar Página Atual
                                        </button>
                                        <button
                                            onClick={() => setSelectedFiles([])}
                                            disabled={importing || selectedFiles.length === 0}
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                            title="Limpar todas as seleções"
                                        >
                                            Limpar Seleções
                                        </button>
                                        <button
                                            onClick={detectExistingFiles}
                                            disabled={detectingExisting}
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                            title="Detectar arquivos que já existem no banco de dados"
                                        >
                                            {detectingExisting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            {detectingExisting ? 'Detectando...' : 'Detectar Existentes'}
                                        </button>
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
                                            {importing ? 'Importando...' : `Importar (${selectedFiles.length})`}
                                        </button>

                                        <button
                                            onClick={() => {
                                                const selected = importableFiles.filter(item => selectedFiles.includes(item.file.key));
                                                const text = selected.map(item => `${item.importData.songName} - ${item.importData.artist}\n${item.file.url}`).join('\n\n');
                                                navigator.clipboard.writeText(text);
                                            }}
                                            disabled={selectedFiles.length === 0}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Copiar Todas
                                        </button>
                                    </div>
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
                                            onClick={handleLoadImportableFiles}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Verificar Novamente
                                        </button>
                                    </div>
                                ) : (
                                    (() => {
                                        // Agrupa por dia (YYYY-MM-DD)
                                        const groupedByDay: { [date: string]: ImportableFile[] } = {};
                                        importableFiles.forEach((item) => {
                                            const date = item.importData.releaseDate ? new Date(item.importData.releaseDate) : null;
                                            const dayKey = date ? date.toISOString().split('T')[0] : 'sem-data';
                                            if (!groupedByDay[dayKey]) groupedByDay[dayKey] = [];
                                            groupedByDay[dayKey].push(item);
                                        });
                                        // Ordena as datas decrescente
                                        const allDays = Object.keys(groupedByDay).sort((a, b) => b.localeCompare(a));

                                        // Calcula a paginação
                                        const totalItems = importableFiles.length;
                                        const totalPages = Math.ceil(totalItems / itemsPerPage);
                                        const startIndex = currentPage * itemsPerPage;
                                        const endIndex = startIndex + itemsPerPage;

                                        // Filtra os itens da página atual
                                        const currentPageItems = importableFiles.slice(startIndex, endIndex);
                                        const currentPageKeys = currentPageItems.map(f => f.file.key);

                                        // Agrupa os itens da página atual por dia
                                        const currentPageGroupedByDay: { [date: string]: ImportableFile[] } = {};
                                        currentPageItems.forEach((item) => {
                                            const date = item.importData.releaseDate ? new Date(item.importData.releaseDate) : null;
                                            const dayKey = date ? date.toISOString().split('T')[0] : 'sem-data';
                                            if (!currentPageGroupedByDay[dayKey]) currentPageGroupedByDay[dayKey] = [];
                                            currentPageGroupedByDay[dayKey].push(item);
                                        });
                                        const currentPageDays = Object.keys(currentPageGroupedByDay).sort((a, b) => b.localeCompare(a));

                                        return (
                                            <div>
                                                {/* Informações da paginação */}
                                                <div className="px-6 py-3 bg-gray-700 border-b border-gray-600 flex items-center justify-between text-sm text-gray-300">
                                                    <div className="flex items-center gap-4">
                                                        <span>
                                                            Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} músicas
                                                        </span>
                                                        <span>
                                                            Página {currentPage + 1} de {totalPages}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-purple-400">
                                                            {currentPageKeys.filter(key => selectedFiles.includes(key)).length} de {currentPageKeys.length} selecionadas nesta página
                                                        </span>
                                                        <span className="text-green-400">
                                                            {selectedFiles.length} total selecionadas
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Músicas da página atual */}
                                                {currentPageDays.map((day) => (
                                                    <div key={day} className="mb-8">
                                                        <h4 className="text-lg font-bold text-purple-300 mb-2 px-4 pt-4">{day === 'sem-data' ? 'Sem Data' : new Date(day).toLocaleDateString('pt-BR')}</h4>
                                                        <div className="divide-y divide-gray-700">
                                                            {currentPageGroupedByDay[day].map((item, index) => (
                                                                <div key={item.file.key} className="p-4 flex items-start gap-4 hover:bg-gray-700/50">
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
                                                                    <div className="p-2 bg-purple-600/20 rounded-lg mt-1">
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
                                                                                <div className="mt-2">
                                                                                    <input
                                                                                        type="text"
                                                                                        readOnly
                                                                                        value={item.file.url}
                                                                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-green-400 font-mono cursor-pointer select-all"
                                                                                        onClick={e => (e.target as HTMLInputElement).select()}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="font-medium text-white mb-2">Dados Detectados</h4>
                                                                                <div className="space-y-1 text-sm">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-gray-500 w-16">Música:</span>
                                                                                        <input
                                                                                            type="text"
                                                                                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white flex-1"
                                                                                            value={item.importData.songName}
                                                                                            onChange={e => {
                                                                                                const newName = e.target.value;
                                                                                                setImportableFiles((prev) => {
                                                                                                    const updated = [...prev];
                                                                                                    const fileIndex = prev.findIndex(p => p.file.key === item.file.key);
                                                                                                    if (fileIndex > -1) {
                                                                                                        updated[fileIndex] = {
                                                                                                            ...updated[fileIndex],
                                                                                                            importData: {
                                                                                                                ...updated[fileIndex].importData,
                                                                                                                songName: newName
                                                                                                            }
                                                                                                        };
                                                                                                    }
                                                                                                    return updated;
                                                                                                });
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                    <p className="text-gray-300 flex items-center gap-2">
                                                                                        <span className="text-gray-500 w-16">Artista:</span> {item.parsed.artist}
                                                                                    </p>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-gray-500 w-16">Versão:</span>
                                                                                        <select
                                                                                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                                                                                            value={item.importData.version && item.importData.version !== "__new" ? item.importData.version : versionOptions[0]}
                                                                                            onChange={e => {
                                                                                                const fileIndex = importableFiles.findIndex(p => p.file.key === item.file.key);
                                                                                                if (e.target.value === "__new") {
                                                                                                    handleVersionChange(fileIndex, "__new");
                                                                                                } else {
                                                                                                    handleVersionChange(fileIndex, e.target.value);
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
                                                                                                    const fileIndex = importableFiles.findIndex(p => p.file.key === item.file.key);
                                                                                                    const val = e.target.value.trim();
                                                                                                    if (val) {
                                                                                                        handleAddNewVersion(val);
                                                                                                        handleVersionChange(fileIndex, val);
                                                                                                    } else {
                                                                                                        handleVersionChange(fileIndex, versionOptions[0] || "");
                                                                                                    }
                                                                                                }}
                                                                                                onKeyDown={e => {
                                                                                                    if (e.key === 'Enter') {
                                                                                                        const fileIndex = importableFiles.findIndex(p => p.file.key === item.file.key);
                                                                                                        const val = (e.target as HTMLInputElement).value.trim();
                                                                                                        if (val) {
                                                                                                            handleAddNewVersion(val);
                                                                                                            handleVersionChange(fileIndex, val);
                                                                                                            (e.target as HTMLInputElement).blur();
                                                                                                        }
                                                                                                    }
                                                                                                }}
                                                                                            />
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-gray-500 w-16">Estilo:</span>
                                                                                        <select
                                                                                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                                                                                            value={item.importData.style && item.importData.style !== "__new" ? item.importData.style : styleOptions[0]}
                                                                                            onChange={e => {
                                                                                                const fileIndex = importableFiles.findIndex(p => p.file.key === item.file.key);
                                                                                                if (e.target.value === "__new") {
                                                                                                    handleStyleChange(fileIndex, "__new");
                                                                                                } else {
                                                                                                    handleStyleChange(fileIndex, e.target.value);
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
                                                                                                    const fileIndex = importableFiles.findIndex(p => p.file.key === item.file.key);
                                                                                                    const val = e.target.value.trim();
                                                                                                    if (val) {
                                                                                                        handleAddNewStyle(val);
                                                                                                        handleStyleChange(fileIndex, val);
                                                                                                    } else {
                                                                                                        handleStyleChange(fileIndex, styleOptions[0] || "Club");
                                                                                                    }
                                                                                                }}
                                                                                                onKeyDown={e => {
                                                                                                    if (e.key === 'Enter') {
                                                                                                        const fileIndex = importableFiles.findIndex(p => p.file.key === item.file.key);
                                                                                                        const val = (e.target as HTMLInputElement).value.trim();
                                                                                                        if (val) {
                                                                                                            handleAddNewStyle(val);
                                                                                                            handleStyleChange(fileIndex, val);
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
                                                    </div>
                                                ))}

                                                {/* Controles de paginação */}
                                                {totalPages > 1 && (
                                                    <div className="px-6 py-4 bg-gray-700 border-t border-gray-600 flex items-center justify-between">
                                                        <button
                                                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                                            disabled={currentPage === 0}
                                                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            ← Anterior
                                                        </button>

                                                        <div className="flex items-center gap-2">
                                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                                let pageNum;
                                                                if (totalPages <= 5) {
                                                                    pageNum = i;
                                                                } else if (currentPage < 3) {
                                                                    pageNum = i;
                                                                } else if (currentPage >= totalPages - 3) {
                                                                    pageNum = totalPages - 5 + i;
                                                                } else {
                                                                    pageNum = currentPage - 2 + i;
                                                                }

                                                                return (
                                                                    <button
                                                                        key={pageNum}
                                                                        onClick={() => setCurrentPage(pageNum)}
                                                                        className={`px-3 py-2 rounded-lg transition-colors ${currentPage === pageNum
                                                                            ? 'bg-purple-600 text-white'
                                                                            : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                                                                            }`}
                                                                    >
                                                                        {pageNum + 1}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        <button
                                                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                                            disabled={currentPage === totalPages - 1}
                                                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Próxima →
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        );
                        // (Removed duplicate 'else if (currentView === 'import')' block to fix unreachable code and type error)
                    } else if (currentView === 'duplicates') {
                        return (
                            /* Duplicates View */
                            <div className="bg-gray-800 rounded-xl overflow-hidden">
                                <div className="px-6 py-4 bg-gray-700 border-b border-gray-600 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Trash2 className="w-5 h-5 text-red-300" />
                                        Detector de Duplicatas
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={detectDuplicates}
                                            disabled={detectingDuplicates}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            {detectingDuplicates ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                            {detectingDuplicates ? 'Detectando...' : 'Detectar Duplicatas'}
                                        </button>
                                        {selectedDuplicates.length > 0 && (
                                            <button
                                                onClick={deleteSelectedDuplicates}
                                                disabled={deletingDuplicates}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                {deletingDuplicates ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                                {deletingDuplicates ? 'Excluindo...' : `Excluir (${selectedDuplicates.length})`}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {duplicateStats && (
                                    <div className="px-6 py-4 bg-gray-700/50 border-b border-gray-600">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-gray-800/50 rounded-lg p-3">
                                                <div className="text-sm text-gray-400">Total de Arquivos</div>
                                                <div className="text-xl font-bold text-white">{duplicateStats.totalFiles}</div>
                                            </div>
                                            <div className="bg-gray-800/50 rounded-lg p-3">
                                                <div className="text-sm text-gray-400">Arquivos Únicos</div>
                                                <div className="text-xl font-bold text-green-400">{duplicateStats.uniqueFiles}</div>
                                            </div>
                                            <div className="bg-gray-800/50 rounded-lg p-3">
                                                <div className="text-sm text-gray-400">Grupos de Duplicatas</div>
                                                <div className="text-xl font-bold text-yellow-400">{duplicateStats.duplicateGroups}</div>
                                            </div>
                                            <div className="bg-gray-800/50 rounded-lg p-3">
                                                <div className="text-sm text-gray-400">Espaço a Economizar</div>
                                                <div className="text-xl font-bold text-red-400">{formatFileSize(duplicateStats.sizeSaved)}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detectingDuplicates ? (
                                    <div className="p-8 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
                                        <p className="text-gray-400">Detectando duplicatas...</p>
                                    </div>
                                ) : duplicateGroups.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Trash2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                                            Nenhuma duplicata encontrada
                                        </h3>
                                        <p className="text-gray-500">
                                            Clique em "Detectar Duplicatas" para analisar os arquivos
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-700">
                                        {duplicateGroups.map((group, groupIndex) => (
                                            <div key={groupIndex} className="p-4">
                                                <div className="mb-3">
                                                    <h4 className="font-semibold text-white mb-2">
                                                        Grupo {groupIndex + 1} - {group.count} arquivos
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span>Total: {formatFileSize(group.totalSize)}</span>
                                                        <span>Pode economizar: {formatFileSize(group.totalSize - Math.max(...group.files.map((f: any) => f.size)))}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {group.files.map((file: any, fileIndex: number) => (
                                                        <div key={file.key} className={`flex items-center justify-between p-3 rounded-lg ${fileIndex === 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                                                            }`}>
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedDuplicates.includes(file.key)}
                                                                    onChange={() => toggleDuplicateSelection(file.key)}
                                                                    disabled={fileIndex === 0} // Não permitir selecionar o primeiro arquivo
                                                                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-red-500 focus:ring-red-500 disabled:opacity-50"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-white">{file.filename}</span>
                                                                        {fileIndex === 0 && (
                                                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                                                                Mantido
                                                                            </span>
                                                                        )}
                                                                        {fileIndex > 0 && (
                                                                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                                                                                Duplicata
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                                                        <span>{formatFileSize(file.size)}</span>
                                                                        <span>{new Date(file.lastModified).toLocaleDateString('pt-BR')}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => window.open(file.url, '_blank')}
                                                                    className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                                                                    title="Download"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Seção de Arquivos Existentes no Banco de Dados */}
                                <div className="mt-8 border-t border-gray-600 pt-8">
                                    <div className="px-6 py-4 bg-gray-700/50 border-b border-gray-600 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-orange-300" />
                                            Arquivos Existentes no Banco de Dados
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={detectExistingFiles}
                                                disabled={detectingExisting}
                                                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                {detectingExisting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <RefreshCw className="w-4 h-4" />
                                                )}
                                                {detectingExisting ? 'Detectando...' : 'Detectar Existentes'}
                                            </button>
                                            {selectedExistingFiles.length > 0 && (
                                                <button
                                                    onClick={deleteSelectedExistingFiles}
                                                    disabled={deletingExisting}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    {deletingExisting ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                    {deletingExisting ? 'Excluindo...' : `Excluir (${selectedExistingFiles.length})`}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {existingStats && (
                                        <div className="px-6 py-4 bg-gray-700/30 border-b border-gray-600">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="bg-gray-800/50 rounded-lg p-3">
                                                    <div className="text-sm text-gray-400">Total de Arquivos</div>
                                                    <div className="text-xl font-bold text-white">{existingStats.totalFiles}</div>
                                                </div>
                                                <div className="bg-gray-800/50 rounded-lg p-3">
                                                    <div className="text-sm text-gray-400">Já no Banco</div>
                                                    <div className="text-xl font-bold text-orange-400">{existingStats.existingCount}</div>
                                                </div>
                                                <div className="bg-gray-800/50 rounded-lg p-3">
                                                    <div className="text-sm text-gray-400">Espaço Ocupado</div>
                                                    <div className="text-xl font-bold text-red-400">
                                                        {existingFiles.reduce((total, file) => total + file.file.size, 0).toLocaleString()} bytes
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {detectingExisting ? (
                                        <div className="p-8 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-400" />
                                            <p className="text-gray-400">Detectando arquivos existentes...</p>
                                        </div>
                                    ) : existingFiles.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-300 mb-2">
                                                Nenhum arquivo existente encontrado
                                            </h3>
                                            <p className="text-gray-500">
                                                Clique em "Detectar Existentes" para analisar os arquivos
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-700">
                                            {existingFiles.map((file, index) => (
                                                <div key={file.file.key} className="p-4">
                                                    <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedExistingFiles.includes(file.file.key)}
                                                                onChange={() => toggleExistingFileSelection(file.file.key)}
                                                                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-white">{file.file.filename}</span>
                                                                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                                                                        No Banco
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                                                    <span>{formatFileSize(file.file.size)}</span>
                                                                    <span>{new Date(file.file.lastModified).toLocaleDateString('pt-BR')}</span>
                                                                    {file.existingTrack && (
                                                                        <span className="text-green-400">
                                                                            ID: {file.existingTrack.id}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {file.existingTrack && (
                                                                    <div className="text-sm text-gray-500 mt-1">
                                                                        <span>Artista: {file.existingTrack.artist}</span>
                                                                        <span className="mx-2">•</span>
                                                                        <span>Música: {file.existingTrack.songName}</span>
                                                                        {file.existingTrack.style && (
                                                                            <>
                                                                                <span className="mx-2">•</span>
                                                                                <span>Estilo: {file.existingTrack.style}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => window.open(file.file.url, '_blank')}
                                                                className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                                                                title="Download"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}
            </div>
        </div>
    );
}