"use client";

import { memo } from 'react';
import Header from '@/components/layout/Header';
import NewFooter from '@/components/layout/NewFooter';
import Image from "next/image";
import {
    Zap, Shield, Globe, Film, Star, MonitorPlay, ShoppingCart, Info,
    ArrowRight, Check, MessageCircle, Sparkles, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

// Animation variants
const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
};

interface FeatureCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    borderColor: string;
    iconColor: string;
}

const FeatureCard = memo<FeatureCardProps>(({ icon: Icon, title, description, borderColor, iconColor }) => (
    <div className={`relative overflow-hidden rounded-2xl border ${borderColor} bg-gray-900/50 backdrop-blur-sm p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl group`}>
        <div className="relative">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${iconColor} rounded-2xl border mb-6`}>
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white mb-4 tracking-tight">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
    </div>
));

FeatureCard.displayName = "FeatureCard";

export default function AllavsoftPage() {
    const features = [
        {
            icon: Zap,
            title: "DOWNLOADS RÁPIDOS",
            description: "Baixe vídeos e áudios em alta velocidade de mais de 1000 sites.",
            borderColor: "border-purple-500/30",
            iconColor: "text-purple-400 bg-purple-500/20 border-purple-500/30"
        },
        {
            icon: Shield,
            title: "100% SEGURO",
            description: "Software oficial licenciado e livre de malware.",
            borderColor: "border-green-500/30",
            iconColor: "text-green-400 bg-green-500/20 border-green-500/30"
        },
        {
            icon: Globe,
            title: "SUPORTE UNIVERSAL",
            description: "Funciona com YouTube, Vimeo, Facebook, Instagram e centenas de outros sites.",
            borderColor: "border-blue-500/30",
            iconColor: "text-blue-400 bg-blue-500/20 border-blue-500/30"
        },
        {
            icon: Film,
            title: "QUALIDADE PREMIUM",
            description: "Downloads em 4K, 8K, Full HD e todas as resoluções disponíveis.",
            borderColor: "border-orange-500/30",
            iconColor: "text-orange-400 bg-orange-500/20 border-orange-500/30"
        },
        {
            icon: MonitorPlay,
            title: "CONVERSÃO AUTOMÁTICA",
            description: "Converta automaticamente para MP3, MP4, AVI e mais de 200 formatos.",
            borderColor: "border-teal-500/30",
            iconColor: "text-teal-400 bg-teal-500/20 border-teal-500/30"
        },
        {
            icon: Star,
            title: "INTERFACE PROFISSIONAL",
            description: "Design moderno e intuitivo para máxima produtividade.",
            borderColor: "border-pink-500/30",
            iconColor: "text-pink-400 bg-pink-500/20 border-pink-500/30"
        }
    ];

    return (
        <div className="min-h-screen bg-[#04060E] text-white z-0" style={{ zIndex: 0 }}>
            <Header />
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-24 py-20 lg:py-32">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent"></div>
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                </div>
                <div className="container mx-auto px-6 relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-bold mb-8"
                        >
                            <Star className="w-4 h-4" />
                            LICENÇA PREMIUM ORIGINAL
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8"
                        >
                            ALLAVSOFT
                            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> PREMIUM</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
                        >
                            O downloader mais poderoso do mercado. Baixe vídeos e áudios de <span className="text-purple-400 font-bold">+1000 sites</span>
                            com licença oficial e suporte completo.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
                        >
                            <a
                                href="https://wa.me/5551935052274?text=Quero%20comprar%20o%20Allavsoft%20Premium"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-black text-xl rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/40 border border-purple-400/30"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center gap-3">
                                    <ShoppingCart className="w-6 h-6" />
                                    COMPRAR AGORA
                                </span>
                            </a>
                            <a
                                href="https://wa.me/5551935052274?text=Quero%20saber%20mais%20sobre%20o%20Allavsoft"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group px-10 py-5 bg-transparent border-2 border-gray-600 text-gray-300 font-bold text-xl rounded-xl transition-all duration-300 hover:border-purple-400 hover:text-purple-400 hover:bg-purple-500/10 hover:scale-105"
                            >
                                <span className="flex items-center gap-3">
                                    <MessageCircle className="w-6 h-6" />
                                    FALAR NO WHATSAPP
                                </span>
                            </a>
                        </motion.div>
                        {/* Hero Image */}
                        <div className="relative max-w-4xl mx-auto">
                            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl"></div>
                            <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-2 shadow-2xl">
                                <Image
                                    src="https://i.ibb.co/JXJDdXx/allavsoft.png"
                                    alt="Allavsoft Interface Premium"
                                    width={1200}
                                    height={600}
                                    className="w-full h-auto rounded-2xl"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seção extra de cards interativos e informações */}
            <section className="py-12 bg-gradient-to-br from-purple-900/10 to-blue-900/10">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="bg-gray-900/60 border border-purple-700/30 backdrop-blur-sm p-8 hover:scale-105 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-400"><Sparkles className="w-6 h-6" /> Dica Pro</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Use o Allavsoft para baixar playlists inteiras do YouTube com apenas um clique. Economize tempo e organize sua biblioteca!</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-900/60 border border-blue-700/30 backdrop-blur-sm p-8 hover:scale-105 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-400"><Info className="w-6 h-6" /> Tutorial Rápido</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Para converter vídeos em MP3, basta colar o link, escolher o formato desejado e clicar em baixar. Simples e rápido!</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-900/60 border border-green-700/30 backdrop-blur-sm p-8 hover:scale-105 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-400"><Star className="w-6 h-6" /> Depoimento VIP</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>“O Allavsoft mudou minha rotina! Consigo baixar tudo que preciso para meus projetos, sem limites e com qualidade.” <span className="text-green-400">— DJ Nextor</span></p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <main className="space-y-12">
                {/* Detailed Description Section */}
                <section className="py-12 bg-gray-900/20">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            <Card className="bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm p-8 md:p-12">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-bold mb-4">
                                        <Info className="w-4 h-4" />
                                        SOLUÇÃO COMPLETA
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
                                        ALLAVSOFT PREMIUM
                                        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> 2025</span>
                                    </h2>
                                    <p className="text-xl text-gray-300 leading-relaxed">
                                        A ferramenta definitiva para download de conteúdo multimídia
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
                                        <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                                            <Globe className="w-6 h-6" />
                                            Compatibilidade Universal
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <p><strong className="text-purple-400">+1000 Sites Suportados:</strong> YouTube, Vimeo, Facebook, Instagram, TikTok, Twitter, Dailymotion, e muito mais.</p>
                                                <p><strong className="text-blue-400">Formatos Diversos:</strong> MP4, AVI, MOV, FLV, WMV, MP3, AAC, WAV, FLAC e +200 formatos.</p>
                                                <p><strong className="text-green-400">Qualidades Múltiplas:</strong> Desde 144p até 8K, incluindo 4K UHD e Full HD.</p>
                                            </div>
                                            <div className="space-y-3">
                                                <p><strong className="text-orange-400">Download em Lote:</strong> Baixe múltiplos arquivos simultaneamente para economizar tempo.</p>
                                                <p><strong className="text-red-400">Gravador Integrado:</strong> Capture telas para conteúdos que não podem ser baixados diretamente.</p>
                                                <p><strong className="text-teal-400">Metadados Completos:</strong> Preserve informações de artista, álbum, legendas e mais.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl p-6">
                                        <h4 className="text-2xl font-bold text-amber-400 mb-3 flex items-center gap-2">
                                            <Sparkles className="w-6 h-6" />
                                            Por que escolher o Allavsoft?
                                        </h4>
                                        <p className="text-gray-300">
                                            Seja para criar sua biblioteca offline, assistir sem conexão ou editar conteúdos, o Allavsoft entrega estabilidade, rapidez e qualidade profissional. Interface intuitiva e suporte técnico confiável.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-12">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-bold mb-4">
                                <Star className="w-4 h-4" />
                                RECURSOS PREMIUM
                            </div>
                            <h3 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                                FUNCIONALIDADES
                                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> EXCLUSIVAS</span>
                            </h3>
                        </div>

                        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={cardVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <FeatureCard {...feature} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* License Section */}
                <section className="py-12 bg-gray-900/20">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-bold mb-6">
                                <Check className="w-4 h-4" />
                                LICENÇA ORIGINAL
                            </div>

                            <h3 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
                                COMPRE SUA
                                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> LICENÇA OFICIAL</span>
                            </h3>

                            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                                Adquira o Allavsoft Premium com licença oficial, suporte técnico completo e atualizações gratuitas por toda vida.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                <a
                                    href="https://wa.me/5551935052274?text=Quero%20comprar%20o%20Allavsoft%20Premium%20com%20licença%20oficial"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-black text-xl rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/40 border border-purple-400/30"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative flex items-center gap-3">
                                        <ShoppingCart className="w-6 h-6" />
                                        COMPRAR LICENÇA PREMIUM
                                    </span>
                                </a>

                                <a
                                    href="https://wa.me/5551935052274?text=Preciso%20de%20mais%20informações%20sobre%20o%20Allavsoft"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group px-10 py-5 bg-transparent border-2 border-gray-600 text-gray-300 font-bold text-xl rounded-xl transition-all duration-300 hover:border-purple-400 hover:text-purple-400 hover:bg-purple-500/10 hover:scale-105"
                                >
                                    <span className="flex items-center gap-3">
                                        <ExternalLink className="w-6 h-6" />
                                        MAIS INFORMAÇÕES
                                    </span>
                                </a>
                            </div>

                            {/* WhatsApp Support */}
                            <div className="mt-16 max-w-2xl mx-auto">
                                <div className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-sm p-8">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
                                    <div className="relative text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full border border-purple-500/30 mb-6">
                                            <MessageCircle className="h-8 w-8 text-purple-400" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-white mb-4">Suporte Especializado</h4>
                                        <p className="text-gray-400 mb-6">
                                            Nossa equipe técnica está disponível para te ajudar com a instalação e configuração do Allavsoft Premium.
                                        </p>
                                        <a
                                            href="https://wa.me/5551935052274?text=Preciso%20de%20suporte%20técnico%20para%20o%20Allavsoft"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-3 px-8 py-4 bg-purple-500/20 border border-purple-500/50 text-purple-400 font-bold rounded-xl transition-all duration-300 hover:bg-purple-500/30 hover:scale-105"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            OBTER SUPORTE
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* NewFooter Component */}
            <NewFooter />
        </div>
    );
}
