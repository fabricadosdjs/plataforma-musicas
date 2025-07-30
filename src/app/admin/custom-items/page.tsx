"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Eye,
    EyeOff,
    ArrowUp,
    ArrowDown,
    Settings,
    Crown,
    Star,
    Gift,
    Zap,
    Shield,
    Music,
    Download,
    Heart,
    Users,
    TrendingUp
} from 'lucide-react';
import Header from '@/components/layout/Header';

interface CustomItem {
    id: number;
    name: string;
    description?: string;
    type: string;
    isActive: boolean;
    icon?: string;
    color?: string;
    order: number;
    createdAt: string;
    updatedAt: string;
    user: {
        name: string;
        email: string;
    };
}

export default function CustomItemsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [customItems, setCustomItems] = useState<CustomItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<CustomItem | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'benefit',
        icon: '',
        color: '#3B82F6',
        order: 0,
        isActive: true
    });

    // Check if user is admin
    useEffect(() => {
        if (session?.user && !session.user.isAdmin) {
            router.push('/access-denied');
        }
    }, [session, router]);

    // Fetch custom items
    const fetchCustomItems = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/custom-items');
            if (response.ok) {
                const data = await response.json();
                setCustomItems(data.customItems || []);
            }
        } catch (error) {
            console.error('Error fetching custom items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.isAdmin) {
            fetchCustomItems();
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingItem
                ? `/api/admin/custom-items`
                : `/api/admin/custom-items`;

            const method = editingItem ? 'PUT' : 'POST';
            const body = editingItem
                ? { ...formData, id: editingItem.id }
                : formData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                setShowModal(false);
                setEditingItem(null);
                resetForm();
                fetchCustomItems();
            }
        } catch (error) {
            console.error('Error saving custom item:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir este item?')) return;

        try {
            const response = await fetch(`/api/admin/custom-items?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchCustomItems();
            }
        } catch (error) {
            console.error('Error deleting custom item:', error);
        }
    };

    const handleEdit = (item: CustomItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            type: item.type,
            icon: item.icon || '',
            color: item.color || '#3B82F6',
            order: item.order,
            isActive: item.isActive
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            type: 'benefit',
            icon: '',
            color: '#3B82F6',
            order: 0,
            isActive: true
        });
    };

    const handleNewItem = () => {
        setEditingItem(null);
        resetForm();
        setShowModal(true);
    };

    const getIconComponent = (iconName: string) => {
        const icons: { [key: string]: React.ReactNode } = {
            'crown': <Crown className="h-5 w-5" />,
            'star': <Star className="h-5 w-5" />,
            'gift': <Gift className="h-5 w-5" />,
            'zap': <Zap className="h-5 w-5" />,
            'shield': <Shield className="h-5 w-5" />,
            'music': <Music className="h-5 w-5" />,
            'download': <Download className="h-5 w-5" />,
            'heart': <Heart className="h-5 w-5" />,
            'users': <Users className="h-5 w-5" />,
            'trending': <TrendingUp className="h-5 w-5" />,
            'settings': <Settings className="h-5 w-5" />
        };
        return icons[iconName] || <Settings className="h-5 w-5" />;
    };

    if (!session?.user?.isAdmin) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Header />
                <div className="container mx-auto px-4 py-8 pt-20">
                    <div className="text-center text-white">
                        <h1 className="text-2xl font-bold">Acesso Negado</h1>
                        <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Header />
            <div className="container mx-auto px-4 py-8 pt-20">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Itens Personalizados</h1>
                            <p className="text-gray-400">Gerencie os itens personalizados do cliente</p>
                        </div>
                        <button
                            onClick={handleNewItem}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Novo Item
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400">Carregando...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customItems.map((item) => (
                            <div
                                key={item.id}
                                className={`bg-gray-800 rounded-lg p-6 border ${item.isActive ? 'border-green-500/30' : 'border-gray-700'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{ backgroundColor: item.color + '20', color: item.color }}
                                        >
                                            {getIconComponent(item.icon || 'settings')}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                                            <p className="text-sm text-gray-400">{item.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.isActive ? (
                                            <Eye className="h-4 w-4 text-green-400" />
                                        ) : (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                {item.description && (
                                    <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <span>Ordem: {item.order}</span>
                                    <span>Criado por: {item.user.name}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                                    >
                                        <Edit className="h-3 w-3" />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    {editingItem ? 'Editar Item' : 'Novo Item'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Nome
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Tipo
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="benefit">Benefício</option>
                                        <option value="feature">Funcionalidade</option>
                                        <option value="tool">Ferramenta</option>
                                        <option value="service">Serviço</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Ícone
                                    </label>
                                    <select
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Selecionar ícone</option>
                                        <option value="crown">Crown</option>
                                        <option value="star">Star</option>
                                        <option value="gift">Gift</option>
                                        <option value="zap">Zap</option>
                                        <option value="shield">Shield</option>
                                        <option value="music">Music</option>
                                        <option value="download">Download</option>
                                        <option value="heart">Heart</option>
                                        <option value="users">Users</option>
                                        <option value="trending">Trending</option>
                                        <option value="settings">Settings</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Cor
                                    </label>
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Ordem
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        min="0"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-gray-300">
                                        Item ativo
                                    </label>
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <Save className="h-4 w-4" />
                                        {editingItem ? 'Atualizar' : 'Criar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 