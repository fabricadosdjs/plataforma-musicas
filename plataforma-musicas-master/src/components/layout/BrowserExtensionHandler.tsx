"use client";

import { useEffect } from 'react';

export default function BrowserExtensionHandler() {
    useEffect(() => {
        // Lidar com extensões que adicionam atributos ao body
        const handleBodyAttributes = () => {
            const body = document.body;

            // Remover atributos adicionados por extensões que podem causar problemas de hidratação
            const problematicAttributes = [
                'cz-shortcut-listen',
                'data-new-gr-c-s-check-loaded',
                'data-gr-ext-installed'
            ];

            problematicAttributes.forEach(attr => {
                if (body.hasAttribute(attr)) {
                    body.removeAttribute(attr);
                }
            });
        };

        // Executar após a hidratação
        handleBodyAttributes();

        // Observar mudanças no body para lidar com extensões que adicionam atributos dinamicamente
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.target === document.body) {
                    handleBodyAttributes();
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['cz-shortcut-listen', 'data-new-gr-c-s-check-loaded', 'data-gr-ext-installed']
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    return null;
} 