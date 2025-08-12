// Detector de extensões que podem baixar mídia
export class DownloadExtensionDetector {
  private static readonly EXTENSION_SIGNATURES = {
    // DownloadHelper
    'downloadhelper': {
      selectors: ['#dhx-container', '.dhx-download', '[data-downloadhelper]'],
      globals: ['DownloadHelper', 'dhx'],
      attributes: ['data-downloadhelper', 'dhx-download']
    },
    // Video DownloadHelper
    'videodownloadhelper': {
      selectors: ['.vdh-container', '#vdh-download'],
      globals: ['VideoDownloadHelper', 'vdh'],
      attributes: ['data-vdh', 'vdh-download']
    },
    // Video Downloader Professional
    'videodownloaderpro': {
      selectors: ['.vdp-container', '#vdp-download'],
      globals: ['VideoDownloaderPro', 'vdp'],
      attributes: ['data-vdp', 'vdp-download']
    },
    // Flash Video Downloader
    'flashvideodownloader': {
      selectors: ['.fvd-container', '#fvd-download'],
      globals: ['FlashVideoDownloader', 'fvd'],
      attributes: ['data-fvd', 'fvd-download']
    },
    // Video Downloader Plus
    'videodownloaderplus': {
      selectors: ['.vdp-plus-container', '#vdp-plus-download'],
      globals: ['VideoDownloaderPlus', 'vdpPlus'],
      attributes: ['data-vdp-plus', 'vdp-plus-download']
    },
    // Media Downloader
    'mediadownloader': {
      selectors: ['.md-container', '#md-download'],
      globals: ['MediaDownloader', 'md'],
      attributes: ['data-md', 'md-download']
    }
  };

  static detectExtensions(): string[] {
    const detectedExtensions: string[] = [];

    // Verificar se estamos no browser
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return detectedExtensions;
    }

    // Verificar por elementos DOM
    for (const [name, signatures] of Object.entries(this.EXTENSION_SIGNATURES)) {
      // Verificar seletores CSS
      for (const selector of signatures.selectors) {
        if (document.querySelector(selector)) {
          detectedExtensions.push(name);
          break;
        }
      }

      // Verificar variáveis globais
      for (const globalVar of signatures.globals) {
        if (typeof (window as any)[globalVar] !== 'undefined') {
          detectedExtensions.push(name);
          break;
        }
      }

      // Verificar atributos em elementos
      for (const attr of signatures.attributes) {
        if (document.querySelector(`[${attr}]`)) {
          detectedExtensions.push(name);
          break;
        }
      }
    }

    // Verificar por padrões comuns de extensões
    const commonPatterns = [
      'downloadhelper',
      'videodownloader',
      'mediadownloader',
      'flashvideodownloader',
      'videodownloaderpro',
      'videodownloaderplus'
    ];

    // Verificar se há elementos com classes ou IDs que contenham esses padrões
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
      try {
        // Verificar se className é uma string (pode ser SVGAnimatedString em elementos SVG)
        const className = typeof element.className === 'string'
          ? element.className.toLowerCase()
          : '';
        const id = typeof element.id === 'string'
          ? element.id.toLowerCase()
          : '';

        for (const pattern of commonPatterns) {
          if (className.includes(pattern) || id.includes(pattern)) {
            if (!detectedExtensions.includes(pattern)) {
              detectedExtensions.push(pattern);
            }
          }
        }
      } catch (error) {
        // Ignorar erros de elementos que não têm as propriedades esperadas
        console.warn('Erro ao verificar elemento para extensões:', error);
        continue;
      }
    }

    return [...new Set(detectedExtensions)]; // Remove duplicatas
  }

  static isDownloadExtensionActive(): boolean {
    return this.detectExtensions().length > 0;
  }

  static getDetectedExtensions(): string[] {
    return this.detectExtensions();
  }
} 