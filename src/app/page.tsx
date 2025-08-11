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
import { Heart, Music, TrendingUp, Database, Upload, AlertTriangle, CheckCircle, Clock, Star, Zap, Play, Download, Users, Award, Globe, Headphones, Crown, Sparkles, Target, ArrowRight, ChevronRight, Shuffle, Volume2, Disc3, Mic2, Radio, Disc, Disc2, Archive, Activity, FolderOpen } from 'lucide-react';
import NewFooter from '@/components/layout/NewFooter';
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Header />
      <main className="container mx-auto px-4 py-8 pt-20 relative z-10">

        {/* Hero Section */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="mb-12 relative">
            {/* Fundo animado topo do hero */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[90vw] max-w-5xl h-40 md:h-56 lg:h-64 xl:h-72 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-full blur-2xl animate-pulse z-0" style={{ pointerEvents: 'none' }} />

            {/* Elementos flutuantes animados */}
            <div className="absolute top-10 left-10 w-4 h-4 bg-purple-400 rounded-full animate-bounce opacity-60"></div>
            <div className="absolute top-20 right-20 w-3 h-3 bg-pink-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-32 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }}></div>

            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-6 py-3 rounded-full border border-purple-500/30 mb-8 backdrop-blur-sm hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 transform hover:scale-105">
              <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
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

              {/* Efeitos de brilho */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-all duration-500"></div>

              {/* Bordas animadas */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-blue-500/50 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

              <img
                src="https://i.ibb.co/fYTVXwdR/tela-home.png"
                alt="Tela do computador mostrando a plataforma"
                className="relative w-full max-w-5xl mx-auto rounded-2xl shadow-2xl border border-purple-500/30 group-hover:scale-[1.02] transition-all duration-500"
              />

              {/* Overlay de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-2xl"></div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/new">
              <button className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-3 transform hover:scale-105 relative overflow-hidden">
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Music className="h-6 w-6 group-hover:animate-pulse relative z-10" />
                <span className="relative z-10">Explorar Músicas</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
            </Link>
            <Link href="/trending">
              <button className="group w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center gap-3 transform hover:scale-105 relative overflow-hidden">
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <TrendingUp className="h-6 w-6 group-hover:animate-pulse relative z-10" />
                <span className="relative z-10">Ver Trending</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
            </Link>
          </div>

          {/* Pricing Badge */}
          <Link href="/plans">
            <div className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:from-green-700/30 hover:to-emerald-700/30 transition-all duration-300 cursor-pointer border border-green-500/30 hover:border-green-400/50 transform hover:scale-105 relative overflow-hidden backdrop-blur-sm">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {/* Partículas flutuantes */}
              <div className="absolute top-1 left-2 w-1 h-1 bg-green-400 rounded-full animate-ping opacity-60"></div>
              <div className="absolute bottom-1 right-2 w-1 h-1 bg-emerald-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></div>

              <Star className="h-5 w-5 text-green-400 group-hover:animate-spin relative z-10" />
              <span className="relative z-10">A partir de R$ 38,00/mês</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform relative z-10" />
            </div>
          </Link>
        </div>

        {/* SEÇÃO - ESTATÍSTICAS IMPRESSIONANTES */}


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
                  <div className="group bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-2xl p-8 text-center border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden backdrop-blur-sm">
                    {/* Efeito de brilho */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    {/* Partículas flutuantes */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-40"></div>

                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🥉</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">VIP BÁSICO</h3>
                    <p className="text-gray-300 text-lg mb-6">R$ 38,00/mês</p>
                    <ul className="text-gray-400 text-base space-y-3 text-left">
                      <li className="flex items-center gap-2 group-hover:text-gray-200 transition-colors duration-300">
                        <CheckCircle className="h-5 w-5 text-green-400 group-hover:animate-pulse" />
                        Acesso ao Drive Mensal
                      </li>
                      <li className="flex items-center gap-2 group-hover:text-gray-200 transition-colors duration-300">
                        <CheckCircle className="h-5 w-5 text-green-400 group-hover:animate-pulse" />
                        Até 4 packs por semana
                      </li>
                      <li className="flex items-center gap-2 group-hover:text-gray-200 transition-colors duration-300">
                        <CheckCircle className="h-5 w-5 text-green-400 group-hover:animate-pulse" />
                        Downloads ilimitados
                      </li>
                    </ul>
                  </div>

                  <div className="group bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-2xl p-8 text-center border-2 border-yellow-500/50 hover:border-yellow-400/70 transition-all duration-300 transform hover:scale-105 relative overflow-hidden backdrop-blur-sm">
                    {/* Efeito de brilho */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    {/* Partículas flutuantes */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-40"></div>
                    <div className="absolute bottom-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.7s' }}></div>

                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                      MAIS POPULAR
                    </div>
                    <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-green-500/50 transition-all duration-300">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🥈</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors duration-300">VIP PADRÃO</h3>
                    <p className="text-gray-300 text-lg mb-6">R$ 42,00/mês</p>
                    <ul className="text-gray-400 text-base space-y-3 text-left">
                      <li className="flex items-center gap-2 group-hover:text-gray-200 transition-colors duration-300">
                        <CheckCircle className="h-5 w-5 text-green-400 group-hover:animate-pulse" />
                        Tudo do Básico
                      </li>
                      <li className="flex items-center gap-2 group-hover:text-gray-200 transition-colors duration-300">
                        <CheckCircle className="h-5 w-5 text-green-400 group-hover:animate-pulse" />
                        Deezer Premium Grátis
                      </li>
                      <li className="flex items-center gap-2 group-hover:text-gray-200 transition-colors duration-300">
                        <CheckCircle className="h-5 w-5 text-green-400 group-hover:animate-pulse" />
                        15% desconto Deemix
                      </li>
                      <li className="flex items-center gap-2 group-hover:text-gray-200 transition-colors duration-300">
                        <CheckCircle className="h-5 w-5 text-green-400 group-hover:animate-pulse" />
                        ARL Premium
                      </li>
                    </ul>
                  </div>

                  <div className="group bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-2xl p-8 text-center border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden backdrop-blur-sm">
                    {/* Efeito de brilho */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    {/* Partículas flutuantes */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-40"></div>
                    <div className="absolute bottom-4 left-4 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '1s' }}></div>

                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🥇</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">VIP COMPLETO</h3>
                    <p className="text-gray-300 text-lg mb-6">R$ 60,00/mês</p>
                    <ul className="text-gray-400 text-base space-y-3 text-left">
                      <li className="flex items-center gap-2 group-hover:text-gray-200 transition-colors duration-300">
                        <CheckCircle className="h-5 w-5 text-green-400 group-hover:animate-pulse" />
                        Tudo do Padrão
                      </li>
                      <li className="flex items-center gap-2 group-hover:text-gray-200 transition-colors duration-300">
                        <CheckCircle className="h-5 w-5 text-green-400 group-hover:animate-pulse" />
                        Playlists ilimitadas
                      </li>
                      <li className="flex items-center gap-2 group-hover:text-gray-200 transition-colors duration-300">
                        <CheckCircle className="h-5 w-5 text-green-400 group-hover:animate-pulse" />
                        Produção de música
                      </li>
                      <li className="flex items-center gap-2 group-hover:text-gray-200 transition-colors duration-300">
                        <CheckCircle className="h-5 w-5 text-green-400 group-hover:animate-pulse" />
                        Suporte prioritário
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="text-center">
                  <Link href="/plans">
                    <button className="group bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden">
                      {/* Efeito de brilho */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      {/* Partículas flutuantes */}
                      <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-ping opacity-60"></div>
                      <div className="absolute bottom-2 right-2 w-1 h-1 bg-orange-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></div>

                      <Crown className="h-6 w-6 group-hover:animate-pulse relative z-10" />
                      <span className="relative z-10">Ver Todos os Planos</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas Animadas */}


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
            <div className="group bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              {/* Partículas flutuantes */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-40"></div>

              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse group-hover:shadow-blue-500/50 transition-all duration-300">
                <Music className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors duration-300">Milhares de Músicas</h3>
              <p className="text-gray-300 text-base group-hover:text-gray-200 transition-colors duration-300">Catálogo vasto com as melhores faixas eletrônicas do momento</p>
            </div>

            <div className="group bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              {/* Partículas flutuantes */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-40"></div>

              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse group-hover:shadow-purple-500/50 transition-all duration-300">
                <TrendingUp className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors duration-300">Trending Semanal</h3>
              <p className="text-gray-300 text-base group-hover:text-gray-200 transition-colors duration-300">Descubra as músicas mais baixadas pelos DJs da comunidade</p>
            </div>

            <div className="group bg-gradient-to-br from-green-900/30 to-green-800/20 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              {/* Partículas flutuantes */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-40"></div>

              <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse group-hover:shadow-green-500/50 transition-all duration-300">
                <Download className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors duration-300">Downloads Ilimitados</h3>
              <p className="text-gray-300 text-base group-hover:text-gray-200 transition-colors duration-300">Baixe quantas músicas quiser, quando quiser</p>
            </div>

            <div className="group bg-gradient-to-br from-pink-900/30 to-pink-800/20 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              {/* Partículas flutuantes */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-40"></div>

              <div className="bg-gradient-to-br from-pink-600 to-pink-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse group-hover:shadow-pink-500/50 transition-all duration-300">
                <Users className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-pink-300 transition-colors duration-300">Comunidade Ativa</h3>
              <p className="text-gray-300 text-base group-hover:text-gray-200 transition-colors duration-300">Conecte-se com DJs de todo o Brasil</p>
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
            <p className="text-gray-300 max-w-4xl mx-auto text-xl mb-8">
              Escolha suas músicas favoritas, filtre por artista, estilo e muito mais, e baixe tudo de uma vez só em um arquivo ZIP. Praticidade máxima para DJs profissionais!
            </p>

            {/* Cards de Benefícios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="group bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-2xl p-8 text-center border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 transform hover:scale-105">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                  <Database className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Filtros Inteligentes</h3>
                <p className="text-gray-300 text-base">Filtre por artista, gênero, BPM, tonalidade e muito mais para criar sua seleção perfeita</p>
              </div>

              <div className="group bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-2xl p-8 text-center border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                  <Download className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Download em Lote</h3>
                <p className="text-gray-300 text-base">Baixe centenas de músicas de uma vez só em um arquivo ZIP organizado e compactado</p>
              </div>

              <div className="group bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-8 text-center border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 transform hover:scale-105">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Velocidade Máxima</h3>
                <p className="text-gray-300 text-base">Downloads ultra-rápidos com nossa infraestrutura otimizada para grandes arquivos</p>
              </div>
            </div>

            {/* Botão de Ação */}
            <div className="text-center">
              <Link href="/playlist">
                <button className="group bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Archive className="h-6 w-6 group-hover:animate-pulse" />
                  Criar Playlist Personalizada
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
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

        {/* SEÇÃO - RECURSOS AVANÇADOS */}
        <div className="mb-20">
          <div className="bg-gradient-to-br from-violet-900/30 via-purple-900/30 to-fuchsia-900/30 rounded-3xl p-10 border border-violet-500/30 backdrop-blur-sm relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400"></div>
            </div>

            <div className="text-center mb-12 relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-4 rounded-full mr-4 shadow-lg">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white">RECURSOS AVANÇADOS</h2>
              </div>
              <p className="text-gray-300 max-w-4xl mx-auto text-xl">
                Ferramentas profissionais que elevam sua experiência de DJ ao próximo nível
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10 relative z-10">
              {/* Análise de BPM */}
              <div className="group bg-gradient-to-br from-violet-900/30 to-purple-900/30 rounded-2xl p-8 text-center border border-violet-500/30 hover:border-violet-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                  <Activity className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-violet-300 transition-colors duration-300">Análise de BPM</h3>
                <p className="text-gray-300 text-base">Detecção automática de BPM para transições perfeitas</p>
                <div className="mt-4 flex justify-center">
                  <div className="flex space-x-1">
                    {[120, 128, 140].map((bpm, i) => (
                      <div key={i} className="w-2 h-8 bg-gradient-to-t from-violet-400 to-purple-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detecção de Tonalidade */}
              <div className="group bg-gradient-to-br from-purple-900/30 to-fuchsia-900/30 rounded-2xl p-8 text-center border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                  <Music className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors duration-300">Detecção de Tonalidade</h3>
                <p className="text-gray-300 text-base">Identificação automática de chaves musicais para harmonias perfeitas</p>
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-purple-600/20 px-3 py-1 rounded-full">
                    <span className="text-purple-300 font-mono text-sm">C Major</span>
                    <span className="text-purple-400">→</span>
                    <span className="text-purple-300 font-mono text-sm">G Major</span>
                  </div>
                </div>
              </div>

              {/* Organização Inteligente */}
              <div className="group bg-gradient-to-br from-fuchsia-900/30 to-violet-900/30 rounded-2xl p-8 text-center border border-fuchsia-500/30 hover:border-fuchsia-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="bg-gradient-to-r from-fuchsia-600 to-violet-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                  <FolderOpen className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-fuchsia-300 transition-colors duration-300">Organização Inteligente</h3>
                <p className="text-gray-300 text-base">Sistema automático de tags e categorização por gênero</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {['House', 'Techno', 'Trance', 'DnB'].map((genre, i) => (
                    <span key={genre} className="px-2 py-1 bg-fuchsia-600/20 text-fuchsia-300 text-xs rounded-full border border-fuchsia-500/30">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Barra de recursos */}
            <div className="text-center relative z-10">
              <div className="inline-flex items-center gap-4 bg-black/20 rounded-full px-6 py-3 border border-violet-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-sm">BPM Detection</span>
                </div>
                <div className="w-px h-4 bg-violet-500/30"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-blue-300 text-sm">Key Detection</span>
                </div>
                <div className="w-px h-4 bg-violet-500/30"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span className="text-purple-300 text-sm">Auto-Organization</span>
                </div>
              </div>
            </div>
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

        {/* SEÇÃO - PLANOS E PREÇOS */}
        <div className="mb-20">
          <div className="bg-gradient-to-br from-amber-900/30 via-orange-900/30 to-red-900/30 rounded-3xl p-10 border border-amber-500/30 backdrop-blur-sm relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-400 via-orange-400 to-red-400"></div>
            </div>

            <div className="text-center mb-12 relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-4 rounded-full mr-4 shadow-lg">
                  <Crown className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white">PLANOS QUE CABEM NO SEU BOLSO</h2>
              </div>
              <p className="text-gray-300 max-w-4xl mx-auto text-xl">
                Escolha o plano ideal para suas necessidades e comece a transformar sua carreira de DJ hoje mesmo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 relative z-10">
              {/* Plano Básico */}
              <div className="group bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl p-8 text-center border border-amber-500/30 hover:border-amber-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                {/* Badge Popular */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                  <Star className="h-10 w-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">VIP Básico</h3>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    <span className="text-2xl text-amber-300">R$</span>38
                    <span className="text-lg text-amber-300">/mês</span>
                  </div>
                  <p className="text-amber-200 text-sm">ou R$ 380/ano (2 meses grátis)</p>
                </div>

                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Downloads ilimitados</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Acesso ao catálogo completo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Suporte por WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Download em ZIP</span>
                  </div>
                </div>

                <Link href="/plans">
                  <button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Começar Agora
                  </button>
                </Link>
              </div>

              {/* Plano Standard */}
              <div className="group bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-2xl p-8 text-center border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                  <Crown className="h-10 w-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-300 transition-colors duration-300">VIP Standard</h3>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    <span className="text-2xl text-orange-300">R$</span>58
                    <span className="text-lg text-orange-300">/mês</span>
                  </div>
                  <p className="text-orange-200 text-sm">ou R$ 580/ano (2 meses grátis)</p>
                </div>

                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Tudo do plano Básico</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Acesso ao Deemix</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Upload de músicas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Prioridade no suporte</span>
                  </div>
                </div>

                <Link href="/plans">
                  <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Escolher Standard
                  </button>
                </Link>
              </div>

              {/* Plano Full */}
              <div className="group bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-2xl p-8 text-center border border-red-500/30 hover:border-red-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                <div className="bg-gradient-to-r from-red-600 to-pink-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-pulse">
                  <Crown className="h-10 w-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-300 transition-colors duration-300">VIP Full</h3>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    <span className="text-2xl text-red-300">R$</span>78
                    <span className="text-lg text-red-300">/mês</span>
                  </div>
                  <p className="text-red-200 text-sm">ou R$ 780/ano (2 meses grátis)</p>
                </div>

                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Tudo do plano Standard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Acesso antecipado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Suporte VIP 24/7</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Recursos exclusivos</span>
                  </div>
                </div>

                <Link href="/plans">
                  <button className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Escolher Full
                  </button>
                </Link>
              </div>
            </div>

            {/* CTA Final */}
            <div className="text-center relative z-10">
              <p className="text-amber-200 text-lg mb-6">
                💳 Aceitamos PIX, cartão de crédito e boleto bancário
              </p>
              <Link href="/plans">
                <button className="group bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105">
                  <Crown className="h-6 w-6 group-hover:animate-pulse" />
                  Ver Todos os Planos
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Depoimentos de Usuários */}
        <div className="mb-20">
          <div className="bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-cyan-900/30 rounded-3xl p-10 border border-emerald-500/30 backdrop-blur-sm">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-full mr-4 shadow-lg">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white">O QUE OS DJS DIZEM</h2>
              </div>
              <p className="text-gray-300 max-w-4xl mx-auto text-xl">
                Depoimentos reais de DJs que transformaram suas carreiras com nossa plataforma
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="group bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-2xl p-8 text-center border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300">
                  <span className="text-2xl">🎧</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors duration-300">DJ Carlos Silva</h3>
                <p className="text-gray-300 text-sm mb-4">São Paulo, SP</p>
                <p className="text-gray-400 text-base italic group-hover:text-gray-200 transition-colors duration-300">
                  "A plataforma revolucionou minha forma de trabalhar. Agora tenho acesso a músicas exclusivas que me fazem destacar nas festas."
                </p>
                <div className="flex justify-center mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              <div className="group bg-gradient-to-br from-teal-900/30 to-cyan-900/30 rounded-2xl p-8 text-center border border-teal-500/30 hover:border-teal-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-teal-500/50 transition-all duration-300">
                  <span className="text-2xl">🎵</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors duration-300">DJ Ana Costa</h3>
                <p className="text-gray-300 text-sm mb-4">Rio de Janeiro, RJ</p>
                <p className="text-gray-400 text-base italic group-hover:text-gray-200 transition-colors duration-300">
                  "Qualidade excepcional e suporte incrível. Consegui expandir meu repertório e aumentar meus contratos significativamente."
                </p>
                <div className="flex justify-center mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              <div className="group bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-2xl p-8 text-center border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-300">
                  <span className="text-2xl">🎤</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">DJ Pedro Santos</h3>
                <p className="text-gray-300 text-sm mb-4">Belo Horizonte, MG</p>
                <p className="text-gray-400 text-base italic group-hover:text-gray-200 transition-colors duration-300">
                  "Melhor investimento da minha carreira. O acervo é imenso e sempre atualizado com as últimas tendências."
                </p>
                <div className="flex justify-center mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

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
                  <div key={i} className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 animate-pulse relative overflow-hidden">
                    {/* Efeito de brilho no loading */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/10 to-transparent animate-pulse"></div>

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
                  <div key={track.id} className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden">
                    {/* Efeito de brilho */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    {/* Partículas flutuantes */}
                    <div className="absolute top-2 right-2 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-40"></div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg flex-shrink-0 group-hover:shadow-blue-500/50 transition-all duration-300">
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
                          <Music className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-base truncate group-hover:text-blue-300 transition-colors duration-300">{track.songName}</div>
                        <div className="text-gray-400 text-sm truncate group-hover:text-gray-200 transition-colors duration-300">{track.artist}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors duration-300">Downloads: {track.downloadCount}</span>
                      <span className="text-sm bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">#{index + 1}</span>
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
                <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden">
                  {/* Efeito de brilho */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {/* Partículas flutuantes */}
                  <div className="absolute top-2 left-2 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-60"></div>
                  <div className="absolute bottom-2 right-2 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></div>

                  <Award className="h-6 w-6 group-hover:animate-pulse relative z-10" />
                  <span className="relative z-10">Ver Trending Completo</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* SEÇÃO - ESTATÍSTICAS IMPRESSIONANTES */}
        <div className="mb-20">
          <div className="bg-gradient-to-br from-slate-900/40 via-gray-900/40 to-slate-900/40 rounded-3xl p-10 border border-slate-500/30 backdrop-blur-sm relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>
            </div>

            <div className="text-center mb-12 relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 rounded-full mr-4 shadow-lg">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white">NÚMEROS QUE IMPRESSIONAM</h2>
              </div>
              <p className="text-gray-300 max-w-4xl mx-auto text-xl">
                Nossa plataforma em números: crescimento constante e sucesso comprovado
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 relative z-10">
              {/* Total de Usuários */}
              <div className="text-center group">
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:animate-pulse">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
                    <span className="text-blue-400">+</span>2.5K
                  </div>
                  <p className="text-gray-400 text-sm">Usuários Ativos</p>
                  <div className="mt-3 flex justify-center">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Downloads Totais */}
              <div className="text-center group">
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:animate-pulse">
                    <Download className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors duration-300">
                    <span className="text-green-400">+</span>50K
                  </div>
                  <p className="text-gray-400 text-sm">Downloads</p>
                  <div className="mt-3 flex justify-center">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full animate-pulse" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Músicas no Acervo */}
              <div className="text-center group">
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:animate-pulse">
                    <Music className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                    <span className="text-purple-400">+</span>15K
                  </div>
                  <p className="text-gray-400 text-sm">Músicas</p>
                  <div className="mt-3 flex justify-center">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Satisfação */}
              <div className="text-center group">
                <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl p-6 border border-amber-500/30 hover:border-amber-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:animate-pulse">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors duration-300">
                    <span className="text-amber-400">98</span>%
                  </div>
                  <p className="text-gray-400 text-sm">Satisfação</p>
                  <div className="mt-3 flex justify-center">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full animate-pulse" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de status */}
            <div className="text-center relative z-10">
              <div className="inline-flex items-center gap-4 bg-black/20 rounded-full px-6 py-3 border border-slate-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-sm">Sistema Online</span>
                </div>
                <div className="w-px h-4 bg-slate-500/30"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-blue-300 text-sm">24/7 Ativo</span>
                </div>
                <div className="w-px h-4 bg-slate-500/30"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span className="text-purple-300 text-sm">Suporte Premium</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-20 relative">
          {/* Elementos flutuantes de fundo */}
          <div className="absolute top-10 left-10 w-6 h-6 bg-purple-400 rounded-full animate-bounce opacity-20"></div>
          <div className="absolute top-20 right-20 w-4 h-4 bg-pink-400 rounded-full animate-bounce opacity-20" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-blue-400 rounded-full animate-bounce opacity-20" style={{ animationDelay: '1s' }}></div>

          <h2 className="text-5xl font-bold text-white mb-8 relative z-10">Pronto para dominar as pistas?</h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto relative z-10">
            Junte-se a milhares de DJs que já descobriram o futuro da música eletrônica.
            Comece sua jornada hoje mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <Link href="/new">
              <button className="group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-5 px-10 rounded-2xl text-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-4 transform hover:scale-105 relative overflow-hidden">
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {/* Partículas flutuantes */}
                <div className="absolute top-2 left-2 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-60"></div>
                <div className="absolute bottom-2 right-2 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></div>

                <Play className="h-7 w-7 group-hover:animate-pulse relative z-10" />
                <span className="relative z-10">Começar Agora</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
            </Link>
            <Link href="/trending">
              <button className="group bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold py-5 px-10 rounded-2xl text-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center gap-4 transform hover:scale-105 relative overflow-hidden">
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {/* Partículas flutuantes */}
                <div className="absolute top-2 left-2 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-60"></div>
                <div className="absolute bottom-2 right-2 w-1 h-1 bg-pink-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></div>

                <TrendingUp className="h-7 w-7 group-hover:animate-pulse relative z-10" />
                <span className="relative z-10">Ver Trending</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
            </Link>
          </div>
        </div>

        {/* Novo Footer */}
        <NewFooter />

      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <HomePageContent />
    </div>
  );
}
