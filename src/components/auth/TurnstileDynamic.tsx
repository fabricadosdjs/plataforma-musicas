import dynamic from 'next/dynamic';

// Importar o componente Turnstile apenas no cliente
const TurnstileWidget = dynamic(
    () => import('./Turnstile').then((mod) => mod.TurnstileWidget),
    {
        ssr: false,
        loading: () => (
            <div className="flex justify-center my-4">
                <div className="w-64 h-12 bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Carregando captcha...</span>
                </div>
            </div>
        ),
    }
);

export { TurnstileWidget };
export default TurnstileWidget;
