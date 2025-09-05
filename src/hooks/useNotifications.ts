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
    // Novos campos para notificações de música
    musicData?: {
        coverUrl?: string;
        artistName?: string;
        songName?: string;
        trackId?: number;
    };
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
        console.log('➕ Tentando adicionar notificação:', notification);

        // Verificar se esta notificação já foi excluída
        const notificationKey = `${notification.category}-${notification.title}-${notification.message}`;
        if (excludedNotifications.has(notificationKey)) {
            console.log('🚫 Notificação excluída, não adicionando:', notificationKey);
            return; // Não adicionar notificação excluída
        }

        const newNotification: Notification = {
            ...notification,
            id: `${notification.category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            read: false,
        };

        console.log('➕ Nova notificação criada:', newNotification);

        setNotifications(prev => {
            // Limitar a 10 notificações, removendo as mais antigas
            const updated = [newNotification, ...prev];
            if (updated.length > 10) {
                console.log('➕ Limitando a 10 notificações, removendo as mais antigas');
                return updated.slice(0, 10);
            }
            return updated;
        });

        // Salvar no localStorage para persistência
        const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
        stored.unshift(newNotification);
        // Manter apenas 10 notificações no localStorage
        localStorage.setItem('notifications', JSON.stringify(stored.slice(0, 10)));
        console.log('➕ Notificação salva no localStorage');

        // Mostrar notificação push nativa se disponível
        showNativeNotification(newNotification);
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
        console.log('🧹 clearAllNotifications chamado');
        console.log('🧹 Estado atual das notificações:', notifications);

        // Limpar todas as notificações do estado
        setNotifications([]);
        console.log('🧹 Estado limpo, notifications agora é array vazio');

        // Limpar completamente do localStorage
        localStorage.removeItem('notifications');
        console.log('🧹 localStorage "notifications" removido');

        // Limpar também as notificações excluídas
        setExcludedNotifications(new Set());
        localStorage.removeItem('excludedNotifications');
        console.log('🧹 localStorage "excludedNotifications" removido');

        // Adicionar um flag para evitar recriação imediata
        localStorage.setItem('notificationsCleared', Date.now().toString());
        console.log('🧹 Flag de limpeza adicionada ao localStorage');

        console.log('🧹 Limpeza completa finalizada');
    }, [notifications]);

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

        // Verificar se as notificações foram limpas recentemente
        const notificationsCleared = localStorage.getItem('notificationsCleared');
        if (notificationsCleared) {
            const clearedTime = parseInt(notificationsCleared);
            const now = Date.now();
            const timeSinceCleared = now - clearedTime;

            // Se foi limpo há menos de 1 minuto, não criar novas notificações
            if (timeSinceCleared < 60000) {
                console.log('👑 Notificações foram limpas recentemente, aguardando antes de criar novas');
                return;
            }
        }

        const user = session.user as any;
        console.log('👑 Verificando vencimento VIP para usuário:', user.id);

        if (user.is_vip && user.vencimento) {
            const vencimentoDate = new Date(user.vencimento);
            const now = new Date();
            const diffTime = vencimentoDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            console.log('👑 Vencimento em:', diffDays, 'dias');

            // Verificar se já existe notificação de vencimento usando localStorage
            const stored = localStorage.getItem('notifications');
            let hasExpirationNotification = false;

            if (stored) {
                const parsed = JSON.parse(stored);
                hasExpirationNotification = parsed.some((n: { category: string; id: string }) =>
                    n.category === 'plan' && (n.id.includes('vip-expiring') || n.id.includes('vip-expired'))
                );
                console.log('👑 Já existe notificação de vencimento?', hasExpirationNotification);
            }

            // Remover notificações antigas de vencimento do estado local
            setNotifications(prev => {
                const filtered = prev.filter(n =>
                    !(n.category === 'plan' && (n.id.includes('vip-expiring') || n.id.includes('vip-expired')))
                );
                console.log('👑 Notificações de vencimento removidas do estado local');
                return filtered;
            });

            if (!hasExpirationNotification) {
                if (diffDays <= 7 && diffDays >= 0) {
                    console.log('👑 Criando notificação de vencimento em', diffDays, 'dias');
                    addNotification({
                        type: 'warning',
                        title: 'Plano VIP Vencendo',
                        message: `Seu plano VIP vence em ${diffDays} dias. Renove para manter seus benefícios!`,
                        category: 'plan',
                        actionUrl: '/plans',
                        actionText: 'Renovar Plano'
                    });
                } else if (diffDays < 0) {
                    console.log('👑 Criando notificação de plano expirado');
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
        } else {
            console.log('👑 Usuário não é VIP ou não tem data de vencimento');
        }
    }, [session, addNotification]);

    // Verificar notificações do sistema
    const checkSystemNotifications = useCallback(() => {
        // Verificar se as notificações foram limpas recentemente
        const notificationsCleared = localStorage.getItem('notificationsCleared');
        if (notificationsCleared) {
            const clearedTime = parseInt(notificationsCleared);
            const now = Date.now();
            const timeSinceCleared = now - clearedTime;

            // Se foi limpo há menos de 1 minuto, não criar novas notificações
            if (timeSinceCleared < 60000) {
                console.log('⚡ Notificações foram limpas recentemente, aguardando antes de criar novas');
                return;
            }
        }

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
                    const hasWelcomeNotification = parsed.some((n: { category: string; id: string }) =>
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
        // Verificar se as notificações foram limpas recentemente
        const notificationsCleared = localStorage.getItem('notificationsCleared');
        if (notificationsCleared) {
            const clearedTime = parseInt(notificationsCleared);
            const now = Date.now();
            const timeSinceCleared = now - clearedTime;

            // Se foi limpo há menos de 1 minuto, não criar novas notificações
            if (timeSinceCleared < 60000) {
                console.log('🛡️ Notificações foram limpas recentemente, aguardando antes de criar novas');
                return;
            }
        }

        if (session?.user && !hasCheckedRef.current.security) {
            hasCheckedRef.current.security = true;
            const user = session.user as any;

            // Verificar se o usuário tem senha fraca (exemplo)
            if (user.password && user.password.length < 8) {
                // Verificar se já existe notificação de segurança usando localStorage
                const stored = localStorage.getItem('notifications');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const hasPasswordNotification = parsed.some((n: { category: string; id: string }) =>
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
        // Verificar se as notificações foram limpas recentemente
        const notificationsCleared = localStorage.getItem('notificationsCleared');
        if (notificationsCleared) {
            const clearedTime = parseInt(notificationsCleared);
            const now = Date.now();
            const timeSinceCleared = now - clearedTime;

            // Se foi limpo há menos de 1 minuto, não criar novas notificações
            if (timeSinceCleared < 60000) {
                console.log('⭐ Notificações foram limpas recentemente, aguardando antes de criar novas');
                return;
            }
        }

        if (session?.user && !hasCheckedRef.current.feature) {
            hasCheckedRef.current.feature = true;
            const user = session.user as any;

            // Notificar sobre recursos VIP se não for VIP
            if (!user.is_vip) {
                // Verificar se já existe notificação de recursos usando localStorage
                const stored = localStorage.getItem('notifications');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const hasFeatureNotification = parsed.some((n: { category: string; id: string }) =>
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
            console.log('📱 Carregando notificações do localStorage...');

            // Verificar se as notificações foram limpas recentemente
            const notificationsCleared = localStorage.getItem('notificationsCleared');
            if (notificationsCleared) {
                const clearedTime = parseInt(notificationsCleared);
                const now = Date.now();
                const timeSinceCleared = now - clearedTime;

                // Se foi limpo há menos de 1 minuto, não carregar notificações
                if (timeSinceCleared < 60000) {
                    console.log('📱 Notificações foram limpas recentemente, não carregando do localStorage');
                    setNotifications([]);
                    return;
                }
            }

            // Carregar notificações excluídas
            const excludedStored = localStorage.getItem('excludedNotifications');
            if (excludedStored) {
                const excludedArray = JSON.parse(excludedStored);
                setExcludedNotifications(new Set(excludedArray));
                console.log('📱 Notificações excluídas carregadas:', excludedArray);
            }

            const stored = localStorage.getItem('notifications');
            if (stored) {
                const parsed = JSON.parse(stored);
                console.log('📱 Notificações encontradas no localStorage:', parsed);

                // Converter timestamps de volta para Date objects
                const withDates = parsed.map((n: { timestamp: string | number | Date }) => ({
                    ...n,
                    timestamp: new Date(n.timestamp)
                }));

                // Filtrar notificações antigas ao carregar
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const filtered = withDates.filter((n: { timestamp: Date }) => n.timestamp > thirtyDaysAgo);
                console.log('📱 Notificações após filtro de 30 dias:', filtered);

                // Limitar a 10 notificações
                const limited = filtered.slice(0, 10);
                setNotifications(limited);
                console.log('📱 Notificações finais carregadas:', limited);

                // Atualizar localStorage se houve filtragem ou limitação
                if (limited.length !== withDates.length) {
                    localStorage.setItem('notifications', JSON.stringify(limited));
                    console.log('📱 localStorage atualizado após filtragem');
                }
            } else {
                console.log('📱 Nenhuma notificação encontrada no localStorage');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar notificações:', error);
        }
    }, []);

    // Verificar notificações periodicamente
    useEffect(() => {
        if (session?.user) {
            console.log('⏰ Iniciando verificações periódicas de notificações para usuário:', session.user.id);

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
                console.log('⏰ Executando verificações periódicas...');
                checkVipExpiration();
                cleanOldNotifications(); // Limpar notificações antigas periodicamente
                setLastCheck(new Date());
            }, 5 * 60 * 1000);

            return () => {
                console.log('⏰ Limpando intervalo de verificações periódicas');
                clearInterval(interval);
            };
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

    // Função para mostrar notificação push nativa do Android
    const showNativeNotification = useCallback((notification: Notification) => {
        // Verificar se o navegador suporta notificações
        if (!('Notification' in window)) {
            console.log('📱 Notificações nativas não suportadas neste navegador');
            return;
        }

        // Verificar se é uma notificação de música
        if (notification.musicData) {
            const { coverUrl, artistName, songName, trackId } = notification.musicData;

            // Solicitar permissão se necessário
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        createMusicNotification(notification);
                    }
                });
            } else if (Notification.permission === 'granted') {
                createMusicNotification(notification);
            }
        }
    }, []);

    // Função para criar notificação de música específica
    const createMusicNotification = useCallback((notification: Notification) => {
        const { coverUrl, artistName, songName, trackId } = notification.musicData!;

        // Criar notificação com dados da música
        const musicNotification = new Notification(notification.title, {
            body: notification.message,
            icon: coverUrl || '/favicon.ico', // Usar capa da música ou favicon como fallback
            badge: '/favicon.ico',
            tag: `music-${trackId}`, // Tag única para evitar duplicatas
            requireInteraction: false,
            silent: false,
            data: {
                trackId,
                artistName,
                songName,
                coverUrl,
                actionUrl: notification.actionUrl
            }
        });

        // Adicionar evento de clique
        musicNotification.onclick = () => {
            // Focar na janela se estiver em background
            window.focus();

            // Se tiver URL de ação, navegar para ela
            if (notification.actionUrl) {
                window.location.href = notification.actionUrl;
            }

            // Fechar a notificação
            musicNotification.close();
        };

        // Auto-fechar após 5 segundos
        setTimeout(() => {
            musicNotification.close();
        }, 5000);

        console.log('📱 Notificação push nativa criada para música:', songName);
    }, []);

    return {
        notifications,
        addNotification,
        markAsRead,
        clearAllNotifications,
        removeNotification,
        cleanOldNotifications,
        lastCheck,
        hasCheckedRef,
        excludedNotifications,
        setExcludedNotifications,
        // Nova função para notificações de música
        addMusicNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'> & { musicData: NonNullable<Notification['musicData']> }) => {
            addNotification(notification);
        },
        resetChecks,
    };
};
