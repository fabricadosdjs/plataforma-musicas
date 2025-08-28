import { useSession } from 'next-auth/react';

export const useHeaderHeight = () => {
    const { data: session } = useSession();

    // Altura base do header: 49px (py-2 = 8px + altura do conteúdo)
    const baseHeaderHeight = 49;

    // Altura da mensagem para usuários não logados: 48px (py-3 = 12px + altura do texto)
    const messageHeight = 48;

    // Altura total do header (sem espaçamento entre header e mensagem)
    const totalHeight = session?.user ? baseHeaderHeight : baseHeaderHeight + messageHeight;

    // Classes de padding para usar nas páginas
    // Como a mensagem está emendada ao header, o padding pode ser mais sutil
    const paddingClasses = session?.user
        ? 'pt-12 lg:pt-16' // Usuário logado: padding normal
        : 'pt-14 lg:pt-18'; // Usuário não logado: padding ajustado para mensagem emendada

    return {
        baseHeaderHeight,
        messageHeight,
        totalHeight,
        paddingClasses,
        hasMessage: !session?.user
    };
};
