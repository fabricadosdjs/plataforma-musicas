# 🔔 Sistema de Notificações - Plataforma Músicas

## 📋 Visão Geral

O sistema de notificações implementado oferece uma experiência completa de alertas para os usuários, incluindo notificações sobre planos VIP, segurança da conta, downloads, recursos premium e mensagens do sistema.

## ✨ Características Principais

### 🔔 **Sino de Notificações no Header**
- **Ícone de sino** sempre visível no header
- **Contador de notificações não lidas** com badge vermelho
- **Menu dropdown** com todas as notificações
- **Persistência** no localStorage
- **Responsivo** para mobile e desktop

### 📱 **Tipos de Notificações**
- **🔴 Error**: Problemas críticos (plano expirado)
- **🟡 Warning**: Avisos importantes (plano vencendo)
- **🟢 Success**: Confirmações (download concluído)
- **🔵 Info**: Informações gerais (recursos disponíveis)

### 🏷️ **Categorias de Notificações**
- **👑 Plan**: Notificações relacionadas a planos VIP
- **🛡️ Security**: Alertas de segurança da conta
- **⬇️ Download**: Confirmações de downloads
- **⭐ Feature**: Recursos premium disponíveis
- **⚡ System**: Mensagens do sistema

## 🚀 Como Usar

### 1. **Hook Principal: `useNotifications`**
```typescript
import { useNotifications } from '@/hooks/useNotifications';

const { 
  notifications, 
  unreadCount, 
  addNotification, 
  markAsRead, 
  clearAllNotifications,
  removeNotification,
  cleanOldNotifications,
  lastCheck
} = useNotifications();
```

### 2. **Contexto de Notificações: `useNotificationContext`**
```typescript
import { useNotificationContext } from '@/context/NotificationContext';

const { 
  addPlanNotification,
  addSecurityNotification,
  addDownloadNotification,
  addFeatureNotification,
  addSystemNotification
} = useNotificationContext();
```

### 3. **Exemplos de Uso**

#### **Notificação de Plano VIP**
```typescript
addPlanNotification(
  'Plano VIP Vencendo',
  'Seu plano VIP vence em 3 dias. Renove para manter seus benefícios!',
  '/plans',
  'Renovar Agora'
);
```

#### **Notificação de Segurança**
```typescript
addSecurityNotification(
  'Segurança da Conta',
  'Recomendamos usar uma senha mais forte para proteger sua conta.',
  '/profile',
  'Alterar Senha'
);
```

#### **Notificação de Download**
```typescript
addDownloadNotification(
  'Download Concluído',
  '"Nome da Música" foi baixada com sucesso!',
  '/downloads',
  'Ver Downloads'
);
```

#### **Notificação de Recurso**
```typescript
addFeatureNotification(
  'Recursos Premium Disponíveis',
  'Descubra downloads ilimitados e qualidade FLAC com nossos planos VIP!',
  '/plans',
  'Ver Planos'
);
```

#### **Notificação de Sistema**
```typescript
addSystemNotification(
  'Bem-vindo à Plataforma!',
  'Explore nossas ferramentas e descubra milhares de músicas.',
  '/new',
  'Ver Novidades'
);
```

#### **Notificação Personalizada**
```typescript
addNotification({
  type: 'success',
  title: 'Título Personalizado',
  message: 'Mensagem personalizada',
  category: 'system',
  actionUrl: '/custom',
  actionText: 'Ação Personalizada'
});
```

### **4. **Funções de Limpeza e Gerenciamento**

#### **Limpar Todas as Notificações**
```typescript
clearAllNotifications(); // Remove todas as notificações permanentemente
```

#### **Limpar Notificações Antigas**
```typescript
cleanOldNotifications(); // Remove notificações com mais de 30 dias
```

#### **Remover Notificação Específica**
```typescript
removeNotification('notification-id'); // Remove uma notificação específica
```

#### **Marcar como Lida**
```typescript
markAsRead('notification-id'); // Marca uma notificação como lida
```

## 🔧 Implementação Técnica

### **Estrutura de Arquivos**
```
src/
├── hooks/
│   └── useNotifications.ts          # Hook principal
├── context/
│   └── NotificationContext.tsx      # Contexto global
├── components/
│   ├── ui/
│   │   └── NotificationItem.tsx    # Item de notificação
│   └── test/
│       └── NotificationTest.tsx    # Componente de teste
└── components/layout/
    └── Header.tsx                  # Header com sininho
```

### **Hook `useNotifications`**
- **Estado local** das notificações
- **Persistência** no localStorage
- **Verificação automática** de vencimento VIP
- **Limpeza automática** de notificações antigas (mais de 30 dias)
- **Intervalo de verificação** a cada 5 minutos
- **Filtragem automática** ao carregar do localStorage

### **Contexto `NotificationContext`**
- **Funções especializadas** para cada categoria
- **Integração** com o hook principal
- **Disponível globalmente** através do AppContext

### **Componente `NotificationItem`**
- **Design responsivo** e moderno
- **Ícones específicos** para cada categoria
- **Botões de ação** quando disponíveis
- **Tempo relativo** (ex: "2h atrás")
- **Animações** e transições suaves

