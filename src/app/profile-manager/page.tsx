
"use client";
import Header from '@/components/layout/Header';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

// Componente para cada módulo de benefício
function BenefitModule({ label, color, value }: { label: string; color: string; value: number | string }) {
    return (
        <div className="flex-1 bg-[#23232a] rounded-xl p-6 flex flex-col items-center justify-center shadow border border-gray-700">
            <span className={`text-lg font-semibold text-${color} mb-2`}>{label}</span>
            <span className="text-2xl font-bold text-white">{value}</span>
            <span className="text-xs text-gray-400 mt-1">Atualizado em tempo real</span>
        </div>
    );
}

export default function ProfileManagerPage() {
    const { data: session } = useSession();
    const username = session?.user?.name || session?.user?.email || 'DJ';

    // Estados para os benefícios
    const [packsSemanais, setPacksSemanais] = useState('--');
    const [playlistsSemanais, setPlaylistsSemanais] = useState('--');
    const [downloadsDiarios, setDownloadsDiarios] = useState('--');

    useEffect(() => {
        if (session?.user?.id) {
            // Simulação de chamada ao banco de dados
            // Substitua por fetch/axios/prisma conforme seu backend
            async function fetchBenefits() {
                // Exemplo: const res = await fetch(`/api/benefits?userId=${session.user.id}`);
                // const data = await res.json();
                // setPacksSemanais(data.packsSemanais);
                // setPlaylistsSemanais(data.playlistsSemanais);
                // setDownloadsDiarios(data.downloadsDiarios);
                // Simulação
                setPacksSemanais('3');
                setPlaylistsSemanais('2');
                setDownloadsDiarios('12');
            }
            fetchBenefits();
        }
    }, [session?.user?.id]);

    return (
        <>
            <Header />
            <div className="w-full flex flex-col items-center justify-center min-h-[60vh] px-4" style={{ background: '#212121' }}>
                <div className="w-full max-w-4xl rounded-2xl p-8 mb-8 bg-gradient-to-br from-blue-900 via-purple-900 to-black shadow-xl border border-gray-800">
                    <div className="flex flex-col items-center justify-center mb-2">
                        <span className="inline-flex items-center justify-center rounded-full bg-yellow-400/20 text-yellow-300 shadow-lg mb-1" style={{ width: 48, height: 48 }}>
                            {/* Premium icon SVG */}
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700" />
                            </svg>
                        </span>
                        <span className="text-yellow-300 text-[11px] font-semibold tracking-wide">Premium</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-white mb-4 drop-shadow-lg text-center">BEM-VINDO(A), {username}</h1>
                    <p className="text-gray-200 font-medium mb-4 text-justify" style={{ fontSize: '13px' }}>
                        Seja muito bem-vindo à sua área VIP exclusiva! Aqui você tem acesso completo a todos os recursos premium da plataforma DJ Jéssica. Desfrute de downloads ilimitados, packs exclusivos, conteúdos em alta qualidade e muito mais. Nossa equipe trabalha constantemente para oferecer a melhor experiência musical para nossos clientes VIP. Explore todas as funcionalidades disponíveis e aproveite ao máximo sua assinatura premium. Em caso de dúvidas, nossa equipe de suporte está sempre disponível para ajudá-lo.
                    </p>
                </div>

                {/* Nova seção de uso dos benefícios - fora da box principal */}
                <div className="w-full max-w-4xl rounded-2xl p-8 mb-8 bg-gradient-to-br from-blue-900 via-purple-900 to-black shadow-xl border border-gray-800 mt-4">
                    <h2 className="text-xl font-bold text-white mb-6 text-center">Uso Atual dos Benefícios</h2>
                    <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
                        {/* Packs Semanais */}
                        <BenefitModule label="Packs Semanais" color="yellow-300" value={packsSemanais} />
                        {/* Playlists Semanais */}
                        <BenefitModule label="Playlists Semanais" color="blue-300" value={playlistsSemanais} />
                        {/* Downloads Diários */}
                        <BenefitModule label="Downloads Diários" color="green-300" value={downloadsDiarios} />
                    </div>
                </div>
            </div>
        </>
    );
}
