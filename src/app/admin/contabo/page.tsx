"use client";

import {
    AlertCircle,
    AlertTriangle,
    BarChart3,
    Bot,
    Brain,
    Calendar,
    CheckCircle,
    Cloud,
    Database,
    Download,
    File,
    Folder,
    Globe,
    HardDrive,
    Image as ImageIcon,
    Import,
    Loader2,
    Music,
    RefreshCw,
    Search,
    Sparkles,
    Target,
    Trash2,
    Upload,
    Volume2,
    Wand2,
    Zap
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
        pool?: string;
        bitrate?: number;
    };
    detectedData?: {
        style?: string;
        label?: string;
        confidence?: number;
        source?: string;
    };
    label?: string;
}

interface AudioAnalysis {
    genre: string;
    bpm: number;
    key: string;
    energy: number;
    danceability: number;
    valence: number;
    popularity: number;
    qualityScore: number;
    releaseYear: number;
    duration: number;
}

interface SmartRecommendation {
    type: 'organization' | 'cleanup' | 'optimization' | 'quality';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
    details: any;
}

export default function ContaboStoragePage() {
    const { data: session, status } = useSession();
    const user = session?.user;
    const isLoaded = status !== 'loading';

    const [files, setFiles] = useState<StorageFile[]>([]);
    const [importableFiles, setImportableFiles] = useState<ImportableFile[]>([]);
    const [styleOptions, setStyleOptions] = useState<string[]>([]);
    const [versionOptions, setVersionOptions] = useState<string[]>(["Original", "Extended Mix", "Radio Edit", "Club Mix", "Vocal Mix", "Instrumental", "Dub Mix", "Remix", "VIP Mix", "Acoustic"]);
    const [bitrateOptions] = useState<number[]>([320, 256, 192, 128]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(0.55);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [currentView, setCurrentView] = useState<'files' | 'import' | 'duplicates' | 'database-duplicates'>('files');

    // Estados de paginação para a aba de importação
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(50);

    // Estados para gerenciamento de pastas
    const [folders, setFolders] = useState<{ [key: string]: any }>({});
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [showFolderSelector, setShowFolderSelector] = useState(false);

    // Estados para detector de duplicatas
    const [duplicateGroups, setDuplicateGroups] = useState<any[]>([]);
    const [selectedDuplicates, setSelectedDuplicates] = useState<string[]>([]);
    const [detectingDuplicates, setDetectingDuplicates] = useState(false);
    const [deletingDuplicates, setDeletingDuplicates] = useState(false);
    const [duplicateStats, setDuplicateStats] = useState<any>(null);
    const [lastDuplicateCheck, setLastDuplicateCheck] = useState<Date | null>(null);

    // Estados para detector de duplicatas do banco de dados
    const [databaseDuplicates, setDatabaseDuplicates] = useState<any[]>([]);
    const [selectedDatabaseDuplicates, setSelectedDatabaseDuplicates] = useState<string[]>([]);
    const [detectingDatabaseDuplicates, setDetectingDatabaseDuplicates] = useState(false);
    const [removingDatabaseDuplicates, setRemovingDatabaseDuplicates] = useState(false);
    const [databaseDuplicateStats, setDatabaseDuplicateStats] = useState<any>(null);

    // Estados para arquivos existentes no banco de dados
    const [existingFiles, setExistingFiles] = useState<any[]>([]);
    const [selectedExistingFiles, setSelectedExistingFiles] = useState<string[]>([]);
    const [detectingExisting, setDetectingExisting] = useState(false);
    const [deletingExisting, setDeletingExisting] = useState(false);
    const [existingStats, setExistingStats] = useState<{
        totalFiles: number;
        existingCount: number;
    } | null>(null);

    // Estados para IA e análise inteligente
    const [smartAnalysis, setSmartAnalysis] = useState<any>(null);
    const [smartRecommendations, setSmartRecommendations] = useState<SmartRecommendation[]>([]);
    const [isSmartAnalyzing, setIsSmartAnalyzing] = useState(false);
    const [showSmartDashboard, setShowSmartDashboard] = useState(false);
    const [autoOrganizing, setAutoOrganizing] = useState(false);
    const [analyzingFile, setAnalyzingFile] = useState<string | null>(null);
    const [detectedStyles, setDetectedStyles] = useState<{ [key: string]: { style: string, label: string, confidence: number, coverImage?: string } }>({});
    const [detectingStylesAndLabels, setDetectingStylesAndLabels] = useState(false);
    const [isDetectingBatch, setIsDetectingBatch] = useState(false);
    const [fileAIData, setFileAIData] = useState<{ [key: string]: any }>({});

    if (isLoaded && !user) {
        redirect('/auth/sign-in');
    }


    useEffect(() => {
        loadFiles();
        // Estilos agora são carregados do banco de dados via loadStylesFromDatabase()
    }, []);

    // Verificar e limpar arrays de estilos sempre que mudarem
    useEffect(() => {
        if (styleOptions.length > 0) {
            const cleanStyles = cleanStyleArray(styleOptions);
            if (cleanStyles.length !== styleOptions.length) {
                console.log('🧹 Limpando array de estilos:', { original: styleOptions, cleaned: cleanStyles });
                setStyleOptions(cleanStyles);
            }
        }
    }, [styleOptions]);

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
        if (currentView === 'import' && Object.keys(folders).length === 0) {
            loadFolders();
        }
    }, [currentView, Object.keys(folders).length]);

    // Detecção automática de estilos e pools quando arquivos são carregados
    useEffect(() => {
        if (importableFiles.length > 0 && Object.keys(detectedStyles).length === 0) {
            detectStyleAndLabelBatchAuto();
        }
    }, [importableFiles.length]);

    useEffect(() => {
        if (isLoaded && user) {
            loadFiles();
            loadStylesFromDatabase(); // Carrega estilos do banco de dados
        }
    }, [isLoaded, user]);

    // Efeito para sincronização automática quando a página é carregada
    useEffect(() => {
        if (isLoaded && user && currentView === 'import') {
            // Sincronizar automaticamente quando entrar na aba de importação
            const autoSync = async () => {
                console.log('🔄 Sincronização automática iniciada...');
                try {
                    await detectExistingFiles();
                    await loadImportableFiles(selectedFolder);
                    console.log('✅ Sincronização automática concluída');
                } catch (error) {
                    console.error('❌ Erro na sincronização automática:', error);
                }
            };

            // Aguarda um momento para garantir que tudo foi carregado
            setTimeout(autoSync, 1000);
        }
    }, [isLoaded, user, currentView]);

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
                const files = data.files || [];
                setImportableFiles(files);

                // Atualiza informações das pastas se disponível
                if (data.folders) {
                    setFolders(prev => {
                        const updatedFolders = { ...prev };
                        Object.keys(data.folders).forEach(folderPath => {
                            updatedFolders[folderPath] = {
                                ...updatedFolders[folderPath],
                                ...data.folders[folderPath]
                            };
                        });
                        return updatedFolders;
                    });
                }

                showMessage(`${data.importableCount} arquivos prontos para importação (${data.totalFiles} total, ${data.existingInDatabase} já existem)`, 'success');

                // Automaticamente detecta arquivos existentes após carregar importáveis
                await detectExistingFiles();

                // Verificar duplicatas automaticamente se houver arquivos
                if (files.length > 0) {
                    console.log('🔄 Chamando verificação de duplicatas para', files.length, 'arquivos');
                    await checkDuplicatesForImportableFiles(files);
                } else {
                    // Limpar estatísticas se não há arquivos
                    setDuplicateStats(null);
                }

                // Atualizar estatísticas de duplicatas com base nos arquivos existentes detectados
                if (existingStats && typeof existingStats.existingCount === 'number' && existingStats.existingCount > 0) {
                    const updatedStats = {
                        totalFiles: files.length,
                        uniqueFiles: files.length - existingStats.existingCount,
                        duplicateGroups: existingStats.existingCount,
                        sizeSaved: 0 // Será calculado se necessário
                    };
                    setDuplicateStats(updatedStats);
                    console.log('📊 Estatísticas atualizadas com base em arquivos existentes:', updatedStats);
                }
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

    const checkDuplicatesForImportableFiles = async (files: ImportableFile[]) => {
        try {
            console.log('🔍 Verificando duplicatas para', files.length, 'arquivos');

            // Se já temos estatísticas de arquivos existentes, usar elas primeiro
            if (existingStats && typeof existingStats.existingCount === 'number' && existingStats.existingCount > 0) {
                console.log('📊 Usando estatísticas de arquivos existentes detectados:', existingStats);
                const stats = {
                    totalFiles: files.length,
                    uniqueFiles: files.length - existingStats.existingCount,
                    duplicateGroups: existingStats.existingCount,
                    sizeSaved: 0 // Será calculado se necessário
                };
                setDuplicateStats(stats);
                setLastDuplicateCheck(new Date());
                showMessage(`📊 ${existingStats.existingCount} arquivos já existem no banco de dados`, 'success');
                return;
            }

            // Preparar dados para verificação
            const tracksToCheck = files.map(item => ({
                songName: item.importData.songName,
                artist: item.importData.artist,
                previewUrl: item.file.url,
                downloadUrl: item.file.url
            }));

            console.log('📤 Dados para verificação:', tracksToCheck.slice(0, 3));

            const response = await fetch('/api/tracks/check-duplicates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tracksToCheck)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Resultado da verificação:', result);

                // Atualizar estatísticas de duplicatas
                const stats = {
                    totalFiles: files.length,
                    uniqueFiles: result.summary.unique,
                    duplicateGroups: result.summary.duplicates,
                    sizeSaved: 0 // Será calculado se necessário
                };

                console.log('📊 Estatísticas atualizadas:', stats);
                setDuplicateStats(stats);
                setLastDuplicateCheck(new Date());
                console.log('✅ Estado duplicateStats atualizado');

                if (result.summary.duplicates > 0) {
                    showMessage(`⚠️ ${result.summary.duplicates} de ${files.length} músicas já existem no banco de dados`, 'error');
                } else {
                    showMessage(`✅ Verificação atualizada: ${result.summary.unique} músicas únicas encontradas`, 'success');
                }
            } else {
                console.error('❌ Erro na resposta da API:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('❌ Erro ao verificar duplicatas:', error);
        }
    };

    const handleLoadImportableFiles = () => {
        loadImportableFiles();
    };

    const refreshDuplicateCheck = async () => {
        if (importableFiles.length > 0) {
            console.log('🔄 Atualizando verificação de duplicatas manualmente');
            await checkDuplicatesForImportableFiles(importableFiles);
        }
    };

    const syncWithDatabase = async () => {
        setMessage('🔄 Sincronizando com banco de dados...');
        try {
            console.log('🔄 Iniciando sincronização manual...');

            // Primeiro detecta arquivos existentes
            console.log('📊 Detectando arquivos existentes...');
            await detectExistingFiles();

            // Aguarda um momento para garantir que o estado foi atualizado
            console.log('⏳ Aguardando atualização do estado...');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Verifica se a detecção funcionou
            if (existingStats && existingStats.existingCount > 0) {
                console.log('✅ Arquivos existentes detectados:', existingStats);
            } else {
                console.log('ℹ️ Nenhum arquivo existente detectado');
            }

            // Depois recarrega arquivos importáveis
            console.log('🔄 Recarregando arquivos importáveis...');
            await loadImportableFiles(selectedFolder);

            console.log('✅ Sincronização manual concluída');
            showMessage('✅ Sincronização concluída!', 'success');
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            showMessage('❌ Erro na sincronização', 'error');
        }
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

                // Converte para objeto com informações básicas
                const folderObject: { [key: string]: any } = {};
                Array.from(folderSet).sort().forEach(folderPath => {
                    folderObject[folderPath] = {
                        totalFiles: 0,
                        existingFiles: 0,
                        importableFiles: 0,
                        importPercentage: 0,
                        status: 'unknown'
                    };
                });

                setFolders(folderObject);
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
                    files: filesToImport.map(f => {
                        // Garante que importData.pool receba o valor de label se existir
                        const pool = f.importData?.pool || f.label || (f.detectedData?.label) || (detectedStyles[f.file.key]?.label) || 'Nexor Records';
                        return {
                            ...f,
                            importData: {
                                ...f.importData,
                                pool,
                                bitrate: f.importData?.bitrate || null
                            },
                            detectedData: f.detectedData || (detectedStyles[f.file.key] ? {
                                style: detectedStyles[f.file.key].style,
                                label: detectedStyles[f.file.key].label,
                                confidence: detectedStyles[f.file.key].confidence,
                                coverImage: detectedStyles[f.file.key].coverImage,
                                source: 'session'
                            } : undefined)
                        };
                    }),
                    aiConfidenceThreshold
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

                // Recarrega estilos do banco para incluir novos estilos criados
                setTimeout(() => loadStylesFromDatabase(), 1000);
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

    // Funções para detector de duplicatas do banco de dados
    const detectDatabaseDuplicates = async () => {
        setDetectingDatabaseDuplicates(true);
        try {
            const response = await fetch('/api/contabo/detect-database-duplicates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    similarityThreshold: 0.8 // 80% de similaridade
                })
            });

            const data = await response.json();

            if (data.success) {
                setDatabaseDuplicates(data.duplicates || []);
                setDatabaseDuplicateStats(data.statistics);
                showMessage(`Encontradas ${data.duplicatesFound} duplicatas no banco (${data.statistics.exactUrlMatches} URLs exatas, ${data.statistics.nameMatches} nomes, ${data.statistics.similarityMatches} similaridade)`, 'success');
            } else {
                showMessage(data.error || 'Erro ao detectar duplicatas do banco', 'error');
            }
        } catch (error) {
            console.error('Erro ao detectar duplicatas do banco:', error);
            showMessage('Erro ao detectar duplicatas do banco', 'error');
        } finally {
            setDetectingDatabaseDuplicates(false);
        }
    };

    const toggleDatabaseDuplicateSelection = (fileKey: string) => {
        setSelectedDatabaseDuplicates(prev =>
            prev.includes(fileKey)
                ? prev.filter(key => key !== fileKey)
                : [...prev, fileKey]
        );
    };

    const selectAllDatabaseDuplicates = () => {
        const allKeys = databaseDuplicates.map(dup => dup.storageFile.key);
        setSelectedDatabaseDuplicates(allKeys);
    };

    const selectDuplicatesByType = (matchType: 'url' | 'name' | 'similarity') => {
        const filteredDuplicates = databaseDuplicates.filter(dup => dup.matchType === matchType);
        const keys = filteredDuplicates.map(dup => dup.storageFile.key);
        setSelectedDatabaseDuplicates(keys);

        const count = keys.length;
        const typeName = matchType === 'url' ? 'URLs exatas' :
            matchType === 'name' ? 'nomes iguais' : 'similaridade';
        showMessage(`Selecionadas ${count} duplicatas por ${typeName}`, 'success');
    };

    const selectDuplicatesBySize = () => {
        // Selecionar os 50% maiores arquivos (mais espaço para economizar)
        const sortedDuplicates = [...databaseDuplicates].sort((a, b) => b.storageFile.size - a.storageFile.size);
        const halfCount = Math.ceil(sortedDuplicates.length / 2);
        const largestDuplicates = sortedDuplicates.slice(0, halfCount);
        const keys = largestDuplicates.map(dup => dup.storageFile.key);

        setSelectedDatabaseDuplicates(keys);
        showMessage(`Selecionados ${keys.length} arquivos maiores (mais espaço para economizar)`, 'success');
    };

    const selectDuplicatesByRecentDate = () => {
        // Selecionar arquivos mais recentes (últimos 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentDuplicates = databaseDuplicates.filter(dup => {
            const fileDate = new Date(dup.storageFile.lastModified);
            return fileDate > thirtyDaysAgo;
        });

        const keys = recentDuplicates.map(dup => dup.storageFile.key);
        setSelectedDatabaseDuplicates(keys);
        showMessage(`Selecionados ${keys.length} arquivos dos últimos 30 dias`, 'success');
    };

    // Funções auxiliares para estatísticas da seleção
    const getSelectedDuplicatesSize = () => {
        return selectedDatabaseDuplicates.reduce((total, key) => {
            const duplicate = databaseDuplicates.find(dup => dup.storageFile.key === key);
            return total + (duplicate?.storageFile.size || 0);
        }, 0);
    };

    const getSelectedDuplicatesByType = (matchType: 'url' | 'name' | 'similarity') => {
        return selectedDatabaseDuplicates.filter(key => {
            const duplicate = databaseDuplicates.find(dup => dup.storageFile.key === key);
            return duplicate?.matchType === matchType;
        });
    };

    const selectDuplicatesSmart = () => {
        // Seleção inteligente: URLs exatas + nomes iguais (mais seguras)
        // Exclui similaridade para evitar falsos positivos
        const safeDuplicates = databaseDuplicates.filter(dup =>
            dup.matchType === 'url' || dup.matchType === 'name'
        );

        const keys = safeDuplicates.map(dup => dup.storageFile.key);
        setSelectedDatabaseDuplicates(keys);

        const urlCount = safeDuplicates.filter(dup => dup.matchType === 'url').length;
        const nameCount = safeDuplicates.filter(dup => dup.matchType === 'name').length;

        showMessage(`Seleção inteligente: ${urlCount} URLs exatas + ${nameCount} nomes iguais (${keys.length} total)`, 'success');
    };

    const clearDatabaseDuplicateSelection = () => {
        setSelectedDatabaseDuplicates([]);
    };

    const removeDatabaseDuplicates = async () => {
        if (selectedDatabaseDuplicates.length === 0) {
            showMessage('Nenhuma duplicata selecionada', 'error');
            return;
        }

        const selectedDuplicatesData = databaseDuplicates.filter(dup =>
            selectedDatabaseDuplicates.includes(dup.storageFile.key)
        );

        if (!confirm(`Tem certeza que deseja remover ${selectedDatabaseDuplicates.length} arquivos duplicados do storage? Esta ação não pode ser desfeita.`)) {
            return;
        }

        console.log('🗑️ Iniciando remoção de duplicatas do banco:', selectedDatabaseDuplicates);

        setRemovingDatabaseDuplicates(true);
        try {
            const response = await fetch('/api/contabo/remove-database-duplicates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    duplicates: selectedDuplicatesData,
                    confirmRemoval: true
                })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(`${data.message} - Espaço liberado: ${data.statistics.formattedSizeRemoved}`, 'success');
                setSelectedDatabaseDuplicates([]);
                // Recarregar duplicatas para atualizar a lista
                await detectDatabaseDuplicates();
            } else {
                showMessage(data.error || 'Erro ao remover duplicatas', 'error');
            }
        } catch (error) {
            console.error('Erro ao remover duplicatas:', error);
            showMessage('Erro ao remover duplicatas', 'error');
        } finally {
            setRemovingDatabaseDuplicates(false);
        }
    };

    // Funções de IA e análise inteligente
    // Função para limpar arrays de estilos
    const cleanStyleArray = (styles: any[]): string[] => {
        if (!Array.isArray(styles)) return [];

        return styles
            .filter(style => style !== null && style !== undefined)
            .map(style => {
                if (typeof style === 'string') {
                    return style.trim();
                } else if (typeof style === 'object' && style !== null) {
                    // Se for um objeto, tentar extrair o nome
                    if (style.name && typeof style.name === 'string') {
                        return style.name.trim();
                    } else if (style.style && typeof style.style === 'string') {
                        return style.style.trim();
                    }
                }
                return null;
            })
            .filter(style => style !== null && style !== '') as string[];
    };

    // Função para validar dados da análise
    const validateAnalysisData = (data: any) => {
        if (!data || typeof data !== 'object') return false;

        // Verificar propriedades obrigatórias
        const requiredProps = ['totalFiles', 'audioFiles', 'genreDistribution', 'topGenres', 'bpmRange', 'averageQuality', 'averageEnergy'];
        for (const prop of requiredProps) {
            if (data[prop] === undefined) {
                console.warn(`⚠️ Propriedade ${prop} não encontrada na análise`);
                return false;
            }
        }

        // Verificar se topGenres é um array válido
        if (!Array.isArray(data.topGenres)) {
            console.warn('⚠️ topGenres não é um array válido');
            return false;
        }

        // Verificar se cada item de topGenres tem a estrutura correta
        for (const genre of data.topGenres) {
            if (!genre || typeof genre !== 'object' || !genre.genre || !genre.count) {
                console.warn('⚠️ Item de topGenres com estrutura inválida:', genre);
                return false;
            }
        }

        return true;
    };

    const runSmartAnalysis = async () => {
        setIsSmartAnalyzing(true);
        try {
            const response = await fetch('/api/contabo/smart-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    folder: selectedFolder,
                    enableDeepLearning: true,
                    analyzeMetadata: true,
                    detectSimilarity: true
                })
            });

            const data = await response.json();
            console.log('🧠 Dados retornados pela API:', data);

            if (data.success) {
                console.log('🧠 Análise:', data.analysis);
                console.log('🧠 Recomendações:', data.recommendations);

                // Verificar estrutura dos dados antes de definir
                if (data.analysis && typeof data.analysis === 'object') {
                    console.log('🧠 Estrutura da análise:', {
                        totalFiles: data.analysis.totalFiles,
                        audioFiles: data.analysis.audioFiles,
                        genreDistribution: data.analysis.genreDistribution,
                        topGenres: data.analysis.topGenres,
                        bpmRange: data.analysis.bpmRange,
                        averageQuality: data.analysis.averageQuality,
                        averageEnergy: data.analysis.averageEnergy
                    });

                    // Verificar se topGenres é um array válido
                    if (data.analysis.topGenres) {
                        console.log('🧠 topGenres é array?', Array.isArray(data.analysis.topGenres));
                        console.log('🧠 topGenres conteúdo:', data.analysis.topGenres);
                    }
                }

                // Validar dados antes de definir
                if (validateAnalysisData(data.analysis)) {
                    setSmartAnalysis(data.analysis);
                    setSmartRecommendations(data.recommendations);
                    setShowSmartDashboard(true);
                    showMessage('Análise inteligente concluída!', 'success');
                } else {
                    console.error('❌ Dados da análise inválidos, não exibindo dashboard');
                    showMessage('Erro: dados da análise inválidos', 'error');
                }
            } else {
                showMessage('Erro na análise inteligente', 'error');
            }
        } catch (error) {
            console.error('Erro na análise inteligente:', error);
            showMessage('Erro de conexão na análise', 'error');
        } finally {
            setIsSmartAnalyzing(false);
        }
    };

    const autoOrganizeFiles = async () => {
        setAutoOrganizing(true);
        try {
            const response = await fetch('/api/contabo/auto-organize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    folder: selectedFolder,
                    strategy: 'genre',
                    createFolders: true
                })
            });

            const data = await response.json();
            if (data.success) {
                showMessage(`Organização automática concluída! ${data.organizationReport.movedFiles} arquivos organizados`, 'success');
                loadImportableFiles(selectedFolder);
            } else {
                showMessage('Erro na organização automática', 'error');
            }
        } catch (error) {
            console.error('Erro na organização automática:', error);
            showMessage('Erro de conexão na organização', 'error');
        } finally {
            setAutoOrganizing(false);
        }
    };

    const analyzeIndividualFile = async (fileKey: string) => {
        setAnalyzingFile(fileKey);
        try {
            const response = await fetch('/api/contabo/analyze-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileKey })
            });

            const data = await response.json();
            if (data.success) {
                showMessage(`Análise do arquivo concluída: ${data.analysis.genre} - ${data.analysis.bpm} BPM`, 'success');
                return data.analysis;
            } else {
                showMessage('Erro na análise do arquivo', 'error');
            }
        } catch (error) {
            console.error('Erro na análise do arquivo:', error);
            showMessage('Erro de conexão na análise', 'error');
        } finally {
            setAnalyzingFile(null);
        }
    };

    const detectStyleAndLabel = async (fileKey: string) => {
        try {
            const response = await fetch('/api/contabo/detect-style-label', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileKey })
            });

            const data = await response.json();
            if (data.success) {
                const detection = data.detection;

                // Salva os dados detectados para exibir nos indicadores visuais
                setDetectedStyles(prev => ({
                    ...prev,
                    [fileKey]: {
                        style: detection.style,
                        label: detection.label,
                        confidence: detection.confidence,
                        coverImage: detection.coverImage
                    }
                }));

                // Aplica automaticamente o estilo detectado ao campo
                const fileIndex = importableFiles.findIndex(item => item.file.key === fileKey);
                if (fileIndex !== -1 && detection.style) {
                    // Validar se detection.style é uma string válida
                    if (typeof detection.style === 'string' && detection.style.trim() !== '') {
                        // Adiciona o estilo às opções se não existir (com deduplicação)
                        if (!styleOptions.includes(detection.style)) {
                            setStyleOptions(prev => Array.from(new Set([...prev, detection.style])));
                        }
                    } else {
                        console.warn('⚠️ detection.style não é uma string válida:', detection.style);
                    }

                    // Atualiza o campo de estilo automaticamente
                    setImportableFiles(prev => {
                        const updated = [...prev];
                        updated[fileIndex] = {
                            ...updated[fileIndex],
                            importData: {
                                ...updated[fileIndex].importData,
                                style: detection.style
                            }
                        };
                        return updated;
                    });
                }

                showMessage(`🎯 IA detectou: ${detection.style} (${detection.label}) - ${Math.round(detection.confidence * 100)}%`, 'success');
                return detection;
            } else {
                showMessage('Erro na detecção automática', 'error');
            }
        } catch (error) {
            console.error('Erro na detecção de estilo/label:', error);
            showMessage('Erro na conexão com IA', 'error');
        }
        return null;
    };

    // Função para detectar estilo e gravadora automaticamente em lote
    const detectStyleAndLabelBatchAuto = async () => {
        if (importableFiles.length === 0) return;

        setIsDetectingBatch(true);
        const startTime = Date.now();

        try {
            // Processa em lotes de 5 para não sobrecarregar
            const batchSize = 5;
            const batches = [];

            for (let i = 0; i < importableFiles.length; i += batchSize) {
                batches.push(importableFiles.slice(i, i + batchSize));
            }

            console.log(`🚀 Iniciando detecção automática para ${importableFiles.length} músicas em ${batches.length} lotes`);

            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex];

                await Promise.all(batch.map(async (importableFile) => {
                    if (importableFile.detectedData) return; // Pula se já tem dados

                    try {
                        const response = await fetch('/api/contabo/detect-style-label', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                artist: importableFile.parsed.artist,
                                songName: importableFile.parsed.songName,
                                version: importableFile.parsed.version || ''
                            })
                        });

                        if (response.ok) {
                            const aiData = await response.json();

                            // Atualiza estado com dados da IA
                            setFileAIData(prev => ({
                                ...prev,
                                [importableFile.file.filename]: {
                                    ...aiData,
                                    detectedAt: new Date().toISOString(),
                                    autoDetected: true
                                }
                            }));

                            // Atualiza importableFiles com dados detectados
                            setImportableFiles(prev =>
                                prev.map(f =>
                                    f.file.filename === importableFile.file.filename
                                        ? {
                                            ...f,
                                            detectedData: {
                                                style: aiData.style,
                                                label: aiData.label,
                                                confidence: aiData.confidence,
                                                source: aiData.platform,
                                                coverImage: aiData.coverImage
                                            }
                                        }
                                        : f
                                )
                            );

                            // Atualiza os estilos detectados para exibição visual
                            setDetectedStyles(prev => ({
                                ...prev,
                                [importableFile.file.key]: {
                                    style: aiData.style,
                                    label: aiData.label,
                                    confidence: aiData.confidence,
                                    coverImage: aiData.coverImage
                                }
                            }));

                            console.log(`✅ Detectado ${importableFile.file.filename}: ${aiData.style} - ${aiData.label} (${(aiData.confidence * 100).toFixed(1)}%)`);
                        } else {
                            console.warn(`❌ Erro ao detectar ${importableFile.file.filename}:`, response.statusText);
                        }

                    } catch (error) {
                        console.error(`❌ Erro ao processar ${importableFile.file.filename}:`, error);
                    }
                }));

                // Pequena pausa entre lotes
                if (batchIndex < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                console.log(`📦 Lote ${batchIndex + 1}/${batches.length} processado`);
            }

            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;

            showMessage(`🎉 Detecção automática concluída! ${importableFiles.length} músicas processadas em ${duration.toFixed(1)}s`, 'success');

        } catch (error) {
            console.error('Erro na detecção em lote:', error);
            showMessage('Erro durante a detecção automática', 'error');
        } finally {
            setIsDetectingBatch(false);
        }
    };

    const detectStyleAndLabelBatch = async () => {
        setDetectingStylesAndLabels(true);
        try {
            const startIndex = currentPage * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentPageFiles = importableFiles.slice(startIndex, endIndex);

            const results = await Promise.allSettled(
                currentPageFiles.map((item: ImportableFile) => detectStyleAndLabel(item.file.key))
            );

            const successCount = results.filter((r: any) => r.status === 'fulfilled' && r.value).length;
            showMessage(`Detecção automática concluída! ${successCount} estilos/labels detectados`, 'success');
        } catch (error) {
            console.error('Erro na detecção em lote:', error);
            showMessage('Erro na detecção automática', 'error');
        } finally {
            setDetectingStylesAndLabels(false);
        }
    };

    const applyAllDetectedStyles = () => {
        let appliedCount = 0;

        setImportableFiles(prev => {
            const updated = [...prev];

            Object.entries(detectedStyles).forEach(([fileKey, detection]) => {
                const fileIndex = updated.findIndex(item => item.file.key === fileKey);

                if (fileIndex !== -1) {
                    // Adiciona o estilo às opções se não existir (com deduplicação)
                    if (detection.style && typeof detection.style === 'string' && detection.style.trim() !== '' && !styleOptions.includes(detection.style)) {
                        setStyleOptions(prevStyles => Array.from(new Set([...prevStyles, detection.style])));
                    }

                    // Atualiza o arquivo com os dados detectados
                    updated[fileIndex] = {
                        ...updated[fileIndex],
                        importData: {
                            ...updated[fileIndex].importData,
                            style: detection.style || updated[fileIndex].importData.style
                        },
                        label: detection.label || updated[fileIndex].label
                    };

                    appliedCount++;
                }
            });

            return updated;
        });

        showMessage(`✨ ${appliedCount} estilos e labels aplicados automaticamente!`, 'success');
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
        if (newStyle && typeof newStyle === 'string' && newStyle.trim() !== '' && !styleOptions.includes(newStyle)) {
            setStyleOptions((prev) => Array.from(new Set([...prev, newStyle])));
            // Recarrega estilos do banco para manter sincronizado
            setTimeout(() => loadStylesFromDatabase(), 1000);
        }
    };

    // Handler to add a new version to the dropdown
    const handleAddNewVersion = (newVersion: string) => {
        if (newVersion && !versionOptions.includes(newVersion)) {
            setVersionOptions((prev) => [...prev, newVersion]);
        }
    };

    // Função para carregar estilos do banco de dados
    const loadStylesFromDatabase = async () => {
        try {
            const response = await fetch('/api/tracks/styles');
            if (response.ok) {
                const data = await response.json();
                console.log('🎵 Dados recebidos da API de estilos:', data);

                if (data.success && data.styles) {
                    // Usar função de limpeza para garantir que styles seja um array de strings válidas
                    const cleanStyles = cleanStyleArray(data.styles);

                    console.log('🎵 Estilos originais:', data.styles);
                    console.log('🎵 Estilos limpos:', cleanStyles);

                    setStyleOptions(cleanStyles);
                    console.log(`🎵 ${cleanStyles.length} estilos válidos carregados do banco de dados`);
                } else {
                    console.error('❌ Resposta da API inválida:', data);
                    setStyleOptions([]);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar estilos do banco:', error);
            setStyleOptions([]);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                            <Cloud className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                                Contabo Object Storage
                            </h1>
                            <p className="text-gray-400 mt-2 text-lg">Gerencie arquivos de música no cloud com IA</p>
                        </div>
                    </div>
                    <Link
                        href="/admin"
                        className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white rounded-xl transition-all duration-300 font-medium border border-gray-600/50 hover:border-gray-500/50 shadow-lg"
                    >
                        ← Voltar ao Admin
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 group">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <HardDrive className="w-7 h-7 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Total de Arquivos</p>
                                <p className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">{files.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 group">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Volume2 className="w-7 h-7 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Arquivos de Áudio</p>
                                <p className="text-3xl font-bold text-purple-400">{audioFiles.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 group">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <ImageIcon className="w-7 h-7 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Outros Arquivos</p>
                                <p className="text-3xl font-bold text-green-400">{otherFiles.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 group">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Import className="w-7 h-7 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Prontos p/ Importação</p>
                                <p className="text-3xl font-bold text-orange-400">{importableFiles.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Zap className="w-6 h-6 text-yellow-400" />
                        Ações Rápidas
                    </h3>
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Upload */}
                        <div className="relative group">
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
                                className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-all duration-300 font-medium ${uploading
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105'
                                    } text-white`}
                            >
                                {uploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Upload className="w-5 h-5" />
                                )}
                                {uploading ? 'Enviando...' : 'Upload Arquivo'}
                            </label>
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={loadFiles}
                            disabled={loading}
                            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-gray-500/25 hover:shadow-xl hover:shadow-gray-500/40 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            Atualizar
                        </button>

                        {/* View Toggle */}
                        <div className="flex bg-gray-800/50 rounded-xl p-2 border border-gray-700/50">
                            <button
                                onClick={() => setCurrentView('files')}
                                className={`px-6 py-3 rounded-lg transition-all duration-300 font-medium ${currentView === 'files'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
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
                                className={`px-6 py-3 rounded-lg transition-all duration-300 font-medium ${currentView === 'import'
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
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
                                className={`px-6 py-3 rounded-lg transition-all duration-300 font-medium ${currentView === 'duplicates'
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                    }`}
                            >
                                <Trash2 className="w-4 h-4 inline mr-2" />
                                Duplicatas ({duplicateGroups.length})
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentView('database-duplicates');
                                    if (databaseDuplicates.length === 0) {
                                        detectDatabaseDuplicates();
                                    }
                                }}
                                className={`px-6 py-3 rounded-lg transition-all duration-300 font-medium ${currentView === 'database-duplicates'
                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/25'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                    }`}
                            >
                                <Database className="w-4 h-4 inline mr-2" />
                                DB Duplicatas ({databaseDuplicates.length})
                            </button>
                        </div>

                        {/* AI Features */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={runSmartAnalysis}
                                disabled={isSmartAnalyzing}
                                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
                            >
                                {isSmartAnalyzing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Brain className="w-5 h-5" />
                                )}
                                {isSmartAnalyzing ? 'Analisando...' : 'IA Smart Analysis'}
                            </button>

                            <button
                                onClick={autoOrganizeFiles}
                                disabled={autoOrganizing}
                                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
                            >
                                {autoOrganizing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Wand2 className="w-5 h-5" />
                                )}
                                {autoOrganizing ? 'Organizando...' : 'Auto Organizar'}
                            </button>

                            {currentView === 'import' && (
                                <>
                                    <button
                                        onClick={detectStyleAndLabelBatch}
                                        disabled={detectingStylesAndLabels}
                                        className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
                                    >
                                        {detectingStylesAndLabels ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Globe className="w-5 h-5" />
                                        )}
                                        {detectingStylesAndLabels ? 'Detectando...' : 'Detectar Estilos IA'}
                                    </button>

                                    {Object.keys(detectedStyles).length > 0 && (
                                        <button
                                            onClick={applyAllDetectedStyles}
                                            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105"
                                        >
                                            <Sparkles className="w-5 h-5" />
                                            Aplicar Todos ({Object.keys(detectedStyles).length})
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 max-w-md ml-auto">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar arquivos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Smart Analysis Dashboard */}
                {showSmartDashboard && smartAnalysis && typeof smartAnalysis === 'object' &&
                    smartAnalysis.totalFiles !== undefined && smartAnalysis.audioFiles !== undefined && (
                        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50 shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/25">
                                        <Brain className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                                            Smart Analysis Dashboard
                                        </h2>
                                        <p className="text-gray-400 text-lg">Análise inteligente da sua biblioteca de música</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSmartDashboard(false)}
                                    className="p-3 hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-110 text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <BarChart3 className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <h3 className="font-bold text-white text-lg">Análise Geral</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                            <span className="text-gray-300 font-medium">Total de Arquivos:</span>
                                            <span className="text-white font-bold text-lg">{typeof smartAnalysis?.totalFiles === 'number' ? smartAnalysis.totalFiles : 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                            <span className="text-gray-300 font-medium">Gêneros Únicos:</span>
                                            <span className="text-white font-bold text-lg">{smartAnalysis?.genreDistribution && typeof smartAnalysis.genreDistribution === 'object' ? Object.keys(smartAnalysis.genreDistribution).length : 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                            <span className="text-gray-300 font-medium">BPM Médio:</span>
                                            <span className="text-white font-bold text-lg">{smartAnalysis?.bpmRange?.avg && typeof smartAnalysis.bpmRange.avg === 'number' ? smartAnalysis.bpmRange.avg : 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                            <span className="text-gray-400 font-medium">Qualidade Média:</span>
                                            <span className="text-white font-bold text-lg">{typeof smartAnalysis?.averageQuality === 'number' ? smartAnalysis.averageQuality : 0}/10</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <Target className="w-6 h-6 text-green-400" />
                                        </div>
                                        <h3 className="font-bold text-white text-lg">Top Gêneros</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {smartAnalysis?.topGenres && Array.isArray(smartAnalysis.topGenres) && smartAnalysis.topGenres.length > 0 ? (
                                            smartAnalysis.topGenres.slice(0, 5).map((genre: any, index: number) => {
                                                // Verificar se o genre é um objeto válido
                                                if (!genre || typeof genre !== 'object' || !genre.genre || !genre.count) {
                                                    return null;
                                                }
                                                return (
                                                    <div key={`${genre.genre}-${index}`} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg hover:bg-gray-600/30 transition-colors duration-200">
                                                        <span className="text-gray-300 font-medium">{String(genre.genre)}:</span>
                                                        <span className="text-white font-bold text-lg">{String(genre.count)}</span>
                                                    </div>
                                                );
                                            }).filter(Boolean)
                                        ) : (
                                            <div className="text-gray-500 text-sm p-3 bg-gray-700/30 rounded-lg">Nenhum gênero detectado</div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <Sparkles className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <h3 className="font-bold text-white text-lg">Recomendações</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {smartRecommendations && Array.isArray(smartRecommendations) && smartRecommendations.length > 0 ? (
                                            smartRecommendations.slice(0, 3).map((rec, index) => {
                                                // Verificar se rec é um objeto válido
                                                if (!rec || typeof rec !== 'object' || !rec.title || !rec.description || !rec.priority) {
                                                    return null;
                                                }
                                                return (
                                                    <div key={`${rec.type}-${rec.title}-${index}`} className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl p-4 hover:from-gray-600/50 hover:to-gray-500/50 transition-all duration-300 border border-gray-600/30">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className={`w-3 h-3 rounded-full ${rec.priority === 'high' ? 'bg-red-400' :
                                                                rec.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                                                                }`} />
                                                            <span className="text-sm font-bold text-white">{String(rec.title)}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-300 leading-relaxed">{String(rec.description)}</p>
                                                    </div>
                                                );
                                            }).filter(Boolean)
                                        ) : (
                                            <div className="text-gray-500 text-sm p-3 bg-gray-700/30 rounded-lg">Nenhuma recomendação disponível</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                {/* Content */}
                {(() => {
                    if (currentView === 'files') {
                        return (
                            /* Files View */
                            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl">
                                <div className="px-8 py-6 bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-b border-gray-600/50">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
                                            <Folder className="w-6 h-6 text-blue-400" />
                                        </div>
                                        Arquivos no Storage ({filteredFiles.length})
                                    </h3>
                                </div>

                                {loading ? (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                                        </div>
                                        <p className="text-gray-300 text-lg font-medium">Carregando arquivos...</p>
                                    </div>
                                ) : filteredFiles.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <Cloud className="w-10 h-10 text-gray-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-300 mb-3">
                                            {files.length === 0 ? 'Nenhum arquivo encontrado' : 'Nenhum resultado'}
                                        </h3>
                                        <p className="text-gray-400 text-lg">
                                            {files.length === 0
                                                ? 'Faça upload de alguns arquivos para começar'
                                                : 'Tente ajustar sua busca'
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-700/50">
                                        {filteredFiles.map((file) => (
                                            <div key={file.key} className="p-6 hover:bg-gray-800/50 transition-all duration-300 group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${file.isAudio
                                                            ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-purple-400'
                                                            : 'bg-gradient-to-br from-gray-500/20 to-gray-600/20 text-gray-400'
                                                            }`}>
                                                            {file.isAudio ? (
                                                                <Volume2 className="w-6 h-6" />
                                                            ) : (
                                                                <File className="w-6 h-6" />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-white truncate text-lg group-hover:text-blue-400 transition-colors duration-300">
                                                                {file.filename}
                                                            </h4>
                                                            <div className="flex items-center gap-6 text-sm text-gray-300 mt-2">
                                                                <span className="flex items-center gap-2 bg-gray-700/30 px-3 py-1 rounded-lg">
                                                                    <HardDrive className="w-4 h-4" />
                                                                    {formatFileSize(file.size)}
                                                                </span>
                                                                <span className="flex items-center gap-2 bg-gray-700/30 px-3 py-1 rounded-lg">
                                                                    <Calendar className="w-4 h-4" />
                                                                    {new Date(file.lastModified).toLocaleDateString('pt-BR')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {file.isAudio && (
                                                            <button
                                                                onClick={() => window.open(file.url, '_blank')}
                                                                className="p-3 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-400/20 hover:to-green-500/20 text-green-400 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
                                                                title="Ouvir prévia"
                                                            >
                                                                <Volume2 className="w-5 h-5" />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => window.open(file.url, '_blank')}
                                                            className="p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-400/20 hover:to-blue-500/20 text-blue-400 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
                                                            title="Download"
                                                        >
                                                            <Download className="w-5 h-5" />
                                                        </button>

                                                        <button
                                                            onClick={() => deleteFile(file.key)}
                                                            className="p-3 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-400/20 hover:to-red-500/20 text-red-400 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg"
                                                            title="Deletar"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
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
                                        {existingStats && existingStats.existingCount > 0 && (
                                            <span className="text-sm text-yellow-400 ml-2 px-2 py-1 bg-yellow-900/20 border border-yellow-700/50 rounded">
                                                ⚠️ {existingStats.existingCount} já existem
                                            </span>
                                        )}
                                    </h3>

                                    {/* Mensagem de Status */}
                                    {existingStats && existingStats.existingCount > 0 && (
                                        <div className="px-4 py-2 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                                            <div className="flex items-center gap-2 text-yellow-200 text-sm">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span>
                                                    ⚠️ <strong>{existingStats.existingCount}</strong> arquivos já existem no banco de dados.
                                                    Clique em <strong>"Sincronizar"</strong> para atualizar a lista.
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Status de Sincronização */}
                                    <div className="px-4 py-2 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-blue-200 text-sm">
                                                <Database className="w-4 h-4" />
                                                <span>
                                                    💡 <strong>Dica:</strong> Se as músicas continuam aparecendo após importar em <code className="bg-blue-800/50 px-1 rounded">/admin/add-music</code>,
                                                    use <strong>"Forçar Sincronização"</strong> para limpar o cache e reconectar.
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={syncWithDatabase}
                                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                                                >
                                                    <RefreshCw className="w-3 h-3 inline mr-1" />
                                                    Sincronizar
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        setMessage('🔄 Forçando sincronização completa...');
                                                        try {
                                                            setExistingStats(null);
                                                            setDuplicateStats(null);
                                                            await syncWithDatabase();
                                                            showMessage('✅ Sincronização forçada concluída!', 'success');
                                                        } catch (error) {
                                                            console.error('❌ Erro na sincronização forçada:', error);
                                                            showMessage('❌ Erro na sincronização forçada', 'error');
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                                                >
                                                    <Zap className="w-3 h-3 inline mr-1" />
                                                    Forçar
                                                </button>
                                            </div>
                                        </div>
                                    </div>

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
                                                        {Object.keys(folders).map((folder) => {
                                                            const folderInfo = folders[folder];
                                                            const getStatusColor = (status: string) => {
                                                                switch (status) {
                                                                    case 'completed':
                                                                        return 'text-green-400 border-green-500';
                                                                    case 'partial':
                                                                        return 'text-yellow-400 border-yellow-500';
                                                                    case 'started':
                                                                        return 'text-orange-400 border-orange-500';
                                                                    case 'pending':
                                                                        return 'text-red-400 border-red-500';
                                                                    default:
                                                                        return 'text-gray-400 border-gray-500';
                                                                }
                                                            };

                                                            const getStatusIcon = (status: string) => {
                                                                switch (status) {
                                                                    case 'completed':
                                                                        return '✅';
                                                                    case 'partial':
                                                                        return '🟡';
                                                                    case 'started':
                                                                        return '🟠';
                                                                    case 'pending':
                                                                        return '🔴';
                                                                    default:
                                                                        return '📁';
                                                                }
                                                            };

                                                            return (
                                                                <button
                                                                    key={folder}
                                                                    onClick={handleSelectFolder(folder)}
                                                                    className={`w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-white text-sm border-l-2 ${getStatusColor(folderInfo?.status || 'unknown')}`}
                                                                    title={folderInfo ? `${folderInfo.existingFiles}/${folderInfo.totalFiles} arquivos importados (${folderInfo.importPercentage?.toFixed(1)}%)` : folder}
                                                                >
                                                                    {getStatusIcon(folderInfo?.status || 'unknown')} {folder}
                                                                    {folderInfo && (
                                                                        <span className="text-xs ml-2 opacity-75">
                                                                            {folderInfo.importableFiles || 0} para importar
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
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
                                            onClick={syncWithDatabase}
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                            title="Sincronizar com o estado atual do banco de dados"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Sincronizar
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setMessage('🔄 Forçando sincronização completa...');
                                                try {
                                                    // Limpa estados antigos
                                                    setExistingStats(null);
                                                    setDuplicateStats(null);

                                                    // Força uma sincronização completa
                                                    await syncWithDatabase();

                                                    showMessage('✅ Sincronização forçada concluída!', 'success');
                                                } catch (error) {
                                                    console.error('❌ Erro na sincronização forçada:', error);
                                                    showMessage('❌ Erro na sincronização forçada', 'error');
                                                }
                                            }}
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                            title="Forçar sincronização completa (limpa cache e reconecta)"
                                        >
                                            <Zap className="w-4 h-4" />
                                            Forçar Sincronização
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

                                        {/* Threshold IA */}
                                        <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
                                            <label className="text-xs text-gray-300 whitespace-nowrap">Confiança IA ≥ {(aiConfidenceThreshold * 100).toFixed(0)}%</label>
                                            <input
                                                type="range"
                                                min={0.3}
                                                max={0.9}
                                                step={0.01}
                                                value={aiConfidenceThreshold}
                                                onChange={e => setAiConfidenceThreshold(parseFloat(e.target.value))}
                                                className="w-28 accent-purple-500"
                                                title="Define o nível mínimo de confiança para aplicar estilo/gravadora da IA"
                                            />
                                        </div>

                                        <button
                                            onClick={async () => {
                                                const selected = importableFiles.filter(item => selectedFiles.includes(item.file.key));

                                                // Verificar duplicatas antes de gerar os dados
                                                try {
                                                    setMessage('Verificando duplicatas...');

                                                    // Preparar dados para verificação
                                                    const tracksToCheck = selected.map(item => ({
                                                        songName: item.importData.songName,
                                                        artist: item.importData.artist,
                                                        previewUrl: item.file.url,
                                                        downloadUrl: item.file.url
                                                    }));

                                                    const response = await fetch('/api/tracks/check-duplicates', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify(tracksToCheck)
                                                    });

                                                    if (response.ok) {
                                                        const result = await response.json();

                                                        if (result.summary.duplicates > 0) {
                                                            // Filtrar apenas músicas únicas
                                                            const uniqueTracks = result.unique;
                                                            const uniqueSelected = selected.filter(item => {
                                                                const trackKey = `${item.importData.artist} - ${item.importData.songName}`.toLowerCase();
                                                                return uniqueTracks.some((unique: { artist: string; songName: string }) =>
                                                                    `${unique.artist} - ${unique.songName}`.toLowerCase() === trackKey
                                                                );
                                                            });

                                                            if (uniqueSelected.length === 0) {
                                                                showMessage(`❌ Todas as ${selected.length} músicas selecionadas já existem no banco de dados!`, 'error');
                                                                return;
                                                            }

                                                            const text = uniqueSelected.map(item => `${item.importData.songName} - ${item.importData.artist}\n${item.file.url}`).join('\n\n');
                                                            await navigator.clipboard.writeText(text);

                                                            showMessage(`✅ ${uniqueSelected.length} músicas únicas copiadas! ${result.summary.duplicates} duplicatas filtradas.`, 'success');
                                                        } else {
                                                            // Todas são únicas
                                                            const text = selected.map(item => `${item.importData.songName} - ${item.importData.artist}\n${item.file.url}`).join('\n\n');
                                                            await navigator.clipboard.writeText(text);

                                                            showMessage(`✅ ${selected.length} músicas copiadas! Todas são únicas.`, 'success');
                                                        }
                                                    } else {
                                                        // Se a verificação falhar, copiar todas mas mostrar aviso
                                                        const text = selected.map(item => `${item.importData.songName} - ${item.importData.artist}\n${item.file.url}`).join('\n\n');
                                                        await navigator.clipboard.writeText(text);

                                                        showMessage(`⚠️ ${selected.length} músicas copiadas! Verificação de duplicatas falhou.`, 'error');
                                                    }
                                                } catch (error) {
                                                    console.error('Erro ao verificar duplicatas:', error);
                                                    // Fallback: copiar todas mas mostrar aviso
                                                    const text = selected.map(item => `${item.importData.songName} - ${item.importData.artist}\n${item.file.url}`).join('\n\n');
                                                    await navigator.clipboard.writeText(text);

                                                    showMessage(`⚠️ ${selected.length} músicas copiadas! Erro na verificação de duplicatas.`, 'error');
                                                }
                                            }}
                                            disabled={selectedFiles.length === 0}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Copiar Todas
                                        </button>

                                        <button
                                            onClick={async () => {
                                                const selected = importableFiles.filter(item => selectedFiles.includes(item.file.key));

                                                if (selected.length === 0) {
                                                    showMessage('Nenhuma música selecionada', 'error');
                                                    return;
                                                }

                                                // Verificar duplicatas antes de gerar o JSON
                                                try {
                                                    setMessage('Verificando duplicatas e gerando JSON...');

                                                    // Preparar dados para verificação
                                                    const tracksToCheck = selected.map(item => ({
                                                        songName: item.importData.songName,
                                                        artist: item.importData.artist,
                                                        previewUrl: item.file.url,
                                                        downloadUrl: item.file.url
                                                    }));

                                                    const response = await fetch('/api/tracks/check-duplicates', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify(tracksToCheck)
                                                    });

                                                    if (response.ok) {
                                                        const result = await response.json();

                                                        if (result.summary.duplicates > 0) {
                                                            // Filtrar apenas músicas únicas
                                                            const uniqueTracks = result.unique;
                                                            const uniqueSelected = selected.filter(item => {
                                                                const trackKey = `${item.importData.artist} - ${item.importData.songName}`.toLowerCase();
                                                                return uniqueTracks.some((unique: { artist: string; songName: string }) =>
                                                                    `${unique.artist} - ${unique.songName}`.toLowerCase() === trackKey
                                                                );
                                                            });

                                                            if (uniqueSelected.length === 0) {
                                                                showMessage(`❌ Todas as ${selected.length} músicas selecionadas já existem no banco de dados!`, 'error');
                                                                return;
                                                            }

                                                            // Gerar JSON apenas com músicas únicas
                                                            const jsonData = uniqueSelected.map(item => ({
                                                                songName: item.importData.songName,
                                                                artist: item.importData.artist,
                                                                style: item.importData.style,
                                                                version: item.importData.version,
                                                                imageUrl: item.importData.imageUrl,
                                                                previewUrl: item.file.url,
                                                                downloadUrl: item.file.url,
                                                                releaseDate: item.importData.releaseDate,
                                                                pool: item.importData.pool || item.label || 'Nexor Records',
                                                                bitrate: item.importData.bitrate
                                                            }));

                                                            const jsonText = JSON.stringify(jsonData, null, 2);
                                                            await navigator.clipboard.writeText(jsonText);

                                                            showMessage(`✅ JSON gerado com ${uniqueSelected.length} músicas únicas! ${result.summary.duplicates} duplicatas filtradas.`, 'success');
                                                        } else {
                                                            // Todas são únicas
                                                            const jsonData = selected.map(item => ({
                                                                songName: item.importData.songName,
                                                                artist: item.importData.artist,
                                                                style: item.importData.style,
                                                                version: item.importData.version,
                                                                imageUrl: item.importData.imageUrl,
                                                                previewUrl: item.file.url,
                                                                downloadUrl: item.file.url,
                                                                releaseDate: item.importData.releaseDate,
                                                                pool: item.importData.pool || item.label || 'Nexor Records',
                                                                bitrate: item.importData.bitrate
                                                            }));

                                                            const jsonText = JSON.stringify(jsonData, null, 2);
                                                            await navigator.clipboard.writeText(jsonText);

                                                            showMessage(`✅ JSON gerado com ${selected.length} músicas! Todas são únicas.`, 'success');
                                                        }
                                                    } else {
                                                        // Se a verificação falhar, gerar JSON com todas mas mostrar aviso
                                                        const jsonData = selected.map(item => ({
                                                            songName: item.importData.songName,
                                                            artist: item.importData.artist,
                                                            style: item.importData.style,
                                                            version: item.importData.version,
                                                            imageUrl: item.importData.imageUrl,
                                                            previewUrl: item.file.url,
                                                            downloadUrl: item.file.url,
                                                            releaseDate: item.importData.releaseDate,
                                                            pool: item.importData.pool || item.label || 'Nexor Records',
                                                            bitrate: item.importData.bitrate
                                                        }));

                                                        const jsonText = JSON.stringify(jsonData, null, 2);
                                                        await navigator.clipboard.writeText(jsonText);

                                                        showMessage(`⚠️ JSON gerado com ${selected.length} músicas! Verificação de duplicatas falhou.`, 'error');
                                                    }
                                                } catch (error) {
                                                    console.error('Erro ao verificar duplicatas:', error);
                                                    // Fallback: gerar JSON com todas mas mostrar aviso
                                                    const jsonData = selected.map(item => ({
                                                        songName: item.importData.songName,
                                                        artist: item.importData.artist,
                                                        style: item.importData.style,
                                                        version: item.importData.version,
                                                        imageUrl: item.importData.imageUrl,
                                                        previewUrl: item.file.url,
                                                        downloadUrl: item.file.url,
                                                        releaseDate: item.importData.releaseDate,
                                                        pool: item.importData.pool || item.label || 'NexorRecords',
                                                        bitrate: item.importData.bitrate
                                                    }));

                                                    const jsonText = JSON.stringify(jsonData, null, 2);
                                                    await navigator.clipboard.writeText(jsonText);

                                                    showMessage(`⚠️ JSON gerado com ${selected.length} músicas! Erro na verificação de duplicatas.`, 'error');
                                                }
                                            }}
                                            disabled={selectedFiles.length === 0}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Gerar JSON
                                        </button>
                                    </div>
                                </div>

                                {/* Resumo IA */}
                                {Object.keys(detectedStyles).length > 0 && (
                                    <div className="px-6 py-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-b border-green-600/30">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-600/20 rounded-lg">
                                                    <Bot className="w-5 h-5 text-green-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-green-400">IA Detectou Dados Automaticamente</h4>
                                                    <p className="text-sm text-gray-300">
                                                        {Object.keys(detectedStyles).length} arquivo(s) com estilo e gravadora detectados
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={applyAllDetectedStyles}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                    Aplicar Todos
                                                </button>
                                                <button
                                                    onClick={() => setDetectedStyles({})}
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                                >
                                                    Limpar
                                                </button>
                                            </div>
                                        </div>

                                        {/* Campo para sobrescrever estilo em lote */}
                                        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600/30">
                                            <div className="flex items-center gap-3 mb-3">
                                                <label className="text-sm font-medium text-gray-300 min-w-fit">
                                                    Sobrescrever estilo para selecionados:
                                                </label>
                                                <select
                                                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    onChange={(e) => {
                                                        const newStyle = e.target.value;
                                                        if (newStyle && selectedFiles.length > 0) {
                                                            // Aplica o estilo selecionado para todos os arquivos marcados
                                                            setImportableFiles(prev => {
                                                                const updated = [...prev];
                                                                selectedFiles.forEach(fileKey => {
                                                                    const fileIndex = updated.findIndex(item => item.file.key === fileKey);
                                                                    if (fileIndex !== -1) {
                                                                        updated[fileIndex] = {
                                                                            ...updated[fileIndex],
                                                                            importData: {
                                                                                ...updated[fileIndex].importData,
                                                                                style: newStyle
                                                                            }
                                                                        };
                                                                    }
                                                                });
                                                                return updated;
                                                            });
                                                            showMessage(`🎯 Estilo "${newStyle}" aplicado a ${selectedFiles.length} arquivo(s) selecionado(s)`, 'success');
                                                            e.target.value = ''; // Reset select
                                                        }
                                                    }}
                                                    defaultValue=""
                                                >
                                                    <option value="">Selecione um estilo...</option>
                                                    {styleOptions.map(style => (
                                                        <option key={style} value={style}>{style}</option>
                                                    ))}
                                                </select>
                                                <span className="text-xs text-gray-400 min-w-fit">
                                                    ({selectedFiles.length} selecionados)
                                                </span>
                                            </div>

                                            {/* Campo para definir label manualmente */}
                                            <div className="flex items-center gap-3">
                                                <label className="text-sm font-medium text-gray-300 min-w-fit">
                                                    Definir label para selecionados:
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex: 8th Wonder, Spinnin' Records, etc..."
                                                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const newLabel = e.currentTarget.value.trim();
                                                            if (newLabel && selectedFiles.length > 0) {
                                                                // Aplica o label para todos os arquivos marcados
                                                                setImportableFiles(prev => {
                                                                    const updated = [...prev];
                                                                    selectedFiles.forEach(fileKey => {
                                                                        const fileIndex = updated.findIndex(item => item.file.key === fileKey);
                                                                        if (fileIndex !== -1) {
                                                                            updated[fileIndex] = {
                                                                                ...updated[fileIndex],
                                                                                label: newLabel
                                                                            };
                                                                        }
                                                                    });
                                                                    return updated;
                                                                });
                                                                showMessage(`🏷️ Label "${newLabel}" aplicado a ${selectedFiles.length} arquivo(s) selecionado(s)`, 'success');
                                                                e.currentTarget.value = ''; // Reset input
                                                            }
                                                        }
                                                    }}
                                                />
                                                <span className="text-xs text-gray-400 min-w-fit">
                                                    (Enter para aplicar)
                                                </span>
                                            </div>

                                            {/* Campo para definir bitrate em lote */}
                                            <div className="flex items-center gap-3 mt-3">
                                                <label className="text-sm font-medium text-gray-300 min-w-fit">
                                                    Definir bitrate para selecionados:
                                                </label>
                                                <select
                                                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    onChange={(e) => {
                                                        const newBitrate = e.target.value ? parseInt(e.target.value) : undefined;
                                                        if (selectedFiles.length > 0) {
                                                            // Aplica o bitrate para todos os arquivos marcados
                                                            setImportableFiles(prev => {
                                                                const updated = [...prev];
                                                                selectedFiles.forEach(fileKey => {
                                                                    const fileIndex = updated.findIndex(item => item.file.key === fileKey);
                                                                    if (fileIndex !== -1) {
                                                                        updated[fileIndex] = {
                                                                            ...updated[fileIndex],
                                                                            importData: {
                                                                                ...updated[fileIndex].importData,
                                                                                bitrate: newBitrate
                                                                            }
                                                                        };
                                                                    }
                                                                });
                                                                return updated;
                                                            });
                                                            const bitrateText = newBitrate ? `${newBitrate} kbps` : 'não definido';
                                                            showMessage(`🎵 Bitrate "${bitrateText}" aplicado a ${selectedFiles.length} arquivo(s) selecionado(s)`, 'success');
                                                            e.target.value = ''; // Reset select
                                                        }
                                                    }}
                                                    defaultValue=""
                                                >
                                                    <option value="">Selecione um bitrate...</option>
                                                    {bitrateOptions.map(bitrate => (
                                                        <option key={bitrate} value={bitrate}>{bitrate} kbps</option>
                                                    ))}
                                                    <option value="">Remover bitrate</option>
                                                </select>
                                                <span className="text-xs text-gray-400 min-w-fit">
                                                    ({selectedFiles.length} selecionados)
                                                </span>
                                            </div>

                                            {/* Botão para recarregar estilos do banco */}
                                            <div className="flex items-center gap-3 mt-3">
                                                <button
                                                    type="button"
                                                    onClick={loadStylesFromDatabase}
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                                                    title="Recarregar estilos do banco de dados"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                    Atualizar Estilos
                                                </button>
                                                <span className="text-xs text-gray-400">
                                                    {styleOptions.length} estilos carregados do banco
                                                </span>
                                            </div>

                                            {/* Campo para definir URL da capa manualmente */}
                                            <div className="flex items-center gap-3 mt-3">
                                                <label className="text-sm font-medium text-gray-300 min-w-fit">
                                                    Definir capa (URL) para selecionados:
                                                </label>
                                                <input
                                                    type="url"
                                                    placeholder="Ex: https://exemplo.com/capa.jpg (deixe vazio para usar padrão)"
                                                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const newImageUrl = e.currentTarget.value.trim() || 'https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png';
                                                            if (selectedFiles.length > 0) {
                                                                // Aplica a URL da capa para todos os arquivos marcados
                                                                setImportableFiles(prev => {
                                                                    const updated = [...prev];
                                                                    selectedFiles.forEach(fileKey => {
                                                                        const fileIndex = updated.findIndex(item => item.file.key === fileKey);
                                                                        if (fileIndex !== -1) {
                                                                            updated[fileIndex] = {
                                                                                ...updated[fileIndex],
                                                                                importData: {
                                                                                    ...updated[fileIndex].importData,
                                                                                    imageUrl: newImageUrl
                                                                                }
                                                                            };
                                                                        }
                                                                    });
                                                                    return updated;
                                                                });
                                                                const isDefault = !e.currentTarget.value.trim();
                                                                showMessage(`🖼️ ${isDefault ? 'Capa padrão' : 'Capa personalizada'} aplicada a ${selectedFiles.length} arquivo(s) selecionado(s)`, 'success');
                                                                e.currentTarget.value = ''; // Reset input
                                                            }
                                                        }
                                                    }}
                                                />
                                                <span className="text-xs text-gray-400 min-w-fit">
                                                    (Enter para aplicar)
                                                </span>
                                            </div>
                                        </div>

                                        {/* Preview dos dados detectados */}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {Object.entries(detectedStyles).slice(0, 3).map(([fileKey, detection]) => (
                                                <div key={fileKey} className="bg-gray-700/50 rounded-lg px-3 py-1 text-xs">
                                                    <span className="text-green-400">{detection.style}</span>
                                                    <span className="text-gray-400 mx-1">•</span>
                                                    <span className="text-blue-400">{detection.label}</span>
                                                    <span className="text-gray-500 ml-1">({Math.round(detection.confidence * 100)}%)</span>
                                                </div>
                                            ))}
                                            {Object.keys(detectedStyles).length > 3 && (
                                                <div className="bg-gray-700/50 rounded-lg px-3 py-1 text-xs text-gray-400">
                                                    +{Object.keys(detectedStyles).length - 3} mais
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

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

                                                {/* Estatísticas de Duplicatas */}
                                                {console.log('🔍 Renderizando estatísticas:', duplicateStats)}
                                                {duplicateStats && (
                                                    <div className="px-6 py-3 bg-gradient-to-r from-orange-900/20 to-red-900/20 border-b border-orange-600/30">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-orange-600/20 rounded-lg">
                                                                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-orange-400">Verificação de Duplicatas</h4>
                                                                    <p className="text-sm text-gray-300">
                                                                        {duplicateStats.totalFiles} arquivos analisados • {duplicateStats.uniqueFiles} únicos • {duplicateStats.duplicateGroups} grupos de duplicatas
                                                                    </p>
                                                                    {lastDuplicateCheck && (
                                                                        <p className="text-xs text-orange-200/70 mt-1">
                                                                            Última verificação: {lastDuplicateCheck.toLocaleTimeString('pt-BR')}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={refreshDuplicateCheck}
                                                                    className="px-3 py-1 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 text-sm rounded-full border border-orange-500/30 transition-colors"
                                                                    title="Atualizar verificação de duplicatas"
                                                                >
                                                                    🔄 Atualizar
                                                                </button>
                                                                {duplicateStats.duplicateGroups > 0 && (
                                                                    <span className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-full border border-red-500/30">
                                                                        ⚠️ {duplicateStats.duplicateGroups} duplicatas encontradas
                                                                    </span>
                                                                )}
                                                                {duplicateStats.sizeSaved > 0 && (
                                                                    <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30">
                                                                        💾 {duplicateStats.sizeSaved} MB economizados
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

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
                                                                    <div className="p-2 bg-purple-600/20 rounded-lg mt-1 w-16 h-16 flex items-center justify-center">
                                                                        {detectedStyles[item.file.key]?.coverImage ? (
                                                                            <img
                                                                                src={detectedStyles[item.file.key].coverImage}
                                                                                alt="Capa da música"
                                                                                className="w-full h-full object-cover rounded"
                                                                                onError={(e) => {
                                                                                    // Fallback para a capa padrão se a imagem falhar
                                                                                    e.currentTarget.src = 'https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png';
                                                                                }}
                                                                            />
                                                                        ) : item.importData.imageUrl ? (
                                                                            <img
                                                                                src={item.importData.imageUrl}
                                                                                alt="Capa padrão da música"
                                                                                className="w-full h-full object-cover rounded"
                                                                                onError={(e) => {
                                                                                    // Fallback final para o ícone se tudo falhar
                                                                                    e.currentTarget.style.display = 'none';
                                                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <img
                                                                                src="https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png"
                                                                                alt="Capa padrão Nexor Records"
                                                                                className="w-full h-full object-cover rounded"
                                                                                onError={(e) => {
                                                                                    // Fallback final para o ícone se tudo falhar
                                                                                    e.currentTarget.style.display = 'none';
                                                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                                }}
                                                                            />
                                                                        )}
                                                                        <Music className="w-8 h-8 text-purple-400 hidden" />
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
                                                                                        <div className="flex items-center gap-2">
                                                                                            <select
                                                                                                className={`bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white ${detectedStyles[item.file.key] ? 'border-green-500 bg-green-900/20' : ''
                                                                                                    }`}
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
                                                                                                {styleOptions.map((style, index) => (
                                                                                                    <option key={`${style}-${index}`} value={style}>{style}</option>
                                                                                                ))}
                                                                                                <option value="__new">Adicionar novo...</option>
                                                                                            </select>
                                                                                            {detectedStyles[item.file.key] && (
                                                                                                <div className="flex items-center gap-1">
                                                                                                    <Bot className="w-4 h-4 text-green-400" />
                                                                                                    <span className="text-xs text-green-400 font-semibold">
                                                                                                        IA: {detectedStyles[item.file.key].style}
                                                                                                    </span>
                                                                                                    <span className="text-xs text-gray-400">
                                                                                                        ({Math.round(detectedStyles[item.file.key].confidence * 100)}%)
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                            <button
                                                                                                onClick={() => detectStyleAndLabel(item.file.key)}
                                                                                                disabled={analyzingFile === item.file.key}
                                                                                                className="p-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded transition-all disabled:opacity-50"
                                                                                                title="Detectar estilo com IA"
                                                                                            >
                                                                                                {analyzingFile === item.file.key ? (
                                                                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                                                                ) : (
                                                                                                    <Zap className="w-3 h-3" />
                                                                                                )}
                                                                                            </button>
                                                                                        </div>
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

                                                                                    {/* Campo para Label - Manual tem prioridade sobre IA */}
                                                                                    {item.label ? (
                                                                                        // Label definido manualmente
                                                                                        <div className="flex items-center gap-2 mt-2">
                                                                                            <span className="text-gray-500 w-16">Label:</span>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    value={item.label}
                                                                                                    className="bg-gray-700 border border-blue-500 bg-blue-900/20 rounded px-2 py-1 text-white"
                                                                                                    onChange={e => {
                                                                                                        const newLabel = e.target.value;
                                                                                                        setImportableFiles((prev) => {
                                                                                                            const updated = [...prev];
                                                                                                            const fileIndex = prev.findIndex(p => p.file.key === item.file.key);
                                                                                                            if (fileIndex > -1) {
                                                                                                                updated[fileIndex] = {
                                                                                                                    ...updated[fileIndex],
                                                                                                                    label: newLabel
                                                                                                                };
                                                                                                            }
                                                                                                            return updated;
                                                                                                        });
                                                                                                    }}
                                                                                                />
                                                                                                <div className="flex items-center gap-1">
                                                                                                    <span className="text-xs text-blue-400 font-semibold">Manual</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : detectedStyles[item.file.key]?.label ? (
                                                                                        // Label detectado pela IA (só aparece se não há manual)
                                                                                        <div className="flex items-center gap-2 mt-2">
                                                                                            <span className="text-gray-500 w-16">Label:</span>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    value={detectedStyles[item.file.key].label}
                                                                                                    className="bg-gray-700 border border-green-500 bg-green-900/20 rounded px-2 py-1 text-white"
                                                                                                    readOnly
                                                                                                />
                                                                                                <div className="flex items-center gap-1">
                                                                                                    <Bot className="w-4 h-4 text-green-400" />
                                                                                                    <span className="text-xs text-green-400 font-semibold">IA Detectada</span>
                                                                                                    <span className="text-xs text-gray-400">
                                                                                                        ({Math.round(detectedStyles[item.file.key].confidence * 100)}%)
                                                                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : null}

                                                                                    {/* Campo para Bitrate */}
                                                                                    <div className="flex items-center gap-2 mt-2">
                                                                                        <span className="text-gray-500 w-16">Bitrate:</span>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <select
                                                                                                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                                                                                                value={item.importData.bitrate || ''}
                                                                                                onChange={e => {
                                                                                                    const newBitrate = e.target.value ? parseInt(e.target.value) : undefined;
                                                                                                    setImportableFiles((prev) => {
                                                                                                        const updated = [...prev];
                                                                                                        const fileIndex = prev.findIndex(p => p.file.key === item.file.key);
                                                                                                        if (fileIndex > -1) {
                                                                                                            updated[fileIndex] = {
                                                                                                                ...updated[fileIndex],
                                                                                                                importData: {
                                                                                                                    ...updated[fileIndex].importData,
                                                                                                                    bitrate: newBitrate
                                                                                                                }
                                                                                                            };
                                                                                                        }
                                                                                                        return updated;
                                                                                                    });
                                                                                                }}
                                                                                            >
                                                                                                <option value="">Não definido</option>
                                                                                                {bitrateOptions.map(bitrate => (
                                                                                                    <option key={bitrate} value={bitrate}>{bitrate} kbps</option>
                                                                                                ))}
                                                                                            </select>
                                                                                            <div className="flex items-center gap-1">
                                                                                                <span className="text-xs text-purple-400 font-semibold">Qualidade</span>
                                                                                            </div>
                                                                                        </div>
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
                                        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-blue-200">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span className="text-sm">
                                                        💡 <strong>Dica:</strong> Após importar músicas em <code className="bg-blue-800/50 px-1 rounded">/admin/add-music</code>,
                                                        clique em <strong>"Sincronizar"</strong> para atualizar esta lista
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={syncWithDatabase}
                                                    className="inline-flex items-center gap-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                                                >
                                                    <RefreshCw className="w-3 h-3" />
                                                    Sincronizar
                                                </button>
                                            </div>
                                        </div>
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
                    } else if (currentView === 'database-duplicates') {
                        return (
                            /* Database Duplicates View */
                            <div className="bg-gray-800 rounded-xl overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-orange-800/50 to-red-800/50 border-b border-gray-600 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Database className="w-5 h-5 text-orange-300" />
                                        Detector de Duplicatas do Banco de Dados
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={detectDatabaseDuplicates}
                                            disabled={detectingDatabaseDuplicates}
                                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            {detectingDatabaseDuplicates ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                            {detectingDatabaseDuplicates ? 'Detectando...' : 'Detectar Duplicatas'}
                                        </button>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button
                                                onClick={selectAllDatabaseDuplicates}
                                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                                            >
                                                ✅ Selecionar Todos
                                            </button>
                                            <button
                                                onClick={() => selectDuplicatesByType('url')}
                                                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                                                title="Selecionar apenas URLs exatas (mais seguras)"
                                            >
                                                🔗 URLs Exatas
                                            </button>
                                            <button
                                                onClick={() => selectDuplicatesByType('name')}
                                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                                                title="Selecionar apenas nomes iguais"
                                            >
                                                📝 Nomes Iguais
                                            </button>
                                            <button
                                                onClick={() => selectDuplicatesByType('similarity')}
                                                className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
                                                title="Selecionar apenas por similaridade (revisar antes)"
                                            >
                                                🔍 Similaridade
                                            </button>
                                            <button
                                                onClick={selectDuplicatesBySize}
                                                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                                                title="Selecionar arquivos maiores (mais espaço)"
                                            >
                                                💾 Maiores
                                            </button>
                                            <button
                                                onClick={selectDuplicatesByRecentDate}
                                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
                                                title="Selecionar arquivos mais recentes"
                                            >
                                                📅 Mais Recentes
                                            </button>
                                            <button
                                                onClick={selectDuplicatesSmart}
                                                className="px-3 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg transition-colors text-sm"
                                                title="Seleção inteligente (URLs exatas + nomes iguais)"
                                            >
                                                🧠 Seleção Inteligente
                                            </button>
                                        </div>

                                        {selectedDatabaseDuplicates.length > 0 && (
                                            <div className="flex items-center gap-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-2">
                                                <div className="flex items-center gap-2 text-yellow-300">
                                                    <span className="font-semibold">📊 Selecionados:</span>
                                                    <span className="text-lg font-bold">{selectedDatabaseDuplicates.length}</span>
                                                    <span>de {databaseDuplicates.length}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={clearDatabaseDuplicateSelection}
                                                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                                                    >
                                                        ❌ Limpar Seleção
                                                    </button>
                                                    <button
                                                        onClick={removeDatabaseDuplicates}
                                                        disabled={removingDatabaseDuplicates}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors flex items-center gap-2"
                                                    >
                                                        {removingDatabaseDuplicates ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                        {removingDatabaseDuplicates ? 'Removendo...' : `🗑️ Remover (${selectedDatabaseDuplicates.length})`}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {databaseDuplicateStats && (
                                    <div className="px-6 py-4 bg-gray-700/50 border-b border-gray-600">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-gray-800/50 rounded-lg p-3">
                                                <div className="text-sm text-gray-400">URLs Exatas</div>
                                                <div className="text-xl font-bold text-green-400">{databaseDuplicateStats.exactUrlMatches}</div>
                                            </div>
                                            <div className="bg-gray-800/50 rounded-lg p-3">
                                                <div className="text-sm text-gray-400">Nomes Iguais</div>
                                                <div className="text-xl font-bold text-blue-400">{databaseDuplicateStats.nameMatches}</div>
                                            </div>
                                            <div className="bg-gray-800/50 rounded-lg p-3">
                                                <div className="text-sm text-gray-400">Similaridade</div>
                                                <div className="text-xl font-bold text-yellow-400">{databaseDuplicateStats.similarityMatches}</div>
                                            </div>
                                            <div className="bg-gray-800/50 rounded-lg p-3">
                                                <div className="text-sm text-gray-400">Espaço Total</div>
                                                <div className="text-xl font-bold text-red-400">{formatFileSize(databaseDuplicateStats.totalSize)}</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-center">
                                            <span className="text-sm text-gray-400">
                                                Similaridade Média: {(databaseDuplicateStats.averageSimilarity * 100).toFixed(1)}%
                                            </span>
                                        </div>

                                        {/* Estatísticas da Seleção Atual */}
                                        {selectedDatabaseDuplicates.length > 0 && (
                                            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                                <div className="text-center text-yellow-300 font-semibold mb-2">
                                                    📊 Estatísticas da Seleção Atual
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                    <div className="text-center">
                                                        <div className="text-yellow-400 font-bold">
                                                            {selectedDatabaseDuplicates.length}
                                                        </div>
                                                        <div className="text-gray-400">Selecionados</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-green-400 font-bold">
                                                            {formatFileSize(getSelectedDuplicatesSize())}
                                                        </div>
                                                        <div className="text-gray-400">Espaço</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-blue-400 font-bold">
                                                            {getSelectedDuplicatesByType('url').length}
                                                        </div>
                                                        <div className="text-gray-400">URLs Exatas</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-yellow-400 font-bold">
                                                            {getSelectedDuplicatesByType('similarity').length}
                                                        </div>
                                                        <div className="text-gray-400">Similaridade</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {detectingDatabaseDuplicates ? (
                                    <div className="p-8 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-400" />
                                        <p className="text-gray-400">Comparando arquivos do storage com o banco de dados...</p>
                                    </div>
                                ) : databaseDuplicates.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                                            Nenhuma duplicata encontrada
                                        </h3>
                                        <p className="text-gray-500">
                                            Clique em "Detectar Duplicatas" para comparar arquivos do storage com o banco de dados
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-700">
                                        {databaseDuplicates.map((duplicate, index) => (
                                            <div key={duplicate.storageFile.key} className="p-4">
                                                <div className="flex items-start gap-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDatabaseDuplicates.includes(duplicate.storageFile.key)}
                                                        onChange={() => toggleDatabaseDuplicateSelection(duplicate.storageFile.key)}
                                                        className="mt-2 w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                                                    />

                                                    <div className="flex-1 space-y-3">
                                                        {/* Arquivo no Storage */}
                                                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                                                                        <Cloud className="w-4 h-4 text-red-400" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-white">
                                                                            {duplicate.storageFile.filename}
                                                                        </div>
                                                                        <div className="text-sm text-gray-400">
                                                                            Storage • {formatFileSize(duplicate.storageFile.size)} • {new Date(duplicate.storageFile.lastModified).toLocaleDateString('pt-BR')}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => window.open(duplicate.storageFile.url, '_blank')}
                                                                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                                                                    title="Download do Storage"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Seta indicando duplicata */}
                                                        <div className="flex items-center justify-center">
                                                            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                                                                <span className="text-yellow-400 text-sm font-medium">
                                                                    {duplicate.matchType === 'url' ? '🔗 URL Exata' :
                                                                        duplicate.matchType === 'name' ? '📝 Nome Igual' :
                                                                            `🔍 ${(duplicate.similarity * 100).toFixed(1)}% Similar`}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Track no Banco de Dados */}
                                                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                                    <Database className="w-4 h-4 text-green-400" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-white">
                                                                        {duplicate.databaseTrack.artist} - {duplicate.databaseTrack.songName}
                                                                    </div>
                                                                    <div className="text-sm text-gray-400">
                                                                        Banco de Dados • ID: {duplicate.databaseTrack.id}
                                                                    </div>
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
                        );
                    }
                    return null;
                })()}
            </div>
        </div>
    );
}