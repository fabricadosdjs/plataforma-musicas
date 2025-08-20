# 🚀 Sistema de Tracking em Lotes - Nexor Records

## 📋 Visão Geral

Este sistema implementa uma **solução híbrida inteligente** para otimizar o tráfego do banco de dados, combinando:

- **Cache local** com localStorage
- **Envio em lotes** para reduzir requisições
- **Sincronização automática** baseada em tempo e quantidade
- **Fallback robusto** para garantir dados não sejam perdidos

## 🎯 Benefícios

- ✅ **Redução de 90%+** no tráfego de egress
- ✅ **Performance melhorada** da aplicação
- ✅ **Dados confiáveis** e centralizados
- ✅ **Experiência offline** com sincronização automática
- ✅ **Monitoramento em tempo real** do status de sincronização

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   localStorage   │    │   API Batch     │
│   (useTracking) │◄──►│   (Cache Local)  │◄──►│   (/api/tracking│
│                 │    │                  │    │   /batch)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                              │
         │                                              ▼
         │                                    ┌─────────────────┐
         └────────────────────────────────────►│   Supabase      │
                                              │   (Database)    │
                                              └─────────────────┘
```

## 🚀 Como Usar

### 1. Configuração Básica

O sistema já está configurado no `layout.tsx` com o `TrackingProvider`:

```tsx
import { useTracking } from '@/context/TrackingContext';

const { trackEvent, pendingCount, isProcessing } = useTracking();
```

### 2. Rastrear Eventos

```tsx
// Rastrear download
trackEvent(songId, 'download', {
  title: 'Nome da Música',
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent
});

// Rastrear play
trackEvent(songId, 'play', {
  title: 'Nome da Música',
  duration: 180 // segundos
});

// Rastrear like
trackEvent(songId, 'like', {
  title: 'Nome da Música'
});

// Rastrear share
trackEvent(songId, 'share', {
  title: 'Nome da Música',
  platform: 'web'
});
```

### 3. Monitorar Status

```tsx
import { SyncStatus } from '@/components/tracking/SyncStatus';

// Status simples
<SyncStatus />

// Status detalhado
<SyncStatus showDetails={true} />
```

## ⚙️ Configuração

### Hook useBatchTracking

```tsx
const tracking = useBatchTracking({
  maxBatchSize: 10,        // Enviar a cada 10 eventos
  maxWaitTime: 24 * 60 * 60 * 1000, // Ou a cada 24 horas
  endpoint: '/api/tracking/batch'
});
```

### Configurações Recomendadas

- **Desenvolvimento**: `maxBatchSize: 5, maxWaitTime: 5 * 60 * 1000` (5 min)
- **Produção**: `maxBatchSize: 10, maxWaitTime: 24 * 60 * 60 * 1000` (24h)
- **Alto Tráfego**: `maxBatchSize: 25, maxWaitTime: 60 * 60 * 1000` (1h)

## 📊 Tipos de Eventos Suportados

| Evento    | Descrição                    | Campos Opcionais           |
|-----------|------------------------------|----------------------------|
| `download`| Download de música           | title, userAgent, platform |
| `play`    | Reprodução de música         | title, duration, position  |
| `like`    | Curtida de música            | title, source              |
| `share`   | Compartilhamento             | title, platform, method    |

## 🔄 Fluxo de Sincronização

1. **Evento Criado**: Usuário executa ação (download, play, etc.)
2. **Cache Local**: Evento salvo no localStorage
3. **Verificação**: Sistema verifica se deve enviar lote
4. **Envio Automático**: 
   - Quando atingir `maxBatchSize` eventos
   - Quando atingir `maxWaitTime` tempo
5. **Processamento**: API processa lote e atualiza banco
6. **Limpeza**: Eventos enviados são removidos do cache

## 🛠️ API Endpoint

### POST `/api/tracking/batch`

**Request Body:**
```json
{
  "events": [
    {
      "id": "unique-id",
      "songId": 123,
      "event": "download",
      "timestamp": 1640995200000,
      "metadata": {
        "title": "Nome da Música",
        "userAgent": "Mozilla/5.0..."
      }
    }
  ],
  "batchSize": 10,
  "timestamp": 1640995200000
}
```

**Response:**
```json
{
  "success": true,
  "processedEvents": 10,
  "batchSize": 10,
  "timestamp": "2022-01-01T00:00:00.000Z"
}
```

## 📱 Componentes Disponíveis

### SyncStatus
Mostra status de sincronização com opções de controle.

```tsx
<SyncStatus showDetails={true} />
```

### TrackingExample
Exemplo completo de implementação do sistema.

```tsx
<TrackingExample songId={123} songTitle="Nome da Música" />
```

## 🔍 Monitoramento e Debug

### Console Logs
- ✅ `📦 Processando lote de X eventos...`
- ✅ `✅ Lote processado com sucesso: X eventos`
- ❌ `❌ Erro ao processar lote: [erro]`

### localStorage
```javascript
// Ver eventos pendentes
const events = JSON.parse(localStorage.getItem('nexor_tracking_events'));
console.log('Eventos pendentes:', events);

