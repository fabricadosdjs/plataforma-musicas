// src/app/featured/page.tsx
"use client";

// Note: Metadata não pode ser exportada de componentes "use client"
// Para SEO, considere usar um componente Server Component wrapper

export default function FeaturedPage() {
  return (
    <div className="min-h-screen p-4 text-white z-0" style={{ backgroundColor: '#1B1C1D', zIndex: 0 }}>
      <h1 className="text-2xl font-bold mb-4 pt-20">Músicas em Destaque</h1>
      <p>Esta página exibirá as músicas em destaque. O conteúdo será implementado em breve.</p>
      {/* Você pode adicionar aqui a lógica para buscar e exibir as músicas em destaque */}
    </div>
  );
}
