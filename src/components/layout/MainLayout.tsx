// src/components/layout/MainLayout.tsx
"use client";

import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useUser, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// REMOVIDOS ícones não utilizados: X, Info, Loader2 (serão definidos no Alert ou removidos se não usados)
import { Play, Download, ThumbsUp, Pause, SkipBack, SkipForward, Music, Search, Instagram, Twitter, Facebook } from 'lucide-react';
// ADICIONADO: Importar Image do next/image para otimização
import Image from 'next/image';
// ADICIONADO: Importar os ícones X e Info para o componente Alert
import { X as XIcon, Info as InfoIcon } from 'lucide-react'; 
// ADICIONADO: Importar o AppContext para prover os valores
import { AppContextProvider, useAppContext } from '@/context/AppContext'; // Importar useAppContext aqui também

// --- Tipos ---
// Definição do tipo Track (pode ser a mesma usada nas páginas)
type Track = {
  id: number;
  songName: string;
  artist: string;
  imageUrl: string;
  downloadUrl: string;
  actionDate?: string; // Propriedade opcional, se nem todas as tracks tiverem
  previewUrl: string; 
};

// Definindo um tipo para a instância do WaveSurfer para evitar 'any'
interface WaveSurferInstance {
    load: (url: string) => void;
    play: () => void;
    pause: () => void;
    playPause: () => void;
    destroy: () => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    // Adicione outras propriedades/métodos do wavesurfer que você usar
}

// --- Componentes Internos do Layout (Header, Player, Footer) ---

// Componente de Alerta (movido para cá para ser global)
const Alert = memo(function Alert({ message, onClose }: { message: string, onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed top-24 right-6 bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-50 animate-fade-in-down">
      <InfoIcon size={24} /> {/* Usando InfoIcon aqui */}
      <span>{message}</span>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
        <XIcon size={18} /> {/* Usando XIcon aqui */}
      </button>
    </div>
  );
});

