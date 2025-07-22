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
    <html lang="pt-BR">
      <body>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#dc2626', 
              marginBottom: '1rem' 
            }}>
              Erro Global!
            </h2>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '2rem' 
            }}>
              Algo deu muito errado.
            </p>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: 'bold',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}