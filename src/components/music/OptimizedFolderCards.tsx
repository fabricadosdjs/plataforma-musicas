import React, { memo } from 'react';
import { useOptimizedNavigation } from '@/hooks/useOptimizedNavigation';

interface Folder {
    name: string;
    trackCount: number;
    imageUrl: string;
    lastUpdated: string;
    downloadCount: number;
}

interface OptimizedFolderCardsProps {
    folders: Folder[];
    loading: boolean;
    maxDisplay?: number;
}

const OptimizedFolderCards = memo(({
    folders,
    loading,
    maxDisplay = 9
}: OptimizedFolderCardsProps) => {
    const { navigateToFolder } = useOptimizedNavigation();

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

    if (folders.length === 0) {
        return (
            <div className="col-span-full text-center py-8">
                <p className="text-[#b3b3b3] text-sm">Nenhum folder recente encontrado</p>
            </div>
        );
    }

    const displayFolders = folders.slice(0, maxDisplay);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-2 sm:gap-3">
            {displayFolders.map((folder, index) => (
                <div
                    key={folder.name}
                    className={`group relative bg-gradient-to-br from-[#181818] to-[#282828] rounded-xl p-2 sm:p-3 border border-[#282828] hover:border-[#1db954]/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#1db954]/20 cursor-pointer ${index < maxDisplay ? 'ring-2 ring-[#1db954]/30' : ''
                        } ${index >= 4 ? 'hidden sm:block' : ''}`}
                    onClick={() => navigateToFolder(folder.name)}
                    title={`${folder.name} - ${folder.trackCount} músicas, ${folder.downloadCount} downloads`}
                >
                    {/* Badge de posição para top folders */}
                    {index < maxDisplay && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#1db954] to-[#1ed760] rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-xs font-bold">
                                {index + 1}
                            </span>
                        </div>
                    )}

                    {/* Imagem do folder */}
                    <div className="w-7 h-7 sm:w-9 sm:h-9 mx-auto mb-2 overflow-hidden rounded-lg">
                        <img
                            src={folder.imageUrl}
                            alt={folder.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/default-folder.jpg';
                            }}
                            loading="lazy"
                        />
                    </div>

                    {/* Nome do folder */}
                    <h3 className="text-white text-xs sm:text-sm font-bold mb-2 text-center line-clamp-2 leading-tight">
                        {folder.name}
                    </h3>

                    {/* Estatísticas */}
                    <div className="space-y-1 text-center">
                        <div className="text-[#1db954] text-xs font-semibold">
                            {folder.trackCount} músicas
                        </div>
                        <div className="text-[#b3b3b3] text-xs">
                            {folder.downloadCount} downloads
                        </div>
                    </div>

                    {/* Indicador de popularidade */}
                    <div className="mt-2 flex justify-center">
                        <div className="flex space-x-1">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i < Math.min(3, Math.ceil((folder.downloadCount / Math.max(...displayFolders.map(f => f.downloadCount))) * 3))
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

OptimizedFolderCards.displayName = 'OptimizedFolderCards';

export default OptimizedFolderCards;

