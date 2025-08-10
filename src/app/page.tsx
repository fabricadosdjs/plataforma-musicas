// src/app/page.tsx
"use client";

import Header from '@/components/layout/Header';
import { useSession } from 'next-auth/react';

// Extend NextAuth session user type to include is_vip
import type { Session } from 'next-auth';

declare module 'next-auth' {
  interface User {
    valor: any;
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    is_vip?: boolean;
  }
  interface Session {
    user: {
      valor: any;
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      is_vip?: boolean;
    };
  }
}

type SessionUser = {
  valor: any;
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  is_vip?: boolean;
};

import { useEffect, useState } from 'react';
import { Heart, Music, TrendingUp, Database, Upload, AlertTriangle, CheckCircle, Clock, Star, Zap, Play, Download, Users, Award, Globe, Headphones, Crown, Sparkles, Target, ArrowRight, ChevronRight, Shuffle, Volume2, Disc3, Mic2, Radio, Disc, Disc2, Archive } from 'lucide-react';
import Link from 'next/link';
import AdminMessagesDisplay from '@/components/ui/AdminMessagesDisplay';
import CreditDashboard from '@/components/credit/CreditDashboard';

function HomePageContent() {
  const { data: session } = useSession();

  // Estado para as músicas mais baixadas
  const [mostDownloadedTracks, setMostDownloadedTracks] = useState<any[]>([]);
  const [loadingMostDownloaded, setLoadingMostDownloaded] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const fetchMostDownloadedTracks = async () => {
    try {
      setLoadingMostDownloaded(true);
      const response = await fetch('/api/tracks/most-downloaded');
      if (response.ok) {
        const data = await response.json();
        setMostDownloadedTracks(data.tracks || []);
      }
    } catch (error) {
      console.error('Error fetching most downloaded tracks:', error);
    } finally {
      setLoadingMostDownloaded(false);
    }
  };

  useEffect(() => {
    fetchMostDownloadedTracks();
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Header />
      <main className="container mx-auto px-4 py-8 pt-20 relative z-10">

        {/* Hero Section */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="mb-12 relative">
            {/* Fundo animado topo do hero */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[90vw] max-w-5xl h-40 md:h-56 lg:h-64 xl:h-72 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-full blur-2xl animate-pulse z-0" style={{ pointerEvents: 'none' }} />
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-6 py-3 rounded-full border border-purple-500/30 mb-8">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span className="text-purple-300 font-medium">A Plataforma Definitiva para DJs</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
              {/* Mobile: 4 linhas, Desktop: 2 linhas próximas, largura igual ao parágrafo */}
              <span className="block md:hidden">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent font-bebas-neue uppercase block text-center">
                  O POOL DE DISCOS
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent font-bebas-neue uppercase block text-center">
                  INDEPENDENTES
                </span>
                <br />
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-bebas-neue uppercase block text-center">
                  ONDE OS DJS
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bebas-neue uppercase block text-center">
                  DESCOBREM O FUTURO
                </span>
              </span>
              <span className="hidden md:block max-w-5xl mx-auto">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent font-bebas-neue uppercase block text-center">
                  O POOL DE DISCOS INDEPENDENTES
                </span>
                <span
                  className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-bebas-neue uppercase block text-center mt-[5px] md:mt-[13px] lg:mt-[25px] xl:mt-[37px]"
                  style={{ display: 'block', marginTop: '-3px' }}
                >
                  ONDE OS DJS DESCOBREM O FUTURO
                </span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-5xl mx-auto leading-relaxed mb-8 text-justify text-center md:text-justify font-inter">
              A plataforma definitiva para DJs que buscam as melhores músicas eletrônicas,
              remixes exclusivos e sets que dominam as pistas. Descubra o futuro da música eletrônica.
            </p>

            {/* Animated Image */}
            <div className="relative mb-12 group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <img
                src="https://i.ibb.co/fYTVXwdR/tela-home.png"
                alt="Tela do computador mostrando a plataforma"
                className="relative w-full max-w-5xl mx-auto rounded-2xl shadow-2xl border border-purple-500/30"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/new">
              <button className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-3 transform hover:scale-105">
                <Music className="h-6 w-6 group-hover:animate-pulse" />
                Explorar Músicas
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/trending">
              <button className="group w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center gap-3 transform hover:scale-105">
                <TrendingUp className="h-6 w-6 group-hover:animate-pulse" />
                Ver Trending
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Pricing Badge */}
          <Link href="/plans">
            <div className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:from-green-700/30 hover:to-emerald-700/30 transition-all duration-300 cursor-pointer border border-green-500/30 hover:border-green-400/50 transform hover:scale-105">
              <Star className="h-5 w-5 text-green-400 group-hover:animate-spin" />
              <span>A partir de R$ 38,00/mês</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* SEÇÃO - RECADOS DA ADM */}
        <div className="mb-20">
          <AdminMessagesDisplay showAdminControls={false} />
        </div>



        {/* SEÇÃO - PLANOS PARA USUÁRIOS NÃO LOGADOS */}
        {!session?.user && (
          <div className="mb-20">
            <div className="bg-gradient-to-br from-yellow-900/20 via-orange-900/20 to-red-900/20 rounded-3xl p-10 border border-yellow-500/20 backdrop-blur-sm relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500"></div>
              </div>

              <div className="relative z-10">
                <div className="text-center mb-10">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4 rounded-full mr-4 shadow-lg">
                      <Crown className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-white">Escolha Seu Plano VIP</h2>
                  </div>
                  <p className="text-gray-300 max-w-4xl mx-auto text-xl">
                    Acesso completo ao maior acervo de música eletrônica do Brasil.
                    Escolha o plano ideal para suas necessidades e comece a baixar hoje mesmo.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="group bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-2xl p-8 text-center border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <span className="text-3xl">🥉</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">VIP BÁSICO</h3>
                    <p className="text-gray-300 text-lg mb-6">R$ 38,00/mês</p>
                    <ul className="text-gray-400 text-base space-y-3 text-left">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        Acesso ao Drive Mensal
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        Até 4 packs por semana
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        Downloads ilimitados
                      </li>
                    </ul>
                  </div>

                  <div className="group bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-2xl p-8 text-center border-2 border-yellow-500/50 hover:border-yellow-400/70 transition-all duration-300 transform hover:scale-105 relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      MAIS POPULAR
                    </div>
                    <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <span className="text-3xl">🥈</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">VIP PADRÃO</h3>
                    <p className="text-gray-300 text-lg mb-6">R$ 42,00/mês</p>
                    <ul className="text-gray-400 text-base space-y-3 text-left">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        Tudo do Básico
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        Deezer Premium Grátis
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        15% desconto Deemix
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        ARL Premium
                      </li>
                    </ul>
                  </div>

                  <div className="group bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-2xl p-8 text-center border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <span className="text-3xl">🥇</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">VIP COMPLETO</h3>
                    <p className="text-gray-300 text-lg mb-6">R$ 60,00/mês</p>
                    <ul className="text-gray-400 text-base space-y-3 text-left">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        Tudo do Padrão
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        Playlists ilimitadas
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        Produção de música
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        Suporte prioritário
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="text-center">
                  <Link href="/plans">
                    <button className="group bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105">
                      <Crown className="h-6 w-6 group-hover:animate-pulse" />
                      Ver Todos os Planos
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bebas-neue font-bold text-white mb-4 uppercase">POR QUE ESCOLHER NOSSA PLATAFORMA?</h2>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto">
              Somos a escolha número um dos DJs brasileiros que buscam qualidade,
              variedade e uma experiência premium incomparável.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse">
                <Music className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Milhares de Músicas</h3>
              <p className="text-gray-300 text-base">Catálogo vasto com as melhores faixas eletrônicas do momento</p>
            </div>

            <div className="group bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Trending Semanal</h3>
              <p className="text-gray-300 text-base">Descubra as músicas mais baixadas pelos DJs da comunidade</p>
            </div>

            <div className="group bg-gradient-to-br from-green-900/30 to-green-800/20 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse">
                <Download className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Downloads Ilimitados</h3>
              <p className="text-gray-300 text-base">Baixe quantas músicas quiser, quando quiser</p>
            </div>

            <div className="group bg-gradient-to-br from-pink-900/30 to-pink-800/20 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-pink-600 to-pink-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Comunidade Ativa</h3>
              <p className="text-gray-300 text-base">Conecte-se com DJs de todo o Brasil</p>
            </div>

          </div>
        </div>

        {/* BOX DESTAQUE - DOWNLOAD EM ZIP */}
        <div className="bg-gradient-to-br from-cyan-900/30 via-blue-900/30 to-cyan-900/30 rounded-3xl p-10 mb-20 border border-cyan-500/30 backdrop-blur-sm">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 rounded-full mr-4 shadow-lg">
                <Archive className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white">Download em ZIP Personalizado</h2>
            </div>
            <p className="text-gray-300 max-w-4xl mx-auto text-xl">
              Escolha suas músicas favoritas, filtre por artista, estilo e muito mais, e baixe tudo de uma vez só em um arquivo ZIP. Praticidade máxima para DJs profissionais!
            </p>
          </div>
        </div>

        {/* SEÇÃO - UPLOAD DE MÚSICAS */}
        <div className="bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-purple-900/30 rounded-3xl p-10 mb-20 border border-purple-500/30 backdrop-blur-sm">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full mr-4 shadow-lg">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white">Compartilhe Suas Músicas</h2>
            </div>
            <p className="text-gray-300 max-w-4xl mx-auto text-xl">
              Usuários VIP podem enviar suas próprias músicas para que outros membros pagantes possam baixar e conhecer seus trabalhos.
              Faça parte da comunidade e compartilhe suas criações!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="group bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-8 text-center border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                <Music className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Upload Fácil</h3>
              <p className="text-gray-300 text-base">Envie suas músicas diretamente pela plataforma com metadados completos</p>
            </div>

            <div className="group bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-8 text-center border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Visibilidade</h3>
              <p className="text-gray-300 text-base">Suas músicas aparecem na página da comunidade e no catálogo geral</p>
            </div>

            <div className="group bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-8 text-center border border-green-500/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Crescimento</h3>
              <p className="text-gray-300 text-base">Acompanhe downloads, curtidas e plays das suas músicas enviadas</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/community">
              <button className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105">
                <Users className="h-6 w-6 group-hover:animate-pulse" />
                Ver Músicas da Comunidade
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>

        {/* SEÇÃO - DEEMIX */}
        <div className="bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-indigo-900/30 rounded-3xl p-10 mb-20 border border-indigo-500/30 backdrop-blur-sm">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-full mr-4 shadow-lg">
                <Headphones className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white">Deemix - Download Premium</h2>
            </div>
            <p className="text-gray-300 max-w-4xl mx-auto text-xl">
              Acesse o Deemix, nossa plataforma exclusiva para download de músicas em alta qualidade diretamente do Deezer e Spotify.
              Baixe em FLAC, MP3 320kbps e muito mais com nossa infraestrutura dedicada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="group bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-8 text-center border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                <Download className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Download FLAC/MP3</h3>
              <p className="text-gray-300 text-base">Qualidade Hi-Fi e MP3 320kbps para suas apresentações</p>
            </div>

            <div className="group bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-8 text-center border border-green-500/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Velocidade Máxima</h3>
              <p className="text-gray-300 text-base">Downloads ultra-rápidos com nossa infraestrutura dedicada</p>
            </div>

            <div className="group bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-8 text-center border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Acesso Global</h3>
              <p className="text-gray-300 text-base">Conecte-se de qualquer lugar através do nosso servidor web</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/deemix">
              <button className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105">
                <Headphones className="h-6 w-6 group-hover:animate-pulse" />
                Conhecer Deemix
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>



        {/* SEÇÃO - AVISO IMPORTANTE SOBRE O ACERVO */}
        {session?.user?.is_vip && (
          <div className="mb-16">
            <div className="bg-gradient-to-br from-amber-600/20 via-orange-600/20 to-red-600/20 backdrop-blur-sm text-white p-10 rounded-3xl border border-amber-500/30 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-400 to-orange-500"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 rounded-full mr-4 shadow-lg">
                    <Database className="h-10 w-10 text-amber-300" />
                  </div>
                  <h2 className="text-4xl font-bold">Aviso Importante sobre o Acervo</h2>
                </div>

                <div className="text-center mb-8">
                  <p className="text-xl mb-6">
                    A migração de todo o nosso acervo para a nova plataforma está em andamento.
                    <span className="font-bold text-amber-200"> Novas músicas são adicionadas diariamente!</span>
                  </p>
                  <p className="text-amber-100 text-lg">
                    Estamos trabalhando para trazer todo o conteúdo histórico para a nova interface moderna.
                  </p>
                </div>

                {/* Progress Section */}
                <div className="bg-black/20 rounded-2xl p-8 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-amber-200 font-semibold text-lg">Progresso da Migração</span>
                    <span className="text-amber-300 font-bold text-xl">5%</span>
                  </div>
                  <div className="w-full bg-amber-900/50 rounded-full h-4 mb-4">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 h-4 rounded-full transition-all duration-1000" style={{ width: '5%' }}></div>
                  </div>
                  <div className="flex items-center justify-center text-amber-200">
                    <Clock className="h-5 w-5 mr-2" />
                    Em andamento - Atualização contínua
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-black/20 rounded-xl p-6 text-center border border-amber-500/30">
                    <Upload className="h-8 w-8 text-amber-300 mx-auto mb-3" />
                    <h4 className="font-semibold text-amber-200 mb-2 text-lg">Upload Diário</h4>
                    <p className="text-amber-100">Novas faixas adicionadas todos os dias</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-6 text-center border border-green-500/30">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-green-300 mb-2 text-lg">Qualidade Garantida</h4>
                    <p className="text-green-100">Todas as músicas em alta qualidade</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-6 text-center border border-blue-500/30">
                    <AlertTriangle className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-blue-300 mb-2 text-lg">Acesso Temporário</h4>
                    <p className="text-blue-100">Drive ainda disponível durante migração</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="https://plataformavip.nexorrecords.com.br/pesquisardrive" target="_blank" rel="noopener noreferrer">
                    <button className="group w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105">
                      <Database className="h-6 w-6 group-hover:animate-pulse" />
                      Acessar Acervo no Drive
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <Link href="/new">
                    <button className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105">
                      <Music className="h-6 w-6 group-hover:animate-pulse" />
                      Ver Músicas Migradas
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO - MAIS BAIXADAS */}
        <div className="mb-20">
          <div className="bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-pink-900/30 rounded-3xl p-10 border border-blue-500/30 backdrop-blur-sm">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mr-3 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">MAIS BAIXADAS</h2>
              </div>
              <p className="text-gray-300 max-w-3xl mx-auto text-lg">
                Descubra as músicas mais baixadas pelos DJs da comunidade esta semana.
                As faixas que estão dominando as pistas.
              </p>
            </div>

            {loadingMostDownloaded ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gray-600 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-600 rounded mb-2"></div>
                        <div className="h-4 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-600 rounded w-20"></div>
                      <div className="h-4 bg-gray-600 rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : mostDownloadedTracks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mostDownloadedTracks.map((track, index) => (
                  <div key={track.id} className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                        {track.imageUrl ? (
                          <img
                            src={track.imageUrl}
                            alt={`Capa de ${track.songName}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center ${track.imageUrl ? 'hidden' : ''}`}>
                          <Music className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-base truncate group-hover:text-blue-300 transition-colors">{track.songName}</div>
                        <div className="text-gray-400 text-sm truncate">{track.artist}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Downloads: {track.downloadCount}</span>
                      <span className="text-sm bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">#{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                  <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Nenhuma música baixada esta semana</p>
                </div>
              </div>
            )}

            <div className="text-center mt-10">
              <Link href="/trending">
                <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Award className="h-6 w-6 group-hover:animate-pulse" />
                  Ver Trending Completo
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-20">
          <h2 className="text-5xl font-bold text-white mb-8">Pronto para dominar as pistas?</h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
            Junte-se a milhares de DJs que já descobriram o futuro da música eletrônica.
            Comece sua jornada hoje mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/new">
              <button className="group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-5 px-10 rounded-2xl text-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-4 transform hover:scale-105">
                <Play className="h-7 w-7 group-hover:animate-pulse" />
                Começar Agora
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/trending">
              <button className="group bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold py-5 px-10 rounded-2xl text-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center gap-4 transform hover:scale-105">
                <TrendingUp className="h-7 w-7 group-hover:animate-pulse" />
                Ver Trending
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <HomePageContent />
    </div>
  );
}