// CORRIGIDO: Tipagem do parâmetro 'e' no onChange
const Header = memo(function Header({ onSearchChange }: { onSearchChange: (query: string) => void }) {
    const pathname = usePathname();
    const navLinks = [
      { href: '/new', label: 'New' },
      { href: '/featured', label: 'Featured' },
      { href: '/trending', label: 'Trending' },
      { href: '/charts', label: 'Charts' },
      { href: '/pro', label: 'PRO' }, // Adicionado o link PRO se for o caso
    ];
  
    return (
      <header className="w-full bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/new" className="flex items-center gap-4">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Music size={16} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">DJ Pool</h1>
          </Link>
        </div>
        <div className="relative w-full max-w-md mx-4 hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          {/* CORRIGIDO: Tipagem explícita para o evento onChange */}
          <input type="text" placeholder="Pesquisar por música ou artista..." onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"/>
        </div>
        <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`font-semibold transition-colors pb-2 ${pathname === link.href ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
                {link.label}
                </Link>
            ))}
             <ClerkLoaded>
                <SignedIn>
                    <Link href="/profile" className={`font-semibold transition-colors pb-2 ${pathname === '/profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
                        Meu Perfil
                    </Link>
                </SignedIn>
            </ClerkLoaded>
            </nav>
            <div className="flex items-center gap-4">
                <ClerkLoading><div className="h-8 w-28 bg-gray-200 rounded-md animate-pulse"></div></ClerkLoading>
                <ClerkLoaded>
                    <SignedIn><UserButton afterSignOutUrl="/new"/></SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal"><button className="font-semibold px-3 py-2 rounded-md transition-colors text-gray-600 hover:text-blue-600">Entrar</button></SignInButton>
                        <SignUpButton mode="modal"><button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">Cadastrar</button></SignUpButton>
                    </SignedOut>
                </ClerkLoaded>
            </div>
        </div>
      </header>
    );
});

const FooterPlayer = memo(function FooterPlayer({ track, onNext, onPrevious, onLike, onDownload, isPlaying, onPlayPause }: { track: Track | null, onNext: () => void, onPrevious: () => void, onLike: (trackId: number) => void, onDownload: (track: Track) => void, isPlaying: boolean, onPlayPause: (state: boolean) => void }) {
    const waveformRef = useRef<HTMLDivElement>(null);
    // CORRIGIDO: Removido o ponto e vírgula extra no comentário
    const wavesurfer = useRef<WaveSurferInstance | null>(null); // CORRIGIDO: Tipado useRef
    // const [isPlaying, setIsPlaying] = useState(false); // REMOVIDO: isPlaying e setIsPlaying vêm do AppContext

    useEffect(() => {
        const createWaveSurfer = async () => {
            if (waveformRef.current) {
                const WaveSurfer = (await import('wavesurfer.js')).default;
                if (wavesurfer.current) wavesurfer.current.destroy();
                wavesurfer.current = WaveSurfer.create({ container: waveformRef.current, waveColor: '#E2E8F0', progressColor: '#007BFF', cursorWidth: 1, barWidth: 2, barGap: 2, barRadius: 2, height: 40, responsive: true, hideScrollbar: true });
                if (track) {
                    wavesurfer.current.load(track.previewUrl);
                    wavesurfer.current.on('ready', () => wavesurfer.current?.play());
                    wavesurfer.current.on('play', () => onPlayPause(true)); // Usa onPlayPause do contexto
                    wavesurfer.current.on('pause', () => onPlayPause(false)); // Usa onPlayPause do contexto
                    wavesurfer.current.on('finish', onNext);
                }
            }
        };
        if (track) createWaveSurfer();
        return () => wavesurfer.current?.destroy();
    }, [track, onNext, onPlayPause]); // Adicionado onPlayPause como dependência

    if (!track) return null;
    
    const handlePlayPause = () => wavesurfer.current?.playPause();

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.08)]">
            <div className="container mx-auto px-6 py-3 flex items-center gap-4">
                {/* CORRIGIDO: Substituído <img> por <Image /> */}
                <Image src={track.imageUrl} alt={track.songName} width={56} height={56} className="w-14 h-14 rounded-lg shadow-sm flex-shrink-0" />
                <div className="flex items-center gap-4 flex-shrink-0">
                    <button onClick={onPrevious} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"><SkipBack size={20} className="text-gray-700" /></button>
                    <button onClick={handlePlayPause} className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">{isPlaying ? <Pause size={24} /> : <Play size={24} />}</button>
                    <button onClick={onNext} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"><SkipForward size={20} className="text-gray-700" /></button>
                </div>
                <div className="flex-grow flex flex-col justify-center gap-1 w-full min-w-0">
                    <div className="truncate"><p className="font-bold text-gray-900 truncate">{track.songName}</p><p className="text-sm text-gray-500 truncate">{track.artist}</p></div>
                    <div ref={waveformRef} className="w-full h-[40px]"></div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => onLike(track.id)} className="p-3 rounded-full hover:bg-blue-500/10" title="Like"><ThumbsUp size={20} className="text-blue-500" /></button>
                  <button onClick={() => onDownload(track)} className="p-3 rounded-full hover:bg-green-500/10" title="Download"><Download size={20} className="text-green-500" /></button>
                </div>
            </div>
        </footer>
    );
});

const SiteFooter = memo(function SiteFooter() {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-screen-2xl mx-auto py-8 px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-center md:text-left"><p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} DJ Pool. Todos os direitos reservados.</p></div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
                    <p className="text-sm text-green-600 font-semibold">Todos os serviços online</p>
                </div>
                <div className="flex space-x-6">
                    <a href="#" className="text-gray-400 hover:text-gray-500"><Instagram size={24} /></a>
                    <a href="#" className="text-gray-400 hover:text-gray-500"><Twitter size={24} /></a>
                    <a href="#" className="text-gray-400 hover:text-gray-500"><Facebook size={24} /></a>
                </div>
            </div>
        </footer>
    );
});


