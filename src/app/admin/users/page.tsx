"use client";

import { AlertCircle, CheckCircle, Copy, Crown, DollarSign, Edit, Filter, Loader2, MessageSquare, Plus, Search, Settings, Trash, User, Users, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminAuth } from '@/components/admin/AdminAuth';

// Corrected: Interface definition should only contain properties.
interface User {
    id: string;
    name: string;
    whatsapp?: string;
    email: string;
    valor?: number;
    vencimento?: string;
    dataPagamento?: string;
    status: string;
    deemix: boolean;
    is_vip: boolean;
    dailyDownloadCount: number | null;
    weeklyPackRequests?: number;
    weeklyPlaylistDownloads?: number;
    weeklyPackRequestsUsed?: number; // Campo para admin controlar uso manual
    weeklyPlaylistDownloadsUsed?: number; // Campo para admin controlar uso manual
    lastDownloadReset?: string | null;
    lastWeekReset?: string | null;
    downloadsCount: number;
    likesCount: number;
    password?: string;
    customBenefits?: any;
}

// ...existing code (VIP_BENEFITS, VIP_PLANS, BENEFIT_LABELS, getUserPlan, getUserBenefits) should remain outside the component, as constants/helpers
const VIP_BENEFITS = {
    BASICO: {
        driveAccess: { enabled: true, description: 'Acesso Mensal' },
        packRequests: { enabled: true, limit: 4, minLimit: 4, maxLimit: 10, description: 'Até 4 estilos por semana' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: 7, minLimit: 7, maxLimit: 15, description: 'Até 7 por semana' },
        deezerPremium: { enabled: false, description: 'Não disponível' },
        deemixDiscount: { enabled: false, percentage: 0, description: 'Não disponível' },
        arlPremium: { enabled: false, description: 'Não disponível' },
        musicProduction: { enabled: false, description: 'Não disponível' }
    },
    PADRAO: {
        driveAccess: { enabled: true, description: 'Acesso Mensal' },
        packRequests: { enabled: true, limit: 6, minLimit: 4, maxLimit: 10, description: 'Até 6 estilos por semana' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: 9, minLimit: 7, maxLimit: 15, description: 'Até 9 por semana' },
        deezerPremium: { enabled: true, description: 'Sim' },
        deemixDiscount: { enabled: true, percentage: 15, description: 'Sim' },
        arlPremium: { enabled: true, description: 'Sim (automático se Deemix)' },
        musicProduction: { enabled: false, description: 'Não disponível' }
    },
    COMPLETO: {
        driveAccess: { enabled: true, description: 'Acesso Mensal' },
        packRequests: { enabled: true, limit: 8, minLimit: 4, maxLimit: 10, description: 'Até 8 estilos por semana' },
        individualContent: { enabled: true, description: 'Sim' },
        extraPacks: { enabled: true, description: 'Sim' },
        playlistDownloads: { enabled: true, limit: -1, minLimit: 7, maxLimit: 15, description: 'Ilimitado (máx. 4 por dia)' },
        deezerPremium: { enabled: true, description: 'Sim' },
        deemixDiscount: { enabled: true, percentage: 15, description: 'Sim' },
        arlPremium: { enabled: true, description: 'Sim (automático se Deemix)' },
        musicProduction: { enabled: true, description: 'Sim' }
    }
} as const;

// Definição dos planos VIP
const VIP_PLANS = {
    BASICO: {
        name: 'VIP BÁSICO',
        minValue: 30,
        maxValue: 35,
        color: 'bg-blue-600',
        icon: '🥉',
        benefits: VIP_BENEFITS.BASICO
    },
    PADRAO: {
        name: 'VIP PADRÃO',
        minValue: 36,
        maxValue: 42,
        color: 'bg-green-600',
        icon: '🥈',
        benefits: VIP_BENEFITS.PADRAO
    },
    COMPLETO: {
        name: 'VIP COMPLETO',
        minValue: 43,
        maxValue: 60,
        color: 'bg-purple-600',
        icon: '🥇',
        benefits: VIP_BENEFITS.COMPLETO
    }
} as const;

// Labels dos benefícios para interface
const BENEFIT_LABELS = {
    driveAccess: '📁 Acesso ao Drive Mensal (desde 2023)',
    packRequests: '🎚️ Solicitação de Packs',
    individualContent: '📦 Conteúdos Avulsos',
    extraPacks: '🔥 Packs Extras',
    playlistDownloads: '🎵 Download de Playlists',
    deezerPremium: '🎁 Deezer Premium Grátis',
    deemixDiscount: '💸 15% de Desconto no Deemix',
    arlPremium: '🔐 ARL Premium para Deemix',
    musicProduction: '🎼 Produção da sua Música'
} as const;

// Função para determinar o plano baseado no valor mensal
const getUserPlan = (valor: number | null) => {
    if (!valor || valor < VIP_PLANS.BASICO.minValue) {
        return null;
    }

    if (valor >= VIP_PLANS.BASICO.minValue && valor <= VIP_PLANS.BASICO.maxValue) {
        return VIP_PLANS.BASICO;
    }

    if (valor >= VIP_PLANS.PADRAO.minValue && valor <= VIP_PLANS.PADRAO.maxValue) {
        return VIP_PLANS.PADRAO;
    }

    if (valor >= VIP_PLANS.COMPLETO.minValue && valor <= VIP_PLANS.COMPLETO.maxValue) {
        return VIP_PLANS.COMPLETO;
    }

    // Para valores acima do máximo, considera como VIP COMPLETO
    if (valor > VIP_PLANS.COMPLETO.maxValue) {
        return VIP_PLANS.COMPLETO;
    }

    return null;
};

// Função para obter benefícios do usuário (padrão + personalizações)
const getUserBenefits = (user: User, customBenefits: { [userId: string]: any }) => {
    const defaultPlan = getUserPlan(user.valor || null);
    const defaultBenefits = defaultPlan ? defaultPlan.benefits : VIP_BENEFITS.BASICO;
    const userCustom = customBenefits[user.id] || {};

    // Mescla benefícios padrão com personalizações
    const finalBenefits: any = { ...defaultBenefits };
    Object.keys(userCustom).forEach(key => {
        finalBenefits[key] = { ...finalBenefits[key], ...userCustom[key] };
    });

    return finalBenefits;
};


