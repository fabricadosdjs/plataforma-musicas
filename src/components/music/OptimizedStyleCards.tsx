import React, { memo } from 'react';
import { useOptimizedNavigation } from '@/hooks/useOptimizedNavigation';

interface Style {
    name: string;
    trackCount: number;
    downloadCount: number;
}

interface OptimizedStyleCardsProps {
    styles: Style[];
    loading: boolean;
    maxDisplay?: number;
}

const OptimizedStyleCards = memo(({
    styles,
    loading,
    maxDisplay = 9
}: OptimizedStyleCardsProps) => {
    const { navigateToGenre } = useOptimizedNavigation();

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-2 sm:gap-3">
                {[...Array(maxDisplay)].map((_, index) => (
                    <div
                        key={index}
                        className={`bg-[#181818] rounded-xl p-2 sm:p-3 border border-[#282828] animate-pulse ${index >= 4 ? 'hidden sm:block' : ''
                            }`}
                    >
                        <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#282828] rounded-lg mx-auto mb-2"></div>
                        <div className="h-3 bg-[#282828] rounded mb-2"></div>
                        <div className="h-2 bg-[#282828] rounded mb-1"></div>
                        <div className="h-2 bg-[#282828] rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (styles.length === 0) {
        return (
            <div className="col-span-full text-center py-8">
                <p className="text-[#b3b3b3] text-sm">Nenhum estilo encontrado</p>
            </div>
        );
    }

    const displayStyles = styles.slice(0, maxDisplay);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-2 sm:gap-3">
            {displayStyles.map((style, index) => (
                <div
                    key={style.name}
                    className={`group relative bg-gradient-to-br from-[#181818] to-[#282828] rounded-xl p-2 sm:p-3 border border-[#282828] hover:border-[#1db954]/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#1db954]/20 cursor-pointer ${index < maxDisplay ? 'ring-2 ring-[#1db954]/30' : ''
                        } ${index >= 4 ? 'hidden sm:block' : ''}`}
                    onClick={() => navigateToGenre(style.name)}
                    title={`${style.name} - ${style.trackCount} músicas, ${style.downloadCount} downloads`}
                >
                    {/* Badge de posição para top estilos */}
                    {index < maxDisplay && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-xs font-bold">
                                {index + 1}
                            </span>
                        </div>
                    )}

                    {/* Ícone do estilo */}
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>

                    {/* Nome do estilo */}
                    <h3 className="text-white text-xs sm:text-sm font-bold mb-2 text-center line-clamp-2 leading-tight">
                        {style.name}
                    </h3>

                    {/* Estatísticas */}
                    <div className="space-y-1 text-center">
                        <div className="text-[#1db954] text-xs font-semibold">
                            {style.trackCount} músicas
                        </div>
                        <div className="text-[#b3b3b3] text-xs">
                            {style.downloadCount} downloads
                        </div>
                    </div>

                    {/* Indicador de popularidade */}
                    <div className="mt-2 flex justify-center">
                        <div className="flex space-x-1">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i < Math.min(3, Math.ceil((style.downloadCount / Math.max(...displayStyles.map(s => s.downloadCount))) * 3))
                                            ? 'bg-[#1db954]'
                                            : 'bg-[#535353]'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1db954]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
            ))}
        </div>
    );
});

OptimizedStyleCards.displayName = 'OptimizedStyleCards';

export default OptimizedStyleCards;

