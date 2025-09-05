"use client"

import Link from "next/link"
import Image from "next/image"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

import {
    ArrowLeft, Music, Download, Check, ExternalLink, Settings, Zap, Shield, Globe, Headphones, Clock,
    Server, User, ArrowRight, HelpCircle, AudioLines, FolderKanban, WifiOff, ListMusic, Computer,
    Search as SearchIcon, Wrench as WrenchIcon, Sparkles, Crown, MessageCircle, Info, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

// Animation variants
const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
};

interface FeatureCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    color: string;
}

const FeatureCard = ({ icon: Icon, title, description, color }: FeatureCardProps) => {
    const colorClasses = {
        purple: "border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:shadow-purple-500/20",
        green: "border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:shadow-green-500/20",
        blue: "border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:shadow-blue-500/20",
        orange: "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5 hover:shadow-orange-500/20",
        teal: "border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-teal-600/5 hover:shadow-teal-500/20",
        pink: "border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-pink-600/5 hover:shadow-pink-500/20"
    };

    const iconColorClasses = {
        purple: "text-purple-400 bg-purple-500/20 border-purple-500/30",
        green: "text-green-400 bg-green-500/20 border-green-500/30",
        blue: "text-blue-400 bg-blue-500/20 border-blue-500/30",
        orange: "text-orange-400 bg-orange-500/20 border-orange-500/30",
        teal: "text-teal-400 bg-teal-500/20 border-teal-500/30",
        pink: "text-pink-400 bg-pink-500/20 border-pink-500/30"
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl group ${colorClasses[color as keyof typeof colorClasses]}`}>
            <div className="relative">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl border mb-6 ${iconColorClasses[color as keyof typeof iconColorClasses]}`}>
                    <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white mb-4 tracking-tight">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{description}</p>
            </div>
        </div>
    );
};

