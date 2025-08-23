import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export interface Notification {
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    category: 'plan' | 'system' | 'download' | 'security' | 'feature';
    actionUrl?: string;
    actionText?: string;
}

export const useNotifications = () => {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [lastCheck, setLastCheck] = useState<Date>(new Date());
    const hasCheckedRef = useRef<{
        system: boolean;
        security: boolean;
        feature: boolean;
        vip: boolean;
    }>({
        system: false,
        security: false,
        feature: false,
        vip: false
    });

    // Rastrear notificações excluídas para evitar que apareçam novamente
    const [excludedNotifications, setExcludedNotifications] = useState<Set<string>>(new Set());

    // Função para adicionar notificação
    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        // Verificar se esta notificação já foi excluída
        const notificationKey = `${notification.category}-${notification.title}-${notification.message}`;
        if (excludedNotifications.has(notificationKey)) {
            return; // Não adicionar notificação excluída
        }

        const newNotification: Notification = {
            ...notification,
            id: `${notification.category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            read: false,
        };

        setNotifications(prev => {
            // Limitar a 10 notificações, removendo as mais antigas
            const updated = [newNotification, ...prev];
            if (updated.length > 10) {
                return updated.slice(0, 10);
            }
            return updated;
        });

        // Salvar no localStorage para persistência
        const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
        stored.unshift(newNotification);
        // Manter apenas 10 notificações no localStorage
        localStorage.setItem('notifications', JSON.stringify(stored.slice(0, 10)));
    }, [excludedNotifications]);

    // Função para marcar como lida
    const markAsRead = useCallback((notificationId: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        ));

        // Atualizar localStorage
        const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
        const updated = stored.map((n: Notification) =>
            n.id === notificationId ? { ...n, read: true } : n
        );
        localStorage.setItem('notifications', JSON.stringify(updated));
    }, []);

    // Função para limpar todas as notificações
    const clearAllNotifications = useCallback(() => {
        // Limpar todas as notificações do estado
        setNotifications([]);

        // Limpar completamente do localStorage
        localStorage.removeItem('notifications');

        // Limpar também as notificações excluídas
        setExcludedNotifications(new Set());
        localStorage.removeItem('excludedNotifications');
    }, []);

    // Função para remover notificação
    const removeNotification = useCallback((notificationId: string) => {
        setNotifications(prev => {
            const notification = prev.find(n => n.id === notificationId);
            if (notification) {
                // Adicionar à lista de notificações excluídas
                const notificationKey = `${notification.category}-${notification.title}-${notification.message}`;
                setExcludedNotifications(prevExcluded => {
                    const newExcluded = new Set(prevExcluded);
                    newExcluded.add(notificationKey);
                    // Salvar no localStorage
                    localStorage.setItem('excludedNotifications', JSON.stringify(Array.from(newExcluded)));
                    return newExcluded;
                });
            }
            return prev.filter(n => n.id !== notificationId);
        });

        // Atualizar localStorage
        const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
        const filtered = stored.filter((n: Notification) => n.id !== notificationId);
        localStorage.setItem('notifications', JSON.stringify(filtered));
    }, []);

    // Verificar vencimento do plano VIP
    const checkVipExpiration = useCallback(() => {
        if (!session?.user) return;

        const user = session.user as any;

        if (user.is_vip && user.vencimento) {
            const vencimentoDate = new Date(user.vencimento);
            const now = new Date();
            const diffTime = vencimentoDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Verificar se já existe notificação de vencimento usando localStorage
            const stored = localStorage.getItem('notifications');
            let hasExpirationNotification = false;

            if (stored) {
                const parsed = JSON.parse(stored);
                hasExpirationNotification = parsed.some((n: any) =>
                    n.category === 'plan' && (n.id.includes('vip-expiring') || n.id.includes('vip-expired'))
                );
            }

            // Remover notificações antigas de vencimento do estado local
            setNotifications(prev => prev.filter(n =>
                !(n.category === 'plan' && (n.id.includes('vip-expiring') || n.id.includes('vip-expired')))
            ));

            if (!hasExpirationNotification) {
                if (diffDays <= 7 && diffDays >= 0) {
                    addNotification({
                        type: 'warning',
                        title: 'Plano VIP Vencendo',
                        message: `Seu plano VIP vence em ${diffDays} dias. Renove para manter seus benefícios!`,
                        category: 'plan',
                        actionUrl: '/plans',
                        actionText: 'Renovar Plano'
                    });
                } else if (diffDays < 0) {
                    addNotification({
                        type: 'error',
                        title: 'Plano VIP Expirado',
                        message: `Seu plano VIP venceu em ${vencimentoDate.toLocaleDateString('pt-BR')}. Renove agora para recuperar seus benefícios!`,
                        category: 'plan',
                        actionUrl: '/plans',
                        actionText: 'Renovar Agora'
                    });
                }
            }
        }
    }, [session, addNotification]);

    // Verificar notificações do sistema
    const checkSystemNotifications = useCallback(() => {
        // Notificação de bem-vindo para novos usuários
        if (session?.user && !hasCheckedRef.current.system) {
            hasCheckedRef.current.system = true;
            const user = session.user as any;
            const userCreated = new Date(user.createdAt || Date.now());
            const daysSinceCreation = Math.ceil((Date.now() - userCreated.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceCreation <= 3) {
                // Verificar se já existe notificação de boas-vindas usando localStorage
                const stored = localStorage.getItem('notifications');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const hasWelcomeNotification = parsed.some((n: any) =>
                        n.category === 'system' && n.id.includes('welcome')
                    );

                    if (!hasWelcomeNotification) {
                        addNotification({
                            type: 'success',
                            title: 'Bem-vindo à Plataforma!',
                            message: 'Explore nossas ferramentas e descubra milhares de músicas. Comece navegando pelas novidades!',
                            category: 'system',
                            actionUrl: '/new',
                            actionText: 'Ver Novidades'
                        });
                    }
                } else {
                    // Se não há notificações salvas, adicionar a de boas-vindas
                    addNotification({
                        type: 'success',
                        title: 'Bem-vindo à Plataforma!',
                        message: 'Explore nossas ferramentas e descubra milhares de músicas. Comece navegando pelas novidades!',
                        category: 'system',
                        actionUrl: '/new',
                        actionText: 'Ver Novidades'
                    });
                }
            }
        }
    }, [session, addNotification]);

    // Verificar notificações de segurança
    const checkSecurityNotifications = useCallback(() => {
        if (session?.user && !hasCheckedRef.current.security) {
            hasCheckedRef.current.security = true;
            const user = session.user as any;

            // Verificar se o usuário tem senha fraca (exemplo)
            if (user.password && user.password.length < 8) {
                // Verificar se já existe notificação de segurança usando localStorage
                const stored = localStorage.getItem('notifications');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const hasPasswordNotification = parsed.some((n: any) =>
                        n.category === 'security' && n.id.includes('weak-password')
                    );

                    if (!hasPasswordNotification) {
                        addNotification({
                            type: 'warning',
                            title: 'Segurança da Conta',
                            message: 'Recomendamos usar uma senha mais forte para proteger sua conta.',
                            category: 'security',
                            actionUrl: '/profile',
                            actionText: 'Alterar Senha'
                        });
                    }
                } else {
                    // Se não há notificações salvas, adicionar a de segurança
                    addNotification({
                        type: 'warning',
                        title: 'Segurança da Conta',
                        message: 'Recomendamos usar uma senha mais forte para proteger sua conta.',
                        category: 'security',
                        actionUrl: '/profile',
                        actionText: 'Alterar Senha'
                    });
                }
            }
        }
    }, [session, addNotification]);

    // Verificar notificações de recursos
    const checkFeatureNotifications = useCallback(() => {
        if (session?.user && !hasCheckedRef.current.feature) {
            hasCheckedRef.current.feature = true;
            const user = session.user as any;

            // Notificar sobre recursos VIP se não for VIP
            if (!user.is_vip) {
                // Verificar se já existe notificação de recursos usando localStorage
                const stored = localStorage.getItem('notifications');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const hasFeatureNotification = parsed.some((n: any) =>
                        n.category === 'feature' && n.id.includes('vip-features')
                    );

                    if (!hasFeatureNotification) {
                        addNotification({
                            type: 'info',
                            title: 'Recursos Premium Disponíveis',
                            message: 'Descubra recursos exclusivos como downloads ilimitados e qualidade FLAC com nossos planos VIP!',
                            category: 'feature',
                            actionUrl: '/plans',
                            actionText: 'Ver Planos'
                        });
                    }
                } else {
                    // Se não há notificações salvas, adicionar a de recursos
                    addNotification({
                        type: 'info',
                        title: 'Recursos Premium Disponíveis',
                        message: 'Descubra recursos exclusivos como downloads ilimitados e qualidade FLAC com nossos planos VIP!',
                        category: 'feature',
                        actionUrl: '/plans',
                        actionText: 'Ver Planos'
                    });
                }
            }
        }
    }, [session, addNotification]);

    // Função para limpar notificações antigas (mais de 30 dias)
    const cleanOldNotifications = useCallback(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        setNotifications(prev => {
            const filtered = prev.filter(n => n.timestamp > thirtyDaysAgo);

            // Atualizar localStorage com as notificações filtradas
            if (filtered.length !== prev.length) {
                localStorage.setItem('notifications', JSON.stringify(filtered));
            }

            return filtered;
        });
    }, []);

    // Carregar notificações do localStorage
    useEffect(() => {
        try {
            // Carregar notificações excluídas
            const excludedStored = localStorage.getItem('excludedNotifications');
            if (excludedStored) {
                const excludedArray = JSON.parse(excludedStored);
                setExcludedNotifications(new Set(excludedArray));
            }

            const stored = localStorage.getItem('notifications');
            if (stored) {
                const parsed = JSON.parse(stored);
                // Converter timestamps de volta para Date objects
                const withDates = parsed.map((n: any) => ({
                    ...n,
                    timestamp: new Date(n.timestamp)
                }));

                // Filtrar notificações antigas ao carregar
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const filtered = withDates.filter(n => n.timestamp > thirtyDaysAgo);

                // Limitar a 10 notificações
                const limited = filtered.slice(0, 10);
                setNotifications(limited);

                // Atualizar localStorage se houve filtragem ou limitação
                if (limited.length !== withDates.length) {
                    localStorage.setItem('notifications', JSON.stringify(limited));
                }
            }
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        }
    }, []);

    // Verificar notificações periodicamente
    useEffect(() => {
        if (session?.user) {
            // Resetar verificações quando a sessão mudar
            hasCheckedRef.current = {
                system: false,
                security: false,
                feature: false,
                vip: false
            };

            // Verificar imediatamente
            checkVipExpiration();
            checkSystemNotifications();
            checkSecurityNotifications();
            checkFeatureNotifications();
            cleanOldNotifications(); // Limpar notificações antigas

            // Verificar a cada 5 minutos
            const interval = setInterval(() => {
                checkVipExpiration();
                cleanOldNotifications(); // Limpar notificações antigas periodicamente
                setLastCheck(new Date());
            }, 5 * 60 * 1000);

            return () => clearInterval(interval);
        }
    }, [session, checkVipExpiration, checkSystemNotifications, checkSecurityNotifications, checkFeatureNotifications, cleanOldNotifications]);

    // Contador de notificações não lidas
    const unreadCount = notifications.filter(n => !n.read).length;

    // Função para resetar verificações (útil para testes)
    const resetChecks = useCallback(() => {
        hasCheckedRef.current = {
            system: false,
            security: false,
            feature: false,
            vip: false
        };
    }, []);

    return {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        clearAllNotifications,
        removeNotification,
        cleanOldNotifications,
        resetChecks,
        lastCheck
    };
};
