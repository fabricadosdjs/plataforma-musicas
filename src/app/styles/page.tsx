"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Music, Download, Users, TrendingUp, Calendar } from "lucide-react";
import Header from "@/components/layout/Header";

interface Style {
    name: string;
    trackCount: number;
    downloadCount: number;
    lastUpdated?: string;
    hasUpdatesToday?: boolean;
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

    // Função para verificar se o estilo foi atualizado hoje
    const isUpdatedToday = (style: Style): boolean => {
        if (style.hasUpdatesToday) return true;

        if (style.lastUpdated) {
            const today = new Date();
            const lastUpdate = new Date(style.lastUpdated);
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
                {/* Header dos Estilos */}
                <div className="w-full bg-gradient-to-b from-[#1db954]/20 to-transparent">
                    <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-12">
                        {/* Botão Voltar */}
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors mb-6"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Voltar
                        </button>

                        {/* Informações dos Estilos */}
                        <div className="text-center">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                                Todos os Estilos
                            </h1>

                            {/* Informações Adicionais */}
                            <div className="max-w-3xl mx-auto mb-8">
                                <div className="bg-[#181818] rounded-xl p-6 border border-[#282828] mb-6">
                                    <div className="text-[#b3b3b3] text-sm leading-relaxed">
                                        Explore todos os estilos musicais disponíveis em nossa plataforma. Descubra novos gêneros,
                                        artistas e músicas que combinam com seu gosto musical. Cada estilo oferece uma experiência
                                        única e diversificada para expandir seu repertório musical.
                                    </div>
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {filteredStyles.length}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">
                                        {filteredStyles.length === 1 ? 'Estilo' : 'Estilos'}
                                    </div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {filteredStyles.reduce((sum, style) => sum + style.trackCount, 0)}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Músicas</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {filteredStyles.reduce((sum, style) => sum + style.downloadCount, 0)}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Downloads</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {Math.round(filteredStyles.reduce((sum, style) => sum + style.downloadCount, 0) / Math.max(filteredStyles.length, 1))}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Média/Estilo</div>
                                </div>
                            </div>

                            {/* Barra de busca */}
                            <div className="mt-8 max-w-2xl mx-auto">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar estilos..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={(e) => e.target.select()}
                                        className="w-full pl-12 pr-4 py-3 bg-[#181818] border border-[#282828] rounded-xl text-white placeholder-[#b3b3b3] focus:outline-none focus:ring-2 focus:ring-[#1db954]/50 focus:border-[#1db954]/50 transition-all duration-300 z-10 relative"
                                    />
                                    <Music className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#b3b3b3] pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Estilos */}
                <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="animate-spin w-12 h-12 border-4 border-[#1db954] border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-[#b3b3b3] text-lg">
                                    Carregando estilos musicais...
                                </p>
                            </div>
                        </div>
                    ) : filteredStyles.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-[#181818] rounded-2xl p-8 max-w-md mx-auto border border-[#282828]">
                                <div className="text-6xl mb-4">🎵</div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Nenhum estilo encontrado
                                </h3>
                                <p className="text-[#b3b3b3] mb-6">
                                    {searchQuery
                                        ? `Não encontramos estilos que correspondam a "${searchQuery}".`
                                        : 'Não encontramos estilos musicais disponíveis.'
                                    }
                                </p>
                                <button
                                    onClick={goBack}
                                    className="px-6 py-2 bg-[#1db954] text-white rounded-lg hover:bg-[#1ed760] transition-colors font-medium"
                                >
                                    Voltar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {filteredStyles.map((style, index) => (
                                <div
                                    key={style.name}
                                    className="group bg-[#181818] rounded-xl border border-[#282828] p-4 hover:scale-105 transition-all duration-300 hover:border-[#1db954]/50 hover:shadow-lg hover:shadow-[#1db954]/10 cursor-pointer relative"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        router.push(`/genre/${encodeURIComponent(style.name)}`);
                                    }}
                                >
                                    {/* Badge de posição para top estilos */}
                                    {index < 10 && (
                                        <div
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-full flex items-center justify-center shadow-lg pointer-events-none"
                                        >
                                            <span className="text-white text-xs font-bold">
                                                {index + 1}
                                            </span>
                                        </div>
                                    )}

                                    {/* Badge de "ATUALIZADO HOJE" */}
                                    {isUpdatedToday(style) && (
                                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                                            <span className="text-white text-xs font-bold">🔥</span>
                                        </div>
                                    )}

                                    {/* Ícone do estilo */}
                                    <div
                                        className="w-10 h-10 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            router.push(`/genre/${encodeURIComponent(style.name)}`);
                                        }}
                                    >
                                        <Music className="h-5 w-5 text-white" />
                                    </div>

                                    {/* Nome do estilo */}
                                    <h3 className="text-white text-sm font-bold mb-2 text-center">
                                        {style.name}
                                    </h3>

                                    {/* Estatísticas */}
                                    <div className="space-y-1 text-center">
                                        <div className="flex items-center justify-center gap-1 text-[#1db954] text-xs font-semibold">
                                            <Music className="w-3 h-3" />
                                            <span>{style.trackCount} músicas</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-1 text-[#b3b3b3] text-xs">
                                            <Download className="w-3 h-3" />
                                            <span>{style.downloadCount} downloads</span>
                                        </div>
                                    </div>

                                    {/* Indicador de popularidade */}
                                    <div className="mt-2 flex justify-center">
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

                                    {/* Indicador de última atualização */}
                                    {style.lastUpdated && (
                                        <div className="mt-2 text-center">
                                            <div className={`text-xs font-medium ${isUpdatedToday(style)
                                                    ? 'text-[#ff6b35]'
                                                    : 'text-[#b3b3b3]'
                                                }`}>
                                                {isUpdatedToday(style) ? '🔥 Atualizado hoje' : `Atualizado: ${new Date(style.lastUpdated).toLocaleDateString('pt-BR')}`}
                                            </div>
                                        </div>
                                    )}

                                    {/* Hover effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#1db954]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
