"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Music,
    Play,
    Package,
    Headphones,
    Mic,
    Star,
    Clock,
    CheckCircle,
    Send,
    Sparkles,
    Crown,
    Zap,
    Flame,
    Gift,
    Heart,
    TrendingUp,
    Users,
    Calendar,
    FileText,
    MessageSquare,
    Phone,
    Mail,
    MapPin,
    ArrowRight,
    Plus,
    Minus
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import Header from '@/components/layout/Header';
import { useSEO } from '@/hooks/useSEO';
import SEOHead from '@/components/seo/SEOHead';

interface OrderForm {
    name: string;
    email: string;
    phone: string;
    serviceType: 'pack' | 'playlist' | 'custom';
    genre: string;
    description: string;
    quantity: number;
    deadline: string;
    budget: string;
    additionalInfo: string;
}

const SERVICE_TYPES = [
    {
        id: 'pack',
        title: 'Pack de Músicas',
        description: 'Coleção personalizada de músicas para seu estilo',
        icon: Package,
        features: ['20-50 músicas', 'Estilo personalizado', 'Qualidade premium', 'Entrega em 3-5 dias'],
        price: 'R$ 150-500'
    },
    {
        id: 'playlist',
        title: 'Playlist Personalizada',
        description: 'Playlist criada especialmente para suas necessidades',
        icon: Play,
        features: ['15-30 músicas', 'Mix perfeito', 'Transições suaves', 'Entrega em 2-3 dias'],
        price: 'R$ 100-300'
    },
    {
        id: 'custom',
        title: 'Serviço Personalizado',
        description: 'Solução sob medida para suas necessidades específicas',
        icon: Mic,
        features: ['Sob consulta', 'Análise detalhada', 'Solução única', 'Prazo flexível'],
        price: 'Sob consulta'
    }
];

const GENRES = [
    'House', 'Techno', 'Trance', 'Progressive House', 'Deep House',
    'Tech House', 'Melodic Techno', 'Big Room', 'Future House',
    'Tropical House', 'Electro House', 'Dubstep', 'Drum & Bass',
    'Hardstyle', 'Psytrance', 'Minimal', 'Ambient', 'Outro'
];

