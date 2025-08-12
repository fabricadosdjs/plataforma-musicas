"use client";

import { Download, ExternalLink, Play } from 'lucide-react';
import { useRef, useState } from 'react';

interface GoogleDrivePlayerProps {
  fileId: string;
  title: string;
  onPlay?: () => void;
  onPause?: () => void;
}

export default function GoogleDrivePlayer({ fileId, title, onPlay, onPause }: GoogleDrivePlayerProps) {
  const [showIframe, setShowIframe] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const googleDriveUrls = {
    preview: `https://drive.google.com/file/d/${fileId}/preview`,
    view: `https://drive.google.com/file/d/${fileId}/view`,
    download: `https://drive.google.com/uc?export=download&id=${fileId}`,
    embed: `https://drive.google.com/file/d/${fileId}/preview?usp=embed_facebook`,
  };

  const handlePlay = () => {
    setShowIframe(true);
    setIsPlaying(true);
    onPlay?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPause?.();
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-white text-lg font-semibold mb-4">
        🎵 {title} (Google Drive)
      </h3>

      <div className="space-y-4">
        {/* Controles principais */}
        <div className="flex gap-3 items-center">
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            <Play size={16} />
            Reproduzir via Preview
          </button>

          <button
            onClick={() => openInNewTab(googleDriveUrls.view)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            <ExternalLink size={16} />
            Abrir no Google Drive
          </button>

          <button
            onClick={() => openInNewTab(googleDriveUrls.download)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
          >
            <Download size={16} />
            Download Direto
          </button>
        </div>

        {/* Links alternativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {Object.entries(googleDriveUrls).map(([type, url]) => (
            <button
              key={type}
              onClick={() => openInNewTab(url)}
              className="text-left p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
            >
              <span className="font-medium text-blue-400 capitalize">{type}:</span>
              <br />
              <span className="text-gray-300 text-xs break-all">{url}</span>
            </button>
          ))}
        </div>

        {/* Iframe para preview */}
        {showIframe && (
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Google Drive Preview:</span>
              <button
                onClick={() => setShowIframe(false)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Fechar Preview
              </button>
            </div>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 */ }}>
              <iframe
                ref={iframeRef}
                src={googleDriveUrls.preview}
                className="absolute top-0 left-0 w-full h-full border-0 rounded"
                allow="autoplay; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-popups"
                title={`Google Drive Preview - ${title}`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Se o áudio não tocar automaticamente, clique no botão play dentro do preview ou use "Abrir no Google Drive"
            </p>
          </div>
        )}

        {/* Instruções */}
        <div className="bg-blue-900/30 border border-blue-600 rounded p-3 text-sm">
          <h4 className="font-medium text-blue-300 mb-2">🔧 Como usar:</h4>
          <ul className="text-blue-100 space-y-1 text-xs">
            <li>• <strong>Reproduzir via Preview:</strong> Mostra o player do Google Drive aqui mesmo</li>
            <li>• <strong>Abrir no Google Drive:</strong> Abre em nova aba para melhor controle</li>
            <li>• <strong>Download Direto:</strong> Baixa o arquivo (pode funcionar para reprodução)</li>
            <li>• <strong>Links alternativos:</strong> Teste diferentes formatos se um não funcionar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
