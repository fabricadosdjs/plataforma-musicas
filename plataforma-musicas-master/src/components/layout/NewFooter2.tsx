// src/components/layout/NewFooter.tsx
"use client";

import React from 'react';
import Link from 'next/link';

const NewFooter = () => {
    return (
        <footer className="relative z-10 mt-16">
            {/* Elementos de fundo do footer */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-gray-900/60 to-transparent"></div>

            {/* Linha decorativa superior */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent h-px"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/30 to-transparent h-px transform translate-y-1"></div>
            </div>

            <div className="container mx-auto px-4 py-8 relative">
                {/* Informações principais compactas */}
                <div className="max-w-6xl mx-auto text-center">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-xs text-gray-300">
                        <div className="flex flex-col items-center gap-1">
                            <div>Venâncio Aires - RS, Brasil</div>
                            <div>contato@nexorrecords.com.br</div>
                            <div>+55 (51) 99999-9999</div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div>Sistema Online</div>
                            <div>99.9% Uptime</div>
                            <div>SSL Seguro</div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div>© 2025 Nexor Records.</div>
                            <div>Todos os direitos reservados.</div>
                            <div>
                                Feito com <span className="text-pink-500">♥</span> em Venâncio Aires
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-row flex-wrap gap-2 items-center justify-center border-t border-gray-700/40 pt-4 text-xs">
                        <Link href="/termos" className="hover:text-blue-400 transition-colors">Termos de Serviço</Link>
                        <span className="text-gray-500">|</span>
                        <Link href="/privacidade" className="hover:text-blue-400 transition-colors">Política de Privacidade</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default NewFooter;
