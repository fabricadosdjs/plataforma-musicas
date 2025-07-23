import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página principal após alguns segundos
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

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
          
          <button
            onClick={() => router.back()}
            className="inline-block bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Página Anterior
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Redirecionando automaticamente em 5 segundos...
        </p>
      </div>
    </div>
  );
}