export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [vipFilter, setVipFilter] = useState('all');
    const [showBenefitsModal, setShowBenefitsModal] = useState(false);
    const [userForBenefits, setUserForBenefits] = useState<User | null>(null);
    const [customBenefits, setCustomBenefits] = useState<{ [userId: string]: any }>({});
    const [editForm, setEditForm] = useState({
        name: '',
        whatsapp: '',
        email: '',
        password: '',
        valor: 0,
        vencimento: '',
        dataPagamento: '',
        status: 'ativo',
        deemix: true,
        is_vip: true,
        dailyDownloadCount: 0
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/auth/sign-in');
        }
    }, [status]);

    // Filtrar usuários baseado nos filtros aplicados
    useEffect(() => {
        let filtered = users;

        // Filtro de busca
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.whatsapp && user.whatsapp.includes(searchTerm))
            );
        }

        // Filtro de status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        // Filtro VIP
        if (vipFilter !== 'all') {
            filtered = filtered.filter(user =>
                vipFilter === 'vip' ? user.is_vip : !user.is_vip
            );
        }

        // Ordenar: vencidos primeiro (mais antigo primeiro), depois não vencidos (mais próximo primeiro)
        filtered = filtered.sort((a, b) => {
            // Se um tem vencimento e outro não, priorizar o que tem vencimento
            if (a.vencimento && !b.vencimento) return -1;
            if (!a.vencimento && b.vencimento) return 1;
            if (!a.vencimento && !b.vencimento) return 0;

            const dateA = new Date(a.vencimento!);
            const dateB = new Date(b.vencimento!);
            const today = new Date();

            // Normalizar as datas para comparação (apenas dia/mês/ano)
            const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const dateANormalized = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
            const dateBNormalized = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());

            const isAVencido = dateANormalized.getTime() <= todayNormalized.getTime();
            const isBVencido = dateBNormalized.getTime() <= todayNormalized.getTime();

            // Caso 1: Ambos vencidos - ordenar do mais antigo para o mais recente
            if (isAVencido && isBVencido) {
                return dateANormalized.getTime() - dateBNormalized.getTime();
            }

            // Caso 2: Apenas A vencido - A vem primeiro
            if (isAVencido && !isBVencido) return -1;

            // Caso 3: Apenas B vencido - B vem primeiro  
            if (!isAVencido && isBVencido) return 1;

            // Caso 4: Nenhum vencido - ordenar por proximidade (mais próximo primeiro)
            return dateANormalized.getTime() - dateBNormalized.getTime();
        });

        setFilteredUsers(filtered);
    }, [users, searchTerm, statusFilter, vipFilter]);

    // Função para calcular receita mensal
    const calculateMonthlyRevenue = () => {
        return users
            .filter(user => user.is_vip && user.valor)
            .reduce((acc, user) => acc + Number(user.valor || 0), 0);
    };

    // Função para verificar se a data de vencimento está próxima (3 dias)
    const isVencimentoProximo = (vencimento: string) => {
        if (!vencimento) return false;
        const hoje = new Date();
        const dataVencimento = new Date(vencimento);
        const diffTime = dataVencimento.getTime() - hoje.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0;
    };

    // Função para verificar se já venceu
    const isVencido = (vencimento: string) => {
        if (!vencimento) return false;
        const hoje = new Date();
        const dataVencimento = new Date(vencimento);
        return dataVencimento < hoje;
    };

    // Função para copiar texto para clipboard
    const copyToClipboard = async (text: string, type: string) => {
        if (!text || !text.trim()) {
            showMessage(`${type} está vazio`, 'error');
            return;
        }

        try {
            // Primeiro tenta usar a API moderna
            if (navigator?.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text.trim());
                showMessage(`${type} copiado para a área de transferência!`, 'success');
                return;
            }

            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = text.trim();
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                showMessage(`${type} copiado para a área de transferência!`, 'success');
            } else {
                throw new Error('Comando copy falhou');
            }
        } catch (err) {
            console.error('Erro ao copiar:', err);
            // Fallback final: mostrar o texto para o usuário copiar manualmente
            const confirmCopy = confirm(`Não foi possível copiar automaticamente. Clique OK para ver o ${type.toLowerCase()} e copiar manualmente.`);
            if (confirmCopy) {
                prompt(`Copie o ${type.toLowerCase()} abaixo:`, text.trim());
                showMessage(`${type} exibido para cópia manual`, 'success');
            }
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            } else {
                throw new Error('Falha ao carregar usuários');
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            showMessage('Erro ao carregar usuários', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchUsers();
        }
    }, [status]);

    const showMessage = (msg: string, type: 'success' | 'error') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const toggleUserStatus = async (userId: string, currentStatus: string) => {
        setUpdating(userId);
        try {
            const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    status: newStatus
                }),
            });

            if (response.ok) {
                const data = await response.json();
                showMessage(data.message, 'success');
                setUsers(prev => prev.map(user =>
                    user.id === userId
                        ? { ...user, status: newStatus }
                        : user
                ));
            } else {
                throw new Error('Falha ao atualizar status do usuário');
            }
        } catch (error) {
            console.error('Erro ao atualizar status do usuário:', error);
            showMessage('Erro ao atualizar status do usuário', 'error');
        } finally {
            setUpdating(null);
        }
    };

    const toggleDeemixStatus = async (userId: string, currentDeemix: boolean) => {
        setUpdating(userId);
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    deemix: !currentDeemix
                }),
            });

            if (response.ok) {
                const data = await response.json();
                showMessage(data.message, 'success');
                setUsers(prev => prev.map(user =>
                    user.id === userId
                        ? { ...user, deemix: !user.deemix }
                        : user
                ));
            } else {
                throw new Error('Falha ao atualizar status do Deemix');
            }
        } catch (error) {
            console.error('Erro ao atualizar status do Deemix:', error);
            showMessage('Erro ao atualizar status do Deemix', 'error');
        } finally {
            setUpdating(null);
        }
    };

    const showDeleteConfirmation = (user: User) => {
        setUserToDelete(user);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        setDeleting(userToDelete.id);
        try {
            const response = await fetch(`/api/admin/users?id=${userToDelete.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const data = await response.json();
                showMessage(data.message, 'success');
                setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
                setUserToDelete(null);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao excluir usuário');
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            showMessage('Erro ao excluir usuário', 'error');
        } finally {
            setDeleting(null);
        }
    };

    const cancelDelete = () => {
        setUserToDelete(null);
    };

    const toggleVipStatus = async (userId: string, currentVipStatus: boolean) => {
        setUpdating(userId);
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    is_vip: !currentVipStatus
                }),
            });

            if (response.ok) {
                const data = await response.json();
                showMessage(data.message, 'success');
                setUsers(prev => prev.map(user =>
                    user.id === userId
                        ? { ...user, deemix: !user.deemix }
                        : user
                ));
            } else {
                throw new Error('Falha ao atualizar usuário');
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            showMessage('Erro ao atualizar usuário', 'error');
        } finally {
            setUpdating(null);
        }
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);

        // Função para converter data para formato YYYY-MM-DD
        const formatDateForInput = (dateValue: any) => {
            if (!dateValue) return '';

            try {
                let date;
                if (typeof dateValue === 'string') {
                    date = new Date(dateValue);
                } else if (dateValue instanceof Date) {
                    date = dateValue;
                } else {
                    return '';
                }

                if (isNaN(date.getTime())) return '';

                return date.toISOString().split('T')[0];
            } catch (error) {
                console.error('Erro ao formatar data:', error);
                return '';
            }
        };

        setEditForm({
            name: user.name || '',
            whatsapp: user.whatsapp || '',
            email: user.email || '',
            password: '', // Não mostrar senha existente por segurança
            valor: user.valor || 0,
            vencimento: formatDateForInput(user.vencimento),
            dataPagamento: formatDateForInput(user.dataPagamento),
            status: user.status,
            deemix: user.deemix,
            is_vip: user.is_vip,
            dailyDownloadCount: user.dailyDownloadCount || 0
        });
    };

    const closeEditModal = () => {
        setEditingUser(null);
        setShowAddModal(false);
        setEditForm({
            name: '',
            whatsapp: '',
            email: '',
            password: '',
            valor: 0,
            vencimento: '',
            dataPagamento: '',
            status: 'ativo',
            deemix: true,
            is_vip: true,
            dailyDownloadCount: 0
        });
    };

    const openBenefitsModal = (user: User) => {
        setUserForBenefits(user);
        setShowBenefitsModal(true);
    };

    const closeBenefitsModal = () => {
        setUserForBenefits(null);
        setShowBenefitsModal(false);
    };

    const openAddModal = () => {
        setShowAddModal(true);
        setEditForm({
            name: '',
            whatsapp: '',
            email: '',
            password: '',
            valor: 0,
            vencimento: '',
            dataPagamento: '',
            status: 'ativo',
            deemix: true,
            is_vip: true,
            dailyDownloadCount: 0
        });
    };

    const addNewUser = async () => {
        try {
            setUpdating('new-user');
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            });

            if (response.ok) {
                const data = await response.json();
                showMessage('Usuário adicionado com sucesso!', 'success');
                fetchUsers();
                closeEditModal();
            } else {
                showMessage('Falha ao adicionar usuário', 'error');
            }
        } catch (error) {
            console.error('Erro ao adicionar usuário:', error);
            showMessage('Erro ao adicionar usuário', 'error');
        } finally {
            setUpdating(null);
        }
    };

    const saveUserEdit = async () => {
        if (!editingUser) return;

        setUpdating(editingUser.id);
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: editingUser.id,
                    ...editForm
                }),
            });

            if (response.ok) {
                const data = await response.json();
                showMessage(data.message, 'success');
                fetchUsers();
                closeEditModal();
            } else {
                throw new Error('Falha ao atualizar usuário');
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            showMessage('Erro ao atualizar usuário', 'error');
        } finally {
            setUpdating(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-[#1B1C1D] flex flex-col items-center justify-center text-white">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-4" />
                <div className="text-white text-lg">Carregando...</div>
            </div>
        );
    }

    return (
        <AdminAuth>
            <div className="min-h-screen bg-[#1B1C1D] text-white">
                <div className="container mx-auto px-6 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Usuários VIP</h1>
                                <p className="text-gray-400 mt-1">Gerencie assinaturas e permissões dos usuários</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href="/admin/custom-items"
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <Settings className="h-4 w-4" />
                                Itens Personalizados
                            </a>
                            <a
                                href="/admin/messages"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Recados da ADM
                            </a>
                        </div>
                    </div>

                    {/* Filtros e Busca */}
                    <div className="bg-gray-800/50 rounded-xl p-6 mb-6 space-y-4">
                        {/* Barra de Busca - Linha separada */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, email ou WhatsApp..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                        </div>

                        {/* Filtros - Linha separada */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Filtro Status */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none text-sm"
                                >
                                    <option value="all">Todos os status</option>
                                    <option value="ativo">Ativo</option>
                                    <option value="inativo">Inativo</option>
                                </select>
                            </div>

                            {/* Filtro VIP */}
                            <div className="relative">
                                <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    value={vipFilter}
                                    onChange={(e) => setVipFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none text-sm"
                                >
                                    <option value="all">Todos os tipos</option>
                                    <option value="vip">Usuários VIP</option>
                                    <option value="regular">Usuários Regular</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Message Alert */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${messageType === 'success'
                            ? 'bg-green-600/20 border border-green-600/30 text-green-400'
                            : 'bg-red-600/20 border border-red-600/30 text-red-400'
                            }`}>
                            {messageType === 'success' ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <AlertCircle className="w-5 h-5" />
                            )}
                            {message}
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-600/20 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Total de Usuários</p>
                                    <p className="text-2xl font-bold text-white">{users.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-yellow-600/20 rounded-lg">
                                    <Crown className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Usuários VIP</p>
                                    <p className="text-2xl font-bold text-yellow-400">{users.filter(u => u.is_vip).length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-600/20 rounded-lg">
                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Usuários Ativos</p>
                                    <p className="text-2xl font-bold text-green-400">{users.filter(u => u.status === 'ativo').length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-600/20 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Receita Mensal</p>
                                    <p className="text-2xl font-bold text-emerald-400">
                                        R$ {calculateMonthlyRevenue().toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add User Button */}
                    <div className="mb-6 flex justify-end">
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 px-6 py-3 pink-gradient-button text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-pink-500/25"
                        >
                            <Plus className="w-5 h-5" />
                            Adicionar Usuário
                        </button>
                    </div>

                    {/* Modern Users Table with Dark Theme */}
                    <div className="users-table-container bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-blue-500/20 backdrop-blur-sm overflow-hidden shadow-2xl">
                        {/* Table Header */}
                        <div className="px-6 py-4 border-b border-gray-700 bg-gray-950">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-pink-300" />
                                Usuários Cadastrados ({filteredUsers.length})
                            </h3>
                        </div>
                        <div className="w-full">
                            <table className="w-full min-w-full">
                                <thead>
                                    <tr>
                                        <th className="w-[16%] px-4 py-4 text-left text-xs font-bold whitespace-nowrap text-gray-300 bg-gray-950">
                                            Nome
                                        </th>
                                        <th className="w-[13%] px-3 py-4 text-left text-xs font-bold whitespace-nowrap text-gray-300 bg-gray-950">
                                            WhatsApp
                                        </th>
                                        <th className="w-[14%] px-3 py-4 text-left text-xs font-bold whitespace-nowrap text-gray-300 bg-gray-950">
                                            E-mail
                                        </th>
                                        <th className="w-[12%] px-3 py-4 text-left text-xs font-bold whitespace-nowrap text-gray-300 bg-gray-950">
                                            Valor
                                        </th>
                                        <th className="w-[11%] px-3 py-4 text-left text-xs font-bold whitespace-nowrap text-gray-300 bg-gray-950">
                                            Plano
                                        </th>
                                        <th className="w-[10%] px-3 py-4 text-left text-xs font-bold whitespace-nowrap text-gray-300 bg-gray-950">
                                            Venc.
                                        </th>
                                        <th className="w-[11%] px-3 py-4 text-left text-xs font-bold whitespace-nowrap text-gray-300 bg-gray-950">
                                            Data Pag.
                                        </th>
                                        <th className="w-[8%] px-3 py-4 text-left text-xs font-bold whitespace-nowrap text-gray-300 bg-gray-950">
                                            Status
                                        </th>
                                        <th className="w-[6%] px-3 py-4 text-left text-xs font-bold whitespace-nowrap text-gray-300 bg-gray-950">
                                            Deemix
                                        </th>
                                        <th className="w-[7%] px-3 py-4 text-center text-xs font-bold whitespace-nowrap text-gray-300 bg-gray-950">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredUsers.map((user, index) => (
                                        <tr key={user.id} className={`transition-all duration-300 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/80'} hover:bg-gray-700`}>
                                            <td className="px-4 py-4">
                                                <div className="text-xs font-light whitespace-nowrap text-gray-200" title={user.name}>{user.name}</div>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="flex items-center gap-1 group">
                                                    <span className="text-xs font-light truncate flex-1 whitespace-nowrap text-gray-200" title={user.whatsapp || ''}>
                                                        {user.whatsapp || '-'}
                                                    </span>
                                                    {user.whatsapp && user.whatsapp.trim() && (
                                                        <button
                                                            onClick={() => copyToClipboard(user.whatsapp!.trim(), 'WhatsApp')}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-500/20 rounded flex-shrink-0"
                                                            title="Copiar WhatsApp"
                                                        >
                                                            <Copy className="w-3 h-3 text-pink-300 hover:text-pink-200" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="flex items-center gap-1 group">
                                                    <span className="text-xs font-light truncate flex-1 whitespace-nowrap text-gray-200" title={user.email}>
                                                        {user.email}
                                                    </span>
                                                    <button
                                                        onClick={() => user.email && copyToClipboard(user.email.trim(), 'Email')}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-500/20 rounded flex-shrink-0"
                                                        title="Copiar Email"
                                                        disabled={!user.email || !user.email.trim()}
                                                    >
                                                        <Copy className="w-3 h-3 text-pink-300 hover:text-pink-200" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap">
                                                <span className="text-xs font-light text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                                    {user.valor ? `R$ ${Number(user.valor).toFixed(2)}` : '-'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4">
                                                {(() => {
                                                    const userPlan = getUserPlan(user.valor || null);
                                                    const hasCustomBenefits = customBenefits[user.id] && Object.keys(customBenefits[user.id]).length > 0;

                                                    if (!userPlan) {
                                                        return <span className="text-xs text-gray-400 font-light whitespace-nowrap">Sem plano</span>;
                                                    }

                                                    return (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">{userPlan.icon}</span>
                                                            {hasCustomBenefits && (
                                                                <div className="ml-1" title="Benefícios personalizados">
                                                                    <span className="text-xs bg-gray-600/30 text-gray-300 px-1 py-0.5 rounded border border-gray-500/30">
                                                                        ✨
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-3 py-4">
                                                <span className={`text-xs font-light px-2 py-1 rounded-lg whitespace-nowrap ${user.vencimento
                                                    ? isVencido(user.vencimento)
                                                        ? 'text-red-300 bg-red-500/20 border border-red-400/30'
                                                        : isVencimentoProximo(user.vencimento)
                                                            ? 'text-orange-300 bg-orange-500/20 border border-orange-400/30'
                                                            : 'text-blue-200 bg-blue-500/10'
                                                    : 'text-gray-400'
                                                    }`}>
                                                    {user.vencimento ? formatDate(user.vencimento) : '-'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4">
                                                <span className="text-xs font-light whitespace-nowrap text-gray-200">
                                                    {user.dataPagamento ? formatDate(user.dataPagamento) : '-'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4">
                                                <button
                                                    onClick={() => toggleUserStatus(user.id, user.status)}
                                                    disabled={updating === user.id}
                                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${user.status === 'ativo'
                                                        ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-400/30 hover:from-emerald-500/30 hover:to-green-500/30 shadow-emerald-500/20 shadow-lg'
                                                        : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-400/30 hover:from-red-500/30 hover:to-pink-500/30 shadow-red-500/20 shadow-lg'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
                                                >
                                                    {updating === user.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <div className={`w-2 h-2 rounded-full ${user.status === 'ativo' ? 'bg-emerald-400 shadow-emerald-400/50 shadow-md' : 'bg-red-400 shadow-red-400/50 shadow-md'}`} />
                                                            {user.status === 'ativo' ? 'ATIVO' : 'INATIVO'}
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-3 py-4">
                                                <button
                                                    onClick={() => toggleDeemixStatus(user.id, user.deemix)}
                                                    disabled={updating === user.id}
                                                    className={`inline-flex items-center justify-center w-10 h-8 rounded-xl text-xs font-bold transition-all ${user.deemix
                                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-purple-500/30 shadow-lg'
                                                        : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 hover:from-gray-500 hover:to-gray-600 shadow-gray-500/20 shadow-lg'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {updating === user.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        user.deemix ? '✓' : '✗'
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-2 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 rounded-xl transition-all hover:scale-110 border border-blue-400/30 shadow-blue-500/20 shadow-md"
                                                        title="Editar usuário"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openBenefitsModal(user)}
                                                        className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 rounded-xl transition-all hover:scale-110 border border-purple-400/30 shadow-purple-500/20 shadow-md"
                                                        title="Personalizar benefícios"
                                                    >
                                                        <Crown className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => showDeleteConfirmation(user)}
                                                        disabled={deleting === user.id}
                                                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-red-400/30 shadow-red-500/20 shadow-md"
                                                        title="Excluir usuário"
                                                    >
                                                        {deleting === user.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredUsers.length === 0 && users.length > 0 && (
                            <div className="text-center py-12 bg-gray-900/50">
                                <Search className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-blue-200 mb-2">
                                    Nenhum usuário encontrado
                                </h3>
                                <p className="text-pink-300">
                                    Tente ajustar os filtros de busca
                                </p>
                            </div>
                        )}

                        {users.length === 0 && (
                            <div className="text-center py-12 bg-gray-900/50">
                                <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-blue-200 mb-2">
                                    Nenhum usuário cadastrado
                                </h3>
                                <p className="text-pink-300 mb-6">
                                    Comece adicionando seu primeiro usuário VIP
                                </p>
                                <button
                                    onClick={openAddModal}
                                    className="inline-flex items-center gap-2 px-6 py-3 pink-gradient-button text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-pink-500/25"
                                >
                                    <Plus className="w-4 h-4" />
                                    Adicionar Primeiro Usuário
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Seção de Benefícios por Valor */}
                    <div className="mt-8 bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
                        <div className="px-6 py-4 bg-gray-950 border-b border-gray-700">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Crown className="w-6 h-6 text-yellow-400" />
                                Benefícios por Valor Mensal
                            </h2>
                            <p className="text-gray-300 text-sm mt-1">
                                Configure os benefícios que cada usuário tem direito conforme seu valor mensal
                            </p>
                        </div>

                        <div className="p-6 bg-gray-900">
                            {/* Cards dos Planos VIP */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                {Object.entries(VIP_PLANS).map(([key, plan]) => (
                                    <div key={key} className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700 hover:border-gray-600 transition-colors">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-12 h-12 ${plan.color} rounded-lg flex items-center justify-center text-2xl`}>
                                                {plan.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                                <p className="text-sm text-gray-400">
                                                    R$ {plan.minValue} - R$ {plan.maxValue}/mês
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="bg-gray-700 rounded-lg p-3">
                                                <h4 className="font-semibold text-white mb-2">Valor Mensal</h4>
                                                <p className="text-2xl font-bold text-green-400">
                                                    R$ {plan.minValue} - R$ {plan.maxValue}
                                                </p>
                                            </div>

                                            <div className="bg-gray-700 rounded-lg p-3">
                                                <h4 className="font-semibold text-white mb-2">Benefícios Inclusos</h4>
                                                <p className="text-sm text-gray-300">
                                                    {key === 'BASICO' && 'Acesso básico à plataforma + downloads limitados'}
                                                    {key === 'PADRAO' && 'Todos os benefícios básicos + packs + playlists'}
                                                    {key === 'COMPLETO' && 'Todos os benefícios + Deezer Premium + ARL + Produção'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tabela de Benefícios Detalhados */}
                            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
                                <div className="px-6 py-4 bg-gray-950 border-b border-gray-700">
                                    <h4 className="text-lg font-semibold text-white">Comparativo de Benefícios</h4>
                                    <p className="text-sm text-gray-300 mt-1">Veja o que cada plano oferece em detalhes</p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-950">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Benefício</th>
                                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">
                                                    🥉 VIP BÁSICO<br />
                                                    <span className="text-xs text-gray-400">R$ 30-35</span>
                                                </th>
                                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">
                                                    🥈 VIP PADRÃO<br />
                                                    <span className="text-xs text-gray-400">R$ 36-42</span>
                                                </th>
                                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-300">
                                                    🥇 VIP COMPLETO<br />
                                                    <span className="text-xs text-gray-400">R$ 43-60</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {Object.entries(BENEFIT_LABELS).map(([key, label]) => (
                                                <tr key={key} className="bg-gray-900 hover:bg-gray-800">
                                                    <td className="px-6 py-4 text-sm text-gray-200">{label}</td>
                                                    {Object.entries(VIP_PLANS).map(([planKey, plan]) => {
                                                        const benefit = (plan.benefits as any)[key];
                                                        return (
                                                            <td key={planKey} className="px-6 py-4 text-center text-sm">
                                                                {benefit.enabled ? (
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="text-green-400 font-medium">✓</span>
                                                                        <span className="text-xs text-gray-400 mt-1">
                                                                            {benefit.description}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="text-red-400 font-medium">✗</span>
                                                                        <span className="text-xs text-gray-400 mt-1">
                                                                            {benefit.description}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal de Confirmação de Exclusão */}
                    {userToDelete && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-gradient-to-br from-[#1B1C1D] to-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md text-white">
                                <h3 className="text-xl font-medium mb-6">
                                    Confirmar Exclusão
                                </h3>

                                <div className="text-center">
                                    <User className="w-16 h-16 mx-auto text-red-400 mb-4" />
                                    <p className="text-sm mb-4">
                                        Tem certeza que deseja excluir o usuário <strong>{userToDelete.name}</strong>?
                                    </p>
                                    {userToDelete.valor && (
                                        <p className="text-green-400 text-sm font-medium">
                                            R$ {Number(userToDelete.valor).toFixed(2)}/mês
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                                    <p className="text-red-300 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Todos os dados, likes e downloads serão permanentemente removidos
                                    </p>
                                </div>
                                <div className="flex gap-3 mt-8">
                                    <button
                                        onClick={cancelDelete}
                                        disabled={deleting === userToDelete.id}
                                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmDeleteUser}
                                        disabled={deleting === userToDelete.id}
                                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {deleting === userToDelete.id ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Excluindo...
                                            </>
                                        ) : (
                                            <>
                                                <Trash className="w-4 h-4" />
                                                Excluir
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal de Edição/Adição - Tema Escuro */}
                    {(editingUser || showAddModal) && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-gradient-to-br from-[#1B1C1D] to-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white shadow-2xl">
                                <h3 className="text-2xl font-medium mb-8">
                                    {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">
                                            Nome *
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                            placeholder="Nome completo"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">
                                            WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.whatsapp}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-300 mb-3">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                            placeholder="email@exemplo.com"
                                        />
                                    </div>

                                    {/* Campo de senha - só aparece quando estiver adicionando novo usuário */}
                                    {showAddModal && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                                Senha *
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editForm.password}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                                    placeholder="Senha forte para novo usuário"
                                                    autoComplete="new-password"
                                                />
                                                <button
                                                    type="button"
                                                    className="px-4 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl"
                                                    onClick={() => {
                                                        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
                                                        let password = "";
                                                        for (let i = 0, n = charset.length; i < 14; ++i) {
                                                            password += charset.charAt(Math.floor(Math.random() * n));
                                                        }
                                                        setEditForm(prev => ({ ...prev, password }));
                                                    }}
                                                >
                                                    Gerar senha forte
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {editingUser && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                                Senha (deixe em branco para não alterar)
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editForm.password}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                                    placeholder="Nova senha (opcional)"
                                                    autoComplete="new-password"
                                                />
                                                <button
                                                    type="button"
                                                    className="px-4 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl"
                                                    onClick={() => {
                                                        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
                                                        let password = "";
                                                        for (let i = 0, n = charset.length; i < 14; ++i) {
                                                            password += charset.charAt(Math.floor(Math.random() * n));
                                                        }
                                                        setEditForm(prev => ({ ...prev, password }));
                                                    }}
                                                >
                                                    Gerar senha forte
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">
                                            Valor da Assinatura (R$)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.valor}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">
                                            Status
                                        </label>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                        >
                                            <option value="ativo" className="bg-gray-900">Ativo</option>
                                            <option value="inativo" className="bg-gray-900">Inativo</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">
                                            Data de Vencimento
                                        </label>
                                        <input
                                            type="date"
                                            value={editForm.vencimento}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, vencimento: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-3">
                                            Data do Pagamento
                                        </label>
                                        <input
                                            type="date"
                                            value={editForm.dataPagamento}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, dataPagamento: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                                    Deemix Ativo
                                                </label>
                                                <select
                                                    value={editForm.deemix ? 'sim' : 'nao'}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        deemix: e.target.value === 'sim'
                                                    }))}
                                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                                >
                                                    <option value="sim" className="bg-gray-900">Sim</option>
                                                    <option value="nao" className="bg-gray-900">Não</option>
                                                </select>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {editForm.deemix ? 'Usuário pode acessar o sistema Deemix' : 'Usuário não tem acesso ao Deemix'}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                                    Usuário VIP
                                                </label>
                                                <select
                                                    value={editForm.is_vip ? 'sim' : 'nao'}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        is_vip: e.target.value === 'sim'
                                                    }))}
                                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-gray-100 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all duration-200"
                                                >
                                                    <option value="sim" className="bg-gray-900">Sim</option>
                                                    <option value="nao" className="bg-gray-900">Não</option>
                                                </select>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {editForm.is_vip ? 'Usuário tem acesso VIP às músicas' : 'Usuário sem acesso às músicas'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-10 pt-6 border-t border-gray-700">
                                    <button
                                        onClick={closeEditModal}
                                        className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-all duration-200 font-medium border border-gray-600 hover:border-gray-500"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={editingUser ? saveUserEdit : addNewUser}
                                        disabled={updating !== null}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-xl transition-all duration-200 disabled:opacity-50 font-medium border border-gray-500 hover:border-gray-400"
                                    >
                                        {updating !== null ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Salvando...
                                            </div>
                                        ) : (
                                            editingUser ? 'Salvar Alterações' : 'Adicionar Usuário'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal de Personalização de Benefícios */}
                    {showBenefitsModal && userForBenefits && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto text-white border border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <Crown className="w-8 h-8 text-purple-400" />
                                        <div>
                                            <h3 className="text-xl font-semibold">Personalizar Benefícios</h3>
                                            <p className="text-sm text-gray-400">
                                                {userForBenefits.name} - {getUserPlan(userForBenefits.valor || null)?.name || 'Sem plano'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeBenefitsModal}
                                        className="text-gray-400 hover:text-gray-300"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                                    <h4 className="font-semibold text-blue-400 mb-2">Benefícios do Plano Atual</h4>
                                    <p className="text-sm text-gray-300">
                                        Os benefícios abaixo são baseados no plano atual do usuário.
                                        Você pode personalizar cada benefício individualmente para este usuário específico.
                                    </p>
                                </div>

                                {/* Seção de Uso Atual dos Benefícios */}
                                <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-white flex items-center gap-2">
                                            📊 Uso Atual dos Benefícios
                                        </h4>
                                        <div className="text-xs text-gray-400">
                                            Último reset semanal: {userForBenefits.lastWeekReset
                                                ? new Date(userForBenefits.lastWeekReset).toLocaleDateString('pt-BR')
                                                : 'Nunca'
                                            }
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-gray-300">🎚️ Packs Semanais</span>
                                                <span className="text-xs text-gray-400">Esta semana</span>
                                            </div>
                                            <div className="text-lg font-bold text-white">
                                                {(() => {
                                                    const customUsed = customBenefits[userForBenefits.id]?.packRequests?.used;
                                                    const used = customUsed !== undefined ? customUsed : (userForBenefits.weeklyPackRequestsUsed || 0);
                                                    const plan = getUserPlan(userForBenefits.valor || null);
                                                    const customBenefit = customBenefits[userForBenefits.id]?.packRequests;
                                                    const limit = customBenefit?.limit || plan?.benefits.packRequests?.limit || 0;
                                                    return `${used} / ${limit}`;
                                                })()}
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                                    style={{
                                                        width: `${Math.min(100, (() => {
                                                            const customUsed = customBenefits[userForBenefits.id]?.packRequests?.used;
                                                            const used = customUsed !== undefined ? customUsed : (userForBenefits.weeklyPackRequestsUsed || 0);
                                                            const plan = getUserPlan(userForBenefits.valor || null);
                                                            const customBenefit = customBenefits[userForBenefits.id]?.packRequests;
                                                            const limit = customBenefit?.limit || plan?.benefits.packRequests?.limit || 1;
                                                            return (used / Math.max(1, limit)) * 100;
                                                        })())}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-gray-300">🎵 Playlists Semanais</span>
                                                <span className="text-xs text-gray-400">Esta semana</span>
                                            </div>
                                            <div className="text-lg font-bold text-white">
                                                {(() => {
                                                    const customUsed = customBenefits[userForBenefits.id]?.playlistDownloads?.used;
                                                    const used = customUsed !== undefined ? customUsed : (userForBenefits.weeklyPlaylistDownloadsUsed || 0);
                                                    const plan = getUserPlan(userForBenefits.valor || null);
                                                    const customBenefit = customBenefits[userForBenefits.id]?.playlistDownloads;
                                                    const limit = customBenefit?.limit || plan?.benefits.playlistDownloads?.limit || 0;
                                                    return `${used} / ${limit === -1 ? "∞" : limit}`;
                                                })()}
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full transition-all"
                                                    style={{
                                                        width: `${(() => {
                                                            const customUsed = customBenefits[userForBenefits.id]?.playlistDownloads?.used;
                                                            const used = customUsed !== undefined ? customUsed : (userForBenefits.weeklyPlaylistDownloadsUsed || 0);
                                                            const plan = getUserPlan(userForBenefits.valor || null);
                                                            const customBenefit = customBenefits[userForBenefits.id]?.playlistDownloads;
                                                            const limit = customBenefit?.limit || plan?.benefits.playlistDownloads?.limit || 1;
                                                            if (limit === -1) return 100;
                                                            return Math.min(100, (used / Math.max(1, limit)) * 100);
                                                        })()}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-gray-300">⬇️ Downloads Diários</span>
                                                <span className="text-xs text-gray-400">Hoje</span>
                                            </div>
                                            <div className="text-lg font-bold text-white">
                                                {userForBenefits.dailyDownloadCount || 0}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Último reset: {userForBenefits.lastDownloadReset
                                                    ? new Date(userForBenefits.lastDownloadReset).toLocaleDateString('pt-BR')
                                                    : 'Nunca'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Personalização de Benefícios */}
                                <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <h4 className="font-semibold text-white flex items-center gap-2 mb-4">
                                        ⚙️ Personalizar Benefícios
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Acesso ao Drive */}
                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <label className="text-sm font-medium text-white flex items-center gap-2 mb-2">
                                                📁 Acesso ao Drive Mensal
                                            </label>
                                            <select
                                                value={customBenefits[userForBenefits.id]?.driveAccess?.enabled !== undefined
                                                    ? customBenefits[userForBenefits.id].driveAccess.enabled.toString()
                                                    : getUserBenefits(userForBenefits, customBenefits).driveAccess.enabled.toString()}
                                                onChange={(e) => {
                                                    const newValue = e.target.value === 'true';
                                                    setCustomBenefits(prev => ({
                                                        ...prev,
                                                        [userForBenefits.id]: {
                                                            ...prev[userForBenefits.id],
                                                            driveAccess: { ...prev[userForBenefits.id]?.driveAccess, enabled: newValue }
                                                        }
                                                    }));
                                                }}
                                                className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 text-sm"
                                            >
                                                <option value="true">Sim</option>
                                                <option value="false">Não</option>
                                            </select>
                                        </div>

                                        {/* Solicitação de Packs */}
                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <label className="text-sm font-medium text-white flex items-center gap-2 mb-2">
                                                🎚️ Solicitação de Packs
                                            </label>
                                            <div className="flex gap-2 mb-2">
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-300 mb-1 block">Disponível (4-10)</label>
                                                    <input
                                                        type="number"
                                                        min="4"
                                                        max="10"
                                                        value={customBenefits[userForBenefits.id]?.packRequests?.limit !== undefined
                                                            ? customBenefits[userForBenefits.id].packRequests.limit
                                                            : getUserBenefits(userForBenefits, customBenefits).packRequests.limit}
                                                        onChange={(e) => {
                                                            const newValue = parseInt(e.target.value);
                                                            setCustomBenefits(prev => ({
                                                                ...prev,
                                                                [userForBenefits.id]: {
                                                                    ...prev[userForBenefits.id],
                                                                    packRequests: { ...prev[userForBenefits.id]?.packRequests, limit: newValue, enabled: true }
                                                                }
                                                            }));
                                                        }}
                                                        className="w-full bg-gray-600 text-white border border-gray-500 rounded px-2 py-1 text-sm"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-300 mb-1 block">Usado (manual)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        value={customBenefits[userForBenefits.id]?.packRequests?.used !== undefined
                                                            ? customBenefits[userForBenefits.id].packRequests.used
                                                            : (userForBenefits.weeklyPackRequestsUsed || 0)}
                                                        onChange={(e) => {
                                                            const newValue = parseInt(e.target.value) || 0;
                                                            setCustomBenefits(prev => ({
                                                                ...prev,
                                                                [userForBenefits.id]: {
                                                                    ...prev[userForBenefits.id],
                                                                    packRequests: { ...prev[userForBenefits.id]?.packRequests, used: newValue }
                                                                }
                                                            }));
                                                        }}
                                                        className="w-full bg-gray-600 text-white border border-gray-500 rounded px-2 py-1 text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {customBenefits[userForBenefits.id]?.packRequests?.used !== undefined
                                                    ? customBenefits[userForBenefits.id].packRequests.used
                                                    : (userForBenefits.weeklyPackRequestsUsed || 0)
                                                } de {customBenefits[userForBenefits.id]?.packRequests?.limit !== undefined
                                                    ? customBenefits[userForBenefits.id].packRequests.limit
                                                    : getUserBenefits(userForBenefits, customBenefits).packRequests.limit} usados
                                            </div>
                                        </div>

                                        {/* Conteúdos Avulsos */}
                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <label className="text-sm font-medium text-white flex items-center gap-2 mb-2">
                                                📦 Conteúdos Avulsos
                                            </label>
                                            <select
                                                value={customBenefits[userForBenefits.id]?.individualContent?.enabled !== undefined
                                                    ? customBenefits[userForBenefits.id].individualContent.enabled.toString()
                                                    : getUserBenefits(userForBenefits, customBenefits).individualContent.enabled.toString()}
                                                onChange={(e) => {
                                                    const newValue = e.target.value === 'true';
                                                    setCustomBenefits(prev => ({
                                                        ...prev,
                                                        [userForBenefits.id]: {
                                                            ...prev[userForBenefits.id],
                                                            individualContent: { ...prev[userForBenefits.id]?.individualContent, enabled: newValue }
                                                        }
                                                    }));
                                                }}
                                                className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 text-sm"
                                            >
                                                <option value="true">Sim</option>
                                                <option value="false">Não</option>
                                            </select>
                                        </div>

                                        {/* Packs Extras */}
                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <label className="text-sm font-medium text-white flex items-center gap-2 mb-2">
                                                🔥 Packs Extras
                                            </label>
                                            <select
                                                value={customBenefits[userForBenefits.id]?.extraPacks?.enabled !== undefined
                                                    ? customBenefits[userForBenefits.id].extraPacks.enabled.toString()
                                                    : getUserBenefits(userForBenefits, customBenefits).extraPacks.enabled.toString()}
                                                onChange={(e) => {
                                                    const newValue = e.target.value === 'true';
                                                    setCustomBenefits(prev => ({
                                                        ...prev,
                                                        [userForBenefits.id]: {
                                                            ...prev[userForBenefits.id],
                                                            extraPacks: { ...prev[userForBenefits.id]?.extraPacks, enabled: newValue }
                                                        }
                                                    }));
                                                }}
                                                className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 text-sm"
                                            >
                                                <option value="true">Sim</option>
                                                <option value="false">Não</option>
                                            </select>
                                        </div>

                                        {/* Download de Playlists */}
                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <label className="text-sm font-medium text-white flex items-center gap-2 mb-2">
                                                🎵 Download de Playlists
                                            </label>
                                            <div className="flex gap-2 mb-2">
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-300 mb-1 block">Disponível (7-15)</label>
                                                    <input
                                                        type="number"
                                                        min="7"
                                                        max="15"
                                                        value={customBenefits[userForBenefits.id]?.playlistDownloads?.limit !== undefined
                                                            ? (customBenefits[userForBenefits.id].playlistDownloads.limit === -1 ? 15 : customBenefits[userForBenefits.id].playlistDownloads.limit)
                                                            : (getUserBenefits(userForBenefits, customBenefits).playlistDownloads.limit === -1 ? 15 : getUserBenefits(userForBenefits, customBenefits).playlistDownloads.limit)}
                                                        onChange={(e) => {
                                                            const newValue = parseInt(e.target.value);
                                                            setCustomBenefits(prev => ({
                                                                ...prev,
                                                                [userForBenefits.id]: {
                                                                    ...prev[userForBenefits.id],
                                                                    playlistDownloads: { ...prev[userForBenefits.id]?.playlistDownloads, limit: newValue, enabled: true }
                                                                }
                                                            }));
                                                        }}
                                                        className="w-full bg-gray-600 text-white border border-gray-500 rounded px-2 py-1 text-sm"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-300 mb-1 block">Usado (manual)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="15"
                                                        value={customBenefits[userForBenefits.id]?.playlistDownloads?.used !== undefined
                                                            ? customBenefits[userForBenefits.id].playlistDownloads.used
                                                            : (userForBenefits.weeklyPlaylistDownloadsUsed || 0)}
                                                        onChange={(e) => {
                                                            const newValue = parseInt(e.target.value) || 0;
                                                            setCustomBenefits(prev => ({
                                                                ...prev,
                                                                [userForBenefits.id]: {
                                                                    ...prev[userForBenefits.id],
                                                                    playlistDownloads: { ...prev[userForBenefits.id]?.playlistDownloads, used: newValue }
                                                                }
                                                            }));
                                                        }}
                                                        className="w-full bg-gray-600 text-white border border-gray-500 rounded px-2 py-1 text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {customBenefits[userForBenefits.id]?.playlistDownloads?.used !== undefined
                                                    ? customBenefits[userForBenefits.id].playlistDownloads.used
                                                    : (userForBenefits.weeklyPlaylistDownloadsUsed || 0)
                                                } de {customBenefits[userForBenefits.id]?.playlistDownloads?.limit !== undefined
                                                    ? (customBenefits[userForBenefits.id].playlistDownloads.limit === -1 ? "∞" : customBenefits[userForBenefits.id].playlistDownloads.limit)
                                                    : (getUserBenefits(userForBenefits, customBenefits).playlistDownloads.limit === -1 ? "∞" : getUserBenefits(userForBenefits, customBenefits).playlistDownloads.limit)} usados
                                            </div>
                                        </div>

                                        {/* Deezer Premium */}
                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <label className="text-sm font-medium text-white flex items-center gap-2 mb-2">
                                                🎁 Deezer Premium Grátis
                                            </label>
                                            <select
                                                value={customBenefits[userForBenefits.id]?.deezerPremium?.enabled !== undefined
                                                    ? customBenefits[userForBenefits.id].deezerPremium.enabled.toString()
                                                    : getUserBenefits(userForBenefits, customBenefits).deezerPremium.enabled.toString()}
                                                onChange={(e) => {
                                                    const newValue = e.target.value === 'true';
                                                    setCustomBenefits(prev => ({
                                                        ...prev,
                                                        [userForBenefits.id]: {
                                                            ...prev[userForBenefits.id],
                                                            deezerPremium: { ...prev[userForBenefits.id]?.deezerPremium, enabled: newValue }
                                                        }
                                                    }));
                                                }}
                                                className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 text-sm"
                                            >
                                                <option value="true">Sim</option>
                                                <option value="false">Não</option>
                                            </select>
                                        </div>

                                        {/* Desconto no Deemix */}
                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <label className="text-sm font-medium text-white flex items-center gap-2 mb-2">
                                                💸 Desconto no Deemix
                                            </label>
                                            <select
                                                value={customBenefits[userForBenefits.id]?.deemixDiscount?.enabled !== undefined
                                                    ? customBenefits[userForBenefits.id].deemixDiscount.enabled.toString()
                                                    : getUserBenefits(userForBenefits, customBenefits).deemixDiscount.enabled.toString()}
                                                onChange={(e) => {
                                                    const newValue = e.target.value === 'true';
                                                    setCustomBenefits(prev => ({
                                                        ...prev,
                                                        [userForBenefits.id]: {
                                                            ...prev[userForBenefits.id],
                                                            deemixDiscount: { ...prev[userForBenefits.id]?.deemixDiscount, enabled: newValue }
                                                        }
                                                    }));
                                                }}
                                                className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 text-sm"
                                            >
                                                <option value="true">Sim</option>
                                                <option value="false">Não</option>
                                            </select>
                                        </div>

                                        {/* ARL Premium */}
                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <label className="text-sm font-medium text-white flex items-center gap-2 mb-2">
                                                🔐 ARL Premium para Deemix
                                            </label>
                                            <select
                                                value={customBenefits[userForBenefits.id]?.arlPremium?.enabled !== undefined
                                                    ? customBenefits[userForBenefits.id].arlPremium.enabled.toString()
                                                    : (customBenefits[userForBenefits.id]?.deemixDiscount?.enabled || getUserBenefits(userForBenefits, customBenefits).deemixDiscount.enabled).toString()}
                                                disabled={!(customBenefits[userForBenefits.id]?.deemixDiscount?.enabled || getUserBenefits(userForBenefits, customBenefits).deemixDiscount.enabled)}
                                                onChange={(e) => {
                                                    const newValue = e.target.value === 'true';
                                                    setCustomBenefits(prev => ({
                                                        ...prev,
                                                        [userForBenefits.id]: {
                                                            ...prev[userForBenefits.id],
                                                            arlPremium: { ...prev[userForBenefits.id]?.arlPremium, enabled: newValue }
                                                        }
                                                    }));
                                                }}
                                                className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 text-sm disabled:opacity-50"
                                            >
                                                <option value="true">Sim</option>
                                                <option value="false">Não</option>
                                            </select>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {!(customBenefits[userForBenefits.id]?.deemixDiscount?.enabled || getUserBenefits(userForBenefits, customBenefits).deemixDiscount.enabled)
                                                    ? 'Ativar Deemix primeiro'
                                                    : 'Aplica automaticamente se Deemix ativo'}
                                            </p>
                                        </div>

                                        {/* Produção Musical */}
                                        <div className="bg-gray-700 rounded-lg p-3">
                                            <label className="text-sm font-medium text-white flex items-center gap-2 mb-2">
                                                🎼 Produção da sua Música
                                            </label>
                                            <select
                                                value={customBenefits[userForBenefits.id]?.musicProduction?.enabled !== undefined
                                                    ? customBenefits[userForBenefits.id].musicProduction.enabled.toString()
                                                    : getUserBenefits(userForBenefits, customBenefits).musicProduction.enabled.toString()}
                                                onChange={(e) => {
                                                    const newValue = e.target.value === 'true';
                                                    setCustomBenefits(prev => ({
                                                        ...prev,
                                                        [userForBenefits.id]: {
                                                            ...prev[userForBenefits.id],
                                                            musicProduction: { ...prev[userForBenefits.id]?.musicProduction, enabled: newValue }
                                                        }
                                                    }));
                                                }}
                                                className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 text-sm"
                                            >
                                                <option value="true">Sim</option>
                                                <option value="false">Não</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Botão Salvar Benefícios */}
                                    <div className="mt-4 pt-4 border-t border-gray-600">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    console.log('💾 Salvando benefícios para usuário:', userForBenefits.id);
                                                    console.log('📋 Benefícios:', customBenefits[userForBenefits.id] || {});

                                                    // Mapear campos para API
                                                    const cb = customBenefits[userForBenefits.id] || {};
                                                    const mappedBenefits = {
                                                        ...cb,
                                                        weeklyPackRequests: cb.packRequests?.limit,
                                                        weeklyPackRequestsUsed: cb.packRequests?.used,
                                                        weeklyPlaylistDownloads: cb.playlistDownloads?.limit,
                                                        weeklyPlaylistDownloadsUsed: cb.playlistDownloads?.used,
                                                    };

                                                    const requestBody = {
                                                        userId: userForBenefits.id,
                                                        customBenefits: mappedBenefits
                                                    };

                                                    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

                                                    const response = await fetch('/api/admin/update-custom-benefits', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        credentials: 'include',
                                                        body: JSON.stringify(requestBody)
                                                    });

                                                    const responseData = await response.json();
                                                    console.log('📡 Resposta da API:', responseData);

                                                    if (response.ok) {
                                                        console.log('✅ Benefícios salvos com sucesso!');
                                                        alert('Benefícios personalizados salvos com sucesso!');
                                                        window.location.reload();
                                                    } else {
                                                        console.error('❌ Erro na API:', responseData);
                                                        const errorMessage = responseData.error || responseData.details || 'Erro desconhecido';
                                                        alert(`Erro ao salvar benefícios personalizados: ${errorMessage}`);
                                                    }
                                                } catch (error) {
                                                    console.error('❌ Erro ao salvar benefícios:', error);
                                                    alert(`Erro ao salvar benefícios personalizados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                                                }
                                            }}
                                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                                        >
                                            💾 Salvar Benefícios Personalizados
                                        </button>
                                    </div>
                                </div>

                                {/* Ações de Gerenciamento */}
                                <div className="mb-6 flex flex-wrap gap-3">
                                    <button
                                        onClick={async () => {
                                            if (confirm('Tem certeza que deseja resetar os contadores semanais deste usuário?')) {
                                                try {
                                                    const response = await fetch('/api/admin/reset-weekly-counters', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ userId: userForBenefits.id })
                                                    });

                                                    if (response.ok) {
                                                        alert('Contadores semanais resetados com sucesso!');
                                                        window.location.reload();
                                                    } else {
                                                        alert('Erro ao resetar contadores');
                                                    }
                                                } catch (error) {
                                                    alert('Erro ao resetar contadores');
                                                }
                                            }
                                        }}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
                                    >
                                        🔄 Resetar Contadores Semanais
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (confirm('Tem certeza que deseja resetar o contador diário de downloads deste usuário?')) {
                                                try {
                                                    const response = await fetch('/api/admin/reset-daily-counter', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ userId: userForBenefits.id })
                                                    });

                                                    if (response.ok) {
                                                        alert('Contador diário resetado com sucesso!');
                                                        window.location.reload();
                                                    } else {
                                                        alert('Erro ao resetar contador diário');
                                                    }
                                                } catch (error) {
                                                    alert('Erro ao resetar contador diário');
                                                }
                                            }
                                        }}
                                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                                    >
                                        ⬇️ Resetar Contador Diário
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminAuth>
    );
}