"use client";

import { AlertCircle, CheckCircle, Loader2, Music } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useState } from 'react';

export default function AddMusicPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== 'loading';
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    jsonData: ''
  });

  if (isLoaded && !user) {
    redirect('/auth/sign-in');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Validar JSON antes de enviar
      try {
        JSON.parse(formData.jsonData);
      } catch (jsonError) {
        setIsSuccess(false);
        setMessage('JSON inválido! Verifique a sintaxe do seu JSON.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/tracks/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: formData.jsonData
      });

      if (response.ok) {
        const result = await response.json();
        setIsSuccess(true);
        setMessage(result.message || 'Músicas adicionadas com sucesso!');
        setFormData({ jsonData: '' });
      } else {
        const errorText = await response.text();
        setIsSuccess(false);
        setMessage(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      setIsSuccess(false);
      setMessage('Erro de rede ou servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#202124' }}>
      <header className="p-4" style={{ backgroundColor: '#2d2f32' }}>
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Music size={24} />
            <span className="text-xl font-bold">DJ Pool - Adicionar Música</span>
          </Link>
          <div className="flex items-center gap-4">
            <span>Olá, {user?.name || user?.email}</span>
            <Link href="/admin" className="bg-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
              Voltar ao Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Adicionar Músicas em Lote</h1>

        {message && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${isSuccess ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {isSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              JSON das Músicas
            </label>
            <textarea
              value={formData.jsonData}
              onChange={(e) => setFormData({ ...formData, jsonData: e.target.value })}
              className="w-full h-96 p-4 border border-gray-600 rounded-lg text-white resize-none font-mono text-sm"
              style={{ backgroundColor: '#2d2f32' }}
              placeholder='Cole aqui o JSON das músicas...'
              required
              disabled={isLoading}
            />
            <p className="text-gray-400 text-sm mt-2">
              Cole aqui um array JSON com as músicas para adicionar ao banco de dados.
            </p>

            {/* Tutorial detalhado JSON */}
            <div className="mt-6 space-y-4">
              <div className="p-4 border border-gray-600 rounded-lg" style={{ backgroundColor: '#2d2f32' }}>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  📚 Tutorial: Como Adicionar Músicas via JSON
                </h4>

                <div className="space-y-4 text-sm">
                  <div>
                    <h5 className="font-semibold text-white mb-2">1. Formato Básico:</h5>
                    <p className="text-gray-300 mb-2">O JSON deve ser um array de objetos, onde cada objeto representa uma música:</p>
                    <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded overflow-auto">
                      {`[
  {
    "songName": "La Dolce Vita",
    "artist": "DJ Il Cubano", 
    "style": "House",
    "version": "Extended Mix",
    "imageUrl": "https://files.catbox.moe/cover.jpg",
    "previewUrl": "https://files.catbox.moe/preview.mp3",
    "downloadUrl": "https://files.catbox.moe/track.mp3",
    "releaseDate": "2025-07-22"
  },
  {
    "songName": "Summer Vibes",
    "artist": "Electronic Artist", 
    "style": "Deep House",
    "version": null,
    "imageUrl": "https://files.catbox.moe/cover2.jpg",
    "previewUrl": "https://files.catbox.moe/preview2.mp3",
    "downloadUrl": "https://files.catbox.moe/track2.mp3",
    "releaseDate": "2025-07-22"
  }
]`}
                    </pre>
                  </div>

                  <div>
                    <h5 className="font-semibold text-white mb-2">2. Campos Obrigatórios:</h5>
                    <ul className="text-gray-300 space-y-1 ml-4">
                      <li>• <code className="bg-gray-800 px-1 rounded">songName</code> - Nome da música</li>
                      <li>• <code className="bg-gray-800 px-1 rounded">artist</code> - Nome do artista</li>
                      <li>• <code className="bg-gray-800 px-1 rounded">style</code> - Gênero musical</li>
                      <li>• <code className="bg-gray-800 px-1 rounded">imageUrl</code> - URL da imagem da capa</li>
                      <li>• <code className="bg-gray-800 px-1 rounded">previewUrl</code> - URL para preview da música</li>
                      <li>• <code className="bg-gray-800 px-1 rounded">downloadUrl</code> - URL para download (preferencialmente Catbox)</li>
                      <li>• <code className="bg-gray-800 px-1 rounded">releaseDate</code> - Data no formato YYYY-MM-DD</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-white mb-2">3. Campos Opcionais:</h5>
                    <ul className="text-gray-300 space-y-1 ml-4">
                      <li>• <code className="bg-gray-800 px-1 rounded">version</code> - Versão (Original Mix, Extended, etc.) - pode ser <code>null</code></li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-white mb-2">3. Exemplo Prático:</h5>
                    <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded overflow-auto">
                      {`[
  {
    "songName": "Blinding Lights",
    "artist": "The Weeknd",
    "style": "Pop",
    "version": "Original Mix",
    "imageUrl": "https://example.com/cover1.jpg",
    "previewUrl": "https://example.com/preview1.mp3",
    "downloadUrl": "https://example.com/download1.mp3",
    "releaseDate": "2025-01-22"
  },
  {
    "songName": "Good 4 U",
    "artist": "Olivia Rodrigo", 
    "style": "Pop Rock",
    "version": "Radio Edit",
    "imageUrl": "https://example.com/cover2.jpg",
    "previewUrl": "https://example.com/preview2.mp3",
    "downloadUrl": "https://example.com/download2.mp3",
    "releaseDate": "2025-01-22"
  }
]`}
                    </pre>
                  </div>

                  <div>
                    <h5 className="font-semibold text-white mb-2">4. Dicas Importantes:</h5>
                    <ul className="text-gray-300 space-y-1 ml-4">
                      <li>• URLs devem ser válidas e acessíveis</li>
                      <li>• Data deve estar no formato YYYY-MM-DD</li>
                      <li>• JSON deve estar bem formatado (sem erros de sintaxe)</li>
                      <li>• Use preferencialmente <strong>files.catbox.moe</strong> para downloads</li>
                      <li>• Campo <code className="bg-gray-800 px-1 rounded">version</code> pode ser <code>null</code> se não houver versão específica</li>
                      <li>• Você pode adicionar múltiplas músicas de uma vez</li>
                      <li>• Verifique o arquivo <code className="bg-gray-800 px-1 rounded">exemplo-musicas.json</code> na raiz do projeto</li>
                    </ul>
                  </div>

                  <div className="bg-blue-900 bg-opacity-30 p-3 rounded border border-blue-700">
                    <p className="text-blue-200 text-xs">
                      💡 <strong>Dica Pro:</strong> Use um validador JSON online para verificar se seu JSON está correto antes de enviar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.jsonData.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processando...
              </>
            ) : (
              'Adicionar Músicas'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
