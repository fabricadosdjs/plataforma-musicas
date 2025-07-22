"use client";

import { AlertCircle, CheckCircle, Crown, DollarSign, Edit, Filter, Loader2, Plus, Search, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

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
    createdAt: string;
    updatedAt: string;
    dailyDownloadCount: number | null;
    lastDownloadReset: string | null;
    downloadsCount: number;
    likesCount: number;
}

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [vipFilter, setVipFilter] = useState('all');
    const [editForm, setEditForm] = useState({
        name: '',
        whatsapp: '',
        email: '',
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

        setFilteredUsers(filtered);
    }, [users, searchTerm, statusFilter, vipFilter]);

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
                        ? { ...user, deemix: !currentDeemix }
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
                        ? { ...user, is_vip: !currentVipStatus }
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
        setEditForm({
            name: user.name || '',
            whatsapp: user.whatsapp || '',
            email: user.email || '',
            valor: user.valor || 0,
            vencimento: user.vencimento ? user.vencimento.split('T')[0] : '',
            dataPagamento: user.dataPagamento ? user.dataPagamento.split('T')[0] : '',
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
            valor: 0,
            vencimento: '',
            dataPagamento: '',
            status: 'ativo',
            deemix: true,
            is_vip: true,
            dailyDownloadCount: 0
        });
    };

    const openAddModal = () => {
        setShowAddModal(true);
        setEditForm({
            name: '',
            whatsapp: '',
            email: '',
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
                throw new Error('Falha ao adicionar usuário');
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
            <div className="min-h-screen bg-[#202124] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-4" />
                <div className="text-white text-lg">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#202124] text-white">
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
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar Usuário
                    </button>
                </div>

                {/* Filtros e Busca */}
                <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Busca */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, email ou WhatsApp..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* Filtro Status */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
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
                                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                            >
                                <option value="all">Todos os tipos</option>
                                <option value="vip">Usuários VIP</option>
                                <option value="regular">Usuários Regular</option>
                            </select>
                        </div>

                        {/* Estatísticas */}
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400">
                                Total: <span className="text-white font-medium">{filteredUsers.length}</span>
                            </span>
                            <span className="text-gray-400">
                                VIP: <span className="text-yellow-400 font-medium">{filteredUsers.filter(u => u.is_vip).length}</span>
                            </span>
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

                {/* Users Table */}
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                                        Nome
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                                        WhatsApp
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                                        E-mail
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                                        Valor
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                                        Vencimento
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                                        Data Pag.
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                                        Deemix
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-300 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-white">{user.name}</div>
                                            <div className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {user.whatsapp || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {user.valor ? `R$ ${Number(user.valor).toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {user.vencimento ? formatDate(user.vencimento) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {user.dataPagamento ? formatDate(user.dataPagamento) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleUserStatus(user.id, user.status)}
                                                disabled={updating === user.id}
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${user.status === 'ativo'
                                                    ? 'bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30'
                                                    : 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {updating === user.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <>
                                                        <div className={`w-2 h-2 rounded-full ${user.status === 'ativo' ? 'bg-green-400' : 'bg-red-400'}`} />
                                                        {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleDeemixStatus(user.id, user.deemix)}
                                                disabled={updating === user.id}
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${user.deemix
                                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30'
                                                    : 'bg-gray-600/20 text-gray-400 border border-gray-600/30 hover:bg-gray-600/30'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {updating === user.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <>
                                                        <div className={`w-2 h-2 rounded-full ${user.deemix ? 'bg-blue-400' : 'bg-gray-400'}`} />
                                                        {user.deemix ? 'Ativo' : 'Inativo'}
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Editar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && users.length > 0 && (
                        <div className="text-center py-12">
                            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                Nenhum usuário encontrado
                            </h3>
                            <p className="text-gray-500">
                                Tente ajustar os filtros de busca
                            </p>
                        </div>
                    )}

                    {users.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                Nenhum usuário cadastrado
                            </h3>
                            <p className="text-gray-500">
                                Comece adicionando seu primeiro usuário VIP
                            </p>
                            <button
                                onClick={openAddModal}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Adicionar Primeiro Usuário
                            </button>
                        </div>
                    )}
                </div>

                {/* Estatísticas detalhadas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Total de Usuários</h3>
                                <p className="text-3xl font-bold text-blue-400 mt-2">
                                    {users.length}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Usuários VIP</h3>
                                <p className="text-3xl font-bold text-yellow-400 mt-2">
                                    {users.filter(u => u.is_vip).length}
                                </p>
                            </div>
                            <Crown className="w-8 h-8 text-yellow-400" />
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Usuários Ativos</h3>
                                <p className="text-3xl font-bold text-green-400 mt-2">
                                    {users.filter(u => u.status === 'ativo').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Receita Mensal</h3>
                                <p className="text-3xl font-bold text-green-400 mt-2">
                                    R$ {users.filter(u => u.is_vip && u.valor).reduce((acc, u) => acc + (u.valor || 0), 0).toFixed(2)}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Modal de Edição/Adição */}
                {(editingUser || showAddModal) && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-semibold text-white mb-6">
                                {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Nome *
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Nome completo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.whatsapp}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="email@exemplo.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Valor da Assinatura (R$)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editForm.valor}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="ativo">Ativo</option>
                                        <option value="inativo">Inativo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Data de Vencimento
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.vencimento}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, vencimento: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Data do Pagamento
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.dataPagamento}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, dataPagamento: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="deemix-checkbox"
                                                checked={editForm.deemix}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, deemix: e.target.checked }))}
                                                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                                            />
                                            <label htmlFor="deemix-checkbox" className="ml-2 text-sm text-gray-300">
                                                Deemix Ativo
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="vip-checkbox"
                                                checked={editForm.is_vip}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, is_vip: e.target.checked }))}
                                                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                                            />
                                            <label htmlFor="vip-checkbox" className="ml-2 text-sm text-gray-300">
                                                Usuário VIP
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={closeEditModal}
                                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={editingUser ? saveUserEdit : addNewUser}
                                    disabled={updating !== null}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
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
            </div>
        </div>
    );
}