## 📱 **Funcionalidades do Header**

### **Sino de Notificações**
- **Badge vermelho** com contador de não lidas
- **Menu dropdown** com scroll
- **Botão "Limpar Antigas"** para remover notificações com mais de 30 dias
- **Botão "Limpar Tudo"** para remover todas as notificações permanentemente
- **Confirmação** antes de limpar (prevenção de acidentes)
- **Feedback visual** após limpeza (✓ Limpo!)
- **Fechamento automático** ao clicar fora

### **Menu de Perfil**
- **Informações do usuário** com status VIP
- **Data de vencimento** do plano
- **Links rápidos** para perfil e logout

## 🎯 **Casos de Uso Implementados**

### **1. Verificação Automática de Planos VIP**
- **7 dias antes** do vencimento: Notificação amarela
- **Após vencimento**: Notificação vermelha
- **Links diretos** para renovação

### **2. Notificações de Download**
- **Confirmação** após download bem-sucedido
- **Link direto** para página de downloads
- **Persistência** para histórico

### **3. Notificações de Segurança**
- **Senhas fracas** detectadas
- **Recomendações** de segurança
- **Links diretos** para configurações

### **4. Notificações de Recursos**
- **Usuários não VIP**: Recursos premium disponíveis
- **Usuários VIP**: Add-ons como Deemix
- **Call-to-action** direto para planos

### **5. Notificações de Sistema**
- **Bem-vindo** para novos usuários
- **Atualizações** e novidades
- **Manutenção** e avisos

## 🧪 **Testando o Sistema**

### **Componente de Teste**
```typescript
import { NotificationTest } from '@/components/test/NotificationTest';

// Adicione em qualquer página para testar
<NotificationTest />
```

### **Botões de Teste Disponíveis**
- **Testar Todas**: Sequência de 6 notificações
- **VIP Vencendo**: Simula plano próximo ao vencimento
- **VIP Expirado**: Simula plano expirado
- **Bem-vindo**: Notificação de boas-vindas
- **Segurança**: Alerta de segurança
- **Recursos**: Informação sobre recursos premium

## 🔄 **Fluxo de Notificações**

### **1. Criação**
```typescript
addNotification() // Hook direto
addPlanNotification() // Contexto especializado
```

### **2. Exibição**
- **Header**: Sino com badge
- **Menu dropdown**: Lista completa
- **Item individual**: Categoria, tempo, ação

### **3. Interação**
- **Clique**: Marca como lida
- **Botão de ação**: Navega para URL
- **Limpar tudo**: Marca todas como lidas

### **4. Persistência**
- **localStorage**: Salva até 50 notificações
- **Sessão**: Mantém estado durante navegação
- **Limpeza automática**: Remove notificações com mais de 30 dias
- **Filtragem automática**: Ao carregar, remove notificações antigas
- **Limpeza manual**: Botões para limpar antigas ou todas

## 🎨 **Personalização**

### **Estilos CSS**
- **Cores por categoria**: Planos (amarelo), Segurança (vermelho), etc.
- **Animações**: Pulse para não lidas, hover effects
- **Responsividade**: Mobile-first design

### **Ícones por Categoria**
- **👑 Plan**: Crown icon
- **🛡️ Security**: Shield icon
- **⬇️ Download**: Download icon
- **⭐ Feature**: Star icon
- **⚡ System**: Zap icon

## 📊 **Monitoramento e Debug**

### **Console Logs**
- **Criação** de notificações
- **Erros** de localStorage
- **Verificações** automáticas

### **Estado das Notificações**
- **Contador** de não lidas
- **Total** de notificações
- **Última verificação** automática

## 🚀 **Próximos Passos**

### **Funcionalidades Futuras**
- **Notificações push** para navegador
- **Email** para notificações críticas
- **Configurações** de preferências
- **Filtros** por categoria
- **Histórico** completo

### **Integrações**
- **WebSocket** para notificações em tempo real
- **API externa** para notificações de sistema
- **Analytics** de engajamento

## 📝 **Exemplo Completo**

```typescript
// Em qualquer componente
import { useNotificationContext } from '@/context/NotificationContext';

export function MeuComponente() {
  const { addPlanNotification } = useNotificationContext();

  const handleVipExpiration = () => {
    addPlanNotification(
      'Plano VIP Vencendo',
      'Seu plano vence em 3 dias. Renove agora!',
      '/plans',
      'Renovar Plano'
    );
  };

  return (
    <button onClick={handleVipExpiration}>
      Simular Vencimento VIP
    </button>
  );
}
```

---

## 🎉 **Conclusão**

O sistema de notificações está completamente implementado e integrado ao header da plataforma. Ele oferece:

- ✅ **Notificações automáticas** para planos VIP
- ✅ **Sistema de categorias** organizado
- ✅ **Persistência** no localStorage
- ✅ **Design responsivo** e moderno
- ✅ **Integração global** através de contextos
- ✅ **Componente de teste** para desenvolvimento
- ✅ **Documentação completa** de uso

As notificações aparecem automaticamente no sininho do header e podem ser facilmente implementadas em qualquer parte da aplicação usando os hooks e contextos fornecidos.
