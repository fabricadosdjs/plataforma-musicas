"use client"

import Link from "next/link"
import Image from "next/image"
import Header from "@/components/layout/Header"
import {
    ArrowLeft, Music, Download, Check, ExternalLink, Settings, Zap, Shield, Globe, Headphones, Star, Clock,
    Server, User, ArrowRight, HelpCircle, AudioLines, FolderKanban, WifiOff, ListMusic, Computer, Search as SearchIcon, Wrench as WrenchIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// --- Componente Principal da Página ---
export default function Deemix() {

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#1B1C1D' }}>
            <Header />
            <main className="container mx-auto px-4 py-8 pt-20">
                <div className="space-y-16">

                    <div className="flex items-center justify-start gap-4">
                        <Button
                            className="bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50"
                        >
                            <Link href="/" className="flex items-center">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Link>
                        </Button>
                        <h1 className="text-4xl font-bold text-white tracking-tight">DEEMIX</h1>
                    </div>

                    <section className="text-center">
                        <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">DEEMIX SERVER 2025</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-300 text-center">
                            A sua central de música pessoal que combina a simplicidade de um programa no seu PC com o poder de um servidor dedicado na nuvem para baixar todo o catálogo do Deezer e suas playlists do Spotify.
                        </p>
                    </section>

                    <div className="flex justify-center">
                        <div className="relative w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl shadow-purple-900/50 border border-purple-800/50">
                            <Image src="https://i.ibb.co/S4zXbpWM/deemix.png" alt="Deemix Interface" width={1200} height={600} className="object-contain" />
                        </div>
                    </div>

                    <section>
                        <div className="text-center mb-10">
                            <h3 className="text-4xl font-bold text-white tracking-tight mb-4">A Vantagem do Servidor Dedicado</h3>
                            <p className="mt-2 max-w-3xl mx-auto text-gray-300 text-center">
                                Você instala o programa, mas a mágica acontece na nossa infraestrutura. Entenda por que nosso Deemix é incomparável.
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto p-8 rounded-lg bg-gray-900/50 border border-gray-800">
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center mb-8">
                                <div className="flex flex-col items-center">
                                    <User size={40} className="text-blue-400" />
                                    <p className="font-bold mt-2 text-white">Você (Seu PC)</p>
                                    <p className="text-xs text-gray-500">Programa Leve</p>
                                </div>
                                <ArrowRight size={32} className="text-gray-600 hidden md:block animate-pulse" />
                                <div className="flex flex-col items-center">
                                    <Server size={40} className="text-green-400" />
                                    <p className="font-bold mt-2 text-white">Nosso Servidor Contabo</p>
                                    <p className="text-xs text-gray-500">Processamento e Download</p>
                                </div>
                                <ArrowRight size={32} className="text-gray-600 hidden md:block animate-pulse" />
                                <div className="flex flex-col items-center">
                                    <Music size={40} className="text-pink-400" />
                                    <p className="font-bold mt-2 text-white">Servidores Deezer</p>
                                    <p className="text-xs text-gray-500">Fonte das Músicas</p>
                                </div>
                            </div>

                            <p className="text-gray-300 mb-6 text-center">
                                Quando você clica para baixar, o programa instalado no seu PC envia um comando para o nosso servidor na Contabo. É o nosso servidor que faz todo o trabalho pesado: ele baixa as músicas em altíssima velocidade dos servidores do Deezer e as envia diretamente para o seu computador.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded">
                                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span><span className="font-bold text-white">Velocidade Máxima:</span> Os downloads usam a conexão de 1 Gbit/s do nosso servidor, não a sua.</span>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded">
                                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span><span className="font-bold text-white">Sem Burocracia:</span> Não precisa de VPN, proxies ou configurações complexas. É só usar.</span>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded">
                                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span><span className="font-bold text-white">Economia de Banda:</span> Seu plano de internet não é consumido pelo download pesado dos arquivos de áudio.</span>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded">
                                    <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                    <span><span className="font-bold text-white">Privacidade e Segurança:</span> Nosso servidor atua como um intermediário, protegendo seu IP.</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="text-center mb-10">
                            <h3 className="text-4xl font-bold text-white tracking-tight mb-4">Deemix: A Ferramenta Definitiva para Baixar Músicas em Alta Qualidade</h3>
                            <p className="mt-2 max-w-3xl mx-auto text-gray-300 text-center">
                                O Deemix é uma das ferramentas mais poderosas e populares para quem deseja baixar músicas diretamente do Deezer — uma das maiores plataformas de streaming do mundo. Diferente de métodos ilegais de extração de áudio por gravação de tela ou plugins inseguros, o Deemix atua como um cliente direto que baixa a música exatamente como ela está hospedada, sem perda de qualidade.
                            </p>
                        </div>
                        <div className="max-w-5xl mx-auto space-y-6">
                            <h4 className="text-3xl font-bold text-green-400 text-center">🚀 Principais Funcionalidades do Deemix:</h4>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-900/50 border-l-4 border-green-500 rounded-r-lg space-y-2">
                                    <div className="flex items-center gap-3">
                                        <AudioLines className="h-6 w-6 text-green-400" />
                                        <h5 className="font-bold text-white text-lg">Downloads em Qualidade Hi-Fi (FLAC)</h5>
                                    </div>
                                    <p className="text-sm text-gray-400 ml-9">Um dos maiores destaques do Deemix é a possibilidade de baixar faixas em qualidade FLAC, ideal para profissionais de áudio. Você também pode escolher outros formatos como MP3 320kbps.</p>
                                </div>
                                <div className="p-4 bg-gray-900/50 border-l-4 border-green-500 rounded-r-lg space-y-2">
                                    <div className="flex items-center gap-3">
                                        <ListMusic className="h-6 w-6 text-green-400" />
                                        <h5 className="font-bold text-white text-lg">Download de Álbuns, Singles e Discografias</h5>
                                    </div>
                                    <p className="text-sm text-gray-400 ml-9">Baixe faixas individuais, álbuns completos, discografias de artistas e playlists pessoais ou públicas do Deezer ou Spotify.</p>
                                </div>
                                <div className="p-4 bg-gray-900/50 border-l-4 border-green-500 rounded-r-lg space-y-2">
                                    <div className="flex items-center gap-3">
                                        <FolderKanban className="h-6 w-6 text-green-400" />
                                        <h5 className="font-bold text-white text-lg">Gerenciamento Inteligente de Arquivos</h5>
                                    </div>
                                    <p className="text-sm text-gray-400 ml-9">As músicas baixadas vêm com tags ID3 completas, capa do álbum em alta resolução e são organizadas automaticamente em pastas.</p>
                                </div>
                                <div className="p-4 bg-gray-900/50 border-l-4 border-green-500 rounded-r-lg space-y-2">
                                    <div className="flex items-center gap-3">
                                        <Computer className="h-6 w-6 text-green-400" />
                                        <h5 className="font-bold text-white text-lg">Interface Intuitiva e Versátil</h5>
                                    </div>
                                    <p className="text-sm text-gray-400 ml-9">Disponível em versões com interface gráfica (GUI) ou linha de comando (CLI), compatíveis com Windows, macOS e Linux.</p>
                                </div>
                                <div className="p-4 bg-gray-900/50 border-l-4 border-green-500 rounded-r-lg space-y-2">
                                    <div className="flex items-center gap-3">
                                        <SearchIcon className="h-6 w-6 text-green-400" />
                                        <h5 className="font-bold text-white text-lg">Busca Integrada e Rápida</h5>
                                    </div>
                                    <p className="text-sm text-gray-400 ml-9">Procure diretamente por artistas, álbuns ou músicas sem precisar sair do programa.</p>
                                </div>
                            </div>
                            <div className="pt-6">
                                <h4 className="text-3xl font-bold text-amber-400 text-center">🛠️ Dicas de Uso Avançado:</h4>
                                <ul className="mt-4 space-y-2 list-disc list-inside text-gray-400 text-sm">
                                    <li><span className="font-bold text-white">Login com token do Deezer:</span> Para acessar conteúdos Hi-Fi ou playlists privadas, você pode usar seu token de login da conta Deezer.</li>
                                    <li><span className="font-bold text-white">Download automático de lançamentos:</span> Com scripts externos, é possível configurar o Deemix para monitorar artistas e baixar automaticamente novos lançamentos.</li>
                                    <li><span className="font-bold text-white">Automação com scripts:</span> Via CLI, você pode criar rotinas automáticas de download, muito útil para rádios, DJs ou quem precisa renovar playlists com frequência.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <div>
                        <h3 className="text-3xl font-bold text-center mb-8 text-white">FUNCIONALIDADES EXCLUSIVAS</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="border-purple-600/30 bg-gradient-to-br from-purple-950/20 to-purple-900/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group" style={{ backgroundColor: '#1B1C1D' }}>
                                <CardHeader className="text-center pb-4">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-600/20 rounded-full flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                                        <Zap className="h-8 w-8 text-purple-400" />
                                    </div>
                                    <CardTitle className="text-xl text-white">DOWNLOAD ULTRA RÁPIDO</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-center text-sm text-gray-300">
                                        Downloads em velocidade máxima direto dos servidores do Deezer, sem limitações de banda.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-green-600/30 bg-gradient-to-br from-green-950/20 to-green-900/10 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 group" style={{ backgroundColor: '#1B1C1D' }}>
                                <CardHeader className="text-center pb-4">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-green-600/20 rounded-full flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                                        <Shield className="h-8 w-8 text-green-400" />
                                    </div>
                                    <CardTitle className="text-xl text-white">100% SEGURO</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-center text-sm text-gray-300">
                                        Conexão criptografada e downloads seguros. Seus dados estão sempre protegidos.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-blue-600/30 bg-gradient-to-br from-blue-950/20 to-blue-900/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group" style={{ backgroundColor: '#1B1C1D' }}>
                                <CardHeader className="text-center pb-4">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-600/20 rounded-full flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                                        <Globe className="h-8 w-8 text-blue-400" />
                                    </div>
                                    <CardTitle className="text-xl text-white">ACESSO GLOBAL</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-center text-sm text-gray-300">
                                        Acesse de qualquer lugar do mundo através do nosso servidor web dedicado.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-orange-600/30 bg-gradient-to-br from-orange-950/20 to-orange-900/10 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 group" style={{ backgroundColor: '#1B1C1D' }}>
                                <CardHeader className="text-center pb-4">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-orange-600/20 rounded-full flex items-center justify-center group-hover:bg-orange-600/30 transition-colors">
                                        <Headphones className="h-8 w-8 text-orange-400" />
                                    </div>
                                    <CardTitle className="text-xl text-white">QUALIDADE PREMIUM</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-center text-sm text-gray-300">
                                        Downloads em FLAC, 320kbps MP3 e outras qualidades. Áudio perfeito para audiófilos.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-red-600/30 bg-gradient-to-br from-red-950/20 to-red-900/10 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 group" style={{ backgroundColor: '#1B1C1D' }}>
                                <CardHeader className="text-center pb-4">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-full flex items-center justify-center group-hover:bg-red-600/30 transition-colors">
                                        <Star className="h-8 w-8 text-red-400" />
                                    </div>
                                    <CardTitle className="text-xl text-white">INTERFACE INTUITIVA</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-center text-sm text-gray-300">
                                        Design moderno e fácil de usar. Encontre e baixe suas músicas em segundos.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-teal-600/30 bg-gradient-to-br from-teal-950/20 to-teal-900/10 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300 group" style={{ backgroundColor: '#1B1C1D' }}>
                                <CardHeader className="text-center pb-4">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-teal-600/20 rounded-full flex items-center justify-center group-hover:bg-teal-600/30 transition-colors">
                                        <Clock className="h-8 w-8 text-teal-400" />
                                    </div>
                                    <CardTitle className="text-xl text-white">DISPONÍVEL 24/7</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-center text-sm text-gray-300">
                                        O servidor que faz o download para você está sempre online. Baixe quando quiser.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Card className="border-blue-600/50 bg-blue-950/20 text-center" style={{ backgroundColor: '#1B1C1D' }}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-center gap-3 text-blue-400 text-2xl font-bold">
                                <HelpCircle className="h-6 w-6" /> Entendendo a ARL e o Spotify
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-gray-300">
                            <p>A <span className="font-bold text-white">ARL (Account Request Login)</span> é sua chave de acesso ao catálogo do Deezer. Ao assinar, nós fornecemos uma ARL Premium já configurada. Basta inseri-la uma vez nas configurações do Deemix e todo o conteúdo em alta qualidade será liberado. Você não precisa ter uma conta Deezer.</p>
                            <p>Para o <span className="font-bold text-white">Spotify</span>, você pode conectar sua própria conta (gratuita ou premium) nas configurações. O Deemix irá ler suas playlists, encontrar as músicas no catálogo do Deezer e baixá-las para você na melhor qualidade disponível.</p>
                        </CardContent>
                    </Card>

                    <div className="flex justify-center">
                        <Card className="border-blue-600/30 bg-black/50 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-300" style={{ backgroundColor: '#1B1C1D' }}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center gap-3 text-blue-400 text-2xl font-bold">
                                    <HelpCircle className="h-6 w-6" /> Como Funciona
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-gray-300">
                                <p>O Deemix é uma ferramenta poderosa que permite baixar músicas diretamente do Deezer em alta qualidade. Nossa versão inclui um servidor dedicado que processa os downloads para você, garantindo velocidade máxima e estabilidade.</p>
                                <p>Para começar, baixe o programa Deemix e configure com as credenciais fornecidas em seu perfil. O sistema irá conectar automaticamente ao nosso servidor e você poderá baixar qualquer música do catálogo do Deezer.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}