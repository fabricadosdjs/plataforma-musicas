"use client"; // Adicionado para permitir o uso de event handlers como onError

// Este componente representa a página de músicas recém-adicionadas.
// É a homepage padrão do seu aplicativo DJ Pool.
export default function LogPage() {
    return (
        <div className="min-h-screen bg-white text-black flex flex-col">
            {/* Cabeçalho */}
            <header className="w-full bg-white shadow-md p-4 flex justify-between items-center border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">DJ Pool</h1>
                {/* Placeholder para navegação ou botões de autenticação */}
                <nav className="space-x-4">
                    <a href="/new" className="text-gray-700 hover:text-primary font-semibold">Novas</a>
                    <a href="/trending" className="text-gray-700 hover:text-primary font-semibold">Em Alta</a>
                    <a href="/featured" className="text-gray-700 hover:text-primary font-semibold">Destaques</a>
                    <a href="/charts" className="text-gray-700 hover:text-primary font-semibold">Rankings</a>
                    <a href="/pro" className="text-gray-700 hover:text-primary font-semibold">PRO</a>
                    {/* Placeholder para Sign In/Sign Up do Clerk */}
                    <a href="/sign-in" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">Entrar</a>
                </nav>
            </header>

            {/* Conteúdo Principal */}
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <h2 className="text-3xl font-bold text-primary mb-6">Músicas Recém-Adicionadas (Log)</h2>

                {/* Grade de Músicas (Placeholder) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Item de Música de Exemplo */}
                    {[...Array(8)].map((_, index) => ( // Gerando 8 itens de exemplo
                        <div key={index} className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200 p-4">
                            <div className="relative w-full h-48 bg-gray-200 rounded-md overflow-hidden mb-4 flex items-center justify-center">
                                {/* Placeholder para Thumbnail */}
                                <img
                                    src={`https://placehold.co/400x300/e0e0e0/000000?text=Capa+${index + 1}`}
                                    alt={`Capa da Música ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/e0e0e0/000000?text=Capa+Padrão'; }}
                                />
                                {/* Ícone de Play sobreposto */}
                                <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-md opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Título da Música {index + 1}</h3>
                            <p className="text-sm text-gray-600">Artista: Nome do Artista</p>
                            <p className="text-sm text-gray-600">Gênero: Eletrônica</p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-gray-500">Plays: {1000 + index * 100}</span>
                                <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors">
                                    Baixar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Botão "Carregar Mais" */}
                <div className="mt-8 text-center">
                    <button className="bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors text-lg font-medium shadow-md">
                        Carregar Mais Músicas
                    </button>
                </div>
            </main>

            {/* Rodapé */}
            <footer className="w-full bg-gray-100 text-center p-4 text-gray-600 border-t border-gray-200 mt-8">
                <p>&copy; {new Date().getFullYear()} DJ Pool App. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}
