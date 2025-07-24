"use client";

import Header from '@/components/layout/Header';
import { useMusicPageTitle } from '@/hooks/useDynamicTitle';
import { Track } from '@/types/track';
import { Music } from 'lucide-react';
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

    // Handlers para SidebarFilters (recebem array e atualizam estado)
    const handleGenresChange = (values: string[]) => {
        setSelectedGenre(values.length > 0 ? values[0] : 'all');
    };
    const handleArtistsChange = (values: string[]) => {
        setSelectedArtist(values.length > 0 ? values[0] : 'all');
    };
    const handleVersionsChange = (values: string[]) => {
        setSelectedVersion(values.length > 0 ? values[0] : 'all');
    };

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
    const generateMonthOptions = (): { value: string; label: string }[] => {
        const options: { value: string; label: string }[] = [];
        const currentDate = new Date();
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

    // Verificar se há filtros ativos
    const hasActiveFilters = !!(searchQuery || selectedGenre !== 'all' || selectedArtist !== 'all' ||
        selectedDateRange !== 'all' || selectedVersion !== 'all' || selectedMonth !== 'all');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            <Header />
            <main className="container mx-auto px-4 py-8 pt-20">
                {/* Cabeçalho com estatísticas, barra de busca, layout com sidebar e conteúdo principal */}
                {/* TODO: Certifique-se que todo o JSX do layout está dentro deste main, conforme o design original. */}
            </main>
        </div>
    );
}

export default function NewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <Music className="h-8 w-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Carregando</h3>
                    <p className="text-gray-400">Preparando sua experiência musical...</p>
                </div>
            </div>
        }>
            <NewPageContent />
        </Suspense>
    );
}
