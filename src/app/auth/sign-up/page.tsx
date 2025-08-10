// app/auth/sign-up/page.tsx
'use client';

import { ArrowLeft, Lock, MessageCircle, Music } from 'lucide-react';
import NewFooter from '@/components/layout/NewFooter';
import Link from 'next/link';

// Note: Metadata não pode ser exportada de componentes "use client"

const SignUpPage = () => {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 z-0"
            style={{ backgroundColor: '#212121', zIndex: 0 }}
        >
            <div className="w-full max-w-lg">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl mb-4">
                        <Lock className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Acesso Restrito</h1>
                    <p className="text-gray-400">Cadastros disponíveis apenas via administrador</p>
                </div>

                {/* Info Card */}
                <div
                    className="backdrop-blur-sm rounded-2xl p-8 shadow-2xl border"
                    style={{
                        backgroundColor: '#2a2a2a',
                        borderColor: '#3a3a3a'
                    }}
                >
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Cadastro Não Disponível</h2>

                        <div className="space-y-4 text-left">
                            <div
                                className="flex items-start gap-3 p-4 rounded-lg border"
                                style={{
                                    backgroundColor: '#1a2332',
                                    borderColor: '#2563eb50'
                                }}
                            >
                                <MessageCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-blue-300 font-medium text-sm mb-1">Como obter acesso VIP?</h4>
                                    <p className="text-blue-200/80 text-xs leading-relaxed">
                                        Entre em contato com o administrador via WhatsApp para adquirir seu plano VIP.
                                    </p>
                                </div>
                            </div>

                            <div
                                className="flex items-start gap-3 p-4 rounded-lg border"
                                style={{
                                    backgroundColor: '#1a3021',
                                    borderColor: '#16a34a50'
                                }}
                            >
                                <Music className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-green-300 font-medium text-sm mb-1">Benefícios VIP</h4>
                                    <ul className="text-green-200/80 text-xs leading-relaxed space-y-1">
                                        <li>• Player de música exclusivo</li>
                                        <li>• Downloads ilimitados por dia</li>
                                        <li>• Acesso a lançamentos exclusivos</li>
                                        <li>• Suporte prioritário</li>
                                    </ul>
                                </div>
                            </div>

                            <div
                                className="flex items-start gap-3 p-4 rounded-lg border"
                                style={{
                                    backgroundColor: '#2d1b33',
                                    borderColor: '#8b5cf650'
                                }}
                            >
                                <Lock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-purple-300 font-medium text-sm mb-1">Já é VIP?</h4>
                                    <p className="text-purple-200/80 text-xs leading-relaxed">
                                        Use as credenciais enviadas via WhatsApp no momento da ativação do seu plano.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link
                            href="/auth/sign-in"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Voltar para Login
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-gray-500 text-xs">
                        © 2025 Plataforma de Músicas. Acesso exclusivo para membros VIP.
                    </p>
                </div>

                {/* Novo Footer */}
                <NewFooter />
            </div>
        </div>
    );
};

export default SignUpPage;
