import React from 'react';

// Componente de Loading estilo Facebook para diferentes elementos
export const FacebookSkeleton = () => (
    <div className="animate-pulse">
        <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
            </div>
        </div>
    </div>
);

// Componente de Loading para a tabela
export const TableSkeleton = () => (
    <div className="animate-pulse">
        <div className="hidden md:table min-w-full">
            <thead className="sticky top-0 z-10 bg-[#1A1B1C]/80 backdrop-blur-sm">
                <tr className="border-b border-zinc-800">
                    <th className="px-4 py-3 w-[35%]">
                        <div className="h-4 bg-gray-700 rounded w-24"></div>
                    </th>
                    <th className="px-4 py-3 w-[15%]">
                        <div className="h-4 bg-gray-700 rounded w-16"></div>
                    </th>
                    <th className="px-4 py-3 w-[15%]">
                        <div className="h-4 bg-gray-700 rounded w-12"></div>
                    </th>
                    <th className="px-4 py-3 w-[35%] text-right">
                        <div className="h-4 bg-gray-700 rounded w-20 ml-auto"></div>
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
                {Array.from({ length: 10 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-3">
                            <div className="h-6 bg-gray-700 rounded w-20"></div>
                        </td>
                        <td className="px-4 py-3">
                            <div className="h-6 bg-gray-700 rounded w-16"></div>
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </div>

        <div className="md:hidden space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse p-4 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-700 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                            <div className="flex gap-2">
                                <div className="h-6 bg-gray-700 rounded w-16"></div>
                                <div className="h-6 bg-gray-700 rounded w-12"></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-3">
                        <div className="w-8 h-8 bg-gray-700 rounded"></div>
                        <div className="w-8 h-8 bg-gray-700 rounded"></div>
                        <div className="w-8 h-8 bg-gray-700 rounded"></div>
                        <div className="w-8 h-8 bg-gray-700 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Componente de Loading para cards
export const CardSkeleton = () => (
    <div className="animate-pulse p-6 bg-zinc-800/50 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
            <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-16"></div>
            </div>
        </div>
    </div>
);

// Componente de Loading para página completa
export const PageSkeleton = () => (
    <div className="animate-pulse">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
            </div>
            <div className="h-12 bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-1/2 mx-auto"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl">
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="flex-1 h-10 bg-gray-700 rounded"></div>
                <div className="w-24 h-10 bg-gray-700 rounded"></div>
            </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
                <CardSkeleton key={index} />
            ))}
        </div>

        {/* Table Skeleton */}
        <div className="w-full">
            <TableSkeleton />
        </div>
    </div>
);

// Componente de Loading para botões
export const ButtonSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-10 bg-gray-700 rounded-lg w-24"></div>
    </div>
);

// Componente de Loading para inputs
export const InputSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-12 bg-gray-700 rounded-lg w-full"></div>
    </div>
);

// Componente de Loading para imagens
export const ImageSkeleton = ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-700 rounded-lg ${className}`}></div>
);

// Componente de Loading para texto
export const TextSkeleton = ({ lines = 1, className = "w-full" }: { lines?: number, className?: string }) => (
    <div className="animate-pulse space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
            <div key={index} className={`h-4 bg-gray-700 rounded ${className}`}></div>
        ))}
    </div>
);

// Componente de Loading para listas
export const ListSkeleton = ({ items = 5 }: { items?: number }) => (
    <div className="animate-pulse space-y-3">
        {Array.from({ length: items }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
        ))}
    </div>
);

// Componente de Loading para grids
export const GridSkeleton = ({ cols = 3, rows = 2 }: { cols?: number, rows?: number }) => (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-6 animate-pulse`}>
        {Array.from({ length: cols * rows }).map((_, index) => (
            <CardSkeleton key={index} />
        ))}
    </div>
);

// Componente de Loading para modais
export const ModalSkeleton = () => (
    <div className="animate-pulse">
        <div className="bg-zinc-800/90 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="h-6 bg-gray-700 rounded w-32"></div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-4">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <div className="h-10 bg-gray-700 rounded w-20"></div>
                <div className="h-10 bg-gray-700 rounded w-24"></div>
            </div>
        </div>
    </div>
);

export default {
    FacebookSkeleton,
    TableSkeleton,
    CardSkeleton,
    PageSkeleton,
    ButtonSkeleton,
    InputSkeleton,
    ImageSkeleton,
    TextSkeleton,
    ListSkeleton,
    GridSkeleton,
    ModalSkeleton
}; 