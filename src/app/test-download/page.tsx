'use client';

import { useState } from 'react';

export default function TestDownloadPage() {
    const [testUrl, setTestUrl] = useState('');
    const [status, setStatus] = useState('');

    const testDownload = async () => {
        if (!testUrl) {
            setStatus('Por favor, insira uma URL');
            return;
        }

        try {
            setStatus('Testando download...');

            // Testar se a URL é acessível
            const response = await fetch(testUrl);

            if (!response.ok) {
                setStatus(`Erro HTTP: ${response.status}`);
                return;
            }

            setStatus('URL acessível, tentando download...');

            // Tentar fazer o download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'test-file.mp3';
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setStatus(`Download concluído! Tamanho: ${blob.size} bytes`);
        } catch (error) {
            setStatus(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Teste de Download</h1>

                <div className="bg-[#181818] rounded-xl p-6 border border-[#282828]">
                    <div className="mb-4">
                        <label className="block text-white mb-2">URL para testar:</label>
                        <input
                            type="text"
                            value={testUrl}
                            onChange={(e) => setTestUrl(e.target.value)}
                            placeholder="https://exemplo.com/arquivo.mp3"
                            className="w-full p-3 bg-[#282828] text-white rounded-lg border border-[#3e3e3e]"
                        />
                    </div>

                    <button
                        onClick={testDownload}
                        className="px-6 py-3 bg-[#1db954] text-white rounded-lg hover:bg-[#1ed760] transition-colors"
                    >
                        Testar Download
                    </button>

                    {status && (
                        <div className="mt-4 p-4 bg-[#282828] rounded-lg">
                            <p className="text-white">{status}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}




