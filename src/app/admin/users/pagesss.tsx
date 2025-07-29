"use client";
// ...existing code...
import { Edit, Plus, Trash, User, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import './users.module.css';

interface User {
    id: string;
    name: string;
    whatsapp?: string;
    email: string;
    password?: string;
    valor?: number;
    vencimento?: string;
    dataPagamento?: string;
    status: string;
    deemix: boolean;
    is_vip: boolean;
    createdAt: string;
    updatedAt: string;
    dailyDownloadCount: number | null;
    lastDownloadReset: string | null;
    weeklyPackRequests?: number;
    weeklyPlaylistDownloads?: number;
    lastWeekReset?: string | null;
    customBenefits?: any;
    downloadsCount: number;
    likesCount: number;
}

// Definição dos benefícios padrão dos planos VIP
const VIP_BENEFITS = {
    BASICO: {
        driveAccess: { enabled: true, description: 'Ilimitado' },
        packRequests: { enabled: true, limit: 4, description: 'Até 4 estilos por semana' },
        individualContent: { enabled: true, description: 'Downloads ilimitados' },
        extraPacks: { enabled: true, description: 'Downloads ilimitados' },
        playlistDownloads: { enabled: true, limit: 7, description: 'Até 7 por semana' },
        deezerPremium: { enabled: false, description: 'Não disponível' },
        deemixDiscount: { enabled: false, percentage: 0, description: 'Não disponível' },
        arlPremium: { enabled: false, description: 'Não disponível' },
        musicProduction: { enabled: false, description: 'Não disponível' }
    },
    PADRAO: {
        driveAccess: { enabled: true, description: 'Ilimitado' },
        packRequests: { enabled: true, limit: 6, description: 'Até 6 estilos por semana' },
        individualContent: { enabled: true, description: 'Downloads ilimitados' },
        extraPacks: { enabled: true, description: 'Downloads ilimitados' },
        playlistDownloads: { enabled: true, limit: 9, description: 'Até 9 por semana' },
        deezerPremium: { enabled: false, description: 'Não disponível' },
        deemixDiscount: { enabled: true, percentage: 15, description: 'Incluso' },
        arlPremium: { enabled: false, description: 'Não disponível' },
        musicProduction: { enabled: false, description: 'Não disponível' }
    },
    COMPLETO: {
        driveAccess: { enabled: true, description: 'Ilimitado' },
        packRequests: { enabled: true, limit: 8, description: 'Até 8 estilos por semana' },
        individualContent: { enabled: true, description: 'Downloads ilimitados' },
        extraPacks: { enabled: true, description: 'Downloads ilimitados' },
        playlistDownloads: { enabled: true, limit: -1, description: 'Ilimitado (máx. 4 por dia)' },
        deezerPremium: { enabled: true, description: 'Incluso' },
        deemixDiscount: { enabled: true, percentage: 15, description: 'Incluso' },
        arlPremium: { enabled: true, description: 'Incluso' },
        musicProduction: { enabled: true, description: 'Incluso' }
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

    // Função para mostrar mensagens
    const showMessage = (msg: string, type: 'success' | 'error') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    // Função para buscar usuários da API
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            } else {
                showMessage('Erro ao buscar usuários', 'error');
            }
        } catch (error) {
            showMessage('Erro ao buscar usuários', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Função para editar usuário
    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || '',
            whatsapp: user.whatsapp || '',
            email: user.email || '',
            password: '',
            valor: user.valor || 0,
            vencimento: user.vencimento || '',
            dataPagamento: user.dataPagamento || '',
            status: user.status || 'ativo',
            deemix: user.deemix,
            is_vip: user.is_vip,
            dailyDownloadCount: user.dailyDownloadCount || 0
        });
    };

    // Função para deletar usuário
    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
    };

    // Função para copiar para a área de transferência
    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            showMessage(`${label} copiado!`, 'success');
        });
    };
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
        return hoje.getTime() > dataVencimento.getTime();
    };

    return (
        <div className="admin-users-bg">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="admin-users-header">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                                    <Users className="h-8 w-8 text-white" />
                                </div>
                                Administração de Usuários
                            </h1>
                            <p className="text-gray-400 mt-2 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Gerencie todos os usuários VIP da plataforma
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Novo Usuário
                        </button>
                    </div>
                </div>

                {/* Tabela de usuários estilizada */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-users-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>WhatsApp</th>
                                <th>E-mail</th>
                                <th>Valor</th>
                                <th>Vencimento</th>
                                <th>Data Pag.</th>
                                <th>Status</th>
                                <th>Deemix</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="user-name">{user.name}</td>
                                    <td>{user.whatsapp || '-'}</td>
                                    <td><span className="user-email">{user.email}</span></td>
                                    <td>{user.valor ? `R$ ${Number(user.valor).toFixed(2)}` : '-'}</td>
                                    <td>{user.vencimento ? new Date(user.vencimento).toLocaleDateString('pt-BR') : '-'}</td>
                                    <td>{user.dataPagamento ? new Date(user.dataPagamento).toLocaleDateString('pt-BR') : '-'}</td>
                                    <td className={user.status === 'ativo' ? 'status-ativo' : 'status-inativo'}>{user.status}</td>
                                    <td>{user.deemix ? 'Sim' : 'Não'}</td>
                                    <td className="user-actions">
                                        <button className="edit" onClick={() => handleEditUser(user)}><Edit className="h-4 w-4" /></button>
                                        <button className="delete" onClick={() => handleDeleteUser(user)}><Trash className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
