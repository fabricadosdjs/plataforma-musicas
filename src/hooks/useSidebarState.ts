import { useState, useEffect } from 'react';

export const useSidebarState = () => {
    // Sidebar SEMPRE ABERTO - não pode ser fechado
    const [isSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detectar se é mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        // Verificar estado inicial
        checkMobile();

        // Listeners para mudanças
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Classes condicionais para o layout - MARGENS FIXAS E CONSISTENTES
    const getLayoutClasses = () => {
        if (isMobile) {
            return 'px-4 sm:px-6 md:px-8';
        }

        // IMPORTANTE: Margens FIXAS para manter consistência visual
        // Sidebar sempre aberto = margens sempre consistentes
        return 'lg:pl-8 lg:pr-8 xl:pl-10 xl:pr-10 2xl:pl-12 2xl:pr-12';
    };

    // Largura máxima condicional - LARGURA FIXA PARA SIDEBAR SEMPRE ABERTO
    const getMaxWidth = () => {
        if (isMobile) {
            return 'max-w-5xl';
        }

        // IMPORTANTE: Largura fixa para sidebar sempre aberto
        // O conteúdo se adapta internamente, mas o container mantém a mesma largura
        return 'max-w-5xl';
    };

    return {
        isSidebarOpen,
        isMobile,
        getLayoutClasses,
        getMaxWidth
    };
};
