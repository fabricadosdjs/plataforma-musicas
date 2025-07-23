import Link from 'next/link';
import { useEffect } from 'react';

export default function Custom404() {
  useEffect(() => {
    // Redirecionamento automático após 5 segundos
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#202124] text-white flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Página não encontrada</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          A página que você está procurando não existe ou foi movida.
        </p>
        
        <div className="space-x-4">
          <Link 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Você será redirecionado automaticamente em 5 segundos...
        </p>
      </div>
    </div>
  );
}