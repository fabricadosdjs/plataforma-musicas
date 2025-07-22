// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <h2 className="text-6xl font-bold text-gray-900 mb-4">404</h2>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Página não encontrada</h3>
                <p className="text-gray-600 mb-8">A página que você está procurando não existe.</p>
                <Link
                    href="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Voltar ao início
                </Link>
            </div>
        </div>
    )
}
