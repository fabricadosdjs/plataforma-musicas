// src/app/admin/add-music/page.tsx
"use client";

import React, { useState, memo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import { Music, Search, Instagram, Twitter, Facebook, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// --- Componentes Reutilizados ---

const Header = memo(function Header() {
    const pathname = usePathname();
    const navLinks = [
      { href: '/new', label: 'New' }, { href: '/featured', label: 'Featured' },
      { href: '/trending', label: 'Trending' }, { href: '/charts', label: 'Charts' },
    ];
  
    return (
      <header className="w-full bg-[#121212]/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-800 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/new" className="flex items-center gap-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Music size={16} className="text-black" />
            </div>
            <h1 className="text-xl font-bold text-white hidden sm:block">DJ Pool</h1>
          </Link>
        </div>
        <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (<Link key={link.href} href={link.href} className={`font-semibold transition-colors pb-2 ${pathname === link.href ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}>{link.label}</Link>))}
            </nav>
            <div className="flex items-center gap-4">
                <ClerkLoading><div className="h-8 w-28 bg-gray-700 rounded-md animate-pulse"></div></ClerkLoading>
                <ClerkLoaded>
                    <SignedIn>
                        <Link href="/profile" className={`font-semibold transition-colors pb-2 hidden md:block ${pathname === '/profile' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}>Meu Perfil</Link>
                        <UserButton afterSignOutUrl="/new"/>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal"><button className="font-semibold px-3 py-2 rounded-md transition-colors text-gray-300 hover:text-white">Entrar</button></SignInButton>
                        <SignUpButton mode="modal"><button className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors text-sm font-bold">Cadastrar</button></SignUpButton>
                    </SignedOut>
                </ClerkLoaded>
            </div>
        </div>
      </header>
    );
});

const SiteFooter = memo(function SiteFooter() {
    return (
        <footer className="bg-[#121212] border-t border-gray-800 mt-auto">
            <div className="max-w-screen-xl mx-auto py-8 px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-center md:text-left"><p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} DJ Pool. Todos os direitos reservados.</p></div>
                <div className="flex items-center gap-2"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span><p className="text-sm text-green-400 font-semibold">Todos os serviços online</p></div>
                <div className="flex space-x-6">
                    <a href="#" className="text-gray-400 hover:text-white"><Instagram size={24} /></a>
                    <a href="#" className="text-gray-400 hover:text-white"><Twitter size={24} /></a>
                    <a href="#" className="text-gray-400 hover:text-white"><Facebook size={24} /></a>
                </div>
            </div>
        </footer>
    );
});


// --- Página de Adicionar Música ---
export default function AddMusicPage() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    songName: '',
    artist: '',
    style: '',
    version: 'Original',
    duration: '',
    fileSize: '',
    releaseDate: new Date().toISOString().split('T')[0],
    imageUrl: '',
    previewUrl: '',
    downloadUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ocorreu um erro ao adicionar a música.');
      }

      setMessage({ type: 'success', text: `Música "${result.songName}" adicionada com sucesso!` });
      // Limpa o formulário, exceto data, estilo e versão
      setFormData(prev => ({
        ...prev,
        songName: '',
        artist: '',
        duration: '',
        fileSize: '',
        imageUrl: '',
        previewUrl: '',
        downloadUrl: '',
      }));

    } catch (error: any) {
      setMessage({ type: 'error', text: `Erro: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Adicionar Nova Música - Admin</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div className="bg-[#121212] text-gray-300 font-inter min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-white mb-2">Adicionar Nova Música</h1>
            <p className="text-gray-400 mb-8">Preencha os detalhes abaixo para adicionar uma nova faixa ao catálogo.</p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-[#181818] p-8 rounded-xl border border-gray-800">
              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="songName" className="block text-sm font-medium text-gray-300 mb-1">Nome da Faixa</label>
                  <input type="text" name="songName" id="songName" value={formData.songName} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-700 bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label htmlFor="artist" className="block text-sm font-medium text-gray-300 mb-1">Artista</label>
                  <input type="text" name="artist" id="artist" value={formData.artist} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-700 bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>

              {/* Detalhes da Faixa */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-1">Gênero</label>
                  <input type="text" name="style" id="style" value={formData.style} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-700 bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label htmlFor="version" className="block text-sm font-medium text-gray-300 mb-1">Versão</label>
                  <select id="version" name="version" value={formData.version} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-700 bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500" required>
                    <option>Original</option><option>Remix</option><option>Dirty</option><option>Clean</option><option>Instrumental</option><option>Acapella</option><option>Intro</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-300 mb-1">Data de Lançamento</label>
                  <input type="date" name="releaseDate" id="releaseDate" value={formData.releaseDate} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-700 bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              
              {/* Detalhes do Ficheiro */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Duração</label>
                  <input type="text" name="duration" id="duration" value={formData.duration} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-700 bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500" placeholder="Ex: 03:45" required />
                </div>
                <div>
                  <label htmlFor="fileSize" className="block text-sm font-medium text-gray-300 mb-1">Tamanho do Ficheiro</label>
                  <input type="text" name="fileSize" id="fileSize" value={formData.fileSize} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-700 bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500" placeholder="Ex: 8.5MB" required />
                </div>
              </div>

              {/* Links */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-1">URL da Imagem da Capa</label>
                  <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-700 bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500" placeholder="https://..." required />
                </div>
                <div>
                  <label htmlFor="previewUrl" className="block text-sm font-medium text-gray-300 mb-1">URL do Preview</label>
                  <input type="url" name="previewUrl" id="previewUrl" value={formData.previewUrl} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-700 bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500" placeholder="https://..." required />
                </div>
                <div>
                  <label htmlFor="downloadUrl" className="block text-sm font-medium text-gray-300 mb-1">URL do Download</label>
                  <input type="url" name="downloadUrl" id="downloadUrl" value={formData.downloadUrl} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-700 bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500" placeholder="https://..." required />
                </div>
              </div>

              <div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white disabled:bg-gray-500 disabled:cursor-not-allowed">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Adicionar Música'}
                </button>
              </div>
            </form>

            {message.text && (
              <div className={`mt-6 p-4 rounded-md text-center flex items-center justify-center gap-2 ${message.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                {message.text}
              </div>
            )}
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}