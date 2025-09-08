import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ProgressiveLoadingBarProps {
    loaded: number;
    total: number;
    isLoading: boolean;
    isComplete: boolean;
    error: Error | null;
    onRetry?: () => void;
    onLoadMore?: () => void;
    showLoadMoreButton?: boolean;
}

export const ProgressiveLoadingBar: React.FC<ProgressiveLoadingBarProps> = ({
    loaded,
    total,
    isLoading,
    isComplete,
    error,
    onRetry,
    onLoadMore,
    showLoadMoreButton = true
}) => {
    const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;
    const isIndeterminate = total === 0 && isLoading;

    return (
        <div className="w-full mb-4">
            {/* Indicador de status */}
            <div className="flex items-center justify-center">
                {isLoading && !isIndeterminate && (
                    <div className="flex items-center gap-2 text-xs text-white font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{loaded} de {total} músicas carregadas</span>
                    </div>
                )}

                {isIndeterminate && (
                    <div className="flex items-center gap-2 text-xs text-white font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Carregando músicas...</span>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 text-xs text-white font-medium">
                        <AlertCircle className="w-3 h-3" />
                        <span>Erro ao carregar</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Componente de botão para carregar mais
export const LoadMoreButton: React.FC<{
    onClick: () => void;
    isLoading: boolean;
    isComplete: boolean;
    loaded: number;
    total: number;
}> = ({ onClick, isLoading, isComplete, loaded, total }) => {
    if (isComplete) return null;

    return (
        <div className="flex justify-center mt-6 mb-8">
            <button
                onClick={onClick}
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isLoading
                    ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                    }`}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Carregando...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span>Carregar Mais Músicas</span>
                        <span className="text-sm opacity-75">({loaded} de {total})</span>
                    </div>
                )}
            </button>
        </div>
    );
};

// Componente de erro com botão de retry
export const ErrorRetryButton: React.FC<{
    error: Error;
    onRetry: () => void;
}> = ({ error, onRetry }) => {
    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Erro ao carregar músicas</span>
            </div>

            <p className="text-sm text-red-500 dark:text-red-400 text-center max-w-md">
                {(error as Error).message || 'Ocorreu um erro inesperado ao carregar as músicas.'}
            </p>

            <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
                Tentar Novamente
            </button>
        </div>
    );
};

// Estilos CSS para animação shimmer
const shimmerStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// Adicionar estilos ao head
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = shimmerStyles;
    document.head.appendChild(style);
}
