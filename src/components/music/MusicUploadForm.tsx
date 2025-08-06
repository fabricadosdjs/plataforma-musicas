"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Upload,
    Music,
    User,
    Tag,
    Calendar,
    FileAudio,
    CheckCircle,
    XCircle,
    Loader2,
    AlertTriangle,
    Info,
    Image,
    ExternalLink
} from 'lucide-react';

interface UploadFormData {
    songName: string;
    artist: string;
    style: string;
    version: string;
    pool: string;
    releaseDate: string;
    coverUrl: string;
}

interface UploadedTrack {
    id: number;
    songName: string;
    artist: string;
    style: string;
    version: string;
    imageUrl: string;
    releaseDate: string;
    createdAt: string;
    _count: {
        downloads: number;
        likes: number;
        plays: number;
    };
}

export default function MusicUploadForm() {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedTracks, setUploadedTracks] = useState<UploadedTrack[]>([]);
    const [isLoadingTracks, setIsLoadingTracks] = useState(true);
    const [showCoverInstructions, setShowCoverInstructions] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [formData, setFormData] = useState<UploadFormData>({
        songName: '',
        artist: '',
        style: '',
        version: 'Original',
        pool: 'Nexor Records',
        releaseDate: new Date().toISOString().split('T')[0],
        coverUrl: ''
    });

    // Estilos disponíveis
    const availableStyles = [
        'House', 'Techno', 'Trance', 'Progressive House', 'Deep House',
        'Tech House', 'Minimal', 'Dubstep', 'Drum & Bass', 'Breaks',
        'Electro', 'Synthwave', 'Italo Disco', 'Eurodance', 'Hardstyle',
        'Hardcore', 'Gabber', 'Acid', 'Ambient', 'Downtempo',
        'Chillout', 'Lounge', 'Jazz', 'Funk', 'Soul',
        'R&B', 'Hip Hop', 'Trap', 'Future Bass', 'Pop',
        'Rock', 'Metal', 'Punk', 'Reggae', 'Salsa',
        'Samba', 'Bossa Nova', 'MPB', 'Forró', 'Axé',
        'Funk Carioca', 'Trap Brasileiro', 'Outro'
    ];

    // Pools disponíveis
    const availablePools = [
        'Nexor Records',
        'Deep House Records',
        'Techno Collective',
        'Trance Masters',
        'Progressive Vibes',
        'Minimal Sessions',
        'Dubstep Nation',
        'Drum & Bass United',
        'Electro Empire',
        'Synthwave Dreams',
        'Italo Disco Classics',
        'Eurodance Legends',
        'Hardstyle Warriors',
        'Hardcore Revolution',
        'Acid Trip',
        'Ambient Space',
        'Chillout Lounge',
        'Jazz Fusion',
        'Funk & Soul',
        'Hip Hop Underground',
        'Trap Future',
        'Pop Sensation',
        'Rock & Metal',
        'Reggae Roots',
        'Latin Grooves',
        'Brazilian Beats',
        'Outro'
    ];

    // Carregar músicas enviadas pelo usuário
    const loadUploadedTracks = async () => {
        try {
            setIsLoadingTracks(true);
            const response = await fetch('/api/tracks/upload');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUploadedTracks(data.tracks);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar músicas:', error);
        } finally {
            setIsLoadingTracks(false);
        }
    };

    // Carregar músicas na montagem do componente
    useEffect(() => {
        loadUploadedTracks();
    }, []);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        handleFileValidation(file);
    };

    const handleFileValidation = (file: File | null) => {
        if (file) {
            // Validar tipo de arquivo
            const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/mp4'];
            if (!audioTypes.includes(file.type)) {
                setError('Apenas arquivos de áudio são permitidos (MP3, WAV, FLAC, AAC, OGG, M4A)');
                return;
            }

            // Validar tamanho (50MB)
            const maxSize = 50 * 1024 * 1024;
            if (file.size > maxSize) {
                setError('Arquivo muito grande. Máximo 50MB');
                return;
            }

            setSelectedFile(file);
            setError(null);

            // Tentar extrair informações do nome do arquivo
            const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extensão
            const parts = fileName.split(' - ');
            if (parts.length >= 2) {
                setFormData(prev => ({
                    ...prev,
                    artist: parts[0].trim(),
                    songName: parts[1].trim()
                }));
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            handleFileValidation(file);
        }
    };

    const handleInputChange = (field: keyof UploadFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedFile) {
            setError('Selecione um arquivo de áudio');
            return;
        }

        if (!formData.songName || !formData.artist || !formData.style || !formData.releaseDate) {
            setError('Preencha todos os campos obrigatórios');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', selectedFile);
            uploadFormData.append('songName', formData.songName);
            uploadFormData.append('artist', formData.artist);
            uploadFormData.append('style', formData.style);
            uploadFormData.append('version', formData.version);
            uploadFormData.append('pool', formData.pool);
            uploadFormData.append('releaseDate', formData.releaseDate);
            uploadFormData.append('coverUrl', formData.coverUrl);

            const response = await fetch('/api/tracks/upload', {
                method: 'POST',
                body: uploadFormData,
                // Adicionar timeout maior para uploads
                signal: AbortSignal.timeout(300000) // 5 minutos
            });

            const data = await response.json();

            if (data.success) {
                setUploadSuccess(true);
                setSelectedFile(null);
                setFormData({
                    songName: '',
                    artist: '',
                    style: '',
                    version: 'Original',
                    pool: 'Nexor Records',
                    releaseDate: new Date().toISOString().split('T')[0],
                    coverUrl: ''
                });
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

                // Recarregar lista de músicas
                await loadUploadedTracks();

                // Resetar sucesso após 3 segundos
                setTimeout(() => setUploadSuccess(false), 3000);
            } else {
                setError(data.error || 'Erro ao fazer upload');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-6">
            {/* Formulário de Upload */}
            <Card className="border-gray-700/50 shadow-xl bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg text-white">
                        <Upload className="text-purple-400" />
                        Enviar Nova Música
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Seleção de Arquivo */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Arquivo de Áudio *
                            </label>
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer ${isDragOver
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : selectedFile
                                            ? 'border-green-500 bg-green-500/10'
                                            : 'border-gray-600 hover:border-purple-500'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="space-y-4">
                                    <FileAudio className={`w-12 h-12 mx-auto ${isDragOver ? 'text-purple-400' : selectedFile ? 'text-green-400' : 'text-gray-400'
                                        }`} />
                                    <div>
                                        <p className="text-white font-medium">
                                            {selectedFile
                                                ? selectedFile.name
                                                : isDragOver
                                                    ? 'Solte o arquivo aqui'
                                                    : 'Arraste e solte um arquivo aqui ou clique para selecionar'
                                            }
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            MP3, WAV, FLAC, AAC, OGG, M4A (máx. 50MB)
                                        </p>
                                        {selectedFile && (
                                            <p className="text-sm text-green-400 mt-1">
                                                ✓ Arquivo selecionado: {formatFileSize(selectedFile.size)}
                                            </p>
                                        )}
                                    </div>
                                    {!selectedFile && (
                                        <Button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            Selecionar Arquivo
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Campos de Metadados */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Nome da Música *
                                </label>
                                <input
                                    type="text"
                                    value={formData.songName}
                                    onChange={(e) => handleInputChange('songName', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                    placeholder="Nome da música"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Artista *
                                </label>
                                <input
                                    type="text"
                                    value={formData.artist}
                                    onChange={(e) => handleInputChange('artist', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                    placeholder="Nome do artista"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Estilo *
                                </label>
                                <select
                                    value={formData.style}
                                    onChange={(e) => handleInputChange('style', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    required
                                >
                                    <option value="">Selecione um estilo</option>
                                    {availableStyles.map(style => (
                                        <option key={style} value={style}>{style}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Versão
                                </label>
                                <input
                                    type="text"
                                    value={formData.version}
                                    onChange={(e) => handleInputChange('version', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                    placeholder="Original"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Pool
                                </label>
                                <select
                                    value={formData.pool}
                                    onChange={(e) => handleInputChange('pool', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    required
                                >
                                    {availablePools.map(pool => (
                                        <option key={pool} value={pool}>{pool}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Data de Lançamento *
                                </label>
                                <input
                                    type="date"
                                    value={formData.releaseDate}
                                    onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Capa da Música (Opcional)
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        value={formData.coverUrl}
                                        onChange={(e) => handleInputChange('coverUrl', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        placeholder="https://i.ibb.co/..."
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            onClick={() => setShowCoverInstructions(!showCoverInstructions)}
                                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1"
                                        >
                                            <Image className="w-3 h-3 mr-1" />
                                            Como obter link da capa
                                        </Button>
                                        {formData.coverUrl && (
                                            <a
                                                href={formData.coverUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Ver imagem
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instruções para ImgBB */}
                        {showCoverInstructions && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                    <Image className="w-4 h-4" />
                                    Como obter o link direto da capa no ImgBB:
                                </h4>
                                <ol className="text-sm text-gray-300 space-y-2">
                                    <li>1. Acesse <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">imgbb.com</a></li>
                                    <li>2. Clique em "Start uploading" ou arraste sua imagem</li>
                                    <li>3. Após o upload, clique em "Embed codes"</li>
                                    <li>4. Copie o link que começa com "https://i.ibb.co/..."</li>
                                    <li>5. Cole o link no campo "Capa da Música" acima</li>
                                </ol>
                                <div className="mt-3 p-2 bg-gray-800/50 rounded text-xs text-gray-400">
                                    <strong>Exemplo:</strong> https://i.ibb.co/abc123/cover-image.jpg
                                </div>
                            </div>
                        )}

                        {/* Mensagens de Erro/Sucesso */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-400" />
                                <span className="text-red-400">{error}</span>
                            </div>
                        )}

                        {uploadSuccess && (
                            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="text-green-400">Música enviada com sucesso!</span>
                            </div>
                        )}

                        {/* Botão de Envio */}
                        <Button
                            type="submit"
                            disabled={isUploading || !selectedFile}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Enviar Música
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Lista de Músicas Enviadas */}
            <Card className="border-gray-700/50 shadow-xl bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg text-white">
                        <Music className="text-purple-400" />
                        Minhas Músicas Enviadas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingTracks ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                        </div>
                    ) : uploadedTracks.length > 0 ? (
                        <div className="space-y-4">
                            {uploadedTracks.map((track) => (
                                <div key={track.id} className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all duration-200">
                                    <img
                                        src={track.imageUrl}
                                        alt={track.songName}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white truncate">{track.songName}</h3>
                                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                                                {track.style}
                                            </span>
                                            {track.version !== 'Original' && (
                                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                                                    {track.version}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 mb-1">
                                            {formatDate(track.createdAt)}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                                                {track._count.downloads} DL
                                            </span>
                                            <span className="bg-pink-500/20 text-pink-400 px-2 py-1 rounded-full">
                                                {track._count.likes} ♥
                                            </span>
                                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                                {track._count.plays} ▶
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Nenhuma música enviada ainda</p>
                            <p className="text-xs text-gray-600 mt-2">Suas músicas enviadas aparecerão aqui</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Informações */}
            <Card className="border-gray-700/50 shadow-xl bg-gray-900">
                <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div className="space-y-2">
                            <h3 className="font-semibold text-white">Informações sobre Upload</h3>
                            <ul className="text-sm text-gray-400 space-y-1">
                                <li>• Apenas usuários VIP podem enviar músicas</li>
                                <li>• Formatos aceitos: MP3, WAV, FLAC, AAC, OGG, M4A</li>
                                <li>• Tamanho máximo: 50MB por arquivo</li>
                                <li>• Suas músicas aparecerão automaticamente na página /community</li>
                                <li>• Músicas enviadas também aparecem na página /new</li>
                                <li>• Mantenha os metadados precisos para melhor organização</li>
                                <li>• Para a capa, use ImgBB ou outro serviço de hospedagem de imagens</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 