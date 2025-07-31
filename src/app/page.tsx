// src/app/page.tsx
"use client";

import Header from '@/components/layout/Header';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Heart, Music, TrendingUp, Database, Upload, AlertTriangle, CheckCircle, Clock, Star, Zap, Play, Download, Users, Award, Globe, Headphones, Crown } from 'lucide-react';
import Link from 'next/link';
import AdminMessagesDisplay from '@/components/ui/AdminMessagesDisplay';

function HomePageContent() {
  const { data: session } = useSession();

  // Estado para as músicas mais baixadas
  const [mostDownloadedTracks, setMostDownloadedTracks] = useState<any[]>([]);
  const [loadingMostDownloaded, setLoadingMostDownloaded] = useState(true);

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
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1B1C1D' }}>
      <Header />
      <main className="container mx-auto px-4 py-8 pt-20">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight uppercase">
              O pool de discos independentes onde os DJs descobrem o que vem por aí
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              A plataforma definitiva para DJs que buscam as melhores músicas eletrônicas,
              remixes exclusivos e sets que dominam as pistas. Descubra o futuro da música eletrônica.
            </p>
            <div className="mt-8">
              <img
                src="https://i.ibb.co/9HdP7R4p/tela-pc.png"
                alt="Tela do computador mostrando a plataforma"
                className="max-w-4xl mx-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/new">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-3">
                <Music className="h-6 w-6" />
                Explorar Músicas
              </button>
            </Link>
            <Link href="/trending">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center gap-3">
                <TrendingUp className="h-6 w-6" />
                Ver Trending
              </button>
            </Link>
          </div>

          {/* Pricing Badge */}
          <Link href="/plans">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 cursor-pointer">
              <Star className="h-5 w-5" />
              A partir de R$ 35,00/mês
            </div>
          </Link>
        </div>

        {/* SEÇÃO - RECADOS DA ADM */}
        <div className="mb-16">
          <AdminMessagesDisplay showAdminControls={false} />
        </div>

        {/* SEÇÃO - PLANOS PARA USUÁRIOS NÃO LOGADOS */}
        {!session?.user && (
          <div className="mb-16">
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-2xl p-8 border border-yellow-500/20">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-3 rounded-full mr-4">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Escolha Seu Plano VIP</h2>
                </div>
                <p className="text-gray-300 max-w-3xl mx-auto text-lg">
                  Acesso completo ao maior acervo de música eletrônica do Brasil.
                  Escolha o plano ideal para suas necessidades e comece a baixar hoje mesmo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-black/20 rounded-xl p-6 text-center">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🥉</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">VIP BÁSICO</h3>
                  <p className="text-gray-300 text-sm mb-4">R$ 30-35/mês</p>
                  <ul className="text-gray-400 text-sm space-y-2 text-left">
                    <li>• Acesso ao Drive Mensal</li>
                    <li>• Até 4 packs por semana</li>
                    <li>• Downloads ilimitados</li>
                  </ul>
                </div>

                <div className="bg-black/20 rounded-xl p-6 text-center border-2 border-yellow-500/50">
                  <div className="bg-gradient-to-r from-green-600 to-green-700 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🥈</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">VIP PADRÃO</h3>
                  <p className="text-gray-300 text-sm mb-4">R$ 36-42/mês</p>
                  <ul className="text-gray-400 text-sm space-y-2 text-left">
                    <li>• Tudo do Básico</li>
                    <li>• Deezer Premium Grátis</li>
                    <li>• 15% desconto Deemix</li>
                    <li>• ARL Premium</li>
                  </ul>
                </div>

                <div className="bg-black/20 rounded-xl p-6 text-center">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🥇</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">VIP COMPLETO</h3>
                  <p className="text-gray-300 text-sm mb-4">R$ 43-60/mês</p>
                  <ul className="text-gray-400 text-sm space-y-2 text-left">
                    <li>• Tudo do Padrão</li>
                    <li>• Playlists ilimitadas</li>
                    <li>• Produção de música</li>
                    <li>• Suporte prioritário</li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Link href="/plans">
                  <button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl">
                    <Crown className="h-5 w-5" />
                    Ver Todos os Planos
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
            <div className="bg-blue-600/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Music className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Milhares de Músicas</h3>
            <p className="text-gray-300 text-sm">Catálogo vasto com as melhores faixas eletrônicas do momento</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
            <div className="bg-purple-600/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Trending Semanal</h3>
            <p className="text-gray-300 text-sm">Descubra as músicas mais baixadas pelos DJs da comunidade</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 hover:border-green-400/40 transition-all duration-300">
            <div className="bg-green-600/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Download className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Downloads Ilimitados</h3>
            <p className="text-gray-300 text-sm">Baixe quantas músicas quiser, quando quiser</p>
          </div>

          <div className="bg-gradient-to-br from-pink-900/20 to-pink-800/10 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/20 hover:border-pink-400/40 transition-all duration-300">
            <div className="bg-pink-600/20 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Comunidade Ativa</h3>
            <p className="text-gray-300 text-sm">Conecte-se com DJs de todo o Brasil</p>
          </div>
        </div>

        {/* SEÇÃO - UPLOAD DE MÚSICAS */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-8 mb-12 border border-purple-500/20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full mr-4">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Compartilhe Suas Músicas</h2>
            </div>
            <p className="text-gray-300 max-w-3xl mx-auto text-lg">
              Usuários VIP podem enviar suas próprias músicas para que outros membros pagantes possam baixar e conhecer seus trabalhos.
              Faça parte da comunidade e compartilhe suas criações!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/20 rounded-xl p-6 text-center">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Music className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Upload Fácil</h3>
              <p className="text-gray-300 text-sm">Envie suas músicas diretamente pela plataforma com metadados completos</p>
            </div>

            <div className="bg-black/20 rounded-xl p-6 text-center">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Visibilidade</h3>
              <p className="text-gray-300 text-sm">Suas músicas aparecem na página da comunidade e no catálogo geral</p>
            </div>

            <div className="bg-black/20 rounded-xl p-6 text-center">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Crescimento</h3>
              <p className="text-gray-300 text-sm">Acompanhe downloads, curtidas e plays das suas músicas enviadas</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/community">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl">
                <Users className="h-5 w-5" />
                Ver Músicas da Comunidade
              </button>
            </Link>
          </div>
        </div>

        {/* SEÇÃO - DEEMIX */}
        <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-2xl p-8 mb-12 border border-indigo-500/20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full mr-4">
                <Headphones className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Deemix - Download Premium</h2>
            </div>
            <p className="text-gray-300 max-w-3xl mx-auto text-lg">
              Acesse o Deemix, nossa plataforma exclusiva para download de músicas em alta qualidade diretamente do Deezer e Spotify.
              Baixe em FLAC, MP3 320kbps e muito mais com nossa infraestrutura dedicada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/20 rounded-xl p-6 text-center">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Download FLAC/MP3</h3>
              <p className="text-gray-300 text-sm">Qualidade Hi-Fi e MP3 320kbps para suas apresentações</p>
            </div>

            <div className="bg-black/20 rounded-xl p-6 text-center">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Velocidade Máxima</h3>
              <p className="text-gray-300 text-sm">Downloads ultra-rápidos com nossa infraestrutura dedicada</p>
            </div>

            <div className="bg-black/20 rounded-xl p-6 text-center">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Acesso Global</h3>
              <p className="text-gray-300 text-sm">Conecte-se de qualquer lugar através do nosso servidor web</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/deemix">
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl">
                <Headphones className="h-5 w-5" />
                Conhecer Deemix
              </button>
            </Link>
          </div>
        </div>

        {session?.user?.is_vip && (
          <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white p-6 rounded-2xl mb-8 shadow-2xl border border-white/10 text-center">
            <div className="flex justify-center mb-4"><Heart className="h-8 w-8 text-white/80 animate-pulse" /></div>
            <h2 className="text-3xl font-bold">Bem-vindo(a) de volta!</h2>
            <p className="mt-2 text-lg opacity-90">
              Agradecemos por fazer parte do nosso plano. Aproveite todos os benefícios exclusivos!
            </p>
          </div>
        )}

        {/* SEÇÃO - AVISO IMPORTANTE SOBRE O ACERVO */}
        {session?.user?.is_vip && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-8 rounded-2xl shadow-2xl border border-amber-400/30 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-400 to-orange-500"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-amber-500/20 p-3 rounded-full mr-4">
                    <Database className="h-8 w-8 text-amber-300" />
                  </div>
                  <h2 className="text-3xl font-bold">Aviso Importante sobre o Acervo</h2>
                </div>

                <div className="text-center mb-6">
                  <p className="text-lg mb-4">
                    A migração de todo o nosso acervo para a nova plataforma está em andamento.
                    <span className="font-bold text-amber-200"> Novas músicas são adicionadas diariamente!</span>
                  </p>
                  <p className="text-amber-100 text-sm">
                    Estamos trabalhando para trazer todo o conteúdo histórico para a nova interface moderna.
                  </p>
                </div>

                {/* Progress Section */}
                <div className="bg-black/20 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-amber-200 font-semibold">Progresso da Migração</span>
                    <span className="text-amber-300 font-bold">0.35%</span>
                  </div>
                  <div className="w-full bg-amber-900/50 rounded-full h-3 mb-2">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 h-3 rounded-full transition-all duration-1000" style={{ width: '0.35%' }}></div>
                  </div>
                  <div className="flex items-center justify-center text-xs text-amber-200">
                    <Clock className="h-4 w-4 mr-1" />
                    Em andamento - Atualização contínua
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-black/20 rounded-lg p-4 text-center">
                    <Upload className="h-6 w-6 text-amber-300 mx-auto mb-2" />
                    <h4 className="font-semibold text-amber-200 mb-1">Upload Diário</h4>
                    <p className="text-xs text-amber-100">Novas faixas adicionadas todos os dias</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-300 mb-1">Qualidade Garantida</h4>
                    <p className="text-xs text-green-100">Todas as músicas em alta qualidade</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4 text-center">
                    <AlertTriangle className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-blue-300 mb-1">Acesso Temporário</h4>
                    <p className="text-xs text-blue-100">Drive ainda disponível durante migração</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="https://plataformavip.nexorrecords.com.br/pesquisardrive" target="_blank" rel="noopener noreferrer">
                    <button className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                      <Database className="h-5 w-5" />
                      Acessar Acervo no Drive
                    </button>
                  </Link>
                  <Link href="/new">
                    <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                      <Music className="h-5 w-5" />
                      Ver Músicas Migradas
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO - MAIS BAIXADAS */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">MAIS BAIXADAS</h2>
            </div>
            <Link href="/trending">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Ver Trending
              </button>
            </Link>
          </div>

          {loadingMostDownloaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-600 rounded mb-2"></div>
                      <div className="h-3 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-gray-600 rounded w-16"></div>
                    <div className="h-3 bg-gray-600 rounded w-8"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : mostDownloadedTracks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mostDownloadedTracks.map((track, index) => (
                <div key={track.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 hover:bg-gray-700/50 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm truncate group-hover:text-blue-300 transition-colors">{track.songName}</div>
                      <div className="text-gray-400 text-xs truncate">{track.artist}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Downloads: {track.downloadCount}</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhuma música baixada esta semana</p>
            </div>
          )}
        </div>

        {/* Premium Features Section */}
        <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-2xl p-8 mb-12 border border-gray-700/50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Por que escolher nossa plataforma?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Somos a escolha número um dos DJs brasileiros que buscam qualidade,
              variedade e uma experiência premium incomparável.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Qualidade Premium</h3>
              <p className="text-gray-300 text-sm">Todas as músicas em alta qualidade para suas apresentações</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Atualização Constante</h3>
              <p className="text-gray-300 text-sm">Novas músicas adicionadas diariamente ao catálogo</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Comunidade Exclusiva</h3>
              <p className="text-gray-300 text-sm">Conecte-se com os melhores DJs do Brasil</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-16">
          <h2 className="text-4xl font-bold text-white mb-6">Pronto para dominar as pistas?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Junte-se a milhares de DJs que já descobriram o futuro da música eletrônica.
            Comece sua jornada hoje mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/new">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center gap-3">
                <Play className="h-6 w-6" />
                Começar Agora
              </button>
            </Link>
            <Link href="/trending">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center gap-3">
                <TrendingUp className="h-6 w-6" />
                Ver Trending
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
    <div className="min-h-screen bg-black">
      <HomePageContent />
    </div>
  );
}
