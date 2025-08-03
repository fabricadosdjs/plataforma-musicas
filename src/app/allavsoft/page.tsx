"use client";

import { memo } from 'react';
import Header from '@/components/layout/Header';
import Image from "next/image";
import {
    Zap, Shield, Globe, Film, Star, MonitorPlay, ShoppingCart, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Tipos para o componente FeatureCard
interface FeatureCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    borderColor: string;
    iconColor: string;
}

// Componente otimizado para cards de recursos
const FeatureCard = memo<FeatureCardProps>(({ icon: Icon, title, description, borderColor, iconColor }) => (
    <Card className={`bg-slate-900/70 border ${borderColor} rounded-lg p-6`}>
        <CardHeader className="text-center pb-3">
            <div className={`w-12 h-12 mx-auto mb-3 ${iconColor} rounded-full flex items-center justify-center`}>
                <Icon className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-center text-sm text-gray-300">{description}</p>
        </CardContent>
    </Card>
));

FeatureCard.displayName = 'FeatureCard';

// Dados dos recursos (movidos para fora do componente para evitar re-criação)
const FEATURES = [
    {
        icon: Zap,
        title: "DOWNLOAD RÁPIDO",
        description: "Otimizado para baixar vídeos e músicas na máxima velocidade da sua conexão.",
        borderColor: "border-purple-600/30",
        iconColor: "bg-purple-600/20 text-purple-400"
    },
    {
        icon: Shield,
        title: "100% SEGURO",
        description: "Downloads seguros e instalação limpa, livre de adwares ou malwares.",
        borderColor: "border-green-600/30",
        iconColor: "bg-green-600/20 text-green-400"
    },
    {
        icon: Globe,
        title: "SUPORTE A +1000 SITES",
        description: "Baixe de YouTube, Vimeo, Facebook, Spotify, e centenas de outros sites.",
        borderColor: "border-blue-600/30",
        iconColor: "bg-blue-600/20 text-blue-400"
    },
    {
        icon: Film,
        title: "CONVERSÃO TOTAL",
        description: "Converta para qualquer formato de vídeo ou áudio para compatibilidade total.",
        borderColor: "border-orange-600/30",
        iconColor: "bg-orange-600/20 text-orange-400"
    },
    {
        icon: Star,
        title: "INTERFACE INTUITIVA",
        description: "Design moderno e fácil de usar. Copie, cole e baixe em segundos.",
        borderColor: "border-red-600/30",
        iconColor: "bg-red-600/20 text-red-400"
    },
    {
        icon: MonitorPlay,
        title: "GRAVADOR DE TELA",
        description: "Capture qualquer atividade em sua tela, como lives e chamadas de vídeo.",
        borderColor: "border-teal-600/30",
        iconColor: "bg-teal-600/20 text-teal-400"
    }
];

// Estilos CSS inline otimizados
const pageStyles = {
    backgroundColor: '#18181b'
};