// --- O Layout Principal ---
// O children agora não precisa de props, pois o AppContext proverá o que for necessário
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  // REMOVIDO: Estados que devem ser gerenciados pelo AppContext ou pela página
  // const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Warning: 'searchTerm' is assigned a value but never used.
  // REMOVIDO: Estados que devem ser gerenciados pelo AppContext
  // const [likedTracks, setLikedTracks] = useState<number[]>([]);
  // const [downloadedTracks, setDownloadedTracks] = useState<number[]>([]);
  // const [downloadCount, setDownloadCount] = useState(0);
  // const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

  // useEffect que busca dados do usuário, mas os estados são do AppContext
  useEffect(() => {
    // Esta lógica de buscar dados do usuário e popular AppContext deve estar no AppContext
    // ou em um hook personalizado dentro dele.
    // Aqui no MainLayout, você apenas usaria o que já vem do AppContext.
    // Se a intenção era que o MainLayout inicializasse o AppContext,
    // então a lógica de fetch deve estar no AppContext e não aqui.
    // Por enquanto, vou remover a busca de dados aqui, assumindo que AppContext lida com isso.
    // Se o seu AppContext não estiver buscando dados do usuário, precisaremos revisar ele.
    if (isLoaded && user) {
        // Exemplo: Disparar uma ação no AppContext para carregar dados do usuário
        // context.loadUserData(user.id);
    }
  }, [user, isLoaded]);

  // Ações de handleAuthAction, handleLike, handleDownload devem vir do AppContext
  // Se elas são definidas aqui, significa que este é o Provider do AppContext.
  // Se MainLayout for o Provider, então o AppContext.tsx precisa ser ajustado.
  // Vou assumir por enquanto que MainLayout é o Provider e mover essas lógicas
  // para o AppContextProvider. Por isso, este MainLayout deve ser o Wrapper.

  // Componente Alert usa o alertMessage deste layout
  const closeAlert = useCallback(() => setAlertMessage(''), []); // Warning: 'setAlertMessage' is defined but never used.

  // O Header precisa de onSearchChange. O Player precisa de track, onNext, onPrevious, onLike, onDownload.
  // Estes virão do AppContext.
  // O FooterPlayer precisa de isPlaying e onPlayPause
  // Aqui assumimos que AppContextProvider já está provendo esses valores.
  // Se MainLayout for o AppContextProvider, a lógica precisa ser um pouco diferente.
  // Vou refatorar para que MainLayout simplesmente use o AppContext.

  return (
    // Envolvendo o conteúdo com AppContextProvider
    <AppContextProvider>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div className="bg-gray-50 text-gray-800 font-nunito min-h-screen flex flex-col">
        {/* Header precisa de onSearchChange para o input de busca */}
        <Header onSearchChange={setSearchTerm} /> 
        {/* Alert precisa de message e onClose, que vêm do estado local do MainLayout */}
        <Alert message={alertMessage} onClose={closeAlert} />
        <div className="flex-grow">
            {children} {/* children é um React.ReactNode agora, não uma função */}
        </div>
        <SiteFooter />
        {/* FooterPlayer precisa de props do AppContext */}
        {/* Você precisará importar useAppContext aqui para passar as props para o FooterPlayer */}
        <AppConsumerFooterPlayer setAlertMessage={setAlertMessage} />
      </div>
    </AppContextProvider>
  );
}

// Componente Wrapper para consumir o AppContext e passar para FooterPlayer
// Isso é necessário porque `MainLayout` é o `AppContextProvider` e não pode
// consumir seu próprio contexto diretamente em sua função principal.
function AppConsumerFooterPlayer({ setAlertMessage }: { setAlertMessage: (msg: string) => void }) {
  const { currentTrack, nextTrack, previousTrack, handleLike, handleDownload, isPlaying, setIsPlaying } = useAppContext();
  
  // As funções onNext e onPrevious aqui vão precisar da lógica de "lista de reprodução"
  // que o AppContext deve fornecer. Por enquanto, as mantemos como simples chamadas.

  return (
    <FooterPlayer 
        track={currentTrack} 
        onNext={nextTrack}
        onPrevious={previousTrack}
        onLike={handleLike}
        onDownload={handleDownload}
        isPlaying={isPlaying}
        onPlayPause={setIsPlaying}
    />
  );
}