"use client";

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

import Link from "next/link";
import {
    LinkIcon, Zap, Sparkles, DownloadCloud, GaugeCircle, ShieldOff,
    ServerCog, FileVideo, CloudCog, Lock, Check, MessageCircle,
    ExternalLink, ArrowRight, ArrowDownCircle, ArrowLeft, AlertTriangle,
    Info, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ReactNode } from "react";
import { motion } from "framer-motion";

// Framer Motion animation variants for cards
const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
};

// --- Componentes de Card (sem alterações) ---

const FeatureCard = ({ icon, title, description }: { icon: ReactNode; title: string; description: string }) => (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-sm p-8 transition-all duration-500 hover:border-green-400/50 hover:bg-gray-800/70 hover:shadow-2xl hover:shadow-green-500/10 hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative">
            <div className="mb-6 text-green-400 group-hover:text-green-300 transition-colors duration-300">{icon}</div>
            <h3 className="mb-4 text-xl font-black uppercase tracking-wider text-white group-hover:text-green-100 transition-colors duration-300">{title}</h3>
            <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{description}</p>
        </div>
    </div>
);

const StepCard = ({ icon, title, description }: { icon: ReactNode; title: string; description: string }) => (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-sm p-8 text-center transition-all duration-500 hover:scale-105 hover:bg-gray-800/70 hover:border-green-400/30 hover:shadow-xl hover:shadow-green-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/80 text-green-400 group-hover:bg-green-500/20 group-hover:text-green-300 transition-all duration-300 border border-gray-600 group-hover:border-green-400/50">
                {icon}
            </div>
            <h3 className="mb-4 text-xl font-black uppercase text-white group-hover:text-green-100 transition-colors duration-300">{title}</h3>
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{description}</p>
        </div>
    </div>
);

