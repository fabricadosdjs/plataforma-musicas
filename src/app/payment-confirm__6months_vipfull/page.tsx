"use client";

import { useEffect, useState } from 'react';
import { CheckCircle, Crown, Calendar, Users, Download, Music, Headphones, MessageCircle, ArrowRight, Star, Zap, Shield, Clock, CreditCard, Gift, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';

export default function PaymentConfirmVIPFull6Months() {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());

    useEffect(() => {
        const now = new Date();
        setCurrentDate(now);

        // Calcular data de 6 meses à frente
        const end = new Date(now);
        end.setMonth(end.getMonth() + 6);
        setEndDate(end);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatFullDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const openWhatsApp = () => {
        const message = `Olá! Acabei de assinar o plano VIP COMPLETO SEMESTRAL (6 meses) e gostaria de reivindicar minha assinatura. Plano: R$ 42,50/mês por 6 meses (R$ 50,00 original com 15% desconto - R$ 255,00 total).`;
        const whatsappUrl = `https://wa.me/5551935052274?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-6 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        {/* Success Badge */}
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-lg font-bold mb-8">
                            <CheckCircle className="w-6 h-6" />
                            PAGAMENTO CONFIRMADO!
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                VIP COMPLETO
                            </span>
                            <br />
                            <span className="text-white">SEMESTRAL</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                            Parabéns! Sua assinatura foi confirmada com sucesso.
                            Você agora tem acesso completo ao maior acervo de música eletrônica do Brasil.
                        </p>

                        {/* Mercado Pago Security Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-semibold mb-6"
                        >
                            <Shield className="w-5 h-5" />
                            Pagamento processado com segurança pelo Mercado Pago
                        </motion.div>

                        {/* Plan Details Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Crown className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Plano VIP Completo</h3>
                                    <p className="text-gray-400">Acesso completo</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-8 h-8 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">6 Meses</h3>
                                    <p className="text-gray-400">Assinatura semestral</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">R$ 42,50/mês</h3>
                                    <p className="text-gray-400">R$ 50,00/mês (15% off)</p>
                                    <p className="text-gray-400">Total: R$ 255,00</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Plan Information */}
            <section className="py-16 bg-[#111111]">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="max-w-6xl mx-auto"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-4xl md:text-5xl font-black mb-3">
                                DETALHES DA SUA
                                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> ASSINATURA</span>
                            </h2>
                            <p className="text-xl text-gray-300">
                                Confira todas as informações sobre seu plano e como acessar a plataforma
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            {/* Timeline Layout */}
                            <div className="space-y-6 relative">
                                {/* Timeline Line */}
                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-green-500/50"></div>

                                {/* 1. Período da Assinatura */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className="relative"
                                >
                                    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 relative overflow-hidden">
                                        {/* Glow Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent"></div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                                        <CardContent className="p-6">
                                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/20">
                                                    <Calendar className="w-6 h-6 text-blue-400" />
                                                </div>
                                                <div>
                                                    <span className="text-white">Período da Assinatura</span>
                                                    <div className="text-sm text-blue-400 font-medium">01</div>
                                                </div>
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                                                    <span className="text-gray-300">Início:</span>
                                                    <span className="text-blue-400 font-semibold">{formatFullDate(currentDate)}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                                                    <span className="text-gray-300">Fim:</span>
                                                    <span className="text-purple-400 font-semibold">{formatFullDate(endDate)}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                                                    <span className="text-gray-300">Duração:</span>
                                                    <span className="text-green-400 font-semibold">6 meses</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* 2. Benefícios Incluídos */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="relative"
                                >
                                    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 relative overflow-hidden">
                                        {/* Glow Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent"></div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                                        <CardContent className="p-6">
                                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-purple-600/20 rounded-full flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/20">
                                                    <Gift className="w-6 h-6 text-purple-400" />
                                                </div>
                                                <div>
                                                    <span className="text-white">Benefícios Incluídos</span>
                                                    <div className="text-sm text-purple-400 font-medium">02</div>
                                                </div>
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
                                                    <Download className="w-5 h-5 text-purple-400" />
                                                    <span className="text-gray-300">Downloads ilimitados</span>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
                                                    <Music className="w-5 h-5 text-purple-400" />
                                                    <span className="text-gray-300">Acesso ao Drive mensal</span>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
                                                    <Users className="w-5 h-5 text-purple-400" />
                                                    <span className="text-gray-300">Solicitação de packs (ilimitado)</span>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
                                                    <Headphones className="w-5 h-5 text-purple-400" />
                                                    <span className="text-gray-300">Deemix Premium incluído</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* 3. Informações de Pagamento */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className="relative"
                                >
                                    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 relative overflow-hidden">
                                        {/* Glow Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent"></div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
                                        <CardContent className="p-6">
                                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-full flex items-center justify-center border border-green-500/30 shadow-lg shadow-green-500/20">
                                                    <CreditCard className="w-6 h-6 text-green-400" />
                                                </div>
                                                <div>
                                                    <span className="text-white">Informações de Pagamento</span>
                                                    <div className="text-sm text-green-400 font-medium">03</div>
                                                </div>
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                                                    <span className="text-gray-300">Valor Mensal:</span>
                                                    <span className="text-green-400 font-semibold">R$ 42,50</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                                                    <span className="text-gray-300">Preço Original:</span>
                                                    <span className="text-blue-400 font-semibold">R$ 50,00/mês</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                                                    <span className="text-gray-300">Desconto:</span>
                                                    <span className="text-purple-400 font-semibold">15% OFF</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                                                    <span className="text-gray-300">Valor Total:</span>
                                                    <span className="text-green-400 font-semibold">R$ 255,00</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                                                    <span className="text-gray-300">Renovação:</span>
                                                    <span className="text-blue-400 font-semibold">Automática</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                                                    <span className="text-gray-300">Processamento:</span>
                                                    <span className="text-green-400 font-semibold">Mercado Pago</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* 4. Como Funciona */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="relative"
                                >
                                    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 relative overflow-hidden">
                                        {/* Glow Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent"></div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                                        <CardContent className="p-6">
                                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/30 to-amber-600/20 rounded-full flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/20">
                                                    <Shield className="w-6 h-6 text-amber-400" />
                                                </div>
                                                <div>
                                                    <span className="text-white">Como Funciona</span>
                                                    <div className="text-sm text-amber-400 font-medium">04</div>
                                                </div>
                                            </h3>
                                            <div className="space-y-4 text-sm text-gray-300">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                                                    <div>
                                                        <strong className="text-amber-400">Renovação Automática:</strong> Sua assinatura será renovada automaticamente a cada 6 meses
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                                                    <div>
                                                        <strong className="text-amber-400">Pagamento Recorrente:</strong> O valor será debitado automaticamente do cartão cadastrado
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                                                    <div>
                                                        <strong className="text-amber-400">Processamento Seguro:</strong> Pagamento processado de forma segura pelo Mercado Pago
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                                                    <div>
                                                        <strong className="text-amber-400">Outras Formas:</strong> Para PIX ou boleto, será necessário assinar novamente
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-[#0d0d0d]">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageCircle className="w-10 h-10 text-green-400" />
                            </div>

                            <h3 className="text-3xl font-bold mb-4">
                                REIVINDIQUE SUA
                                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> ASSINATURA</span>
                            </h3>

                            <p className="text-xl text-gray-300 mb-8">
                                Entre em contato conosco via WhatsApp para ativar sua conta e receber as credenciais de acesso à plataforma.
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-center gap-3 text-lg">
                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                    <span className="text-gray-300">Pagamento confirmado</span>
                                </div>
                                <div className="flex items-center justify-center gap-3 text-lg">
                                    <ArrowRight className="w-6 h-6 text-blue-400" />
                                    <span className="text-gray-300">Próximo passo: Ativação da conta</span>
                                </div>
                                <div className="flex items-center justify-center gap-3 text-lg">
                                    <Star className="w-6 h-6 text-yellow-400" />
                                    <span className="text-gray-300">Acesso imediato após confirmação</span>
                                </div>
                            </div>

                            <Button
                                onClick={openWhatsApp}
                                className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 text-lg flex items-center justify-center gap-3 mx-auto"
                            >
                                <MessageCircle className="w-6 h-6" />
                                ENTRAR EM CONTATO
                                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>

                            <p className="text-sm text-gray-400 mt-4">
                                WhatsApp: +55 51 9 3505-2274
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Additional Info */}
            <section className="py-12 bg-[#0a0a0a]">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent"></div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                                <CardContent className="p-6 text-center relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30 shadow-lg shadow-blue-500/20">
                                        <Zap className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-3 text-white">Acesso Imediato</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">Sua conta será ativada assim que entrarmos em contato via WhatsApp. Processo rápido e seguro!</p>
                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                        <span className="text-blue-400 text-xs font-medium">ATIVAÇÃO RÁPIDA</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent"></div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
                                <CardContent className="p-6 text-center relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30 shadow-lg shadow-purple-500/20">
                                        <Clock className="w-8 h-8 text-purple-400" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-3 text-white">6 Meses de Acesso</h4>
                                    <div className="space-y-2">
                                        <p className="text-gray-300 text-sm">De <span className="text-purple-400 font-semibold">{formatDate(currentDate)}</span></p>
                                        <p className="text-gray-300 text-sm">Até <span className="text-purple-400 font-semibold">{formatDate(endDate)}</span></p>
                                    </div>
                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full">
                                        <Calendar className="w-3 h-3 text-purple-400" />
                                        <span className="text-purple-400 text-xs font-medium">SEMESTRAL</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent"></div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
                                <CardContent className="p-6 text-center relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30 shadow-lg shadow-green-500/20">
                                        <Crown className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-3 text-white">Status VIP</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">Acesso completo a todos os recursos do plano VIP Completo com benefícios exclusivos</p>
                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                                        <Star className="w-3 h-3 text-green-400" />
                                        <span className="text-green-400 text-xs font-medium">PREMIUM</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
} 