export default function PedidosPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { showToast } = useToast();

    // SEO para a página
    const { seoData } = useSEO({
        customTitle: 'Pedidos - Serviços Personalizados',
        customDescription: 'Solicite packs, playlists e serviços personalizados de música eletrônica. Atendimento premium para DJs.',
        customKeywords: 'pedidos, packs, playlists, serviços personalizados, música eletrônica, DJ'
    });

    const [form, setForm] = useState<OrderForm>({
        name: '',
        email: '',
        phone: '',
        serviceType: 'pack',
        genre: '',
        description: '',
        quantity: 20,
        deadline: '',
        budget: '',
        additionalInfo: ''
    });

    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState('pack');
    const [userData, setUserData] = useState<any>(null);

    // Buscar dados completos do usuário
    useEffect(() => {
        const fetchUserData = async () => {
            if (session?.user?.email) {
                try {
                    const response = await fetch('/api/user-data');
                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data);
                        
                        // Preencher formulário com dados do usuário
                        setForm(prev => ({
                            ...prev,
                            name: data.name || session.user.name || '',
                            email: data.email || session.user.email || '',
                            phone: data.whatsapp || ''
                        }));
                    }
                } catch (error) {
                    console.error('Erro ao buscar dados do usuário:', error);
                    // Fallback para dados da session
                    setForm(prev => ({
                        ...prev,
                        name: session.user.name || '',
                        email: session.user.email || ''
                    }));
                }
            }
        };

        if (session?.user) {
            fetchUserData();
        }
    }, [session]);

    // Atualizar dados do usuário quando session mudar
    useEffect(() => {
        if (session?.user) {
            setForm(prev => ({
                ...prev,
                name: session.user.name || '',
                email: session.user.email || ''
            }));
        }
    }, [session]);

    const handleInputChange = (field: keyof OrderForm, value: string | number) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) {
            showToast('Você precisa estar logado para fazer um pedido', 'error');
            return;
        }

        if (!form.name || !form.email || !form.description) {
            showToast('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...form,
                    userId: session.user.id,
                    userName: session.user.name,
                    userEmail: session.user.email,
                    userWhatsApp: userData?.whatsapp || ''
                }),
            });

            if (response.ok) {
                showToast('Pedido enviado com sucesso! Entraremos em contato em breve.', 'success');
                setForm({
                    name: session.user.name || '',
                    email: session.user.email || '',
                    phone: userData?.whatsapp || '',
                    serviceType: 'pack',
                    genre: '',
                    description: '',
                    quantity: 20,
                    deadline: '',
                    budget: '',
                    additionalInfo: ''
                });
            } else {
                showToast('Erro ao enviar pedido. Tente novamente.', 'error');
            }
        } catch (error) {
            showToast('Erro ao enviar pedido. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#1B1C1D] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-white mt-4">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1B1C1D] relative overflow-hidden">
            {/* SEO Component */}
            {seoData && <SEOHead {...seoData} />}

            {/* Animated background particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            <Header />

            <main className="container mx-auto px-4 py-8 pt-20 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full backdrop-blur-sm border border-purple-500/30 animate-pulse-glow">
                            <Gift className="h-10 w-10 text-purple-400" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 neon-text">
                        Pedidos Premium
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Solicite packs, playlists e serviços personalizados criados especialmente para suas necessidades
                    </p>
                </div>

                {/* Service Types Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {SERVICE_TYPES.map((service) => (
                        <div
                            key={service.id}
                            className={`glass-effect rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${selectedService === service.id
                                    ? 'border-purple-500/50 bg-purple-600/10'
                                    : 'border-gray-800/50 hover:border-purple-500/30'
                                }`}
                            onClick={() => {
                                setSelectedService(service.id);
                                handleInputChange('serviceType', service.id as any);
                            }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                                    <service.icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{service.title}</h3>
                                    <p className="text-purple-400 font-semibold">{service.price}</p>
                                </div>
                            </div>
                            <p className="text-gray-400 mb-4">{service.description}</p>
                            <ul className="space-y-2">
                                {service.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Order Form */}
                <div className="max-w-4xl mx-auto">
                    <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Solicitar Serviço</h2>
                                <p className="text-gray-400">Preencha os dados para recebermos seu pedido</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* User Info Notice */}
                            {session && (
                                <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-4 mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                        <span className="text-green-400 font-semibold">Dados do Usuário</span>
                                    </div>
                                    <p className="text-gray-300 text-sm">
                                        Seus dados de cadastro foram preenchidos automaticamente. 
                                        Você pode editá-los se necessário.
                                    </p>
                                </div>
                            )}

                            {/* Personal Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-white font-medium mb-2">
                                        Nome * 
                                        {form.name && (
                                            <span className="ml-2 text-green-400 text-sm">✓ Preenchido automaticamente</span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                                        placeholder="Seu nome completo"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white font-medium mb-2">
                                        Email * 
                                        {form.email && (
                                            <span className="ml-2 text-green-400 text-sm">✓ Preenchido automaticamente</span>
                                        )}
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-white font-medium mb-2">
                                    WhatsApp
                                    {form.phone && (
                                        <span className="ml-2 text-green-400 text-sm">✓ Preenchido automaticamente</span>
                                    )}
                                </label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>

                            {/* Service Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-white font-medium mb-2">Gênero Musical</label>
                                    <select
                                        value={form.genre}
                                        onChange={(e) => handleInputChange('genre', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                                    >
                                        <option value="">Selecione um gênero</option>
                                        {GENRES.map((genre) => (
                                            <option key={genre} value={genre}>{genre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white font-medium mb-2">Quantidade de Músicas</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('quantity', Math.max(1, form.quantity - 5))}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                        >
                                            <Minus className="h-4 w-4 text-white" />
                                        </button>
                                        <span className="text-white font-semibold min-w-[3rem] text-center">{form.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('quantity', form.quantity + 5)}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                        >
                                            <Plus className="h-4 w-4 text-white" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-white font-medium mb-2">Descrição do Pedido *</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors h-32 resize-none"
                                    placeholder="Descreva detalhadamente o que você precisa. Inclua referências, estilo desejado, músicas específicas, etc."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-white font-medium mb-2">Prazo Desejado</label>
                                    <input
                                        type="date"
                                        value={form.deadline}
                                        onChange={(e) => handleInputChange('deadline', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white font-medium mb-2">Orçamento</label>
                                    <input
                                        type="text"
                                        value={form.budget}
                                        onChange={(e) => handleInputChange('budget', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                                        placeholder="Ex: R$ 200-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-white font-medium mb-2">Informações Adicionais</label>
                                <textarea
                                    value={form.additionalInfo}
                                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors h-24 resize-none"
                                    placeholder="Qualquer informação adicional que possa nos ajudar a entender melhor sua necessidade..."
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-center pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center gap-3 shadow-lg hover:shadow-purple-500/20"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5" />
                                            Enviar Pedido
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="mt-12 text-center">
                    <div className="glass-effect rounded-2xl p-8 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-white mb-4">Precisa de Ajuda?</h3>
                        <p className="text-gray-300 mb-6">
                            Entre em contato conosco para tirar dúvidas ou solicitar um orçamento personalizado
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center justify-center gap-2 text-gray-300">
                                <Mail className="h-5 w-5 text-purple-400" />
                                <span>contato@nexorrecords.com.br</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-gray-300">
                                <Phone className="h-5 w-5 text-purple-400" />
                                <span>+55 (51) 93505-2274</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-gray-300">
                                <MessageSquare className="h-5 w-5 text-purple-400" />
                                <span>Chat Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 