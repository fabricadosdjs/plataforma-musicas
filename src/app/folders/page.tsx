"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Folder, Music, Download, Users, TrendingUp, Calendar } from "lucide-react";
import Header from "@/components/layout/Header";
import Link from "next/link";

interface Folder {
    name: string;
    trackCount: number;
    downloadCount: number;
    lastUpdated?: string;
    hasUpdatesToday?: boolean;
    imageUrl?: string | null;
}

export default function FoldersPage() {
    const router = useRouter();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Buscar todas as pastas
    const fetchFolders = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/tracks/folders/most-downloaded');

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setFolders(data.folders);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar pastas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    // Filtrar pastas baseado na busca
    const filteredFolders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Função para verificar se a pasta foi atualizada hoje
    const isUpdatedToday = (folder: Folder): boolean => {
        if (folder.hasUpdatesToday) return true;

        if (folder.lastUpdated) {
            const today = new Date();
            const lastUpdate = new Date(folder.lastUpdated);
            return today.toDateString() === lastUpdate.toDateString();
        }

        return false;
    };

    const goBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-[#121212] overflow-x-hidden">
            {/* Header Fixo */}
            <Header />

            {/* Conteúdo Principal - Tela Cheia */}
            <div className="pt-12 lg:pt-16">
                {/* Header das Pastas */}
                <div className="w-full bg-gradient-to-b from-[#8b5cf6]/20 to-transparent">
                    <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-12">
                        {/* Botão Voltar */}
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors mb-6"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Voltar
                        </button>

                        {/* Informações das Pastas */}
                        <div className="text-center">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                                Todas as Pastas
                            </h1>

                            {/* Informações Adicionais */}
                            <div className="max-w-3xl mx-auto mb-8">
                                <div className="bg-[#181818] rounded-xl p-6 border border-[#282828] mb-6">
                                    <div className="text-[#b3b3b3] text-sm leading-relaxed">
                                        Explore todas as pastas musicais disponíveis em nossa plataforma. Descubra novas coleções,
                                        artistas e músicas organizadas por temas específicos. Cada pasta oferece uma experiência
                                        única e diversificada para expandir seu repertório musical.
                                    </div>
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#8b5cf6] mb-1">
                                        {filteredFolders.length}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">
                                        {filteredFolders.length === 1 ? 'Pasta' : 'Pastas'}
                                    </div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#8b5cf6] mb-1">
                                        {filteredFolders.reduce((sum, folder) => sum + folder.trackCount, 0)}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Músicas</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#8b5cf6] mb-1">
                                        {filteredFolders.reduce((sum, folder) => sum + folder.downloadCount, 0)}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Downloads</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#8b5cf6] mb-1">
                                        {Math.round(filteredFolders.reduce((sum, folder) => sum + folder.downloadCount, 0) / Math.max(filteredFolders.length, 1))}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Média/Pasta</div>
                                </div>
                            </div>

                            {/* Barra de busca */}
                            <div className="mt-8 max-w-3xl mx-auto">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar pastas..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={(e) => e.target.select()}
                                        className="w-full pl-12 pr-4 py-3 bg-[#181818] border border-[#282828] rounded-xl text-white placeholder-[#b3b3b3] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6]/50 transition-all duration-300 z-10 relative"
                                    />
                                    <Folder className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#b3b3b3] pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Pastas */}
                <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="animate-spin w-12 h-12 border-4 border-[#8b5cf6] border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-[#b3b3b3] text-lg">
                                    Carregando pastas musicais...
                                </p>
                            </div>
                        </div>
                    ) : filteredFolders.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-[#181818] rounded-2xl p-8 max-w-md mx-auto border border-[#282828]">
                                <div className="text-6xl mb-4">📁</div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Nenhuma pasta encontrada
                                </h3>
                                <p className="text-[#b3b3b3] mb-6">
                                    {searchQuery
                                        ? `Não encontramos pastas que correspondam a "${searchQuery}".`
                                        : 'Não encontramos pastas musicais disponíveis.'
                                    }
                                </p>
                                <button
                                    onClick={goBack}
                                    className="px-6 py-2 bg-[#8b5cf6] text-white rounded-lg hover:bg-[#9333ea] transition-colors font-medium"
                                >
                                    Voltar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {filteredFolders.map((folder, index) => (
                                <div
                                    key={folder.name}
                                    className="group bg-[#181818] rounded-xl border border-[#282828] p-4 hover:scale-105 transition-all duration-300 hover:border-[#8b5cf6]/50 hover:shadow-lg hover:shadow-[#8b5cf6]/10 cursor-pointer relative"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        router.push(`/folder/${encodeURIComponent(folder.name)}`);
                                    }}
                                >
                                    {/* Badge de posição para top pastas */}
                                    {index < 10 && (
                                        <div
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] rounded-full flex items-center justify-center shadow-lg pointer-events-none"
                                        >
                                            <span className="text-white text-xs font-bold">
                                                {index + 1}
                                            </span>
                                        </div>
                                    )}

                                    {/* Badge de "ATUALIZADO HOJE" */}
                                    {isUpdatedToday(folder) && (
                                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                                            <span className="text-white text-xs font-bold">🔥</span>
                                        </div>
                                    )}

                                    {/* Imagem da pasta */}
                                    <div className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                                        {folder.imageUrl ? (
                                            <>
                                                <img
                                                    src={folder.imageUrl}
                                                    alt={`${folder.name} cover`}
                                                    className="w-10 h-10 rounded-lg object-cover mx-auto"
                                                    onError={(e) => {
                                                        // Fallback para ícone se a imagem falhar
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        target.nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                                <div
                                                    className="w-10 h-10 bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] rounded-lg flex items-center justify-center mx-auto hidden"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        router.push(`/folder/${encodeURIComponent(folder.name)}`);
                                                    }}
                                                >
                                                    <Folder className="h-5 w-5 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <div
                                                className="w-10 h-10 bg-gradient-to-br from-[#8b5cf6] to-[#9333ea] rounded-lg flex items-center justify-center mx-auto"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    router.push(`/folder/${encodeURIComponent(folder.name)}`);
                                                }}
                                            >
                                                <Folder className="h-5 w-5 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Nome da pasta */}
                                    <h3 className="text-white text-sm font-bold mb-2 text-center">
                                        {folder.name}
                                    </h3>

                                    {/* Estatísticas */}
                                    <div className="space-y-1 text-center">
                                        <div className="flex items-center justify-center gap-1 text-[#8b5cf6] text-xs font-semibold">
                                            <Music className="w-3 h-3" />
                                            <span>{folder.trackCount} músicas</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-1 text-[#b3b3b3] text-xs">
                                            <Download className="w-3 h-3" />
                                            <span>{folder.downloadCount} downloads</span>
                                        </div>
                                    </div>

                                    {/* Indicador de popularidade */}
                                    <div className="mt-2 flex justify-center">
                                        <div className="flex space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i < Math.min(5, Math.ceil((folder.downloadCount / Math.max(...folders.map(f => f.downloadCount))) * 5))
                                                        ? 'bg-[#8b5cf6]'
                                                        : 'bg-[#535353]'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Indicador de última atualização */}
                                    {folder.lastUpdated && (
                                        <div className="mt-2 text-center">
                                            <div className={`text-xs font-medium ${isUpdatedToday(folder)
                                                ? 'text-[#ff6b35]'
                                                : 'text-[#b3b3b3]'
                                                }`}>
                                                {isUpdatedToday(folder) ? '🔥 Atualizado hoje' : `Atualizado: ${new Date(folder.lastUpdated).toLocaleDateString('pt-BR')}`}
                                            </div>
                                        </div>
                                    )}

                                    {/* Hover effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Simples */}
            <footer className="bg-black border-t border-gray-800 mt-20">
                <div className="max-w-[95%] mx-auto px-6 py-12">

                    {/* Conteúdo Principal */}
                    <div className="flex flex-col items-center gap-4">

                        {/* Logo e Nome */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                    </svg>
                                </div>
                                <span className="text-2xl font-bold text-white">
                                    Nexor Records Pools
                                </span>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap justify-center gap-6">
                            <Link href="/new" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Novidades
                            </Link>
                            <Link href="/trending" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Trending
                            </Link>
                            <Link href="/plans" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Planos
                            </Link>
                            <Link href="/privacidade" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Privacidade
                            </Link>
                            <Link href="/termos" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Termos
                            </Link>
                        </div>

                        {/* Redes Sociais */}
                        <div className="flex gap-4">
                            <a href="https://twitter.com/plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806.026-1.566.247-2.229.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                </svg>
                            </a>
                            <a href="https://instagram.com/plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.017 12.017.017z" />
                                </svg>
                            </a>
                            <a href="https://youtube.com/@plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>

                        {/* Copyright */}
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">
                                © 2025 Nexor Records Pools. Todos os direitos reservados.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
