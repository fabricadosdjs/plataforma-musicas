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

    const startColor = '#27222C';
    const endColor = '#0C0C0C';
    const currentColor = interpolateColor(startColor, endColor, scrollProgress);

    return (
        <div
            className="fixed inset-0 -z-10 transition-colors duration-100"
            style={{
                background: `linear-gradient(to bottom, ${startColor}, ${currentColor})`
            }}
        />
    );
}