// --- Componente Principal da Página ---
export default function Deemix() {
    return (
        <div className="min-h-screen bg-[#04060E] text-white z-0" style={{ zIndex: 0 }}>
            <Header />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-24 py-20 lg:py-32">
                {/* Animated Background Particles */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent"></div>
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Floating Music Notes */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-32 left-20 animate-bounce" style={{ animationDelay: '0.5s' }}>
                        <Music className="w-6 h-6 text-purple-400/30" />
                    </div>
                    <div className="absolute top-40 right-32 animate-bounce" style={{ animationDelay: '1.5s' }}>
                        <Music className="w-4 h-4 text-pink-400/30" />
                    </div>
                    <div className="absolute bottom-32 left-1/4 animate-bounce" style={{ animationDelay: '2.5s' }}>
                        <Music className="w-5 h-5 text-blue-400/30" />
                    </div>
                </div>

                <div className="max-w-[95%] mx-auto px-6 relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-300 text-sm font-bold mb-8 backdrop-blur-sm shadow-lg shadow-purple-500/20"
                        >
                            <Music className="w-4 h-4 animate-pulse" />
                            DEEMIX PREMIUM DEDICADO
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 80 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8"
                        >
                            DEEMIX
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse"> PREMIUM</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
                        >
                            A ferramenta mais poderosa para baixar músicas do <span className="text-purple-400 font-bold">Deezer</span> em alta qualidade.
                            Servidor dedicado, velocidade máxima e qualidade <span className="text-pink-400 font-bold">FLAC</span>.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                        >
                            <Link
                                href="/planos"
                                className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xl rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/40 border border-purple-400/30"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center gap-3">
                                    <Crown className="w-6 h-6" />
                                    VER PLANOS VIP
                                </span>
                            </Link>

                            <a
                                href="https://mpago.la/1CW9WQK"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group px-10 py-5 bg-transparent border-2 border-gray-600 text-gray-300 font-bold text-xl rounded-xl transition-all duration-300 hover:border-purple-400 hover:text-purple-400 hover:bg-purple-500/10 hover:scale-105"
                            >
                                <span className="flex items-center gap-3">
                                    <Download className="w-6 h-6" />
                                    COMPRAR AVULSO
                                </span>
                            </a>
                        </motion.div>
                    </div>
                </div>
            </section>

            <main className="space-y-12">
                {/* Server Architecture Section */}
                <section className="py-12 bg-gray-900/20">
                    <div className="max-w-[95%] mx-auto px-6">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-bold mb-4">
                                <Server className="w-4 h-4" />
                                ARQUITETURA PREMIUM
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                                VANTAGEM DO
                                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> SERVIDOR DEDICADO</span>
                            </h2>
                            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
                                Você instala o programa, mas a mágica acontece na nossa infraestrutura de nuvem. Entenda por que nosso Deemix é incomparável.
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <div className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-sm p-8 md:p-12">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-purple-500/5"></div>
                                <div className="relative">
                                    {/* Architecture Diagram */}
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-8">
                                        <motion.div
                                            className="flex flex-col items-center text-center"
                                            initial={{ opacity: 0, x: -50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30">
                                                <User className="h-10 w-10 text-blue-400" />
                                            </div>
                                            <h3 className="font-black text-white text-lg mb-2">SEU PC</h3>
                                            <p className="text-gray-400 text-sm">Interface Leve</p>
                                        </motion.div>

                                        <ArrowRight className="hidden md:block h-8 w-8 text-green-400 animate-pulse" />

                                        <motion.div
                                            className="flex flex-col items-center text-center"
                                            initial={{ opacity: 0, y: 50 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.2 }}
                                        >
                                            <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4 border border-green-500/30">
                                                <Server className="h-10 w-10 text-green-400" />
                                            </div>
                                            <h3 className="font-black text-white text-lg mb-2">NOSSO SERVIDOR</h3>
                                            <p className="text-gray-400 text-sm">Processamento Premium</p>
                                        </motion.div>

                                        <ArrowRight className="hidden md:block h-8 w-8 text-green-400 animate-pulse" />

                                        <motion.div
                                            className="flex flex-col items-center text-center"
                                            initial={{ opacity: 0, x: 50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6, delay: 0.4 }}
                                        >
                                            <div className="w-20 h-20 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-4 border border-pink-500/30">
                                                <Music className="h-10 w-10 text-pink-400" />
                                            </div>
                                            <h3 className="font-black text-white text-lg mb-2">DEEZER</h3>
                                            <p className="text-gray-400 text-sm">Fonte das Músicas</p>
                                        </motion.div>
                                    </div>

                                    <p className="text-gray-300 text-lg mb-8 text-center leading-relaxed">
                                        Quando você clica para baixar, nosso servidor na Contabo faz todo o trabalho pesado:
                                        baixa as músicas em altíssima velocidade dos servidores do Deezer e envia diretamente para você.
                                    </p>

                                    {/* Benefits Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            { icon: Zap, title: "Velocidade Máxima", desc: "Downloads usando conexão de 1 Gbit/s, não a sua internet." },
                                            { icon: Shield, title: "Sem Burocracia", desc: "Não precisa de VPN, proxies ou configurações complexas." },
                                            { icon: WifiOff, title: "Economia de Banda", desc: "Seu plano de internet não é consumido pelos downloads." },
                                            { icon: Crown, title: "Privacidade Total", desc: "Nosso servidor protege seu IP e garante anonimato." }
                                        ].map((item, index) => (
                                            <motion.div
                                                key={index}
                                                className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30"
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                            >
                                                <div className="p-2 bg-green-500/20 rounded-lg">
                                                    <item.icon className="h-5 w-5 text-green-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                                    <p className="text-gray-400 text-sm">{item.desc}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-12">
                    <div className="max-w-[95%] mx-auto px-6">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-bold mb-4">
                                <Sparkles className="w-4 h-4" />
                                RECURSOS EXCLUSIVOS
                            </div>
                            <h3 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                                FUNCIONALIDADES
                                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> PREMIUM</span>
                            </h3>
                        </div>

                        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { icon: Zap, title: "DOWNLOAD ULTRA RÁPIDO", description: "Downloads em velocidade máxima direto dos servidores do Deezer, sem limitações.", color: "purple" },
                                { icon: Shield, title: "100% SEGURO", description: "Conexão criptografada e downloads seguros. Seus dados sempre protegidos.", color: "green" },
                                { icon: Globe, title: "ACESSO GLOBAL", description: "Acesse de qualquer lugar do mundo através do nosso servidor web dedicado.", color: "blue" },
                                { icon: Headphones, title: "QUALIDADE PREMIUM", description: "Downloads em FLAC, MP3 320kbps e outros formatos de alta qualidade.", color: "orange" },
                                { icon: ListMusic, title: "PLAYLISTS COMPLETAS", description: "Baixe álbuns, discografias e playlists do Spotify e Deezer inteiras.", color: "teal" },
                                { icon: FolderKanban, title: "ORGANIZAÇÃO AUTO", description: "Músicas organizadas automaticamente com tags e capas em alta resolução.", color: "pink" }
                            ].map((feature, index) => (
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

                {/* CTA Section */}
                <section className="py-12 bg-gray-900/20">
                    <div className="max-w-[95%] mx-auto px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-bold mb-6">
                                <Check className="w-4 h-4" />
                                PRONTO PARA USAR
                            </div>

                            <h3 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
                                ESCOLHA SEU
                                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> PLANO IDEAL</span>
                            </h3>

                            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                                Escolha entre nossos planos VIP com descontos especiais ou compre o Deemix avulso. Descubra a liberdade de ter toda sua música favorita em alta qualidade.
                            </p>                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                <Link
                                    href="/planos"
                                    className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-xl rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/40 border border-purple-400/30"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative flex items-center gap-3">
                                        <Crown className="w-6 h-6 group-hover:animate-pulse" />
                                        VER PLANOS VIP
                                    </span>
                                </Link>

                                <a
                                    href="https://mpago.la/1CW9WQK"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative overflow-hidden px-10 py-5 bg-transparent border-2 border-gray-600 text-gray-300 font-bold text-xl rounded-xl transition-all duration-300 hover:border-purple-400 hover:text-purple-400 hover:bg-purple-500/10 hover:scale-105"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                                    <span className="relative flex items-center gap-3">
                                        <Download className="w-6 h-6 group-hover:animate-bounce" />
                                        COMPRAR AVULSO
                                    </span>
                                </a>
                            </div>

                            {/* WhatsApp Support */}
                            <div className="mt-16 max-w-2xl mx-auto">
                                <div className="group relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-sm p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full border border-green-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                                            <MessageCircle className="h-8 w-8 text-green-400 group-hover:animate-pulse" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-green-100 transition-colors duration-300">Precisa de Ajuda?</h4>
                                        <p className="text-gray-400 mb-6 group-hover:text-gray-300 transition-colors duration-300">
                                            Nossa equipe está pronta para te ajudar com qualquer dúvida sobre o Deemix Premium.
                                        </p>
                                        <a
                                            href="https://wa.me/5551935052274?text=Olá,%20preciso%20de%20ajuda%20com%20o%20Deemix"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/btn inline-flex items-center gap-3 px-8 py-4 bg-green-500/20 border border-green-500/50 text-green-400 font-bold rounded-xl transition-all duration-300 hover:bg-green-500/30 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30"
                                        >
                                            <MessageCircle className="w-5 h-5 group-hover/btn:animate-bounce" />
                                            FALAR NO WHATSAPP
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Seção de Preços */}
            <section className="py-12 bg-gradient-to-br from-purple-900/10 to-green-900/10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-bold mb-4">
                            <Crown className="w-4 h-4" />
                            PLANOS DISPONÍVEIS
                        </div>
                        <h3 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                            ESCOLHA SEU
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> DESCONTO IDEAL</span>
                        </h3>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Planos VIP com descontos especiais ou compre o Deemix avulso. Todos com acesso completo à plataforma premium.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Plano VIP Básico */}
                        <Card className="bg-gray-900/60 border border-purple-700/30 backdrop-blur-sm p-8 hover:scale-105 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-400">
                                    <Crown className="w-6 h-6" />
                                    VIP BÁSICO
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center mb-6">
                                    <div className="text-3xl font-bold text-white mb-2">R$ 35/mês</div>
                                    <div className="text-lg text-purple-400 font-semibold mb-4">35% de desconto</div>
                                    <div className="text-sm text-gray-400">Preço normal: R$ 35,00</div>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        Deemix Premium incluído
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        50 Downloads/dia
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        Acesso ao Drive
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Plano VIP Padrão */}
                        <Card className="bg-gray-900/60 border border-green-700/30 backdrop-blur-sm p-8 hover:scale-105 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-400">
                                    <Crown className="w-6 h-6" />
                                    VIP PADRÃO
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center mb-6">
                                    <div className="text-3xl font-bold text-white mb-2">R$ 42/mês</div>
                                    <div className="text-lg text-green-400 font-semibold mb-4">42% de desconto</div>
                                    <div className="text-sm text-gray-400">Preço normal: R$ 35,00</div>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        Deemix Premium incluído
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        75 Downloads/dia
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        Drive + Packs
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Plano VIP Completo */}
                        <Card className="bg-gray-900/60 border border-blue-700/30 backdrop-blur-sm p-8 hover:scale-105 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-400">
                                    <Crown className="w-6 h-6" />
                                    VIP COMPLETO
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center mb-6">
                                    <div className="text-3xl font-bold text-white mb-2">R$ 50/mês</div>
                                    <div className="text-lg text-blue-400 font-semibold mb-4">60% de desconto</div>
                                    <div className="text-sm text-gray-400">Preço normal: R$ 35,00</div>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        Deemix Premium incluído
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        150 Downloads/dia
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        Todos os recursos
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Card do Deemix Avulso */}
                    <div className="max-w-2xl mx-auto mt-8">
                        <Card className="bg-gray-900/60 border border-orange-700/30 backdrop-blur-sm p-8 hover:scale-105 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-400">
                                    <Download className="w-6 h-6" />
                                    DEEMIX AVULSO
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center mb-6">
                                    <div className="text-3xl font-bold text-white mb-2">R$ 35,00</div>
                                    <div className="text-lg text-orange-400 font-semibold mb-4">Preço único</div>
                                    <div className="text-sm text-gray-400">Acesso direto ao Deemix Premium</div>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        Deemix Premium completo
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        Downloads ilimitados
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        Qualidade FLAC/MP3
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Seção extra de cards interativos e informações premium */}
            <section className="py-12 bg-gradient-to-br from-purple-900/10 to-green-900/10">
                <div className="max-w-[95%] mx-auto px-6">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="bg-gray-900/60 border border-purple-700/30 backdrop-blur-sm p-8 hover:scale-105 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-400"><Sparkles className="w-6 h-6" /> Dica Pro</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Use o Deemix para baixar álbuns completos do Deezer com qualidade FLAC. Organize sua coleção com capas e metadados!</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-900/60 border border-green-700/30 backdrop-blur-sm p-8 hover:scale-105 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-400"><Info className="w-6 h-6" /> Tutorial Rápido</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Para baixar playlists, basta colar o link da Deezer, escolher o formato e clicar em baixar. Simples e eficiente!</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-900/60 border border-blue-700/30 backdrop-blur-sm p-8 hover:scale-105 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-400"><Star className="w-6 h-6" /> Depoimento VIP</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>“O Deemix é perfeito para baixar músicas em alta qualidade. Recomendo para todos que querem praticidade e organização!” <span className="text-blue-400">— DJ Nexor</span></p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}