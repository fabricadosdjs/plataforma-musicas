// src/components/layout/Footer.tsx
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full bg-gradient-to-r from-[#1B1C1D] to-[#23232a] text-gray-300 py-2 px-4 mt-8 border-t border-gray-700/60 text-center text-xs shadow-inner">
            <div className="max-w-6xl mx-auto">
                {/* Informações principais */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-gray-300">Venâncio Aires - RS, Brasil</div>
                        <div className="text-gray-300">contato@nexorrecords.com.br</div>
                        <div className="text-gray-300">+55 (51) 99999-9999</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-gray-300">Sistema Online</div>
                        <div className="text-gray-300">99.9% Uptime</div>
                        <div className="text-gray-300">SSL Seguro</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-gray-300">© 2025 Nexor Records.</div>
                        <div className="text-gray-300">Todos os direitos reservados.</div>
                        <div className="text-gray-300">
                            Feito com <span className="text-pink-500">♥</span> em Venâncio Aires
                        </div>
                    </div>
                </div>

                {/* Links */}
                <div className="flex flex-row flex-wrap gap-2 items-center justify-center border-t border-gray-700/40 pt-2">
                    <Link href="/termos" className="hover:text-blue-400 transition-colors">Termos de Serviço</Link>
                    <span className="text-gray-500">|</span>
                    <Link href="/privacidade" className="hover:text-blue-400 transition-colors">Política de Privacidade</Link>
                </div>
            </div>
        </footer>
    );
}
