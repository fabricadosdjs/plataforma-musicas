"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Music, Download, Users } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import FooterSpacer from "@/components/layout/FooterSpacer";

interface Style {
    name: string;
    trackCount: number;
    downloadCount: number;
}

export default function StylesPage() {
    const router = useRouter();
    const [styles, setStyles] = useState<Style[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Buscar todos os estilos
    const fetchStyles = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/tracks/styles/most-downloaded');

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStyles(data.styles);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar estilos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStyles();
    }, []);

    // Filtrar estilos baseado na busca
    const filteredStyles = styles.filter(style =>
        style.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const goBack = () => {
        router.back();
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#121212] overflow-x-hidden">
                {/* Header */}
                <div className="w-full max-w-6xl mx-auto mt-4 sm:mt-8 mb-8 px-3 sm:px-6 md:px-8 lg:pl-6 lg:pr-16 xl:pl-8 xl:pr-20 2xl:pl-10 2xl:pr-24">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={goBack}
                            className="p-2 bg-[#181818] hover:bg-[#282828] rounded-lg text-white transition-all duration-300 hover:scale-105"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                                Todos os Estilos
                            </h1>
                            <p className="text-[#b3b3b3] text-sm sm:text-base mt-2">
                                Explore todos os estilos musicais disponíveis na plataforma
                            </p>
                        </div>
                    </div>

                    {/* Barra de busca */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar estilos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#282828] border border-[#3e3e3e] rounded-xl text-white placeholder-[#b3b3b3] focus:outline-none focus:ring-2 focus:ring-[#1db954]/50 focus:border-[#1db954]/50 transition-all duration-300"
                            />
                            <Music className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#b3b3b3]" />
                        </div>
                    </div>

                    {/* Estatísticas gerais */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-4 border border-[#282828]/50 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Music className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-[#1db954] mb-1">
                                {styles.length}
                            </div>
                            <div className="text-[#b3b3b3] text-sm">Estilos Disponíveis</div>
                        </div>

                        <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-4 border border-[#282828]/50 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Download className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-[#1db954] mb-1">
                                {styles.reduce((sum, style) => sum + style.downloadCount, 0)}
                            </div>
                            <div className="text-[#b3b3b3] text-sm">Total de Downloads</div>
                        </div>

                        <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-4 border border-[#282828]/50 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-[#1db954] mb-1">
                                {styles.reduce((sum, style) => sum + style.trackCount, 0)}
                            </div>
                            <div className="text-[#b3b3b3] text-sm">Total de Músicas</div>
                        </div>
                    </div>
                </div>

                {/* Lista de estilos */}
                <div className="w-full max-w-6xl mx-auto mb-8 px-3 sm:px-6 md:px-8 lg:pl-6 lg:pr-16 xl:pl-8 xl:pr-20 2xl:pl-10 2xl:pr-24">
                    {loading ? (
                        // Loading skeleton
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(9)].map((_, index) => (
                                <div key={index} className="bg-[#181818] rounded-xl p-6 border border-[#282828] animate-pulse">
                                    <div className="w-12 h-12 bg-[#282828] rounded-lg mx-auto mb-4"></div>
                                    <div className="h-4 bg-[#282828] rounded mb-2"></div>
                                    <div className="h-3 bg-[#282828] rounded mb-1"></div>
                                    <div className="h-3 bg-[#282828] rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredStyles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStyles.map((style, index) => (
                                <div
                                    key={style.name}
                                    className="group bg-[#181818] rounded-xl border border-[#282828] p-6 hover:scale-105 transition-all duration-300 hover:border-[#1db954]/50 hover:shadow-lg hover:shadow-[#1db954]/10 cursor-pointer"
                                    onClick={() => router.push(`/genre/${encodeURIComponent(style.name)}`)}
                                >
                                    {/* Ícone do estilo */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Music className="h-6 w-6 text-white" />
                                    </div>

                                    {/* Nome do estilo */}
                                    <h3 className="text-white text-lg font-bold mb-3 text-center">
                                        {style.name}
                                    </h3>

                                    {/* Estatísticas */}
                                    <div className="space-y-2 text-center">
                                        <div className="flex items-center justify-center gap-2 text-[#1db954] text-sm font-semibold">
                                            <Music className="w-4 h-4" />
                                            <span>{style.trackCount} músicas</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-[#b3b3b3] text-sm">
                                            <Download className="w-4 h-4" />
                                            <span>{style.downloadCount} downloads</span>
                                        </div>
                                    </div>

                                    {/* Indicador de popularidade */}
                                    <div className="mt-4 flex justify-center">
                                        <div className="flex space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i < Math.min(5, Math.ceil((style.downloadCount / Math.max(...styles.map(s => s.downloadCount))) * 5))
                                                            ? 'bg-[#1db954]'
                                                            : 'bg-[#535353]'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hover effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#1db954]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Nenhum resultado encontrado
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-[#282828] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Music className="w-8 h-8 text-[#b3b3b3]" />
                            </div>
                            <h3 className="text-white text-lg font-semibold mb-2">
                                Nenhum estilo encontrado
                            </h3>
                            <p className="text-[#b3b3b3] text-sm">
                                {searchQuery ? `Nenhum estilo encontrado para "${searchQuery}"` : 'Não há estilos disponíveis no momento'}
                            </p>
                        </div>
                    )}
                </div>

                <FooterSpacer />
            </div>
        </MainLayout>
    );
}
