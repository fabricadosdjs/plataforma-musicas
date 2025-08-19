"use client";

import MainLayout from "@/components/layout/MainLayout";
import {
    Disc3,
    Mic,
    Globe,
    Music,
    Headphones,
    Zap,
    CheckCircle,
    Clock,
    Star,
    Award,
    Users,
    TrendingUp,
    Play,
    Download,
    Mail,
    MessageCircle
} from "lucide-react";

const LabelPage = () => {
    return (
        <MainLayout>
            <div className="min-h-screen bg-black overflow-x-hidden">
                <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:pl-8 lg:pr-8 xl:pl-10 xl:pr-10 2xl:pl-12 2xl:pr-12 py-8">
                    {/* Hero Section */}
                    <div className="text-center mb-12 sm:mb-16">
                        <div className="flex items-center justify-center mb-6 sm:mb-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50"></div>
                                <div className="relative bg-black rounded-full p-4 sm:p-6">
                                    <Disc3 className="h-10 w-10 sm:h-16 sm:w-16 text-blue-400" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight tracking-tight">
                            NEXOR RECORDS
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4 font-light">
                            Uma gravadora nova e inovadora, transformando ideias em hits globais. Sua música eletrônica merece o melhor tratamento profissional.
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
                        <div className="bg-black border border-gray-800 rounded-xl p-4 sm:p-6 text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <Music className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                            </div>
                            <p className="text-sm sm:text-base text-gray-400 font-medium">Músicas Gravadas</p>
                            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">30+</p>
                        </div>

                        <div className="bg-black border border-gray-800 rounded-xl p-4 sm:p-6 text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                            </div>
                            <p className="text-sm sm:text-base text-gray-400 font-medium">Artistas Atendidos</p>
                            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">3+</p>
                        </div>

                        <div className="bg-black border border-gray-800 rounded-xl p-4 sm:p-6 text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                            </div>
                            <p className="text-sm sm:text-base text-gray-400 font-medium">Países Alcançados</p>
                            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">28</p>
                        </div>

                        <div className="bg-black border border-gray-800 rounded-xl p-4 sm:p-6 text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                            </div>
                            <p className="text-sm sm:text-base text-gray-400 font-medium">Streams Mensais</p>
                            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">200+</p>
                        </div>
                    </div>

                    {/* Process Timeline Section */}
                    <div className="mb-12 sm:mb-16">
                        <div className="flex items-center justify-center mb-8 sm:mb-12">
                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mr-3" />
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Como Funciona</h2>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-6 sm:space-y-8">
                            {/* Step 1 */}
                            <div className="relative">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-white font-black text-lg sm:text-xl">1</span>
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-8 sm:h-12 bg-gradient-to-b from-blue-500 to-transparent"></div>
                                    </div>
                                    <div className="flex-1 bg-black border border-gray-800 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-center mb-3">
                                            <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mr-2" />
                                            <h3 className="text-lg sm:text-xl font-black text-white">Envio da Ideia</h3>
                                        </div>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                            Você nos envia sua ideia musical com descrição detalhada, referências e visão artística.
                                            Nossa equipe analisa o potencial comercial e artístico do projeto.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-white font-black text-lg sm:text-xl">2</span>
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-8 sm:h-12 bg-gradient-to-b from-green-500 to-transparent"></div>
                                    </div>
                                    <div className="flex-1 bg-black border border-gray-800 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-center mb-3">
                                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-2" />
                                            <h3 className="text-lg sm:text-xl font-black text-white">Avaliação e Aprovação</h3>
                                        </div>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                            Nossa equipe de A&R avalia sua proposta, considerando mercado, tendências e potencial.
                                            Se aprovado, iniciamos o processo de produção com cronograma detalhado.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-white font-black text-lg sm:text-xl">3</span>
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-8 sm:h-12 bg-gradient-to-b from-purple-500 to-transparent"></div>
                                    </div>
                                    <div className="flex-1 bg-black border border-gray-800 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-center mb-3">
                                            <Music className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 mr-2" />
                                            <h3 className="text-lg sm:text-xl font-black text-white">Primeira Versão</h3>
                                        </div>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                            Nossos produtores criam a primeira versão da música, aplicando técnicas profissionais
                                            de produção, mixagem e masterização inicial.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="relative">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-white font-black text-lg sm:text-xl">4</span>
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-8 sm:h-12 bg-gradient-to-b from-orange-500 to-transparent"></div>
                                    </div>
                                    <div className="flex-1 bg-black border border-gray-800 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-center mb-3">
                                            <Headphones className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400 mr-2" />
                                            <h3 className="text-lg sm:text-xl font-black text-white">Demo e Ajustes</h3>
                                        </div>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                            Você recebe a primeira demo da música e nos diz o que quer alterar.
                                            Fazemos os ajustes necessários até sua total aprovação.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="relative">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-white font-black text-lg sm:text-xl">5</span>
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-8 sm:h-12 bg-gradient-to-b from-yellow-500 to-transparent"></div>
                                    </div>
                                    <div className="flex-1 bg-black border border-gray-800 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-center mb-3">
                                            <Download className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 mr-2" />
                                            <h3 className="text-lg sm:text-xl font-black text-white">Gravação Final</h3>
                                        </div>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                            Aprovada a versão, gravamos em WAV e MP3 de alta qualidade, aplicamos masterização
                                            profissional e adicionamos seu selo junto ao nosso.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 6 */}
                            <div className="relative">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-white font-black text-lg sm:text-xl">6</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-black border border-gray-800 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-center mb-3">
                                            <Star className="h-5 w-5 sm:h-6 sm:w-6 text-pink-400 mr-2" />
                                            <h3 className="text-lg sm:text-xl font-black text-white">Versão Final</h3>
                                        </div>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                            Você recebe a versão final pronta para distribuição, com qualidade profissional
                                            e todos os arquivos necessários para seu lançamento.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Distribution Section */}
                    <div className="mb-12 sm:mb-16">
                        <div className="flex items-center justify-center mb-8 sm:mb-12">
                            <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mr-3" />
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Distribuição Global</h2>
                        </div>

                        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-6 sm:p-8 mb-8">
                            <div className="text-center mb-6">
                                <h3 className="text-xl sm:text-2xl font-black text-white mb-3">Ditto Music - Nossa Parceira</h3>
                                <p className="text-gray-300 text-sm sm:text-base">
                                    Distribuição profissional para todas as principais plataformas de streaming do mundo
                                </p>
                            </div>

                            {/* Distribution Steps */}
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm sm:text-base mb-1">Perfil de Artista</h4>
                                        <p className="text-gray-400 text-sm">Criamos seu perfil profissional em nossa distribuidora parceira</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm sm:text-base mb-1">Dados e Redes Sociais</h4>
                                        <p className="text-gray-400 text-sm">Configuramos suas informações e links para redes sociais</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm sm:text-base mb-1">Distribuição</h4>
                                        <p className="text-gray-400 text-sm">Enviamos sua música para aprovação nas plataformas</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm sm:text-base mb-1">Smartlinks</h4>
                                        <p className="text-gray-400 text-sm">Você recebe links inteligentes para divulgação e pre-saves</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm sm:text-base mb-1">Reivindicação de Perfil</h4>
                                        <p className="text-gray-400 text-sm">Após o lançamento, você pode reivindicar seu perfil no Spotify, Amazon e Deezer</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Platforms Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center">
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Play className="h-6 w-6 text-white" />
                                </div>
                                <p className="text-white font-bold text-sm">Spotify</p>
                            </div>
                            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center">
                                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Music className="h-6 w-6 text-white" />
                                </div>
                                <p className="text-white font-bold text-sm">Apple Music</p>
                            </div>
                            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center">
                                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Headphones className="h-6 w-6 text-white" />
                                </div>
                                <p className="text-white font-bold text-sm">Amazon Music</p>
                            </div>
                            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center">
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Globe className="h-6 w-6 text-white" />
                                </div>
                                <p className="text-white font-bold text-sm">Deezer</p>
                            </div>
                        </div>
                    </div>

                    {/* Services Section */}
                    <div className="mb-12 sm:mb-16">
                        <div className="flex items-center justify-center mb-8 sm:mb-12">
                            <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mr-3" />
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">Nossos Serviços</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            <div className="bg-black border border-gray-800 rounded-2xl p-6 sm:p-8 text-center group hover:border-blue-500/50 transition-all duration-300">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Mic className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-white mb-3">Gravação Profissional</h3>
                                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                                    Estúdio equipado com tecnologia de ponta, engenheiros experientes e ambiente acusticamente tratado.
                                </p>
                            </div>

                            <div className="bg-black border border-gray-800 rounded-2xl p-6 sm:p-8 text-center group hover:border-green-500/50 transition-all duration-300">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Music className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-white mb-3">Produção Musical</h3>
                                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                                    Produção completa com arranjos, mixagem e masterização profissional para qualidade de rádio.
                                </p>
                            </div>

                            <div className="bg-black border border-gray-800 rounded-2xl p-6 sm:p-8 text-center group hover:border-purple-500/50 transition-all duration-300">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Globe className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-white mb-3">Distribuição Global</h3>
                                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                                    Distribuição para todas as principais plataformas de streaming do mundo com nossa parceira Ditto Music.
                                </p>
                            </div>

                            <div className="bg-black border border-gray-800 rounded-2xl p-6 sm:p-8 text-center group hover:border-orange-500/50 transition-all duration-300">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-white mb-3">Marketing Digital</h3>
                                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                                    Estratégias de marketing digital para aumentar sua visibilidade e alcançar mais ouvintes.
                                </p>
                            </div>

                            <div className="bg-black border border-gray-800 rounded-2xl p-6 sm:p-8 text-center group hover:border-yellow-500/50 transition-all duration-300">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-white mb-3">Suporte Artístico</h3>
                                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                                    Acompanhamento personalizado durante todo o processo, desde a ideia até o lançamento.
                                </p>
                            </div>

                            <div className="bg-black border border-gray-800 rounded-2xl p-6 sm:p-8 text-center group hover:border-pink-500/50 transition-all duration-300">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Award className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-white mb-3">Certificação</h3>
                                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                                    Certificação de qualidade profissional e selo da Nexor Records em todas as produções.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6 sm:p-8">
                            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 sm:mb-6">Pronto para Gravar sua Música?</h2>
                            <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                                Junte-se aos artistas que já transformaram suas ideias em hits globais com a Nexor Records
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="https://api.whatsapp.com/send?phone=5551981086784&text=Olá! Gostaria de gravar minha música eletrônica com a Nexor Records. Podem me ajudar?"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-black rounded-xl sm:rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/25 text-base sm:text-lg inline-flex items-center justify-center"
                                >
                                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                                    Começar Agora
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default LabelPage;
