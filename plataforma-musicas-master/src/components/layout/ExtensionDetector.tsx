"use client";

import { useEffect } from 'react';
import { useDownloadExtensionDetector } from '@/hooks/useDownloadExtensionDetector';
import { useToast } from '@/hooks/useToast';

export const ExtensionDetector = () => {
  const { detectedExtensions, hasExtension } = useDownloadExtensionDetector();
  const { showToast } = useToast();

  useEffect(() => {
    if (hasExtension && detectedExtensions.length > 0) {
      const extensionNames = detectedExtensions
        .map(ext => ext.charAt(0).toUpperCase() + ext.slice(1))
        .join(', ');

      const isMusicPage = window.location.pathname.includes('/new') ||
        window.location.pathname.includes('/trending') ||
        window.location.pathname.includes('/music');

      const message = isMusicPage
        ? `⚠️ Extensão de download detectada: ${extensionNames}. O uso de extensões para baixar músicas é PROIBIDO e pode resultar no cancelamento do seu plano. Desative a extensão para continuar usando a plataforma.`
        : `⚠️ Extensão de download detectada: ${extensionNames}. O uso de extensões para baixar músicas é PROIBIDO e pode resultar no cancelamento do seu plano.`;

      showToast(message, 'warning', 10000); // 10 segundos para extensões
    }
  }, [hasExtension, detectedExtensions, showToast]);

  return null; // Componente invisível
}; 