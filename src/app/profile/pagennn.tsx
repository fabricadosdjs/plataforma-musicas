
"use client";

import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/layout/Header";

// SVG Crown Icon
const VipCrown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }}
  >
    <path d="M2 8l4.5 4.5L12 3l5.5 9.5L22 8l-2 11H4L2 8z" fill="#FFD600" stroke="#FFD600" strokeWidth="1.5" />
  </svg>
);

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { likedTracks, downloadedTracks } = useAppContext();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      if (session?.user?.email) {
        try {
          const res = await axios.get(`/api/user?email=${encodeURIComponent(session.user.email)}`);
          setUserData(res.data);
        } catch (err) {
          setUserData(null);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchUserData();
  }, [session?.user?.email]);

  const userName = session?.user?.name || "Usuário";
  const userEmail = session?.user?.email || "---";
  const userWhatsapp = userData?.whatsapp || "---";
  // Simulação de foto de perfil (pode ser substituída por userData?.image)
  const profilePic = session?.user?.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(userName);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-[#17171A] via-[#1a1122] to-[#0d1a22] flex flex-col items-center py-10">
        {/* Header do perfil */}
        <div className="w-full max-w-3xl flex flex-col md:flex-row items-center md:items-end gap-6 mb-10 p-8 rounded-3xl shadow-lg" style={{ background: "linear-gradient(135deg, #220D16 0%, #190D22 100%)" }}>
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="relative">
              <img src={profilePic} alt="Foto de perfil" className="w-28 h-28 rounded-full border-4 border-yellow-400 shadow-lg object-cover" />
              <span className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-md">
                <VipCrown />
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <h1 className="text-white font-extrabold text-2xl md:text-3xl" style={{ fontFamily: 'Lato, sans-serif' }}>{userName}</h1>
              <span className="bg-yellow-400 text-black font-bold px-3 py-1 rounded-full text-xs ml-2">VIP</span>
            </div>
            <span className="text-gray-300 text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>{userEmail}</span>
          </div>
          <div className="flex-1 flex flex-col items-center md:items-end gap-3 w-full">
            <button className="bg-white text-black font-bold px-6 py-2 rounded-full shadow hover:bg-gray-200 transition" style={{ fontFamily: 'Lato, sans-serif', fontSize: '15px' }}>Editar Perfil</button>
            <a href="/new" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200 shadow-md mt-2 md:mt-0" style={{ fontFamily: 'Lato, sans-serif', fontSize: '15px', letterSpacing: '1px' }}>HOMEPAGE</a>
          </div>
        </div>

        {/* Seções principais */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Dados Pessoais */}
          <div className="bg-black/80 rounded-2xl p-6 flex flex-col shadow-lg border border-gray-800">
            <h2 className="text-yellow-400 font-bold text-lg mb-3 tracking-wide" style={{ fontFamily: 'Lato, sans-serif' }}>Dados Pessoais</h2>
            <div className="text-white text-sm mb-2" style={{ fontFamily: 'Lato, sans-serif' }}><span className="font-bold">Nome:</span> {userName}</div>
            <div className="text-white text-sm mb-2" style={{ fontFamily: 'Lato, sans-serif' }}><span className="font-bold">E-mail:</span> {userEmail}</div>
            <div className="text-white text-sm mb-2" style={{ fontFamily: 'Lato, sans-serif' }}><span className="font-bold">WhatsApp:</span> {userWhatsapp}</div>
          </div>
          {/* Dados do Plano */}
          <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl p-6 flex flex-col shadow-lg border border-green-800">
            <h2 className="text-white font-bold text-lg mb-3 tracking-wide" style={{ fontFamily: 'Lato, sans-serif' }}>Plano VIP</h2>
            <div className="text-white text-sm mb-2 flex items-center gap-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22c55e" /><path d="M8 12.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="font-bold">Status:</span> <span className="text-green-300 font-bold">Ativo</span>
            </div>
            <div className="text-white text-sm mb-2" style={{ fontFamily: 'Lato, sans-serif' }}><span className="font-bold">Próximo vencimento:</span> 31/08/2025</div>
            <div className="text-white text-sm mb-2" style={{ fontFamily: 'Lato, sans-serif' }}><span className="font-bold">Tipo de plano:</span> VIP</div>
          </div>
          {/* Preferências Musicais */}
          <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-2xl p-6 flex flex-col shadow-lg border border-purple-800">
            <h2 className="text-white font-bold text-lg mb-3 tracking-wide" style={{ fontFamily: 'Lato, sans-serif' }}>Preferências</h2>
            <div className="text-white text-sm mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>Gênero favorito: <span className="font-bold">Eletrônica</span></div>
            <div className="text-white text-sm mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>Artista favorito: <span className="font-bold">DJ Jéssica</span></div>
            <div className="text-white text-sm mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>Playlist top: <span className="font-bold">VIP Hits</span></div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="flex flex-col items-center p-6 rounded-2xl border border-blue-900 bg-gradient-to-br from-[#101937] to-[#1a2a4d] shadow-lg">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm10-14v12.18A3 3 0 0 0 17 15a3 3 0 1 0 3 3V7h2V3h-6v2h2ZM5 19a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm12-2a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" /></svg>
            <div className="text-white font-bold text-xl mt-2" style={{ fontFamily: 'Lato, sans-serif' }}>{likedTracks?.length ?? 0}</div>
            <div className="text-gray-300 text-xs" style={{ fontFamily: 'Lato, sans-serif' }}>Músicas Curtidas</div>
          </div>
          <div className="flex flex-col items-center p-6 rounded-2xl border border-green-900 bg-gradient-to-br from-[#0E2316] to-[#1a3d2a] shadow-lg">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 16V4m0 12 4-4m-4 4-4-4m-6 8h20v-2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2Z" /></svg>
            <div className="text-white font-bold text-xl mt-2" style={{ fontFamily: 'Lato, sans-serif' }}>{downloadedTracks?.length ?? 0}</div>
            <div className="text-gray-300 text-xs" style={{ fontFamily: 'Lato, sans-serif' }}>Downloads</div>
          </div>
          <div className="flex flex-col items-center p-6 rounded-2xl border border-yellow-900 bg-gradient-to-br from-[#251035] to-[#3a1a5d] shadow-lg">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path fill="#FFD600" stroke="#FFD600" strokeWidth="1.5" d="m12 17.27-6.18 3.73 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63L22 9.24l-5.46 4.73 1.64 7.03z" /></svg>
            <div className="text-white font-bold text-xl mt-2" style={{ fontFamily: 'Lato, sans-serif' }}>VIP</div>
            <div className="text-gray-300 text-xs" style={{ fontFamily: 'Lato, sans-serif' }}>Status</div>
          </div>
          <div className="flex flex-col items-center p-6 rounded-2xl border border-red-900 bg-gradient-to-br from-[#2F150D] to-[#4d1a1a] shadow-lg">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M3 17v-2a2 2 0 0 1 2-2h2v4H5a2 2 0 0 1-2-2Zm6 2v-6a2 2 0 0 1 2-2h2v8h-2a2 2 0 0 1-2-2Zm6-4v4a2 2 0 0 0 2 2h2v-6h-2a2 2 0 0 0-2 2Z" /></svg>
            <div className="text-white font-bold text-xl mt-2" style={{ fontFamily: 'Lato, sans-serif' }}>24/7</div>
            <div className="text-gray-300 text-xs" style={{ fontFamily: 'Lato, sans-serif' }}>Suporte</div>
          </div>
        </div>

        {/* Sobre e Suporte */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-black/80 rounded-2xl p-6 flex flex-col shadow-lg border border-gray-800">
            <h2 className="text-white font-bold text-lg mb-3 tracking-wide" style={{ fontFamily: 'Lato, sans-serif' }}>Sobre sua assinatura</h2>
            <p className="text-gray-200 text-justify leading-relaxed" style={{ fontSize: "14px", fontFamily: "Lato, sans-serif" }}>
              Seja muito bem-vindo à sua área VIP exclusiva! Aqui você tem acesso completo a todos os recursos premium da plataforma DJ Jéssica. Desfrute de downloads ilimitados, packs exclusivos, conteúdos em alta qualidade e muito mais. Nossa equipe trabalha constantemente para oferecer a melhor experiência musical para nossos clientes VIP. Explore todas as funcionalidades disponíveis e aproveite ao máximo sua assinatura premium. Em caso de dúvidas, nossa equipe de suporte está sempre disponível para ajudá-lo.
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-2xl p-6 flex flex-col shadow-lg border border-green-800">
            <h2 className="text-white font-bold text-lg mb-3 tracking-wide" style={{ fontFamily: 'Lato, sans-serif' }}>Suporte VIP</h2>
            <div className="flex items-center gap-3 mb-2">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#22c55e" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 17.93V20a1 1 0 1 1-2 0v-.07A8.001 8.001 0 0 1 4.07 13H4a1 1 0 1 1 0-2h.07A8.001 8.001 0 0 1 11 4.07V4a1 1 0 1 1 2 0v.07A8.001 8.001 0 0 1 19.93 11H20a1 1 0 1 1 0 2h-.07A8.001 8.001 0 0 1 13 19.93Z" /></svg>
              <span className="text-white font-bold">Atendimento 24/7</span>
            </div>
            <div className="text-white text-sm mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>Precisa de ajuda? Fale com nosso suporte VIP pelo WhatsApp: <a href="https://wa.me/SEUNUMEROAQUI" className="text-green-300 underline">Clique aqui</a></div>
            <div className="text-white text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>Ou envie um e-mail para <a href="mailto:support@djjessica.com" className="text-green-300 underline">support@djjessica.com</a></div>
          </div>
        </div>
      </div>
    </>
  );
}

