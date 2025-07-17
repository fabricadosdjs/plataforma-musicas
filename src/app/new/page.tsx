"use client";

import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function NewPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <header className="w-full bg-white shadow-md p-4 flex justify-between items-center border-b border-gray-200 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">DJ Pool</h1>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="/new" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Novas</a>
          <a href="/trending" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">Em Alta</a>
          <a href="/featured" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">Destaques</a>
          <a href="/charts" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">Rankings</a>
          <a href="/pro" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">PRO</a>
        </nav>
        <div className="flex items-center gap-4">
            <SignedIn>
                <UserButton afterSignOutUrl="/"/>
            </SignedIn>
            <SignedOut>
                <a href="/sign-in" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                    Entrar
                </a>
            </SignedOut>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Músicas Recém-Adicionadas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl">
              <div className="relative w-full h-48 bg-gray-200">
                <img
                  src={`https://placehold.co/400x300/e9ecef/495057?text=Capa+${index + 1}`}
                  alt={`Capa da Música ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/f8f8f8/ff0000?text=Erro!'; }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={`Título da Música ${index + 1}`}>Título da Música {index + 1}</h3>
                <p className="text-sm text-gray-600 truncate" title="Nome do Artista">Nome do Artista</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">BPM: 128</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors font-semibold">
                    Baixar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="w-full bg-gray-100 text-center p-6 text-gray-600 border-t border-gray-200 mt-12">
        <p>&copy; {new Date().getFullYear()} DJ Pool App. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