const PricingCard = ({
    serviceName, logoSrc, price, period, features, isRecommended,
}: { serviceName: string; logoSrc?: string; price: string; period: string; features: string[]; isRecommended?: boolean; }) => (
    <div
        className={`relative flex h-full flex-col rounded-2xl border p-8 text-center transition-all duration-300 ${isRecommended ? "border-2 border-green-500 bg-slate-900 shadow-2xl shadow-green-500/20" : "border-slate-800 bg-slate-900/50"}`}
    >
        {isRecommended && (
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 transform rounded-full bg-green-500 px-4 py-1 text-sm font-bold uppercase text-white">
                A Solução Definitiva
            </span>
        )}
        <div className="mb-6 flex-grow flex items-center justify-center">
            {logoSrc ? (<Image src={logoSrc} alt={`${serviceName} Logo`} width={140} height={45} className="mx-auto" unoptimized />) : (<h3 className="text-3xl font-bold uppercase tracking-widest text-green-400">{serviceName}</h3>)}
        </div>
        <div className="mb-6">
            <div className={`text-5xl font-black ${isRecommended ? "text-green-400" : "text-red-400"}`}>{price}</div>
            <p className="text-slate-400">{period}</p>
        </div>
        <ul className="space-y-3 text-slate-400">
            {features.map((feature, index) => (
                <li key={index} className="flex items-center justify-center">
                    {isRecommended && <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-400" />}
                    <span className={isRecommended ? "text-slate-300" : "text-slate-500"}>{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);

// --- Componente Principal da Página ---

export default function DebridLinkPage() {
    const topFeatures = [
        { icon: <ServerCog className="h-10 w-10" />, title: "Suporte a +150 Hosters", description: "Com uma única conta, acesse dezenas de servidores de arquivos como se fosse premium em todos." },
        { icon: <GaugeCircle className="h-10 w-10" />, title: "Velocidade Irrestrita", description: "Baixe na máxima velocidade da sua conexão, sem gargalos ou limitações artificiais." },
        { icon: <CloudCog className="h-10 w-10" />, title: "Conversor de Torrents", description: "Converta arquivos torrent em links de download direto, baixando com privacidade e velocidade." },
        { icon: <ShieldOff className="h-10 w-10" />, title: "100% Livre de Anúncios", description: "Navegue e baixe em um ambiente limpo, sem pop-ups, banners ou qualquer tipo de distração irritante." },
    ];

    const steps = [
        {
            icon: <LinkIcon className="h-8 w-8" />,
            title: "Cole o Link",
            description: "Insira o link do arquivo ou torrent que deseja baixar.",
        },
        {
            icon: <Zap className="h-8 w-8" />,
            title: "Processamento Instantâneo",
            description: "O Debrid-Link converte o link para download premium em segundos.",
        },
        {
            icon: <DownloadCloud className="h-8 w-8" />,
            title: "Download Direto",
            description: "Baixe com velocidade máxima, sem limites ou esperas.",
        },
        {
            icon: <FileVideo className="h-8 w-8" />,
            title: "Streaming Imediato",
            description: "Assista vídeos diretamente do navegador, sem precisar baixar tudo.",
        },
        {
            icon: <Lock className="h-8 w-8" />,
            title: "Privacidade Garantida",
            description: "Seus downloads são privados e protegidos por criptografia.",
        },
        {
            icon: <Sparkles className="h-8 w-8" />,
            title: "Aproveite!",
            description: "Curta seus arquivos sem restrições, anúncios ou complicações.",
        },
    ];

    return (
        <>
            <div className="min-h-screen text-white bg-gradient-to-br from-[#04060E] via-gray-900 to-black z-0" style={{ zIndex: 0 }}>
                <Header />

                {/* Premium Hero Section */}
                <section className="relative overflow-hidden pt-24 pb-16">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="max-w-[95%] mx-auto px-6">
                        <div className="text-center max-w-5xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-bold mb-8">
                                <Zap className="w-4 h-4" />
                                PREMIUM DOWNLOAD SOLUTION
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
                                DEBRID
                                <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                                    LINK
                                </span>
                            </h1>

                            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                                Transforme qualquer link em download premium. Acesse +150 servidores com velocidade máxima e zero limitações.
                            </p>

                            {/* Premium CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                                <a
                                    href="https://debrid-link.com/id/QgHfc"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30 border border-green-400/30"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative flex items-center gap-2">
                                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                        COMEÇAR AGORA
                                    </span>
                                </a>

                                <a
                                    href="https://wa.me/5551935052274?text=Olá,%20gostaria%20de%20saber%20sobre%20o%20Debrid-Link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group px-8 py-4 bg-transparent border-2 border-gray-600 text-gray-300 font-bold text-lg rounded-xl transition-all duration-300 hover:border-green-400 hover:text-green-400 hover:bg-green-500/5"
                                >
                                    <span className="flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5" />
                                        FALAR NO WHATSAPP
                                    </span>
                                </a>
                            </div>

                            {/* Hero Image */}
                            <div className="relative max-w-5xl mx-auto">
                                <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-3xl blur-2xl"></div>
                                <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-2 shadow-2xl">
                                    <Image
                                        src="/images/downloader.macbook.webp"
                                        alt="Interface do Debrid-Link"
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
                <main className="space-y-12">
                    {/* Como Funciona - Premium Section */}
                    <section className="py-12 bg-gray-900/20">
                        <div className="max-w-[95%] mx-auto px-6">
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-bold mb-4">
                                    <Zap className="w-4 h-4" />
                                    PROCESSO SIMPLIFICADO
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                                    DOWNLOAD EM
                                    <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent"> 6 PASSOS</span>
                                </h2>
                                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                                    Nossa tecnologia foi projetada para máxima simplicidade e eficiência.
                                </p>
                            </div>

                            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {steps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        variants={cardVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        className="relative"
                                    >
                                        {/* Step Number */}
                                        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-black text-sm border-2 border-gray-900 z-10">
                                            {index + 1}
                                        </div>
                                        <StepCard {...step} />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Pricing Section - Premium */}
                    <section className="py-12">
                        <div className="max-w-[95%] mx-auto px-6">
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-sm font-bold mb-4">
                                    <AlertTriangle className="w-4 h-4" />
                                    COMPARAÇÃO DE CUSTOS
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                                    4 PROBLEMAS.
                                    <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent"> 1 SOLUÇÃO.</span>
                                </h2>
                                <p className="text-xl text-gray-400 max-w-4xl mx-auto">
                                    Pare de pagar múltiplas assinaturas caras e ineficientes. Veja como o Debrid-Link revoluciona seu custo-benefício.
                                </p>
                            </div>

                            <div className="max-w-7xl mx-auto">
                                {/* Competitors Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                    <PricingCard serviceName="Mega.nz" logoSrc="/images/mega-logo.svg" price="R$ 32" period="por mês" features={["Apenas 1 TB de transferência", "Velocidade limitada", "Acesso a 1 hoster"]} />
                                    <PricingCard serviceName="Filecat" logoSrc="/images/filecat-logo.svg" price="R$ 95" period="por mês" features={["Plano de 30 dias", "Apenas 1 hoster", "Preço elevado por 1 serviço"]} />
                                    <PricingCard serviceName="Turbobit" logoSrc="https://turbobit.me/wp-content/uploads/2019/09/logo-e1567507204298.png" price="R$ 53,84" period="por mês" features={["Apenas 600 GB de transferência", "Velocidade ilimitada", "Acesso a 1 hoster"]} />
                                    <PricingCard serviceName="Tezfiles" logoSrc="https://filesearch.link/wp-content/uploads/2022/07/tezfiles.svg" price="R$ 81" period="por mês" features={["Apenas 20 GB de transferência/dia", "Velocidade limitada", "Acesso a 1 hoster"]} />
                                </div>

                                {/* Arrow Animation */}
                                <motion.div
                                    className="flex justify-center text-center mb-12"
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="flex flex-col items-center">
                                        <ArrowDownCircle className="h-16 w-16 text-green-500 mb-4" />
                                        <span className="text-green-400 font-bold text-lg">A SOLUÇÃO DEFINITIVA</span>
                                    </div>
                                </motion.div>

                                {/* Debrid-Link Solution */}
                                <div className="max-w-md mx-auto">
                                    <PricingCard
                                        serviceName="Debrid-Link"
                                        price="R$ 25"
                                        period="por mês (média)"
                                        features={[
                                            "Downloads ILIMITADOS",
                                            "Velocidade MÁXIMA da sua internet",
                                            "Suporte a +150 servidores",
                                            "TODOS os hosts acima inclusos"
                                        ]}
                                        isRecommended
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* Features Section - Premium */}
                    <section className="py-12 bg-gray-900/20">
                        <div className="max-w-[95%] mx-auto px-6">
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-bold mb-4">
                                    <Sparkles className="w-4 h-4" />
                                    RECURSOS PREMIUM
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                                    RECURSOS QUE
                                    <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent"> IMPRESSIONAM</span>
                                </h2>
                                <p className="text-xl text-gray-400 max-w-4xl mx-auto">
                                    Cada funcionalidade foi projetada para oferecer a melhor experiência de download possível.
                                </p>
                            </div>

                            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                                {topFeatures.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        variants={cardVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.6, delay: index * 0.15 }}
                                    >
                                        <FeatureCard {...feature} />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Final - Premium */}
                    <section className="py-12 relative overflow-hidden">
                        <div className="absolute inset-0">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
                        </div>

                        <div className="max-w-[95%] mx-auto px-6 text-center">
                            <div className="max-w-4xl mx-auto">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-bold mb-6">
                                    <Check className="w-4 h-4" />
                                    MILHARES DE USUÁRIOS SATISFEITOS
                                </div>

                                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                                    DIGA ADEUS À
                                    <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"> FRUSTRAÇÃO</span>
                                </h2>

                                <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                                    Junte-se a milhares de usuários que já descobriram a liberdade de baixar sem limites.
                                    Transforme sua experiência hoje mesmo.
                                </p>

                                {/* Premium CTA */}
                                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                                    <a
                                        href="https://debrid-link.com/id/QgHfc"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-green-500 to-teal-500 text-white font-black text-xl rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-green-500/40 border border-green-400/30"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="relative flex items-center gap-3">
                                            <ExternalLink className="w-6 h-6" />
                                            CRIAR CONTA AGORA
                                        </span>
                                    </a>
                                </div>

                                {/* WhatsApp Card */}
                                <div className="max-w-2xl mx-auto">
                                    <div className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-sm p-8">
                                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5"></div>
                                        <div className="relative">
                                            <div className="flex flex-col items-center justify-center gap-4 mb-6">
                                                <div className="p-3 bg-green-500/20 rounded-full border border-green-500/30">
                                                    <MessageCircle className="h-8 w-8 text-green-400" />
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-2xl font-bold text-white mb-2">Não tem cartão internacional?</h3>
                                                    <p className="text-gray-400">Compre via PIX diretamente conosco pelo WhatsApp com atendimento personalizado.</p>
                                                </div>
                                            </div>

                                            <a
                                                href="https://wa.me/5551935052274?text=Olá,%20gostaria%20de%20comprar%20uma%20conta%20Debrid-Link"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group w-full block"
                                            >
                                                <div className="px-8 py-4 bg-transparent border-2 border-green-500/60 text-green-400 font-bold text-lg rounded-xl transition-all duration-300 hover:border-green-500 hover:bg-green-500/10 hover:scale-105 flex items-center justify-center gap-3">
                                                    <MessageCircle className="w-5 h-5" />
                                                    FALAR NO WHATSAPP
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Seção extra de cards interativos e informações premium */}
                <section className="py-12 bg-gradient-to-br from-green-900/10 to-teal-900/10">
                    <div className="max-w-[95%] mx-auto px-6">
                        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-gray-900/60 border border-green-700/30 rounded-2xl p-8 hover:scale-105 transition-all duration-300">
                                <div className="flex items-center gap-2 mb-4 text-green-400 font-bold"><Sparkles className="w-6 h-6" /> Dica Pro</div>
                                <h4 className="text-xl font-black mb-2 text-green-300">Downloads Ilimitados</h4>
                                <p>Use o Debrid-Link para baixar arquivos grandes sem restrições e com máxima velocidade. Ideal para DJs e criadores!</p>
                            </div>
                            <div className="bg-gray-900/60 border border-teal-700/30 rounded-2xl p-8 hover:scale-105 transition-all duration-300">
                                <div className="flex items-center gap-2 mb-4 text-teal-400 font-bold"><Info className="w-6 h-6" /> Tutorial Rápido</div>
                                <h4 className="text-xl font-black mb-2 text-teal-300">Como Usar</h4>
                                <p>Copie o link do arquivo, cole no Debrid-Link e clique em baixar. Pronto! Seu download começa instantaneamente.</p>
                            </div>
                            <div className="bg-gray-900/60 border border-green-700/30 rounded-2xl p-8 hover:scale-105 transition-all duration-300">
                                <div className="flex items-center gap-2 mb-4 text-green-400 font-bold"><Star className="w-6 h-6" /> Depoimento VIP</div>
                                <h4 className="text-xl font-black mb-2 text-green-300">Experiência Real</h4>
                                <p>“O Debrid-Link me permite baixar packs e playlists sem limites. Recomendo para todos que querem praticidade!” <span className="text-green-400">— DJ Nexor</span></p>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}
