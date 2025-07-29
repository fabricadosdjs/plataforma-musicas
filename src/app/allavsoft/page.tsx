"use client";

import Header from '@/components/layout/Header';
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft, Video, Download, Check, ExternalLink, Zap, Shield, Globe, Film, Star, Clock,
    HelpCircle, Clapperboard, MonitorPlay, ShoppingCart, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Componente Principal da Página ---
export default function Allavsoft() {
    return (
        <div className="min-h-screen text-white" style={{ backgroundColor: '#18181b', fontFamily: 'Ubuntu, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
            <Header />
            <div className="pt-8" />
            <main className="space-y-16">
                <section className="text-center pt-24">
                    <h2 className="font-bebas-neue text-5xl md:text-6xl tracking-wider text-white font-bold">ALLAVSOFT</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-base text-slate-400 text-justify">
                        A sua central de download de mídia pessoal. Baixe e converta vídeos e músicas de mais de 1000 sites, incluindo YouTube, Spotify, e muito mais.
                    </p>
                </section>

                <div className="flex justify-center">
                    <div className="relative w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl shadow-purple-900/50 border border-purple-800/50">
                        <Image src="https://i.ibb.co/JXJDdXx/allavsoft.png" alt="Allavsoft Interface" width={1200} height={600} className="object-contain" />
                    </div>
                </div>

                {/* Seção com a nova descrição detalhada */}
                <section className="max-w-4xl mx-auto text-slate-300 bg-slate-900/70 border border-slate-800 rounded-lg p-8">
                    <h3 className="font-bebas-neue text-4xl tracking-wider text-center text-white font-bold mb-6">Allavsoft – A Solução Completa para Baixar Vídeos e Áudios da Internet</h3>
                    <p className="text-justify mb-8 text-slate-400">
                        O Allavsoft é uma poderosa ferramenta desenvolvida para quem busca praticidade e eficiência na hora de baixar conteúdos multimídia da internet. Compatível com centenas de plataformas, o programa permite que você salve seus vídeos, músicas, playlists e até legendas com apenas alguns cliques.
                    </p>

                    <h4 className="font-bebas-neue text-3xl tracking-wider text-green-400 text-center mb-6">✅ Principais Funcionalidades:</h4>

                    <div className="space-y-4 text-justify">
                        <p><strong>Download de Vídeos e Áudios:</strong> Baixe vídeos em HD, Full HD, 4K e até 8K, além de extrair apenas o áudio em formatos como MP3, WAV, FLAC, entre outros.</p>
                        <p><strong>Compatibilidade com Mais de 1000 Sites:</strong> YouTube, Facebook, Vimeo, TikTok, Instagram, Spotify (via navegador), Deezer, Dailymotion e muitos outros. O Allavsoft reconhece automaticamente o link e inicia o download.</p>
                        <p><strong>Conversão de Formatos:</strong> Converta arquivos de vídeo e áudio para os mais diversos formatos: MP4, AVI, MOV, MKV, MP3, AAC, entre outros. Ideal para usar em qualquer dispositivo.</p>
                        <p><strong>Download em Lote:</strong> Economize tempo baixando vários arquivos de uma vez. Basta colar a lista de URLs e deixar o Allavsoft fazer o trabalho por você.</p>
                        <p><strong>Gravador de Tela Integrado:</strong> Não conseguiu baixar diretamente? Use o recurso de gravação de tela para capturar qualquer conteúdo que esteja sendo reproduzido em seu computador.</p>
                        <p><strong>Captura de Legendas e Metadados:</strong> Baixe vídeos com legendas embutidas ou separadas e preserve os metadados dos arquivos de música (nome da faixa, artista, álbum, etc).</p>
                        <p><strong>Atualizações Constantes:</strong> O Allavsoft está sempre se atualizando para acompanhar mudanças nos sites de streaming e garantir máxima compatibilidade.</p>
                    </div>

                    <div className="mt-10">
                        <h4 className="font-bebas-neue text-3xl tracking-wider text-amber-400 text-center mb-4">💡 Por que usar o Allavsoft?</h4>
                        <p className="text-justify text-slate-400">
                            Seja para criar sua própria biblioteca offline, assistir sem conexão ou editar seus conteúdos favoritos, o Allavsoft entrega estabilidade, rapidez e qualidade. Com uma interface intuitiva e suporte técnico confiável, é a escolha ideal para quem busca uma solução completa de downloads.
                        </p>
                    </div>
                </section>

                <div className="max-w-4xl mx-auto mt-16">
                    <h3 className="font-bebas-neue text-3xl tracking-wider text-center mb-8 font-bold">RECURSOS EM DESTAQUE</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="bg-slate-900/70 border border-purple-600/30 rounded-lg p-8 flex flex-col items-center justify-center">
                            <CardHeader className="text-center pb-4">
                                <div className="w-16 h-16 mx-auto mb-4 bg-purple-600/20 rounded-full flex items-center justify-center">
                                    <Zap className="h-8 w-8 text-purple-400" />
                                </div>
                                <CardTitle className="font-bebas-neue text-xl">DOWNLOAD RÁPIDO</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-sm text-gray-300">
                                    Otimizado para baixar vídeos e músicas na máxima velocidade da sua conexão.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/70 border border-green-600/30 rounded-lg p-8 flex flex-col items-center justify-center">
                            <CardHeader className="text-center pb-4">
                                <div className="w-16 h-16 mx-auto mb-4 bg-green-600/20 rounded-full flex items-center justify-center">
                                    <Shield className="h-8 w-8 text-green-400" />
                                </div>
                                <CardTitle className="font-bebas-neue text-xl">100% SEGURO</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-sm text-gray-300">
                                    Downloads seguros e instalação limpa, livre de adwares ou malwares.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/70 border border-blue-600/30 rounded-lg p-8 flex flex-col items-center justify-center">
                            <CardHeader className="text-center pb-4">
                                <div className="w-16 h-16 mx-auto mb-4 bg-blue-600/20 rounded-full flex items-center justify-center">
                                    <Globe className="h-8 w-8 text-blue-400" />
                                </div>
                                <CardTitle className="font-bebas-neue text-xl">SUPORTE A +1000 SITES</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-sm text-gray-300">
                                    Baixe de YouTube, Vimeo, Facebook, Spotify, e centenas de outros sites.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/70 border border-orange-600/30 rounded-lg p-8 flex flex-col items-center justify-center">
                            <CardHeader className="text-center pb-4">
                                <div className="w-16 h-16 mx-auto mb-4 bg-orange-600/20 rounded-full flex items-center justify-center">
                                    <Film className="h-8 w-8 text-orange-400" />
                                </div>
                                <CardTitle className="font-bebas-neue text-xl">CONVERSÃO TOTAL</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-sm text-gray-300">
                                    Converta para qualquer formato de vídeo ou áudio para compatibilidade total.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/70 border border-red-600/30 rounded-lg p-8 flex flex-col items-center justify-center">
                            <CardHeader className="text-center pb-4">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-full flex items-center justify-center">
                                    <Star className="h-8 w-8 text-red-400" />
                                </div>
                                <CardTitle className="font-bebas-neue text-xl">INTERFACE INTUITIVA</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-sm text-gray-300">
                                    Design moderno e fácil de usar. Copie, cole e baixe em segundos.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/70 border border-teal-600/30 rounded-lg p-8 flex flex-col items-center justify-center">
                            <CardHeader className="text-center pb-4">
                                <div className="w-16 h-16 mx-auto mb-4 bg-teal-600/20 rounded-full flex items-center justify-center">
                                    <MonitorPlay className="h-8 w-8 text-teal-400" />
                                </div>
                                <CardTitle className="font-bebas-neue text-xl">GRAVADOR DE TELA</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-sm text-gray-300">
                                    Capture qualquer atividade em sua tela, como lives e chamadas de vídeo.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="max-w-4xl mx-auto text-slate-300 bg-slate-900/70 border border-blue-600/50 rounded-lg p-8 mt-12">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center justify-center gap-3 text-blue-400 font-bebas-neue text-2xl tracking-wider">
                            <Info className="h-6 w-6" /> Sobre a Licença
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-justify text-[14px]">Ao comprar, você adquire uma <span className="font-bold text-white">chave de licença</span> para ativar e usar todas as funcionalidades premium do Allavsoft no seu computador.</p>
                        <p className="text-justify text-[14px]">A licença garante acesso completo ao software, incluindo futuras atualizações de compatibilidade e suporte técnico especializado.</p>
                    </CardContent>
                </Card>

                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-lg blur opacity-75 animate-pulse"></div>
                        <Button className="relative bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 font-bebas-neue text-xl px-8 py-4 shadow-lg flex items-center justify-center gap-2">
                            <a href="https://wa.me/5551935052274" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                <ShoppingCart className="text-green-500" size={22} />
                                <span>COMPRAR LICENÇA ALLAVSOFT</span>
                            </a>
                        </Button>
                    </div>
                </div>

            </main>
        </div>
    );
}
