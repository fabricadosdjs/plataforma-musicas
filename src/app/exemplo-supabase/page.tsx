import { prisma } from '@/utils/prisma'

export default async function Page() {
    try {
        const tracks = await prisma.track.findMany({
            select: {
                id: true,
                songName: true,
                artist: true,
                style: true,
                pool: true
            },
            take: 10
        });

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8 text-center">
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Exemplo Prisma
                        </span>
                    </h1>

                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Faixas do Banco de Dados</h2>

                        {tracks && tracks.length > 0 ? (
                            <div className="space-y-4">
                                {tracks.map((track) => (
                                    <div key={track.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                                        <h3 className="text-lg font-semibold text-white mb-2">{track.songName}</h3>
                                        <p className="text-gray-300 mb-2">Artista: {track.artist}</p>
                                        {track.style && (
                                            <p className="text-gray-400 text-sm">Gênero: {track.style}</p>
                                        )}
                                        {track.pool && (
                                            <p className="text-gray-400 text-sm">Pool: {track.pool}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-400 text-lg">Nenhuma faixa encontrada no banco de dados</p>
                                <p className="text-gray-500 text-sm mt-2">
                                    Verifique se a tabela 'tracks' existe e contém dados
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            Esta página demonstra a integração com Prisma usando Server Components
                        </p>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        console.error('Erro ao buscar tracks:', error);

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8 text-center">
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Exemplo Prisma
                        </span>
                    </h1>

                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Erro ao Conectar</h2>
                        <div className="text-center py-8">
                            <p className="text-red-400 text-lg">Erro ao conectar com o banco de dados</p>
                            <p className="text-gray-500 text-sm mt-2">
                                Verifique se o Prisma está configurado corretamente
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
