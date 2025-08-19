"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const handleReset = () => {
    if (typeof reset === 'function') {
      reset();
    } else {
      // Fallback: recarregar a página se reset não estiver disponível
      window.location.reload();
    }
  };

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Algo deu errado!
            </h2>
            <p className="text-gray-600 mb-4">
              Ocorreu um erro inesperado. Tente novamente.
            </p>
            <button
              onClick={handleReset}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}