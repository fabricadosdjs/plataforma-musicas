// src/app/global-error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-red-600 mb-4">Erro Global!</h2>
            <p className="text-gray-600 mb-8">Algo deu muito errado.</p>
            <button
              onClick={() => reset()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
