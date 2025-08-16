"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Style {
    id: number;
    name: string;
    color: string;
    count: number;
}

interface StylesSliderProps {
    styles: Style[];
}

export const StylesSlider = ({ styles }: StylesSliderProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showAllStyles, setShowAllStyles] = useState(false);

    // Itens por slide responsivos
    const getItemsPerSlide = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 640) return 4; // Mobile
            if (window.innerWidth < 1024) return 6; // Tablet
            return 8; // Desktop
        }
        return 8; // Default
    };

    const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());
    const totalSlides = Math.ceil(styles.length / itemsPerSlide);

    // Atualizar itens por slide quando a tela mudar
    React.useEffect(() => {
        const handleResize = () => {
            setItemsPerSlide(getItemsPerSlide());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const getCurrentStyles = () => {
        const start = currentSlide * itemsPerSlide;
        return styles.slice(start, start + itemsPerSlide);
    };

    return (
        <>
            {/* Slider de Estilos Principais */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-2xl font-bold text-white">Principais Estilos</h2>
                    <button
                        onClick={() => setShowAllStyles(true)}
                        className="text-red-400 hover:text-red-300 text-xs sm:text-sm font-medium"
                    >
                        Ver todos os estilos
                    </button>
                </div>

                <div className="relative">
                    {/* Botões de navegação */}
                    {totalSlides > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full backdrop-blur-sm"
                            >
                                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full backdrop-blur-sm"
                            >
                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                        </>
                    )}

                    {/* Grid de estilos - responsivo */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                        {getCurrentStyles().map((style) => (
                            <button
                                key={style.id}
                                onClick={() => window.location.href = `/new?style=${encodeURIComponent(style.name)}`}
                                className="group relative overflow-hidden rounded-lg aspect-square bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-200"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                <div className="relative z-10 h-full flex flex-col items-center justify-center p-1 sm:p-2 text-center">
                                    <span className="text-white font-semibold text-xs sm:text-sm leading-tight">
                                        {style.name}
                                    </span>
                                    <span className="text-gray-400 text-xs mt-1">
                                        {style.count}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Indicadores de slide */}
                    {totalSlides > 1 && (
                        <div className="flex justify-center mt-4 space-x-2">
                            {Array.from({ length: totalSlides }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentSlide(i)}
                                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${i === currentSlide ? 'bg-blue-500' : 'bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Modal com todos os estilos */}
            {showAllStyles && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-800">
                            <h3 className="text-xl font-bold text-white">Todos os Estilos</h3>
                            <button
                                onClick={() => setShowAllStyles(false)}
                                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="grid grid-cols-4 gap-4">
                                {styles.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => {
                                            window.location.href = `/new?style=${encodeURIComponent(style.name)}`;
                                            setShowAllStyles(false);
                                        }}
                                        className="group p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200 text-left"
                                    >
                                        <div className="font-semibold text-white mb-1">{style.name}</div>
                                        <div className="text-gray-400 text-sm">{style.count} músicas</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
