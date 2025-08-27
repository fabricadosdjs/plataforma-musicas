// src/components/layout/Footer.tsx
import Link from 'next/link';
import { Music } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-black border-t border-gray-800 mt-20">
            <div className="max-w-[95%] mx-auto px-6 py-12">

                {/* Conteúdo Principal */}
                <div className="flex flex-col items-center gap-4">

                    {/* Logo e Nome */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <Music className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">
                                Nexor Records Pools
                            </span>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link href="/new" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                            Novidades
                        </Link>
                        <Link href="/trending" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                            Trending
                        </Link>
                        <Link href="/plans" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                            Planos
                        </Link>
                        <Link href="/privacidade" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                            Privacidade
                        </Link>
                        <Link href="/termos" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                            Termos
                        </Link>
                    </div>

                    {/* Redes Sociais */}
                    <div className="flex gap-4">
                        <a href="https://twitter.com/plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806.026-1.566.247-2.229.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                            </svg>
                        </a>
                        <a href="https://instagram.com/plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.017 12.017.017z" />
                            </svg>
                        </a>
                        <a href="https://youtube.com/@plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="text-center">
                        <p className="text-gray-400 text-sm">
                            © 2025 Nexor Records Pools. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
