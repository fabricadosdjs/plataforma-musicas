"use client";

import Header from '@/components/layout/Header';
import MusicTable from '@/components/music/MusicTable';
import { useMusicPageTitle } from '@/hooks/useDynamicTitle';
import { Track } from '@/types/track';
import { ChevronLeft, ChevronRight, Filter, Loader2, Music, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function NewPageContent() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Hook para gerenciar título dinâmico da aba
    useMusicPageTitle('Novas Músicas - DJ Pool Platform');

    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [genres, setGenres] = useState<string[]>([]);
    const [artists, setArtists] = useState<string[]>([]);
    const [versions, setVersions] = useState<string[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Estados dos filtros (controlados localmente, não por URL)
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [selectedArtist, setSelectedArtist] = useState('all');
    const [selectedDateRange, setSelectedDateRange] = useState('all');
    const [selectedVersion, setSelectedVersion] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 50;

    // Função para buscar músicas
    const fetchTracks = async (resetPage = false) => {
        try {
            setSearchLoading(true);

            const page = resetPage ? 1 : currentPage;
            if (resetPage) setCurrentPage(1);

            const params = new URLSearchParams();

            if (selectedGenre !== 'all') params.append('genre', selectedGenre);
            if (selectedArtist !== 'all') params.append('artist', selectedArtist);
            if (selectedDateRange !== 'all') params.append('dateRange', selectedDateRange);
            if (selectedVersion !== 'all') params.append('version', selectedVersion);
            if (selectedMonth !== 'all') params.append('month', selectedMonth);
            if (searchQuery.trim()) params.append('search', searchQuery.trim());
            params.append('page', page.toString());
            params.append('limit', ITEMS_PER_PAGE.toString());

            const response = await fetch(`/api/tracks?${params}`);
            const data = await response.json();

            if (response.ok) {
                setTracks(data.tracks || []);
                setTotalPages(data.totalPages || 1);
                setTotalCount(data.totalCount || data.total || 0);

                // Atualizar filtros apenas na primeira carga
                if (loading) {
                    setGenres(data.filters?.genres || []);
                    setArtists(data.filters?.artists || []);
                    setVersions(data.filters?.versions || []);
                }
            } else {
                console.error('Erro ao buscar tracks:', data.error);
                setTracks([]);
                setTotalCount(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Erro ao buscar tracks:', error);
            setTracks([]);
            setTotalCount(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
            setSearchLoading(false);
        }
    };

    // Carregar dados iniciais
    useEffect(() => {
        fetchTracks();
    }, []);

    // Função para aplicar filtros (chamada pelo botão)
    const handleSearch = () => {
        fetchTracks(true); // Reset para página 1
    };

    // Função para limpar filtros
    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedGenre('all');
        setSelectedArtist('all');
        setSelectedDateRange('all');
        setSelectedVersion('all');
        setSelectedMonth('all');
        setCurrentPage(1);

        // Buscar sem filtros
        setTimeout(() => {
            fetchTracks(true);
        }, 100);
    };

    // Navegação de páginas
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        setTimeout(() => {
            fetchTracks();
        }, 100);
    };

    // Gerar opções de mês
    const generateMonthOptions = () => {
        const options = [];
        const currentDate = new Date();

        // Últimos 24 meses
        for (let i = 0; i < 24; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const value = `${year}-${String(month).padStart(2, '0')}`;
            const label = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });

            options.push({ value, label });
        }

        return options;
    };

    const monthOptions = generateMonthOptions();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            <Header />

            <main className="container mx-auto px-4 py-8 pt-20">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-600 rounded-lg">
                            <Music className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Novas Músicas</h1>
                            <p className="text-gray-300">
                                {totalCount > 0 ? `${totalCount} músicas encontradas` : 'Carregando...'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
                        {/* Busca */}
                        <div className="xl:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Buscar Música
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Nome da música ou artista..."
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Gênero */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Gênero
                            </label>
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos os gêneros</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Artista */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Artista
                            </label>
                            <select
                                value={selectedArtist}
                                onChange={(e) => setSelectedArtist(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos os artistas</option>
                                {artists.map(artist => (
                                    <option key={artist} value={artist}>{artist}</option>
                                ))}
                            </select>
                        </div>

                        {/* Mês */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mês de Lançamento
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todos os meses</option>
                                {monthOptions.map(month => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Versão */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Versão
                            </label>
                            <select
                                value={selectedVersion}
                                onChange={(e) => setSelectedVersion(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todas as versões</option>
                                {versions.map(version => (
                                    <option key={version} value={version}>{version}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleSearch}
                            disabled={searchLoading}
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                        >
                            {searchLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                            <span>Pesquisar</span>
                        </button>

                        <button
                            onClick={handleClearFilters}
                            disabled={searchLoading}
                            className="flex items-center space-x-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Limpar Filtros</span>
                        </button>
                    </div>
                </div>

                {/* Tabela de Músicas */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                            <p className="text-gray-300">Carregando músicas...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <MusicTable tracks={tracks} />

                        {/* Paginação */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-4 mt-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || searchLoading}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Anterior</span>
                                </button>

                                <span className="text-white">
                                    Página {currentPage} de {totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || searchLoading}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
                                >
                                    <span>Próxima</span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default function NewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-300">Carregando...</p>
                </div>
            </div>
        }>
            <NewPageContent />
        </Suspense>
    );
}
