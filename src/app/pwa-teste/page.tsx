import PWAInstaller from "@/components/PWAInstaller";

export default function PWATestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212]">
      <h1 className="text-3xl text-white mb-6">Teste do Instalador PWA</h1>
      <PWAInstaller />
      <p className="text-[#b3b3b3] mt-4">Adicione o app à sua tela inicial para uma experiência completa!</p>
    </div>
  );
}
