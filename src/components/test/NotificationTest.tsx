import React from 'react';
import { useNotificationContext } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Crown, Shield, Download, Star, Zap } from 'lucide-react';

export const NotificationTest: React.FC = () => {
    const {
        addNotification,
        addPlanNotification,
        addSecurityNotification,
        addDownloadNotification,
        addFeatureNotification,
        addSystemNotification
    } = useNotificationContext();

    const testNotifications = () => {
        // Notificação de plano
        addPlanNotification(
            'Teste de Plano VIP',
            'Esta é uma notificação de teste para planos VIP.',
            '/plans',
            'Ver Planos'
        );

        // Notificação de segurança
        setTimeout(() => {
            addSecurityNotification(
                'Teste de Segurança',
                'Esta é uma notificação de teste para segurança da conta.',
                '/profile',
                'Verificar Conta'
            );
        }, 1000);

        // Notificação de download
        setTimeout(() => {
            addDownloadNotification(
                'Teste de Download',
                'Esta é uma notificação de teste para downloads.',
                '/downloads',
                'Ver Downloads'
            );
        }, 2000);

        // Notificação de recurso
        setTimeout(() => {
            addFeatureNotification(
                'Teste de Recurso',
                'Esta é uma notificação de teste para recursos premium.',
                '/plans',
                'Ver Recursos'
            );
        }, 3000);

        // Notificação de sistema
        setTimeout(() => {
            addSystemNotification(
                'Teste de Sistema',
                'Esta é uma notificação de teste para o sistema.',
                '/',
                'Ir para Home'
            );
        }, 4000);

        // Notificação personalizada
        setTimeout(() => {
            addNotification({
                type: 'success',
                title: 'Notificação Personalizada',
                message: 'Esta é uma notificação personalizada com tipo success.',
                category: 'system'
            });
        }, 5000);
    };

    const testVipExpiration = () => {
        addPlanNotification(
            'Plano VIP Vencendo',
            'Seu plano VIP vence em 3 dias. Renove para manter seus benefícios!',
            '/plans',
            'Renovar Agora'
        );
    };

    const testVipExpired = () => {
        addPlanNotification(
            'Plano VIP Expirado',
            'Seu plano VIP venceu. Renove agora para recuperar seus benefícios!',
            '/plans',
            'Renovar Agora'
        );
    };

    const testWelcome = () => {
        addSystemNotification(
            'Bem-vindo à Plataforma!',
            'Explore nossas ferramentas e descubra milhares de músicas. Comece navegando pelas novidades!',
            '/new',
            'Ver Novidades'
        );
    };

    const testSecurity = () => {
        addSecurityNotification(
            'Segurança da Conta',
            'Recomendamos usar uma senha mais forte para proteger sua conta.',
            '/profile',
            'Alterar Senha'
        );
    };

    const testFeature = () => {
        addFeatureNotification(
            'Recursos Premium Disponíveis',
            'Descubra recursos exclusivos como downloads ilimitados e qualidade FLAC com nossos planos VIP!',
            '/plans',
            'Ver Planos'
        );
    };

    return (
        <Card className="bg-gray-900/60 border border-gray-700/30 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Bell className="w-5 h-5 text-blue-400" />
                    Teste do Sistema de Notificações
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={testNotifications}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                    >
                        <Bell className="w-4 h-4 mr-2" />
                        Testar Todas
                    </Button>

                    <Button
                        onClick={testVipExpiration}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        size="sm"
                    >
                        <Crown className="w-4 h-4 mr-2" />
                        VIP Vencendo
                    </Button>

                    <Button
                        onClick={testVipExpired}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                    >
                        <Crown className="w-4 h-4 mr-2" />
                        VIP Expirado
                    </Button>

                    <Button
                        onClick={testWelcome}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        Bem-vindo
                    </Button>

                    <Button
                        onClick={testSecurity}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        size="sm"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Segurança
                    </Button>

                    <Button
                        onClick={testFeature}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        size="sm"
                    >
                        <Star className="w-4 h-4 mr-2" />
                        Recursos
                    </Button>
                </div>

                <div className="text-xs text-gray-400 text-center">
                    Clique nos botões para testar diferentes tipos de notificações.
                    <br />
                    As notificações aparecerão no sininho do header.
                </div>
            </CardContent>
        </Card>
    );
};
