// src/components/PWAInstaller.tsx
"use client";
import { useEffect, useState } from "react";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // Registro do service worker desativado
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-[#181818] border border-[#282828] rounded-xl shadow-lg p-4 flex items-center gap-3 animate-fade-in">
      <span className="text-white font-semibold">Instale o app!</span>
      <button
        onClick={handleInstall}
        className="bg-[#1db954] hover:bg-[#1ed760] text-white px-4 py-2 rounded-lg font-bold transition-colors"
      >
        Instalar PWA
      </button>
    </div>
  );
}
