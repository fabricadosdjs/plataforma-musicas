import { useState, useEffect } from 'react';
import { DownloadExtensionDetector } from '@/utils/downloadDetector';
import { useToast } from './useToast';

export const useDownloadExtensionDetector = () => {
  const [detectedExtensions, setDetectedExtensions] = useState<string[]>([]);
  const [hasExtension, setHasExtension] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const checkExtensions = () => {
      // Usar detecção de extensões
      const extensions = DownloadExtensionDetector.detectExtensions();

      // Debug: log das extensões detectadas
      console.log('🔍 Extensões detectadas:', extensions);

      setDetectedExtensions(extensions);
      setHasExtension(extensions.length > 0);

      // Se detectou extensões e ainda não mostrou o aviso
      if (extensions.length > 0 && !hasExtension) {
        const warningMessage = getWarningMessage(extensions);
        showToast(warningMessage.message, warningMessage.type);
        console.log('⚠️ Aviso de extensão mostrado:', warningMessage.message);
      }
    };

    // Verificar imediatamente
    checkExtensions();

    // Verificar periodicamente (a cada 2 segundos para páginas de música)
    const interval = setInterval(checkExtensions, 2000);

    // Verificar quando a página ganha foco
    const handleFocus = () => {
      checkExtensions();
    };

    // Verificar quando o mouse se move (para detectar extensões que aparecem no hover)
    const handleMouseMove = () => {
      // Só verificar ocasionalmente para não impactar performance
      if (Math.random() < 0.2) { // 20% de chance
        checkExtensions();
      }
    };

    // Verificar quando há mudanças no DOM
    const handleDOMChange = () => {
      checkExtensions();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('mousemove', handleMouseMove);

    // Observar mudanças no DOM
    const observer = new MutationObserver(handleDOMChange);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'data-*']
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, [hasExtension, showToast]);

  const getWarningMessage = (extensions: string[]) => {
    const extensionNames = extensions
      .map(ext => ext.charAt(0).toUpperCase() + ext.slice(1))
      .join(', ');

    // Mensagem mais específica para páginas de música
    const isMusicPage = window.location.pathname.includes('/new') ||
      window.location.pathname.includes('/trending') ||
      window.location.pathname.includes('/music');

    const message = isMusicPage
      ? `⚠️ Extensão de download detectada: ${extensionNames}. O uso de extensões para baixar músicas é PROIBIDO e pode resultar no cancelamento do seu plano. Desative a extensão para continuar usando a plataforma.`
      : `⚠️ Extensão de download detectada: ${extensionNames}. O uso de extensões para baixar músicas é PROIBIDO e pode resultar no cancelamento do seu plano.`;

    return {
      message,
      type: 'warning' as const
    };
  };

  return {
    detectedExtensions,
    hasExtension
  };
}; 