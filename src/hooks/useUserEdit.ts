import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserData {
    name: string;
    email: string;
    whatsapp?: string;
}

interface UseUserEditReturn {
    isEditing: boolean;
    editingField: string | null;
    editedData: UserData;
    isLoading: boolean;
    error: string | null;
    success: string | null;
    startEditing: (field: string) => void;
    cancelEditing: () => void;
    updateField: (field: string, value: string) => void;
    saveChanges: () => Promise<void>;
    resetMessages: () => void;
}

export const useUserEdit = (): UseUserEditReturn => {
    const { data: session, update } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<UserData>({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        whatsapp: session?.user?.whatsapp || '(51) 98108 - 6784'
    });

    console.log('🔧 Estado inicial do editedData:', editedData);

    // Atualizar dados quando a sessão mudar
    useEffect(() => {
        if (session?.user) {
            const newData = {
                name: session.user.name || '',
                email: session.user.email || '',
                whatsapp: session.user.whatsapp || '(51) 98108 - 6784'
            };
            console.log('🔄 Atualizando dados da sessão:', newData);
            setEditedData(newData);
        }
    }, [session]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const startEditing = useCallback((field: string) => {
        setIsEditing(true);
        setEditingField(field);
        setError(null);
        setSuccess(null);

        // Atualizar o campo específico que está sendo editado
        if (field === 'name') {
            setEditedData(prev => ({ ...prev, name: session?.user?.name || '' }));
        } else if (field === 'email') {
            setEditedData(prev => ({ ...prev, email: session?.user?.email || '' }));
        } else if (field === 'whatsapp') {
            setEditedData(prev => ({ ...prev, whatsapp: session?.user?.whatsapp || '(51) 98108 - 6784' }));
        }
    }, [session]);

    const cancelEditing = useCallback(() => {
        setIsEditing(false);
        setEditingField(null);
        setError(null);
        setSuccess(null);
        // Restaurar dados originais
        setEditedData({
            name: session?.user?.name || '',
            email: session?.user?.email || '',
            whatsapp: session?.user?.whatsapp || '(51) 98108 - 6784'
        });
    }, [session]);

    const updateField = useCallback((field: string, value: string) => {
        console.log(`🔄 Atualizando campo ${field} com valor:`, value);
        setEditedData(prev => {
            const newData = {
                ...prev,
                [field]: value
            };
            console.log('🔄 Novo estado:', newData);
            return newData;
        });
    }, []);

    const saveChanges = useCallback(async () => {
        if (!session?.user?.id) {
            setError('Usuário não autenticado');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Preparar dados para envio
            const dataToSend = {
                name: editedData.name,
                email: editedData.email,
                whatsapp: editedData.whatsapp || null
            };

            console.log('📤 Dados sendo enviados para a API:', dataToSend);

            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao atualizar dados');
            }

            setSuccess(data.message || 'Dados atualizados com sucesso!');
            setIsEditing(false);
            setEditingField(null);

            // Atualizar a sessão para refletir as mudanças
            await update();

            // Sincronizar editedData com os novos dados da sessão
            const newEditedData = {
                name: data.user.name,
                email: data.user.email,
                whatsapp: data.user.whatsapp || '(51) 98108 - 6784'
            };
            console.log('🔄 Sincronizando editedData com novos dados:', newEditedData);
            setEditedData(newEditedData);

            // Limpar mensagem de sucesso após 3 segundos
            setTimeout(() => {
                setSuccess(null);
            }, 3000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setIsLoading(false);
        }
    }, [editedData, session?.user?.id, update]);

    const resetMessages = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    return {
        isEditing,
        editingField,
        editedData,
        isLoading,
        error,
        success,
        startEditing,
        cancelEditing,
        updateField,
        saveChanges,
        resetMessages,
    };
};
