// Utilitário para downloads robustos
// src/utils/downloadUtils.ts

// Utilitário para downloads robustos
// src/utils/downloadUtils.ts

export const forceDownload = async (url: string, filename: string): Promise<void> => {
    try {
        console.log('Iniciando download:', { url, filename });

        // Método 1: Para Catbox, tentar usar proxy do servidor primeiro
        if (url.includes('catbox.moe') || url.includes('files.catbox.moe')) {
            try {
                console.log('Detectado link Catbox, tentando proxy do servidor');

                const proxyUrl = `/api/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
                const link = document.createElement('a');
                link.href = proxyUrl;
                link.download = filename;
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    document.body.removeChild(link);
                }, 1000);

                console.log('Download via proxy iniciado');
                return;

            } catch (proxyError) {
                console.log('Proxy falhou, tentando método direto:', proxyError);
            }
        }

        // Método 2: Para Catbox, fetch direto com headers corretos
        if (url.includes('catbox.moe') || url.includes('files.catbox.moe')) {
            try {
                console.log('Tentando fetch direto no Catbox');

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'audio/mpeg, application/octet-stream, */*',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://catbox.moe/',
                    },
                    mode: 'cors',
                });

                if (response.ok) {
                    console.log('Resposta Catbox OK, criando blob');
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = objectUrl;
                    link.download = filename;
                    link.style.display = 'none';

                    document.body.appendChild(link);
                    link.click();

                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(objectUrl);
                    }, 1000);

                    console.log('Download Catbox direto iniciado com sucesso');
                    return;
                }
            } catch (catboxError) {
                console.log('Método Catbox direto falhou:', catboxError);
            }
        }

        // Método 3: Fetch + blob para máximo controle (outros hosts)
        try {
            console.log('Tentando fetch genérico');
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'audio/mpeg, application/octet-stream, */*',
                },
            });

            if (response.ok) {
                console.log('Fetch genérico OK, criando blob');
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = objectUrl;
                link.download = filename;
                link.style.display = 'none';
                link.target = '_blank';
                link.rel = 'noopener noreferrer';

                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(objectUrl);
                }, 1000);

                console.log('Download genérico iniciado com sucesso');
                return;
            }
        } catch (fetchError) {
            console.log('Fetch method failed, using direct link method:', fetchError);
        }

        // Método 4: Link direto com força (fallback)
        console.log('Usando método de link direto');
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        // Forçar download no Catbox
        if (url.includes('catbox.moe') || url.includes('files.catbox.moe')) {
            link.setAttribute('crossorigin', 'anonymous');
        }

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
        }, 2000);

        console.log('Link direto executado');

    } catch (error) {
        console.error('Erro no download:', error);

        // Método 5: Último recurso - window.open com download forçado
        console.log('Usando último recurso - window.open');
        try {
            // Para Catbox, adicionar parâmetros de download
            let downloadUrl = url;
            if (url.includes('catbox.moe') || url.includes('files.catbox.moe')) {
                downloadUrl = url + (url.includes('?') ? '&' : '?') + 'download=1';
            }

            const downloadWindow = window.open(downloadUrl, '_blank');
            if (downloadWindow) {
                setTimeout(() => {
                    try {
                        downloadWindow.close();
                    } catch (e) {
                        console.log('Não foi possível fechar a janela automaticamente');
                    }
                }, 5000);
            }
        } catch (windowError) {
            console.error('Erro no window.open:', windowError);
            // Se tudo falhar, pelo menos abrir o link
            window.location.href = url;
        }
    }
};

export default forceDownload;
