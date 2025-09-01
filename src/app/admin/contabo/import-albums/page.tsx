"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    FolderOpen,
    Music,
    Album,
    Upload,
    Download,
    CheckCircle,
    AlertCircle,
    XCircle,
    Play,
    Pause,
    RefreshCw,
    Search,
    Filter,
    Eye,
    EyeOff
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useToastContext } from "@/context/ToastContext";

interface AlbumFile {
    key: string;
    url: string;
    size: number;
    lastModified: string;
    filename: string;
    artist?: string;
    album?: string;
    track?: string;
    genre?: string;
    bpm?: number;
    musicalKey?: string;
    duration?: string;
    selected?: boolean;
}

interface ImportProgress {
    total: number;
    processed: number;
    success: number;
    failed: number;
    current: string;
}

const ImportAlbumsPage = () => {
    const { data: session } = useSession();
    const { showToast } = useToastContext();

    // Estados
    const [albumFiles, setAlbumFiles] = useState<AlbumFile[]>([]);
    const [filteredFiles, setFilteredFiles] = useState<AlbumFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("");
    const [selectedArtist, setSelectedArtist] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [importProgress, setImportProgress] = useState<ImportProgress>({
        total: 0,
        processed: 0,
        success: 0,
        failed: 0,
        current: ""
    });

    // Verificar se está logado (removida restrição de admin)
    useEffect(() => {
        if (session?.user && !session?.user) {
            showToast("❌ Acesso negado. Usuário não autenticado.", "error");
        }
    }, [session, showToast]);

    // Carregar arquivos de álbuns do Contabo
    const loadAlbumFiles = async () => {
        if (!session?.user) return;

        setLoading(true);
        try {
            const response = await fetch('/api/contabo/albums');
            if (!response.ok) {
                throw new Error('Erro ao carregar álbuns');
            }

            const data = await response.json();
            const filesWithSelection = (data.files || []).map((file: any) => ({ ...file, selected: false }));
            setAlbumFiles(filesWithSelection);
            setFilteredFiles(filesWithSelection);

            showToast(`✅ ${data.files?.length || 0} arquivos de álbuns carregados`, "success");
        } catch (error) {
            console.error('Erro ao carregar álbuns:', error);
            showToast("❌ Erro ao carregar álbuns do Contabo", "error");
        } finally {
            setLoading(false);
        }
    };

    // Filtrar arquivos
    useEffect(() => {
        let filtered = albumFiles.map(file => ({ ...file })); // Clonar para manter referências

        if (searchQuery) {
            filtered = filtered.filter(file =>
                file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.album?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.track?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedGenre) {
            filtered = filtered.filter(file => file.genre === selectedGenre);
        }

        if (selectedArtist) {
            filtered = filtered.filter(file => file.artist === selectedArtist);
        }

        setFilteredFiles(filtered);
    }, [albumFiles, searchQuery, selectedGenre, selectedArtist]);

    // Importar álbuns selecionados
    const importSelectedAlbums = async () => {
        if (!session?.user) return;

        const selectedFiles = filteredFiles.filter(file => file.selected);
        if (selectedFiles.length === 0) {
            showToast("⚠️ Selecione pelo menos um álbum para importar", "warning");
            return;
        }

        setImporting(true);
        setImportProgress({
            total: selectedFiles.length,
            processed: 0,
            success: 0,
            failed: 0,
            current: ""
        });

        try {
            for (const file of selectedFiles) {
                setImportProgress(prev => ({
                    ...prev,
                    current: file.filename,
                    processed: prev.processed + 1
                }));

                try {
                    const response = await fetch('/api/contabo/import-album', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileKey: file.key, filename: file.filename })
                    });

                    if (response.ok) {
                        setImportProgress(prev => ({ ...prev, success: prev.success + 1 }));
                        showToast(`✅ ${file.filename} importado com sucesso`, "success");
                    } else {
                        setImportProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
                        showToast(`❌ Erro ao importar ${file.filename}`, "error");
                    }
                } catch (error) {
                    setImportProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
                    showToast(`❌ Erro ao importar ${file.filename}`, "error");
                }
            }
        } finally {
            setImporting(false);
            showToast(`✅ Importação concluída: ${importProgress.success} sucessos, ${importProgress.failed} falhas`, "success");
        }
    };

    // Gêneros e artistas únicos
    const uniqueGenres = Array.from(new Set(albumFiles.map(f => f.genre).filter(Boolean)));
    const uniqueArtists = Array.from(new Set(albumFiles.map(f => f.artist).filter(Boolean)));

    if (!session?.user) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <XCircle className="h-24 w-24 text-red-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
                        <p className="text-gray-400">Usuário não autenticado.</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-emerald-900/20 border-b border-gray-700/40">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl">
                                        <Album className="h-10 w-10 text-white" />
                                    </div>
                                    <div className="absolute -inset-3 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-3xl blur opacity-30 animate-pulse"></div>
                                </div>
                                <div>
                                    <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-2xl">
                                        IMPORTAR ÁLBUNS
                                    </h1>
                                    <p className="text-xl md:text-2xl text-gray-300 mt-2 font-medium">
                                        Importar álbuns do Contabo Storage
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conteúdo Principal */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Controles */}
                    <div className="mb-8 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <button
                                onClick={loadAlbumFiles}
                                disabled={loading}
                                className="px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                    <FolderOpen className="h-5 w-5" />
                                )}
                                {loading ? "Carregando..." : "Carregar Álbuns"}
                            </button>

                            <button
                                onClick={importSelectedAlbums}
                                disabled={importing || filteredFiles.filter(f => f.selected).length === 0}
                                className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {importing ? (
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Upload className="h-5 w-5" />
                                )}
                                {importing ? "Importando..." : "Importar Selecionados"}
                            </button>

                            <button
                                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                                className="px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg flex items-center gap-2"
                            >
                                {viewMode === "grid" ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                {viewMode === "grid" ? "Lista" : "Grid"}
                            </button>
                        </div>

                        {/* Barra de Pesquisa */}
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar álbuns, artistas, músicas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                                />
                            </div>

                            {/* Filtros */}
                            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                <select
                                    value={selectedGenre}
                                    onChange={(e) => setSelectedGenre(e.target.value)}
                                    className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                >
                                    <option value="">🎵 Todos os gêneros</option>
                                    {uniqueGenres.map(genre => (
                                        <option key={genre} value={genre}>🎧 {genre}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedArtist}
                                    onChange={(e) => setSelectedArtist(e.target.value)}
                                    className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                >
                                    <option value="">🎤 Todos os artistas</option>
                                    {uniqueArtists.map(artist => (
                                        <option key={artist} value={artist}>👤 {artist}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Progresso da Importação */}
                        {importing && (
                            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
                                    <h3 className="text-lg font-bold text-white">Importando Álbuns...</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-gray-300">
                                        <span>Processando: {importProgress.current}</span>
                                        <span>{importProgress.processed}/{importProgress.total}</span>
                                    </div>

                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(importProgress.processed / importProgress.total) * 100}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-400" />
                                            <span className="text-green-400">{importProgress.success} sucessos</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-400" />
                                            <span className="text-red-400">{importProgress.failed} falhas</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lista de Arquivos */}
                    {loading ? (
                        <div className="text-center py-20">
                            <RefreshCw className="h-16 w-16 text-purple-500 animate-spin mx-auto mb-4" />
                            <p className="text-gray-400 text-lg">Carregando álbuns do Contabo...</p>
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="text-center py-20">
                            <Album className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-4">Nenhum álbum encontrado</h3>
                            <p className="text-gray-400 mb-6">
                                {searchQuery || selectedGenre || selectedArtist
                                    ? "Tente ajustar os filtros de busca"
                                    : "Clique em 'Carregar Álbuns' para buscar no Contabo Storage."}
                            </p>
                            {!loading && (
                                <button
                                    onClick={loadAlbumFiles}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Carregar Álbuns
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-300">
                                    {filteredFiles.length} álbum{filteredFiles.length !== 1 ? 's' : ''} encontrado{filteredFiles.length !== 1 ? 's' : ''}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {filteredFiles.filter(f => f.selected).length} selecionado{filteredFiles.filter(f => f.selected).length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {viewMode === "grid" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredFiles.map((file, index) => (
                                        <div
                                            key={`${file.key}-${index}`}
                                            className={`group bg-gray-800/30 backdrop-blur-sm rounded-2xl border transition-all duration-300 hover:scale-105 ${file.selected
                                                ? 'border-purple-500/50 bg-purple-500/10'
                                                : 'border-gray-700/30 hover:border-purple-500/30'
                                                }`}
                                        >
                                            <div className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-white font-semibold mb-1 truncate">
                                                            {file.album || file.filename}
                                                        </h3>
                                                        <p className="text-gray-300 text-sm mb-1 truncate">
                                                            {file.artist || 'Artista desconhecido'}
                                                        </p>
                                                        {file.track && (
                                                            <p className="text-gray-400 text-xs truncate">
                                                                {file.track}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <input
                                                        type="checkbox"
                                                        checked={file.selected || false}
                                                        onChange={(e) => {
                                                            const updated = e.target.checked;
                                                            setAlbumFiles(prev =>
                                                                prev.map(f =>
                                                                    f.key === file.key
                                                                        ? { ...f, selected: updated }
                                                                        : f
                                                                )
                                                            );
                                                            setFilteredFiles(prev =>
                                                                prev.map(f =>
                                                                    f.key === file.key
                                                                        ? { ...f, selected: updated }
                                                                        : f
                                                                )
                                                            );
                                                        }}
                                                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                                                    />
                                                </div>

                                                {/* Detalhes */}
                                                <div className="space-y-2 text-xs text-gray-400">
                                                    {file.genre && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-1 bg-gray-700/50 rounded-full">
                                                                {file.genre}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <span>{file.duration || 'N/A'}</span>
                                                        <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                                                    </div>

                                                    {file.bpm && (
                                                        <div className="flex items-center gap-2">
                                                            <span>BPM: {file.bpm}</span>
                                                            {file.musicalKey && <span>Key: {file.musicalKey}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredFiles.map((file, index) => (
                                        <div
                                            key={`${file.key}-${index}`}
                                            className={`group bg-gray-800/30 backdrop-blur-sm rounded-2xl border p-4 transition-all duration-300 ${file.selected
                                                ? 'border-purple-500/50 bg-purple-500/10'
                                                : 'border-gray-700/30 hover:border-purple-500/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={file.selected || false}
                                                    onChange={(e) => {
                                                        const updated = e.target.checked;
                                                        setAlbumFiles(prev =>
                                                            prev.map(f =>
                                                                f.key === file.key
                                                                    ? { ...f, selected: updated }
                                                                    : f
                                                            )
                                                        );
                                                        setFilteredFiles(prev =>
                                                            prev.map(f =>
                                                                f.key === file.key
                                                                    ? { ...f, selected: updated }
                                                                    : f
                                                            )
                                                        );
                                                    }}
                                                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                                                />

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white font-semibold mb-1 truncate">
                                                        {file.album || file.filename}
                                                    </h3>
                                                    <p className="text-gray-300 text-sm mb-2 truncate">
                                                        {file.artist || 'Artista desconhecido'}
                                                    </p>
                                                    {file.track && (
                                                        <p className="text-gray-400 text-sm truncate">
                                                            {file.track}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    {file.genre && (
                                                        <span className="px-2 py-1 bg-gray-700/50 rounded-full">
                                                            {file.genre}
                                                        </span>
                                                    )}
                                                    <span>{file.duration || 'N/A'}</span>
                                                    <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
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
        </MainLayout>
    );
};

export default ImportAlbumsPage;
