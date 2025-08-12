// src/components/layout/NewFooter.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import {
    Music,
    Globe,
    Headphones,
    Disc,
    CheckCircle,
    ArrowRight,
    Users,
    TrendingUp,
    Download,
    Zap,
    Crown,
    Star,
    Archive,
    Upload,
    Heart,
    MapPin,
    Mail,
    Phone,
    Instagram,
    Facebook,
    Twitter,
    Youtube,
    Play,
    Shuffle,
    Repeat,
    Volume2,
    Wifi,
    Shield,
    Clock,
    Sparkles
} from 'lucide-react';

const NewFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative z-10 mt-20 overflow-hidden bg-[#0a0a0a] border-t border-gray-800/50">
            {/* Background com efeitos visuais escuros */}
            <div className="absolute inset-0">
                {/* Gradiente principal escuro */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#111111] to-[#1a1a1a]"></div>

                {/* Partículas animadas com cores escuras */}
                <div className="absolute inset-0">
                    <div className="absolute top-10 left-10 w-2 h-2 bg-purple-600/30 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                    <div className="absolute top-20 right-20 w-1 h-1 bg-pink-600/40 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-blue-600/30 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-10 right-1/3 w-1 h-1 bg-emerald-600/40 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
                </div>

                {/* Linhas decorativas escuras */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-600/40 to-transparent"></div>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-600/40 to-transparent transform translate-y-0.5"></div>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600/40 to-transparent transform translate-y-1"></div>
                </div>

                {/* Padrão de fundo sutil */}
                <div className="absolute inset-0 opacity-3">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, #1a1a1a 1px, transparent 1px),
                                        radial-gradient(circle at 75% 75%, #1a1a1a 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}></div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 relative">
                {/* Header do footer com logo e status */}
                <div className="text-center mb-12">
                    {/* Logo animado com tema escuro */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="relative">
                            <div className="bg-gradient-to-r from-purple-800 via-pink-800 to-blue-800 p-3 rounded-xl shadow-2xl border border-purple-700/30">
                                <Music className="h-8 w-8 text-white" />
                            </div>
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-800 via-pink-800 to-blue-800 rounded-xl blur opacity-30 animate-pulse"></div>
                        </div>
                        <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                            NEXOR RECORDS
                        </h2>
                    </div>

                    {/* Status do sistema com tema escuro */}
                    <div className="inline-flex items-center gap-6 bg-[#111111]/90 backdrop-blur-sm px-6 py-3 rounded-xl border border-gray-800/60 shadow-xl">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                            </div>
                            <span className="text-emerald-400 font-semibold text-xs">SISTEMA ONLINE</span>
                        </div>
                        <div className="w-px h-5 bg-gradient-to-b from-transparent via-gray-700 to-transparent"></div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                <div className="absolute inset-0 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                            </div>
                            <span className="text-blue-400 font-semibold text-xs">99.9% UPTIME</span>
                        </div>
                        <div className="w-px h-5 bg-gradient-to-b from-transparent via-gray-700 to-transparent"></div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute inset-0 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                            </div>
                            <span className="text-purple-400 font-semibold text-xs">SSL SEGURO</span>
                        </div>
                    </div>
                </div>

                {/* Grid principal com informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Coluna 1 - Sobre */}
                    <div className="space-y-4 group">
                        <div className="relative">
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-purple-400" />
                                SOBRE A PLATAFORMA
                            </h3>
                            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-500"></div>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            A plataforma definitiva para DJs profissionais. Acesso ilimitado a milhares de músicas eletrônicas de alta qualidade com tecnologia de ponta.
                        </p>
                        <div className="flex space-x-2">
                            {[
                                { icon: Instagram, color: 'hover:text-purple-400', bgColor: 'hover:bg-purple-800/30' },
                                { icon: Facebook, color: 'hover:text-pink-400', bgColor: 'hover:bg-pink-800/30' },
                                { icon: Twitter, color: 'hover:text-blue-400', bgColor: 'hover:bg-blue-800/30' },
                                { icon: Youtube, color: 'hover:text-red-400', bgColor: 'hover:bg-red-800/30' }
                            ].map((social, index) => (
                                <a key={index} href="#" className={`text-gray-500 transition-all duration-300 ${social.color}`}>
                                    <div className={`bg-[#111111] p-2 rounded-lg transition-all duration-300 ${social.bgColor} hover:scale-110 border border-gray-800/50`}>
                                        <social.icon className="h-4 w-4" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Coluna 2 - Links rápidos */}
                    <div className="space-y-4 group">
                        <div className="relative">
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-pink-400" />
                                LINKS RÁPIDOS
                            </h3>
                            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-red-500 group-hover:w-full transition-all duration-500"></div>
                        </div>
                        <div className="space-y-2">
                            {[
                                { href: '/new', text: 'Novas Músicas', color: 'purple' },
                                { href: '/trending', text: 'Trending', color: 'pink' },
                                { href: '/playlist', text: 'Criar Playlist', color: 'blue' },
                                { href: '/vip', text: 'Planos VIP', color: 'green' }
                            ].map((link, index) => (
                                <Link key={index} href={link.href} className="group/link flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300">
                                    <div className={`w-1 h-1 bg-${link.color}-500 rounded-full group-hover/link:scale-150 transition-all duration-300`}></div>
                                    <span className="text-sm group-hover/link:translate-x-1 transition-transform duration-300">{link.text}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Coluna 3 - Recursos */}
                    <div className="space-y-4 group">
                        <div className="relative">
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Crown className="h-4 w-4 text-yellow-400" />
                                RECURSOS PREMIUM
                            </h3>
                            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 group-hover:w-full transition-all duration-500"></div>
                        </div>
                        <div className="space-y-2">
                            {[
                                'Download em ZIP',
                                'Filtros Avançados',
                                'Análise de BPM',
                                'Detecção de Tonalidade'
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-gray-400 group/feature">
                                    <CheckCircle className="h-3 w-3 text-emerald-500 group-hover/feature:scale-110 transition-transform duration-300" />
                                    <span className="text-xs group-hover/feature:text-white transition-colors duration-300">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Coluna 4 - Suporte */}
                    <div className="space-y-4 group">
                        <div className="relative">
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Headphones className="h-4 w-4 text-blue-400" />
                                SUPORTE VIP
                            </h3>
                            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-500"></div>
                        </div>
                        <div className="space-y-2">
                            {[
                                { text: 'Suporte 24/7', color: 'emerald', delay: '0s' },
                                { text: 'Chat ao Vivo', color: 'blue', delay: '0.5s' },
                                { text: 'Email Premium', color: 'purple', delay: '1s' },
                                { text: 'WhatsApp VIP', color: 'pink', delay: '1.5s' }
                            ].map((support, index) => (
                                <div key={index} className="flex items-center gap-2 text-gray-400 group/support">
                                    <div className="relative">
                                        <div className={`w-1.5 h-1.5 bg-${support.color}-500 rounded-full animate-pulse`} style={{ animationDelay: support.delay }}></div>
                                        <div className={`absolute inset-0 w-1.5 h-1.5 bg-${support.color}-500 rounded-full animate-ping`} style={{ animationDelay: support.delay }}></div>
                                    </div>
                                    <span className="text-xs group-hover/support:text-white transition-colors duration-300">{support.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Linha separadora decorativa escura */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-800/50"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <div className="bg-[#0a0a0a] px-4">
                            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse shadow-lg"></div>
                        </div>
                    </div>
                </div>

                {/* Seção inferior com informações de contato */}
                <div className="text-center">
                    {/* Localização e contato */}
                    <div className="mb-6">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-purple-400" />
                            <h3 className="text-white font-bold text-lg">Venâncio Aires - RS, Brasil</h3>
                        </div>
                        <div className="space-y-1 text-gray-400">
                            <p className="hover:text-white transition-colors duration-200 cursor-pointer group text-sm">
                                <Mail className="inline h-3 w-3 mr-2 text-pink-400 group-hover:scale-110 transition-transform duration-300" />
                                contato@nexorrecords.com.br
                            </p>
                            <p className="hover:text-white transition-colors duration-200 cursor-pointer group text-sm">
                                <Phone className="inline h-3 w-3 mr-2 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                                +55 (51) 99999-9999
                            </p>
                        </div>
                    </div>

                    {/* Copyright e créditos */}
                    <div className="text-gray-500 text-xs">
                        <p className="mb-2">© {currentYear} Nexor Records. Todos os direitos reservados.</p>
                        <p className="flex items-center justify-center gap-1">
                            <span>Feito com</span>
                            <Heart className="h-3 w-3 text-red-500 animate-pulse" />
                            <span>em Venâncio Aires</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default NewFooter;
