// src/app/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-red-600 mb-4">Algo deu errado!</h2>
                <p className="text-gray-600 mb-8">Ocorreu um erro inesperado.</p>
                <button
                    onClick={() => reset()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 mr-4"
                >
                    Tentar novamente
                </button>
                <a
                    href="/"
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Voltar ao início
                </a>
            </div>
        </div>
    )
}
