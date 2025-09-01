"use client";

import { useState, useEffect } from 'react';
import { MessageSquare, Calendar, User, Edit, Trash2, Plus, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface AdminMessage {
    id: number;
    title: string;
    message: string;
    createdAt: string;
    isActive: boolean;
    user: {
        name: string;
        email: string;
    };
}

interface AdminMessagesDisplayProps {
    showAdminControls?: boolean;
}

export default function AdminMessagesDisplay({ showAdminControls = false }: AdminMessagesDisplayProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<AdminMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMessage, setEditingMessage] = useState<AdminMessage | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        message: ''
    });

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin-messages');
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching admin messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingMessage
                ? `/api/admin-messages/${editingMessage.id}`
                : '/api/admin-messages';

            const method = editingMessage ? 'PUT' : 'POST';
            const body = editingMessage
                ? { ...formData, isActive: true }
                : formData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                setFormData({ title: '', message: '' });
                setShowForm(false);
                setEditingMessage(null);
                fetchMessages();
            } else {
                const error = await response.json();
                alert(`Erro: ${error.error}`);
            }
        } catch (error) {
            console.error('Error saving message:', error);
            alert('Erro ao salvar recado');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja deletar este recado?')) return;

        try {
            const response = await fetch(`/api/admin-messages/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchMessages();
            } else {
                const error = await response.json();
                alert(`Erro: ${error.error}`);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Erro ao deletar recado');
        }
    };

    const handleEdit = (message: AdminMessage) => {
        setEditingMessage(message);
        setFormData({
            title: message.title,
            message: message.message
        });
        setShowForm(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-blue-500/20">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-blue-500/20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                        <MessageSquare className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">RECADOS DA ADM</h2>
                        <p className="text-gray-300 text-sm">Comunicados importantes da administração</p>
                    </div>
                </div>

                {showAdminControls && (session && session.user && (session.user as typeof session.user & { isAdmin?: boolean }).isAdmin) && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Novo Recado
                    </button>
                )}
            </div>

            {/* Formulário para criar/editar recado */}
            {showForm && showAdminControls && session && session.user && (session.user as typeof session.user & { isAdmin?: boolean }).isAdmin && (
                <div className="bg-black/20 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">
                            {editingMessage ? 'Editar Recado' : 'Novo Recado'}
                        </h3>
                        <button
                            onClick={() => {
                                setShowForm(false);
                                setEditingMessage(null);
                                setFormData({ title: '', message: '' });
                            }}
                            className="text-gray-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white font-semibold mb-2">Título</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                placeholder="Digite o título do recado"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-white font-semibold mb-2">Mensagem</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 min-h-[100px] resize-y"
                                placeholder="Digite a mensagem do recado"
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
                            >
                                {editingMessage ? 'Atualizar' : 'Criar'} Recado
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingMessage(null);
                                    setFormData({ title: '', message: '' });
                                }}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de recados */}
            {messages.length > 0 ? (
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className="bg-black/20 rounded-xl p-6 border border-gray-700/50">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-2">{message.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(message.createdAt)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            {message.user.name || 'Administração'}
                                        </div>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {message.message}
                                    </p>
                                </div>

                                {showAdminControls && session && session.user && (session.user as typeof session.user & { isAdmin?: boolean }).isAdmin && (
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleEdit(message)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all duration-300"
                                            title="Editar recado"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(message.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all duration-300"
                                            title="Deletar recado"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum recado da administração no momento</p>
                </div>
            )}
        </div>
    );
} 