// Limpar eventos (para testes)
localStorage.removeItem('nexor_tracking_events');
```

### DevTools
- **Application** → **Local Storage** → **nexor_tracking_events**
- **Network** → **XHR** → **/api/tracking/batch**

## 🚨 Tratamento de Erros

### Falhas de Rede
- Eventos permanecem no cache local
- Tentativa automática na próxima sincronização
- Log de erros para debugging

### Falhas de Banco
- Eventos não são perdidos
- Sistema continua funcionando offline
- Retry automático com backoff exponencial

## 📈 Métricas e Performance

### Antes (Sistema Tradicional)
- 1 requisição por evento
- 100 downloads = 100 requisições
- Latência alta por evento

### Depois (Sistema em Lotes)
- 1 requisição a cada 10 eventos
- 100 downloads = 10 requisições
- **Redução de 90% no tráfego**

## 🔧 Personalização

### Adicionar Novos Tipos de Eventos

1. **Hook**: Adicionar tipo em `TrackingEvent['event']`
2. **API**: Implementar lógica em `/api/tracking/batch`
3. **Componente**: Usar `trackEvent(songId, 'novoEvento')`

### Modificar Configurações

```tsx
// No TrackingContext.tsx
const tracking = useBatchTracking({
  maxBatchSize: 15,        // Personalizar tamanho do lote
  maxWaitTime: 60 * 60 * 1000, // Personalizar tempo de espera
  endpoint: '/api/tracking/custom' // Endpoint personalizado
});
```

## 🧪 Testes

### Teste Local
```tsx
// Forçar sincronização
const { forceSend } = useTracking();
forceSend();

// Limpar eventos
const { clearEvents } = useTracking();
clearEvents();
```

### Teste de Performance
```tsx
// Simular muitos eventos
for (let i = 0; i < 50; i++) {
  trackEvent(i, 'download', { test: true });
}
```

## 📚 Exemplos de Implementação

### Lista de Músicas
```tsx
const MusicList = ({ tracks }) => {
  const { trackEvent } = useTracking();
  
  const handleDownload = (track) => {
    trackEvent(track.id, 'download', {
      title: track.title,
      artist: track.artist
    });
  };
  
  return (
    <div>
      {tracks.map(track => (
        <button key={track.id} onClick={() => handleDownload(track)}>
          Download {track.title}
        </button>
      ))}
    </div>
  );
};
```

### Player de Áudio
```tsx
const AudioPlayer = ({ track }) => {
  const { trackEvent } = useTracking();
  
  const handlePlay = () => {
    trackEvent(track.id, 'play', {
      title: track.title,
      duration: track.duration
    });
  };
  
  return <button onClick={handlePlay}>▶️ Play</button>;
};
```

## 🎯 Próximos Passos

1. **Integrar** com componentes existentes
2. **Testar** em diferentes cenários
3. **Monitorar** performance e métricas
4. **Otimizar** configurações baseado no uso real
5. **Expandir** para outros tipos de eventos

---

**Desenvolvido para Nexor Records** 🎵  
*Sistema de tracking inteligente e eficiente*


