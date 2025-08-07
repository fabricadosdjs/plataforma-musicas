export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white z-0" style={{ zIndex: 0 }}>
            <h1 className="text-4xl font-bold mb-4">Página não encontrada</h1>
            <p className="text-lg mb-8">A página que você tentou acessar não existe.</p>
            <a href="/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium">Voltar para músicas</a>
        </div>
    );
}
