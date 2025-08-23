import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';

interface NotificationContextType {
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    addPlanNotification: (title: string, message: string, actionUrl?: string, actionText?: string) => void;
    addSecurityNotification: (title: string, message: string, actionUrl?: string, actionText?: string) => void;
    addDownloadNotification: (title: string, message: string, actionUrl?: string, actionText?: string) => void;
    addFeatureNotification: (title: string, message: string, actionUrl?: string, actionText?: string) => void;
    addSystemNotification: (title: string, message: string, actionUrl?: string, actionText?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext deve ser usado dentro de um NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { addNotification } = useNotifications();

    const addPlanNotification = useCallback((
        title: string,
        message: string,
        actionUrl?: string,
        actionText?: string
    ) => {
        addNotification({
            type: 'warning',
            title,
            message,
            category: 'plan',
            actionUrl,
            actionText
        });
    }, [addNotification]);

    const addSecurityNotification = useCallback((
        title: string,
        message: string,
        actionUrl?: string,
        actionText?: string
    ) => {
        addNotification({
            type: 'warning',
            title,
            message,
            category: 'security',
            actionUrl,
            actionText
        });
    }, [addNotification]);

    const addDownloadNotification = useCallback((
        title: string,
        message: string,
        actionUrl?: string,
        actionText?: string
    ) => {
        addNotification({
            type: 'success',
            title,
            message,
            category: 'download',
            actionUrl,
            actionText
        });
    }, [addNotification]);

    const addFeatureNotification = useCallback((
        title: string,
        message: string,
        actionUrl?: string,
        actionText?: string
    ) => {
        addNotification({
            type: 'info',
            title,
            message,
            category: 'feature',
            actionUrl,
            actionText
        });
    }, [addNotification]);

    const addSystemNotification = useCallback((
        title: string,
        message: string,
        actionUrl?: string,
        actionText?: string
    ) => {
        addNotification({
            type: 'info',
            title,
            message,
            category: 'system',
            actionUrl,
            actionText
        });
    }, [addNotification]);

    const value: NotificationContextType = {
        addNotification,
        addPlanNotification,
        addSecurityNotification,
        addDownloadNotification,
        addFeatureNotification,
        addSystemNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
