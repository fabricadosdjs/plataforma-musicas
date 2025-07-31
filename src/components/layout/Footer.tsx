// src/components/layout/Footer.tsx
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full bg-gradient-to-r from-[#1B1C1D] to-[#23232a] text-gray-300 py-8 px-4 mt-16 border-t border-gray-700/60 text-center text-sm flex flex-col items-center gap-3 shadow-inner">
            <div className="font-bold tracking-wide text-lg mb-1 text-white/90 drop-shadow-sm">Nexor Records <span className="text-gray-400 font-normal">| All Rights Reserved 2025</span></div>
            <div className="text-gray-300 text-base mb-2">Plataforma feita com <span className="text-pink-500">♥</span> em Venâncio Aires-RS</div>
            <div className="w-32 border-t border-gray-700 my-2"></div>
            <div className="flex flex-row flex-wrap gap-2 items-center justify-center">
                <Link href="/termos" className="hover:text-blue-400 transition-colors font-medium">Termos de Serviço</Link>
                <span className="text-gray-500">|</span>
                <Link href="/privacidade" className="hover:text-blue-400 transition-colors font-medium">Política de Privacidade</Link>
                <span className="text-gray-500">|</span>
                <Link href="/politica-grupo" className="hover:text-blue-400 transition-colors font-medium">Política do Grupo</Link>
            </div>
        </footer>
    );
}
