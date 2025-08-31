import React, { memo, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOptimizedNavigation } from '@/hooks/useOptimizedNavigation';

interface CommunitySlide {
    id: number;
    title: string;
    artist: string;
    image: string;
    link: string;
    badge: string;
}

interface OptimizedCommunityCarouselProps {
    slides: CommunitySlide[];
    autoPlayInterval?: number;
}

const OptimizedCommunityCarousel = memo(({
    slides,
    autoPlayInterval = 5000
}: OptimizedCommunityCarouselProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const { navigateTo } = useOptimizedNavigation();

    // Auto-play otimizado
    useEffect(() => {
        if (isHovered || slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [isHovered, slides.length, autoPlayInterval]);

    // Navegação otimizada
    const goToSlide = useCallback((index: number) => {
        setCurrentSlide(index);
    }, []);

    const goToPreviousSlide = useCallback(() => {
        setCurrentSlide((prev) => prev === 0 ? slides.length - 1 : prev - 1);
    }, [slides.length]);

    const goToNextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    // Navegação para o link do slide
    const handleSlideClick = useCallback((slide: CommunitySlide) => {
        navigateTo(slide.link);
    }, [navigateTo]);

    if (slides.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-[95%] mx-auto mt-6 sm:mt-8 mb-6 sm:mb-8 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 transition-all duration-300">
            {/* Header do carrossel */}
            <div className="flex items-center justify-between mb-3 sm:mb-6">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-1 h-4 sm:h-5 bg-gradient-to-b from-[#1db954] to-[#1ed760] rounded-full"></div>
                    <h2 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight">
                        O QUE TÁ ROLANDO
                    </h2>
                </div>

                {/* Controles de navegação */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={goToPreviousSlide}
                        className="p-2 sm:p-3 bg-[#181818]/80 hover:bg-[#282828]/90 rounded-lg sm:rounded-xl text-white transition-all duration-300 backdrop-blur-md border border-[#282828]/50 hover:border-[#3e3e3e]/70 hover:shadow-lg hover:shadow-[#1db954]/20 group"
                        title="Slide anterior"
                    >
                        <ChevronLeft size={18} className="sm:w-[22px] sm:h-[22px] group-hover:scale-110 transition-transform duration-200" />
                    </button>
                    <button
                        onClick={goToNextSlide}
                        className="p-2 sm:p-3 bg-[#181818]/80 hover:bg-[#282828]/90 rounded-lg sm:rounded-xl text-white transition-all duration-300 backdrop-blur-md border border-[#282828]/50 hover:border-[#3e3e3e]/70 hover:shadow-lg hover:shadow-[#1db954]/20 group"
                        title="Próximo slide"
                    >
                        <ChevronRight size={18} className="sm:w-[22px] sm:h-[22px] group-hover:scale-110 transition-transform duration-200" />
                    </button>
                </div>
            </div>

            {/* Container do carrossel */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#181818] border border-[#282828] shadow-2xl">
                {/* Slides container */}
                <div
                    className="flex transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {slides.map((slide) => (
                        <div key={slide.id} className="w-full flex-shrink-0">
                            {/* Mobile: Layout ultra-compacto */}
                            <div className="block sm:hidden">
                                <div className="relative h-32 sm:h-40 overflow-hidden group">
                                    {/* Background image com overlay */}
                                    <div className="absolute inset-0">
                                        <img
                                            src={slide.image}
                                            alt={slide.title}
                                            className="object-cover opacity-60 group-hover:opacity-80 transition-all duration-500 w-full h-full"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://i.ibb.co/Q7B5BSTz/20250513-1005-DJ-em-Balada-Brasileira-remix-01jv4vx7prex7a005qqn46ee4z.png';
                                            }}
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    </div>

                                    {/* Conteúdo mobile ultra-compacto */}
                                    <div className="relative z-10 h-full flex flex-col justify-end p-2 sm:p-3">
                                        {/* Badge no topo */}
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg backdrop-blur-md border border-green-400/30">
                                                {slide.badge}
                                            </span>
                                        </div>

                                        {/* Informações da música */}
                                        <div className="text-white">
                                            <h3 className="text-sm sm:text-base font-bold mb-1 line-clamp-1">
                                                {slide.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-[#b3b3b3] line-clamp-1">
                                                {slide.artist}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop: Layout completo */}
                            <div className="hidden sm:block">
                                <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden group">
                                    {/* Background image com overlay */}
                                    <div className="absolute inset-0">
                                        <img
                                            src={slide.image}
                                            alt={slide.title}
                                            className="object-cover opacity-60 group-hover:opacity-80 transition-all duration-500 w-full h-full"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://i.ibb.co/Q7B5BSTz/20250513-1005-DJ-em-Balada-Brasileira-remix-01jv4vx7prex7a005qqn46ee4z.png';
                                            }}
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    </div>

                                    {/* Conteúdo desktop */}
                                    <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-6 md:p-8">
                                        {/* Badge no topo */}
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg backdrop-blur-md border border-green-400/30">
                                                {slide.badge}
                                            </span>
                                        </div>

                                        {/* Informações da música */}
                                        <div className="text-white">
                                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                                                {slide.title}
                                            </h3>
                                            <p className="text-lg sm:text-xl text-[#b3b3b3] mb-4">
                                                {slide.artist}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Overlay clicável */}
                            <div
                                className="absolute inset-0 cursor-pointer z-20"
                                onClick={() => handleSlideClick(slide)}
                                title={`Clique para acessar ${slide.title}`}
                            />
                        </div>
                    ))}
                </div>

                {/* Indicadores de slide - Ocultos em mobile */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 hidden sm:flex">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-[#1db954] w-6' : 'bg-white/50 hover:bg-white/75'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

OptimizedCommunityCarousel.displayName = 'OptimizedCommunityCarousel';

export default OptimizedCommunityCarousel;

