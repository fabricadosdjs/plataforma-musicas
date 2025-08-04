"use client";

import { useEffect, useState } from 'react';

export default function DynamicGradientBackground() {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = Math.min(scrollTop / Math.max(docHeight, 1), 1);
            setScrollProgress(progress);
        };

        // Adicionar listener de scroll
        window.addEventListener('scroll', handleScroll);

        // Chamar uma vez para definir o estado inicial
        handleScroll();

        // Cleanup
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Interpolação entre as cores
    const interpolateColor = (color1: string, color2: string, factor: number) => {
        // Converter hex para RGB
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');

        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);

        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);

        // Interpolar
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);

        return `rgb(${r}, ${g}, ${b})`;
    };

    const startColor = '#8B4513';
    const midColor = '#2F1B14';
    const endColor = '#0C0C0C';

    // Função para interpolação tripla de cores
    const interpolateTripleColor = (color1: string, color2: string, color3: string, factor: number) => {
        if (factor <= 0.5) {
            // Primeira metade: interpolar entre color1 e color2
            return interpolateColor(color1, color2, factor * 2);
        } else {
            // Segunda metade: interpolar entre color2 e color3
            return interpolateColor(color2, color3, (factor - 0.5) * 2);
        }
    };

    const currentColor = interpolateTripleColor(startColor, midColor, endColor, scrollProgress);

    return (
        <div
            className="fixed inset-0 -z-10 transition-colors duration-300"
            style={{
                background: `linear-gradient(135deg, ${startColor} 0%, ${midColor} 50%, ${currentColor} 100%)`
            }}
        />
    );
}
