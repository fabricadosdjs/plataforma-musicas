"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Upload,
    Music,
    Play,
    Download,
    Heart,
    Edit,
    Trash2,
    Plus,
    X,
    CheckCircle,
    Loader2,
    Image as ImageIcon,
    Disc,
    Star,
    Users,
    TrendingUp,
    RefreshCw
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface MusicFile {
    id: string;
    name: string;
    size: number;
    type: string;
    lastModified: number;
    file: File; // Arquivo real para upload
}

interface UploadedTrack {
    id: string;
    songName: string;
    artist: string;
    style: string;
    pool: string;
    folder: string;
    imageUrl: string;
    uploadedAt: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress?: number;
    downloadCount?: number;
    likeCount?: number;
}

const MyMusicPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Estados para upload
    const [selectedFile, setSelectedFile] = useState<MusicFile | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [songName, setSongName] = useState('');
    const [artistName, setArtistName] = useState('');
    const [style, setStyle] = useState('');
    const [pool, setPool] = useState('');
    const [folder, setFolder] = useState('');

    // Estados para controle do uploader
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStep, setUploadStep] = useState<'idle' | 'music-file' | 'cover-image' | 'details' | 'uploading' | 'completed'>('idle');
    const [uploadStage, setUploadStage] = useState<'idle' | 'preparing' | 'uploading-files' | 'saving-database' | 'finalizing' | 'completed' | 'error'>('idle');
    const [stageMessage, setStageMessage] = useState('');

    // Estados para lista de músicas
    const [userTracks, setUserTracks] = useState<UploadedTrack[]>([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [isLoadingTracks, setIsLoadingTracks] = useState(false);
    const [deletingTracks, setDeletingTracks] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/sign-in');
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            fetchUserTracks();
        }
    }, [session]);

    const fetchUserTracks = async () => {
        try {
            if (!session?.user?.email) return;

            setIsLoadingTracks(true);
            console.log('🔄 Iniciando busca de músicas...');

            const communityResponse = await fetch('/api/tracks/upload-community', {
                signal: AbortSignal.timeout(8000)
            });

            if (communityResponse.ok) {
                const communityData = await communityResponse.json();
                if (communityData.success && communityData.tracks) {
                    const tracks = communityData.tracks.map((track: any) => ({
                        id: track.id.toString(),
                        songName: track.songName,
                        artist: track.artist,
                        style: track.style || 'N/A',
                        pool: track.pool || 'N/A',
                        folder: track.folder || 'N/A',
                        imageUrl: track.imageUrl,
                        uploadedAt: new Date(track.createdAt).toISOString().split('T')[0],
                        status: 'success',
                        downloadCount: track._count?.downloads || 0,
                        likeCount: track._count?.likes || 0
                    }));
                    setUserTracks(tracks);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao buscar músicas:', error);
            setUserTracks([]);
        } finally {
            setIsLoadingTracks(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith('.mp3')) {
                alert('Por favor, selecione apenas arquivos MP3');
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                alert('O arquivo deve ter no máximo 50MB');
                return;
            }

            const fileName = file.name.replace(/\.[^/.]+$/, "");
            const parts = fileName.split(' - ');
            if (parts.length >= 2) {
                setArtistName(parts[0].trim());
                setSongName(parts[1].trim());
            } else {
                setSongName(fileName);
            }

            // Guardar o arquivo real para upload
            setSelectedFile({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                file: file // Adicionar o arquivo real
            });
        }
    };

    const handleCoverSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setCoverImage(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !coverImage || !songName || !artistName || !style || !pool || !folder) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setUploadStage('preparing');
        setStageMessage('Preparando arquivos para upload...');

        try {
            // ESTÁGIO 1: Preparação
            setUploadStage('preparing');
            setStageMessage('Validando arquivos e preparando dados...');
            setUploadProgress(10);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // ESTÁGIO 2: Upload dos arquivos para o storage
            setUploadStage('uploading-files');
            setStageMessage('Enviando MP3 e capa para o storage da Contabo...');
            setUploadProgress(20);

            const formData = new FormData();
            formData.append('audioFile', selectedFile.file);
            formData.append('coverImage', coverImage);
            formData.append('songName', songName.trim());
            formData.append('artist', artistName.trim());

            const storageResponse = await fetch('/api/storage/upload', {
                method: 'POST',
                body: formData
            });

            if (!storageResponse.ok) {
                const errorData = await storageResponse.json();
                throw new Error(errorData.error || 'Erro ao fazer upload dos arquivos');
            }

            const storageResult = await storageResponse.json();
            console.log('✅ Arquivos enviados para o storage:', storageResult);
            setUploadProgress(60);

            // ESTÁGIO 3: Salvar no banco de dados
            setUploadStage('saving-database');
            setStageMessage('Salvando metadados no banco de dados...');
            setUploadProgress(70);

            const uploadResponse = await fetch('/api/tracks/upload-community', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    songName: songName.trim(),
                    artist: artistName.trim(),
                    style: style.trim(),
                    pool: pool.trim(),
                    folder: folder.trim(),
                    coverImageUrl: storageResult.files.cover.url,
                    audioFileUrl: storageResult.files.audio.url,
                    releaseDate: new Date().toISOString()
                })
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.error || 'Erro ao salvar no banco de dados');
            }

            const uploadResult = await uploadResponse.json();
            console.log('✅ Upload realizado com sucesso:', uploadResult);

            // ESTÁGIO 4: Finalização
            setUploadStage('finalizing');
            setStageMessage('Configurando URLs e finalizando...');
            setUploadProgress(90);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // ESTÁGIO 5: Concluído
            setUploadStage('completed');
            setStageMessage('Upload concluído com sucesso!');
            setUploadProgress(100);
            setUploadStep('completed');

            // Criar nova track com dados reais da API
            const newTrack: UploadedTrack = {
                id: uploadResult.track.id.toString(),
                songName: uploadResult.track.songName,
                artist: uploadResult.track.artist,
                style: uploadResult.track.style,
                pool: uploadResult.track.pool,
                folder: uploadResult.track.folder,
                imageUrl: storageResult.files.cover.url,
                uploadedAt: new Date(uploadResult.track.createdAt).toISOString().split('T')[0],
                status: 'success',
                downloadCount: 0,
                likeCount: 0
            };

            // Adicionar à lista local
            setUserTracks(prev => [newTrack, ...prev]);

            // Resetar formulário
            setSelectedFile(null);
            setCoverImage(null);
            setSongName('');
            setArtistName('');
            setStyle('');
            setPool('');
            setFolder('');

            // Mostrar sucesso
            alert(`Música "${uploadResult.track.songName}" enviada com sucesso!`);

            // Fechar modal após 2 segundos
            setTimeout(() => {
                setShowUploadForm(false);
                setUploadStep('idle');
                setUploadStage('idle');
                setStageMessage('');
            }, 2000);

            // Recarregar lista para mostrar dados atualizados
            setTimeout(() => {
                fetchUserTracks();
            }, 1000);

        } catch (error) {
            console.error('❌ Erro no upload:', error);
            setUploadStage('error');
            setStageMessage('Erro durante o upload');

            let errorMessage = 'Erro ao fazer upload da música. Verifique os dados e tente novamente.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            alert(`❌ ${errorMessage}`);
        } finally {
            if (uploadStage !== 'completed') {
                setIsUploading(false);
                setUploadProgress(0);
                setTimeout(() => {
                    setUploadStage('idle');
                    setStageMessage('');
                    setUploadStep('idle');
                }, 3000);
            }
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const nextStep = () => {
        if (uploadStep === 'music-file' && selectedFile) {
            setUploadStep('cover-image');
        } else if (uploadStep === 'cover-image' && coverImage) {
            setUploadStep('details');
        } else if (uploadStep === 'details' && songName && artistName && style && pool && folder) {
            setUploadStep('uploading');
            handleUpload();
        }
    };

    const prevStep = () => {
        if (uploadStep === 'cover-image') {
            setUploadStep('music-file');
        } else if (uploadStep === 'details') {
            setUploadStep('cover-image');
        }
    };

    const canGoNext = () => {
        if (uploadStep === 'music-file') return selectedFile;
        if (uploadStep === 'cover-image') return coverImage;
        if (uploadStep === 'details') return songName && artistName && style && pool && folder;
        return false;
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-400" />
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#121212]">
            <Header />

            <div className="pt-20 pb-8 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header da Página */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Music className="h-12 w-12 text-green-400" />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-4">Minhas Músicas</h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Gerencie suas músicas, faça upload de novas faixas e compartilhe com a comunidade
                        </p>
                    </div>

                    {/* Estatísticas Rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <Music className="h-5 w-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Total de Músicas</p>
                                    <p className="text-green-400 font-bold text-xl">{userTracks.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Na Comunidade</p>
                                    <p className="text-blue-400 font-bold text-xl">{userTracks.filter(t => t.status === 'success').length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Downloads</p>
                                    <p className="text-purple-400 font-bold text-xl">
                                        {userTracks.reduce((total, track) => total + (track.downloadCount || 0), 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                    <Star className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Favoritos</p>
                                    <p className="text-yellow-400 font-bold text-xl">
                                        {userTracks.reduce((total, track) => total + (track.likeCount || 0), 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="text-center mb-8 flex items-center justify-center gap-4">
                        <button
                            onClick={() => {
                                setShowUploadForm(true);
                                setUploadStep('music-file');
                                setUploadStage('idle');
                                setStageMessage('');
                                setUploadProgress(0);
                            }}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-700 text-white py-4 px-8 rounded-xl font-bold hover:from-green-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            <Plus className="h-6 w-6" />
                            Enviar Nova Música
                        </button>

                        <button
                            onClick={fetchUserTracks}
                            disabled={isLoadingTracks}
                            className="flex items-center justify-center gap-2 bg-gray-700 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoadingTracks ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Atualizando...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-5 w-5" />
                                    Atualizar
                                </>
                            )}
                        </button>
                    </div>

                    {/* Lista de Músicas */}
                    <div className="bg-gray-800/50 rounded-3xl p-6 border border-gray-700/50">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Disc className="h-6 w-6 text-green-400" />
                            Suas Músicas
                        </h2>

                        {isLoadingTracks ? (
                            <div className="text-center py-12">
                                <Loader2 className="h-16 w-16 text-green-400 mx-auto mb-4 animate-spin" />
                                <p className="text-gray-400 text-lg mb-2">Carregando suas músicas...</p>
                                <p className="text-gray-500">Buscando na comunidade...</p>
                            </div>
                        ) : userTracks.length === 0 ? (
                            <div className="text-center py-12">
                                <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400 text-lg mb-2">Nenhuma música encontrada</p>
                                <p className="text-gray-500 mb-4">Comece fazendo upload da sua primeira música!</p>
                                <button
                                    onClick={() => {
                                        setShowUploadForm(true);
                                        setUploadStep('music-file');
                                        setUploadStage('idle');
                                        setStageMessage('');
                                        setUploadProgress(0);
                                    }}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
                                >
                                    <Plus className="h-4 w-4" />
                                    Fazer primeiro upload
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {userTracks.map((track) => (
                                    <div key={track.id} className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-4 hover:border-green-500/30 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={track.imageUrl}
                                                    alt={track.songName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-white font-semibold text-lg">{track.songName}</h3>
                                                <p className="text-gray-400">{track.artist}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                                                        {track.style}
                                                    </span>
                                                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                                                        {track.pool}
                                                    </span>
                                                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                                                        {track.folder}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600/50 rounded-lg transition-colors">
                                                    <Play className="h-5 w-5" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600/50 rounded-lg transition-colors">
                                                    <Download className="h-5 w-5" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600/50 rounded-lg transition-colors">
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Upload por Etapas */}
            {showUploadForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Upload className="h-6 w-6 text-green-400" />
                                Enviar Nova Música
                            </h2>
                            <button
                                onClick={() => {
                                    setShowUploadForm(false);
                                    setUploadStep('idle');
                                    setUploadStage('idle');
                                    setStageMessage('');
                                    setUploadProgress(0);
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Indicador de Etapas */}
                        <div className="flex items-center justify-center mb-8">
                            <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${uploadStep === 'music-file' ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                                    }`}>
                                    1
                                </div>
                                <div className={`w-12 h-0.5 ${uploadStep === 'cover-image' || uploadStep === 'details' || uploadStep === 'uploading' || uploadStep === 'completed' ? 'bg-green-500' : 'bg-gray-600'
                                    }`}></div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${uploadStep === 'cover-image' ? 'bg-green-500 text-white' : uploadStep === 'details' || uploadStep === 'uploading' || uploadStep === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-gray-600 text-gray-300'
                                    }`}>
                                    2
                                </div>
                                <div className={`w-12 h-0.5 ${uploadStep === 'details' || uploadStep === 'uploading' || uploadStep === 'completed' ? 'bg-green-500' : 'bg-gray-600'
                                    }`}></div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${uploadStep === 'details' ? 'bg-green-500 text-white' : uploadStep === 'uploading' || uploadStep === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-gray-600 text-gray-300'
                                    }`}>
                                    3
                                </div>
                                <div className={`w-12 h-0.5 ${uploadStep === 'uploading' || uploadStep === 'completed' ? 'bg-green-500' : 'bg-gray-600'
                                    }`}></div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${uploadStep === 'uploading' ? 'bg-green-500 text-white' : uploadStep === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-gray-600 text-gray-300'
                                    }`}>
                                    4
                                </div>
                            </div>
                        </div>

                        {/* Conteúdo das Etapas */}
                        {uploadStep === 'music-file' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <Music className="h-16 w-16 text-green-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Arquivo de Música</h3>
                                    <p className="text-gray-400">Selecione o arquivo MP3 da sua música</p>
                                </div>

                                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-green-500 transition-colors">
                                    <input
                                        type="file"
                                        accept=".mp3"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="music-file"
                                    />
                                    <label htmlFor="music-file" className="cursor-pointer">
                                        {selectedFile ? (
                                            <div className="space-y-3">
                                                <Music className="h-16 w-16 text-green-400 mx-auto" />
                                                <p className="text-white font-semibold text-lg">{selectedFile.name}</p>
                                                <p className="text-gray-400">{formatFileSize(selectedFile.size)}</p>
                                                <p className="text-green-400 text-sm">✅ Arquivo selecionado com sucesso!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                                                <p className="text-white font-semibold text-lg">Clique para selecionar arquivo</p>
                                                <p className="text-gray-400">Apenas arquivos MP3 até 50MB</p>
                                                <p className="text-gray-500 text-sm">Formatos aceitos: .mp3</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}

                        {uploadStep === 'cover-image' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <ImageIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Capa da Música</h3>
                                    <p className="text-gray-400">Selecione uma imagem para a capa da sua música</p>
                                </div>

                                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverSelect}
                                        className="hidden"
                                        id="cover-image"
                                    />
                                    <label htmlFor="cover-image" className="cursor-pointer">
                                        {coverImage ? (
                                            <div className="space-y-3">
                                                <img
                                                    src={URL.createObjectURL(coverImage)}
                                                    alt="Preview da capa"
                                                    className="w-24 h-24 object-cover rounded-lg mx-auto"
                                                />
                                                <p className="text-white font-semibold text-lg">{coverImage.name}</p>
                                                <p className="text-blue-400 text-sm">✅ Capa selecionada com sucesso!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto" />
                                                <p className="text-white font-semibold text-lg">Clique para selecionar capa</p>
                                                <p className="text-gray-400">JPG, PNG, GIF até 5MB</p>
                                                <p className="text-gray-500 text-sm">Formatos aceitos: .jpg, .png, .gif</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}

                        {uploadStep === 'details' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <Edit className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Detalhes da Música</h3>
                                    <p className="text-gray-400">Preencha as informações da sua música</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-white font-semibold mb-2">Nome da Música *</label>
                                            <input
                                                type="text"
                                                value={songName}
                                                onChange={(e) => setSongName(e.target.value)}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                                                placeholder="Nome da música"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white font-semibold mb-2">Nome do Artista *</label>
                                            <input
                                                type="text"
                                                value={artistName}
                                                onChange={(e) => setArtistName(e.target.value)}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                                                placeholder="Nome do artista"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-white font-semibold mb-2">Estilo *</label>
                                            <input
                                                type="text"
                                                value={style}
                                                onChange={(e) => setStyle(e.target.value)}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                                                placeholder="Ex: House, Techno, Trance..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white font-semibold mb-2">Pool *</label>
                                            <input
                                                type="text"
                                                value={pool}
                                                onChange={(e) => setPool(e.target.value)}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                                                placeholder="Ex: The Mashup, Protocol..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white font-semibold mb-2">Pasta/Álbum *</label>
                                            <input
                                                type="text"
                                                value={folder}
                                                onChange={(e) => setFolder(e.target.value)}
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                                                placeholder="Ex: 8th Wonder, Protocol..."
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {uploadStep === 'completed' && (
                            <div className="space-y-6 text-center">
                                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Upload Concluído!</h3>
                                <p className="text-gray-400">Sua música foi enviada com sucesso para a comunidade</p>
                                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                                    <p className="text-green-300 text-sm">
                                        A música estará disponível em breve nas páginas /new e /community
                                    </p>
                                </div>
                            </div>
                        )}

                        {uploadStep === 'uploading' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <Loader2 className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-spin" />
                                    <h3 className="text-xl font-bold text-white mb-2">Enviando Música</h3>
                                    <p className="text-gray-400">Aguarde enquanto processamos sua música</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-2">
                                            {uploadStage === 'preparing' && (
                                                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full">
                                                    🔄 Preparando
                                                </span>
                                            )}
                                            {uploadStage === 'uploading-files' && (
                                                <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-full">
                                                    📤 Enviando Arquivos
                                                </span>
                                            )}
                                            {uploadStage === 'saving-database' && (
                                                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
                                                    💾 Salvando no Banco
                                                </span>
                                            )}
                                            {uploadStage === 'finalizing' && (
                                                <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-3 py-1 rounded-full">
                                                    ⚡ Finalizando
                                                </span>
                                            )}
                                            {uploadStage === 'completed' && (
                                                <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-full">
                                                    ✅ Concluído!
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-sm">{stageMessage}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">Progresso do Upload</span>
                                            <span className="text-green-400 font-medium">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 via-green-500 to-purple-500"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botões de Navegação */}
                        {uploadStep !== 'uploading' && uploadStep !== 'completed' && (
                            <div className="flex gap-4 pt-6">
                                {uploadStep !== 'music-file' && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                                    >
                                        Voltar
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!canGoNext()}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploadStep === 'music-file' && 'Próximo: Capa'}
                                    {uploadStep === 'cover-image' && 'Próximo: Detalhes'}
                                    {uploadStep === 'details' && 'Enviar Música'}
                                </button>
                            </div>
                        )}

                        {/* Botão Cancelar */}
                        {uploadStep !== 'uploading' && uploadStep !== 'completed' && (
                            <div className="text-center pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUploadForm(false);
                                        setUploadStep('idle');
                                        setUploadStage('idle');
                                        setStageMessage('');
                                        setUploadProgress(0);
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default MyMusicPage;
