// Utilitário para downloads robustos
// src/utils/downloadUtils.ts

export const forceDownload = async (url: string, filename: string): Promise<void> => {
    try {
        // Método 1: Tentar fetch + blob para máximo controle
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'audio/mpeg, application/octet-stream, */*',
                },
            });

            if (response.ok) {
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
                }, 100);

                return;
            }
        } catch (fetchError) {
            console.log('Fetch method failed, using direct link method');
        }

        // Método 2: Link direto (fallback)
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        // Adicionar event listener para garantir comportamento correto
        link.addEventListener('click', (e) => {
            // Não prevenir default aqui para permitir download
            setTimeout(() => {
                if (document.body.contains(link)) {
                    document.body.removeChild(link);
                }
            }, 1000);
        });

        document.body.appendChild(link);
        link.click();

        // Fallback de limpeza
        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
        }, 2000);

    } catch (error) {
        console.error('Erro no download:', error);

        // Método 3: Último recurso - window.open com download
        const downloadWindow = window.open(url, '_blank');
        if (downloadWindow) {
            // Tentar fechar a janela após um tempo
            setTimeout(() => {
                try {
                    downloadWindow.close();
                } catch (e) {
                    // Silenciar erro se não conseguir fechar
                }
            }, 3000);
        }
    }
};

export default forceDownload;
