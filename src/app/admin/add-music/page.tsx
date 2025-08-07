"use client";

import { AlertCircle, CheckCircle, Loader2, Music } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { AdminAuth } from '@/components/admin/AdminAuth';

export default function AddMusicPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== 'loading';
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    jsonData: ''
  });
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<any>(null);


  if (isLoaded && !user) {
    redirect('/auth/sign-in');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Validar JSON antes de enviar
      let tracks;
      try {
        tracks = JSON.parse(formData.jsonData);
        if (!Array.isArray(tracks)) {
          setIsSuccess(false);
          setMessage('JSON deve ser um array de músicas');
          setIsLoading(false);
          return;
        }
      } catch (jsonError) {
        setIsSuccess(false);
        setMessage('JSON inválido! Verifique a sintaxe do seu JSON.');
        setIsLoading(false);
        return;
      }

      // Processar datas para timezone do Brasil
      const processedTracks = tracks.map((track: any) => {
        if (track.releaseDate) {
          // Converter para timezone do Brasil
          const brazilDate = new Date(new Date(track.releaseDate).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
          return {
            ...track,
            releaseDate: brazilDate.toISOString().split('T')[0] // Formato YYYY-MM-DD
          };
        }
        return track;
      });

      const response = await fetch('/api/tracks/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedTracks)
      });

      if (response.ok) {
        const result = await response.json();
        setIsSuccess(true);
        setMessage(result.message || 'Músicas adicionadas com sucesso!');
        setImportResult(result);
        setFormData({ jsonData: '' });
      } else {
        const errorText = await response.text();
        setIsSuccess(false);
        setMessage(`Erro ${response.status}: ${errorText}`);
        setImportResult(null);
      }
    } catch (error) {
      console.error('Erro:', error);
      setIsSuccess(false);
      setMessage('Erro de rede ou servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const checkDuplicates = async () => {
    if (!formData.jsonData.trim()) {
      setMessage('Por favor, insira dados JSON primeiro');
      return;
    }

    try {
      // Validar JSON antes de enviar
      let tracks;
      try {
        tracks = JSON.parse(formData.jsonData);
        if (!Array.isArray(tracks)) {
          setMessage('JSON deve ser um array de músicas');
          return;
        }
      } catch (jsonError) {
        setMessage('JSON inválido! Verifique a sintaxe do seu JSON.');
        return;
      }

      setCheckingDuplicates(true);
      setMessage('');

      // Processar datas para timezone do Brasil
      const processedTracks = tracks.map((track: any) => {
        if (track.releaseDate) {
          // Converter para timezone do Brasil
          const brazilDate = new Date(new Date(track.releaseDate).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
          return {
            ...track,
            releaseDate: brazilDate.toISOString().split('T')[0] // Formato YYYY-MM-DD
          };
        }
        return track;
      });

      const response = await fetch('/api/tracks/check-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedTracks)
      });

      if (response.ok) {
        const result = await response.json();
        setDuplicateCheckResult(result);
        setMessage(`✅ Verificação concluída: ${result.summary.unique} únicas, ${result.summary.duplicates} duplicadas`);
      } else {
        const errorText = await response.text();
        setMessage(`❌ Erro na verificação: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
      setMessage('❌ Erro de rede ao verificar duplicatas');
    } finally {
      setCheckingDuplicates(false);
    }
  };

  return (
    <AdminAuth>
      <div className="min-h-screen text-white bg-[#1B1C1D]">
        <header className="p-4 bg-[#2D2E2F]">
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

          {/* Resumo detalhado da importação */}
          {importResult && importResult.success && (
            <div className="bg-[#2D2E2F] border border-[#3D3E3F] rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Resumo da Importação
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#1B1C1D] p-4 rounded-lg border border-[#3D3E3F]">
                  <div className="text-2xl font-bold text-blue-400">{importResult.summary.received}</div>
                  <div className="text-sm text-gray-400">Total Recebido</div>
                </div>
                <div className="bg-[#1B1C1D] p-4 rounded-lg border border-[#3D3E3F]">
                  <div className="text-2xl font-bold text-green-400">{importResult.summary.inserted}</div>
                  <div className="text-sm text-gray-400">Inseridas</div>
                </div>
                <div className="bg-[#1B1C1D] p-4 rounded-lg border border-[#3D3E3F]">
                  <div className="text-2xl font-bold text-yellow-400">{importResult.summary.unique}</div>
                  <div className="text-sm text-gray-400">Únicas</div>
                </div>
                <div className="bg-[#1B1C1D] p-4 rounded-lg border border-[#3D3E3F]">
                  <div className="text-2xl font-bold text-red-400">{importResult.summary.duplicates}</div>
                  <div className="text-sm text-gray-400">Duplicadas</div>
                </div>
              </div>

              {/* Lista de duplicados */}
              {importResult.duplicates && importResult.duplicates.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    Músicas Não Importadas ({importResult.duplicates.length})
                  </h4>
                  <div className="bg-[#1B1C1D] rounded-lg p-4 max-h-60 overflow-y-auto">
                    <ul className="space-y-2">
                      {importResult.duplicates.map((duplicate: string, index: number) => (
                        <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          {duplicate}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg">
                    <p className="text-blue-200 text-sm">
                      💡 <strong>Dica:</strong> Estas músicas já existem no banco de dados.
                      Se você quiser adicioná-las novamente, primeiro remova as versões existentes
                      ou use dados diferentes (URLs diferentes).
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setImportResult(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                >
                  Limpar Resumo
                </button>
              </div>
            </div>
          )}

          {/* Resultado da verificação de duplicatas */}
          {duplicateCheckResult && (
            <div className="bg-[#2D2E2F] border border-[#3D3E3F] rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                Verificação de Duplicatas
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#1B1C1D] p-4 rounded-lg border border-[#3D3E3F]">
                  <div className="text-2xl font-bold text-blue-400">{duplicateCheckResult.summary.total}</div>
                  <div className="text-sm text-gray-400">Total Verificado</div>
                </div>
                <div className="bg-[#1B1C1D] p-4 rounded-lg border border-[#3D3E3F]">
                  <div className="text-2xl font-bold text-green-400">{duplicateCheckResult.summary.unique}</div>
                  <div className="text-sm text-gray-400">Únicas</div>
                </div>
                <div className="bg-[#1B1C1D] p-4 rounded-lg border border-[#3D3E3F]">
                  <div className="text-2xl font-bold text-red-400">{duplicateCheckResult.summary.duplicates}</div>
                  <div className="text-sm text-gray-400">Duplicadas</div>
                </div>
              </div>

              {/* Lista de duplicatas encontradas */}
              {duplicateCheckResult.duplicates && duplicateCheckResult.duplicates.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Músicas Duplicadas Encontradas ({duplicateCheckResult.duplicates.length})
                  </h4>
                  <div className="bg-[#1B1C1D] rounded-lg p-4 max-h-60 overflow-y-auto">
                    <ul className="space-y-3">
                      {duplicateCheckResult.duplicates.map((duplicate: any, index: number) => (
                        <li key={index} className="text-sm text-gray-300 border-l-2 border-red-400 pl-3">
                          <div className="font-medium">{duplicate.track.artist} - {duplicate.track.songName}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Motivo: {duplicate.reason}
                            {duplicate.existingTrack && (
                              <div className="mt-1">
                                Já existe: ID {duplicate.existingTrack.id} - {duplicate.existingTrack.artist} - {duplicate.existingTrack.songName}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDuplicateCheckResult(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                >
                  Limpar Verificação
                </button>
              </div>
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
                className="w-full h-96 p-4 border border-[#3D3E3F] rounded-xl text-white resize-none font-mono text-sm bg-[#2D2E2F] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
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
                      <h5 className="font-semibold text-white mb-2">1. Campos Obrigatórios:</h5>
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
                      <h5 className="font-semibold text-white mb-2">2. Campos Opcionais:</h5>
                      <ul className="text-gray-300 space-y-1 ml-4">
                        <li>• <code className="bg-gray-800 px-1 rounded">version</code> - Versão (Original Mix, Extended, etc.) - pode ser <code>null</code></li>
                        <li>• <code className="bg-gray-800 px-1 rounded">pool</code> - Nome do pool/gravadora</li>
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
    "pool": "Republic Records",
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
    "pool": "Geffen Records",
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
                        <li>• Campo <code className="bg-gray-800 px-1 rounded">pool</code> é opcional e representa a gravadora/pool</li>
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

            <div className="flex gap-4">
              <button
                type="button"
                onClick={checkDuplicates}
                disabled={checkingDuplicates || !formData.jsonData.trim()}
                className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-yellow-500/20 transform hover:scale-105 disabled:transform-none"
              >
                {checkingDuplicates ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Verificando...
                  </>
                ) : (
                  <>
                    <AlertCircle size={20} />
                    Verificar Duplicatas
                  </>
                )}
              </button>

              <button
                type="submit"
                disabled={isLoading || !formData.jsonData.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processando...
                  </>
                ) : (
                  <>
                    <Music size={20} />
                    Adicionar Músicas
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminAuth>
  );
}
