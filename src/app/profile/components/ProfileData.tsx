"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit,
    Save,
    X,
    Shield,
    Key,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface UserData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    birthDate?: string;
    is_vip?: boolean;
    plan?: string;
    vencimento?: string;
    deemix_enabled?: boolean;
    deemix_credentials?: string;
    allavsoft_enabled?: boolean;
    allavsoft_credentials?: string;
}

export default function ProfileData() {
    const { data: session, update } = useSession();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        birthDate: ''
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (session?.user) {
            fetchUserData();
        }
    }, [session]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/user-data');
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    birthDate: data.birthDate || ''
                });
            }
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await fetch('/api/user-data', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
                setIsEditing(false);
                await update(); // Atualizar sessão
                await fetchUserData(); // Recarregar dados
            } else {
                setMessage({ type: 'error', text: 'Erro ao atualizar dados' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao salvar dados' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: userData?.name || '',
            email: userData?.email || '',
            phone: userData?.phone || '',
            address: userData?.address || '',
            birthDate: userData?.birthDate || ''
        });
        setMessage(null);
    };

    if (!session?.user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="h-8 w-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
                    <p className="text-gray-400">Você precisa estar logado para acessar esta página.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                    <p className="text-white text-xl">Carregando dados...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header da Página */}
            <div className="bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-indigo-900/20 border-b border-gray-800/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Meus Dados
                        </h1>
                        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl">
                            Gerencie suas informações pessoais e credenciais
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Mensagem de Status */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl border ${
                        message.type === 'success' 
                            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                        <div className="flex items-center gap-3">
                            {message.type === 'success' ? (
                                <CheckCircle className="h-5 w-5" />
                            ) : (
                                <AlertCircle className="h-5 w-5" />
                            )}
                            <span>{message.text}</span>
                        </div>
                    </div>
                )}

                {/* Informações Pessoais */}
                <div className="bg-black rounded-2xl p-6 border border-gray-800/50 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-400" />
                            Informações Pessoais
                        </h3>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300"
                            >
                                <Edit className="h-4 w-4" />
                                Editar
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all duration-300"
                                >
                                    <X className="h-4 w-4" />
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Nome</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="Seu nome completo"
                                />
                            ) : (
                                <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white">
                                    {userData?.name || 'Não informado'}
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="seu@email.com"
                                />
                            ) : (
                                <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white">
                                    {userData?.email || 'Não informado'}
                                </div>
                            )}
                        </div>

                        {/* Telefone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Telefone</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="(11) 99999-9999"
                                />
                            ) : (
                                <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white">
                                    {userData?.phone || 'Não informado'}
                                </div>
                            )}
                        </div>

                        {/* Endereço */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Endereço</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="Seu endereço completo"
                                />
                            ) : (
                                <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white">
                                    {userData?.address || 'Não informado'}
                                </div>
                            )}
                        </div>

                        {/* Data de Nascimento */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Data de Nascimento</label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            ) : (
                                <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white">
                                    {userData?.birthDate ? new Date(userData.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
                                </div>
                            )}
                        </div>

                        {/* Status VIP */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Status VIP</label>
                            <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                    userData?.is_vip 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                    {userData?.is_vip ? 'Ativo' : 'Inativo'}
                                </span>
                                {userData?.plan && (
                                    <span className="ml-3 text-white">({userData.plan})</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ferramentas Premium */}
                <div className="bg-black rounded-2xl p-6 border border-gray-800/50 mb-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Key className="h-5 w-5 text-yellow-400" />
                        Ferramentas Premium
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Deemix Premium */}
                        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-500/20">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-white">Deemix Premium</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    userData?.deemix_enabled 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : 'bg-red-500/20 text-red-400'
                                }`}>
                                    {userData?.deemix_enabled ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-sm">Status:</span>
                                    <span className={`text-sm font-medium ${
                                        userData?.deemix_enabled ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {userData?.deemix_enabled ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                
                                {userData?.deemix_credentials && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400 text-sm">Credenciais:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-sm font-mono bg-gray-800 px-2 py-1 rounded">
                                                {showPassword ? userData.deemix_credentials : '••••••••••••'}
                                            </span>
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-gray-400 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Allavsoft Premium */}
                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-white">Allavsoft Premium</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    userData?.allavsoft_enabled 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : 'bg-red-500/20 text-red-400'
                                }`}>
                                    {userData?.allavsoft_enabled ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-sm">Status:</span>
                                    <span className={`text-sm font-medium ${
                                        userData?.allavsoft_enabled ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {userData?.allavsoft_enabled ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                
                                {userData?.allavsoft_credentials && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400 text-sm">Credenciais:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-sm font-mono bg-gray-800 px-2 py-1 rounded">
                                                {showPassword ? userData.allavsoft_credentials : '••••••••••••'}
                                            </span>
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-gray-400 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informações da Conta */}
                <div className="bg-black rounded-2xl p-6 border border-gray-800/50">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-400" />
                        Informações da Conta
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-gray-800/30">
                                <span className="text-gray-400">ID da Conta</span>
                                <span className="text-white font-mono text-sm">{userData?.id}</span>
                            </div>
                            
                            <div className="flex items-center justify-between py-3 border-b border-gray-800/30">
                                <span className="text-gray-400">Tipo de Conta</span>
                                <span className="text-white font-medium">
                                    {userData?.is_vip ? 'Premium' : 'Básica'}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between py-3">
                                <span className="text-gray-400">Membro desde</span>
                                <span className="text-white font-medium">2024</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-gray-800/30">
                                <span className="text-gray-400">Plano Atual</span>
                                <span className="text-white font-medium">
                                    {userData?.plan || 'Gratuito'}
                                </span>
                            </div>
                            
                            {userData?.vencimento && (
                                <div className="flex items-center justify-between py-3 border-b border-gray-800/30">
                                    <span className="text-gray-400">Vencimento VIP</span>
                                    <span className="text-white font-medium">
                                        {new Date(userData.vencimento).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between py-3">
                                <span className="text-gray-400">Última Atualização</span>
                                <span className="text-white font-medium">Hoje</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