// --- Componente Principal da Página ---
export default function Allavsoft() {
    return (
        <div className="min-h-screen text-white" style={pageStyles}>
            <Header />
            <div className="pt-8" />
            <main className="space-y-12">
                <section className="text-center pt-20">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-wider text-white mb-4">ALLAVSOFT</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-base text-slate-400 px-4">
                        A sua central de download de mídia pessoal. Baixe e converta vídeos e músicas de mais de 1000 sites, incluindo YouTube, Spotify, e muito mais.
                    </p>
                </section>

                <div className="flex justify-center px-4">
                    <div className="relative w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-purple-800/50">
                        <Image
                            src="https://i.ibb.co/JXJDdXx/allavsoft.png"
                            alt="Allavsoft Interface"
                            width={1200}
                            height={600}
                            className="object-contain w-full h-auto"
                            priority={false}
                            loading="lazy"
                        />
                    </div>
                </div>

                {/* Seção com a nova descrição detalhada */}
                <section className="max-w-4xl mx-auto text-slate-300 bg-slate-900/70 border border-slate-800 rounded-lg p-6 md:p-8 mx-4">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-wider text-center text-white mb-6">
                        Allavsoft – A Solução Completa para Baixar Vídeos e Áudios da Internet
                    </h2>
                    <p className="text-justify mb-6 text-slate-400">
                        O Allavsoft é uma poderosa ferramenta desenvolvida para quem busca praticidade e eficiência na hora de baixar conteúdos multimídia da internet. Compatível com centenas de plataformas, o programa permite que você salve seus vídeos, músicas, playlists e até legendas com apenas alguns cliques.
                    </p>

                    <h3 className="text-2xl md:text-3xl font-bold tracking-wider text-green-400 text-center mb-6">✅ Principais Funcionalidades:</h3>

                    <div className="space-y-3 text-justify text-sm md:text-base">
                        <p><strong>Download de Vídeos e Áudios:</strong> Baixe vídeos em HD, Full HD, 4K e até 8K, além de extrair apenas o áudio em formatos como MP3, WAV, FLAC, entre outros.</p>
                        <p><strong>Compatibilidade com Mais de 1000 Sites:</strong> YouTube, Facebook, Vimeo, TikTok, Instagram, Spotify (via navegador), Deezer, Dailymotion e muitos outros. O Allavsoft reconhece automaticamente o link e inicia o download.</p>
                        <p><strong>Conversão de Formatos:</strong> Converta arquivos de vídeo e áudio para os mais diversos formatos: MP4, AVI, MOV, MKV, MP3, AAC, entre outros. Ideal para usar em qualquer dispositivo.</p>
                        <p><strong>Download em Lote:</strong> Economize tempo baixando vários arquivos de uma vez. Basta colar a lista de URLs e deixar o Allavsoft fazer o trabalho por você.</p>
                        <p><strong>Gravador de Tela Integrado:</strong> Não conseguiu baixar diretamente? Use o recurso de gravação de tela para capturar qualquer conteúdo que esteja sendo reproduzido em seu computador.</p>
                        <p><strong>Captura de Legendas e Metadados:</strong> Baixe vídeos com legendas embutidas ou separadas e preserve os metadados dos arquivos de música (nome da faixa, artista, álbum, etc).</p>
                        <p><strong>Atualizações Constantes:</strong> O Allavsoft está sempre se atualizando para acompanhar mudanças nos sites de streaming e garantir máxima compatibilidade.</p>
                    </div>

                    <div className="mt-8">
                        <h4 className="text-2xl md:text-3xl font-bold tracking-wider text-amber-400 text-center mb-4">💡 Por que usar o Allavsoft?</h4>
                        <p className="text-justify text-slate-400">
                            Seja para criar sua própria biblioteca offline, assistir sem conexão ou editar seus conteúdos favoritos, o Allavsoft entrega estabilidade, rapidez e qualidade. Com uma interface intuitiva e suporte técnico confiável, é a escolha ideal para quem busca uma solução completa de downloads.
                        </p>
                    </div>
                </section>

                <div className="max-w-4xl mx-auto mt-12 px-4">
                    <h3 className="text-2xl md:text-3xl font-bold tracking-wider text-center mb-8">RECURSOS EM DESTAQUE</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {FEATURES.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                borderColor={feature.borderColor}
                                iconColor={feature.iconColor}
                            />
                        ))}
                    </div>
                </div>

                <Card className="max-w-4xl mx-auto text-slate-300 bg-slate-900/70 border border-blue-600/50 rounded-lg p-6 md:p-8 mt-12 mx-4">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center justify-center gap-3 text-blue-400 text-xl md:text-2xl font-bold tracking-wider">
                            <Info className="h-5 w-5 md:h-6 md:w-6" /> Sobre a Licença
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-justify text-sm">Ao comprar, você adquire uma <span className="font-bold text-white">chave de licença</span> para ativar e usar todas as funcionalidades premium do Allavsoft no seu computador.</p>
                        <p className="text-justify text-sm">A licença garante acesso completo ao software, incluindo futuras atualizações de compatibilidade e suporte técnico especializado.</p>
                    </CardContent>
                </Card>

                <div className="flex justify-center pb-12 px-4">
                    <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 font-bold text-lg md:text-xl px-6 md:px-8 py-3 md:py-4 shadow-lg">
                        <a href="https://wa.me/5551935052274" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <ShoppingCart className="text-green-600" size={20} />
                            <span>COMPRAR LICENÇA ALLAVSOFT</span>
                        </a>
                    </Button>
                </div>

            </main>
        </div>
    );
}
