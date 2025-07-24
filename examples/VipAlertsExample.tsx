// Exemplo de uso do novo sistema de alertas VIP
import { useAppContext } from '@/context/AppContext';

export function ExampleVipAlerts() {
    const { showAlert, showVipAlert, showAccessCheckAlert } = useAppContext();

    // 1. Alerta padrão (5 segundos)
    const showNormalAlert = () => {
        showAlert('Operação realizada com sucesso!');
    };

    // 2. Alerta VIP bonito (15 segundos)
    const showVipDownload = () => {
        showVipAlert('✨ Download VIP autorizado! Seu arquivo está sendo preparado...');
    };

    // 3. Alerta de verificação de perfil (15 segundos)
    const showAccessCheck = () => {
        showAccessCheckAlert('Verificando perfil e permissões VIP...');
    };

    return (
        <div className="space-y-4">
            <button onClick={showNormalAlert}>
                Mostrar Alerta Normal
            </button>
            <button onClick={showVipDownload}>
                Mostrar Alerta VIP
            </button>
            <button onClick={showAccessCheck}>
                Mostrar Verificação de Perfil
            </button>
        </div>
    );
}

// Como usar em outros componentes:

// 1. Para downloads VIP:
// showVipAlert('🎵 Download VIP iniciado! Qualidade premium garantida.');

// 2. Para verificações de perfil:
// showAccessCheckAlert('Verificando benefícios VIP e permissões...');

// 3. Para mensagens de boas-vindas VIP:
// showVipAlert('👑 Bem-vindo de volta, usuário VIP! Acesso total liberado.');

// 4. Para notificações de upgrade:
// showVipAlert('🚀 Parabéns! Sua conta foi promovida para VIP Premium!');

// 5. Para avisos de acesso:
// showAccessCheckAlert('Analisando seu perfil para liberar conteúdo exclusivo...');
