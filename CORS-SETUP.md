# 🚀 Configuração CORS para Plataforma de Músicas

Este documento explica como configurar e usar o CORS (Cross-Origin Resource Sharing) para resolver problemas de áudio em dispositivos móveis.

## 📋 **O que foi implementado:**

### 1. **Headers CORS no Next.js (`next.config.ts`)**
- Headers CORS para todas as rotas
- Headers específicos para APIs de áudio
- Configurações de segurança e cache

### 2. **Middleware CORS (`src/middleware.ts`)**
- Middleware global para todas as requisições
- Headers CORS automáticos
- Tratamento de preflight OPTIONS

### 3. **Servidor Express com CORS (`server.js`)**
- Servidor separado com CORS completo
- Configurações específicas para áudio
- Rotas de teste para CORS

### 4. **Configurações CORS (`cors.config.js`)**
- Configurações para diferentes ambientes
- Headers específicos para áudio
- Configurações de desenvolvimento e produção

## 🚀 **Como usar:**

### **Opção 1: Servidor Next.js padrão (com CORS)**
```bash
npm run dev
```
- Usa `next.config.ts` e `src/middleware.ts`
- CORS configurado automaticamente
- Ideal para desenvolvimento rápido

### **Opção 2: Servidor Express com CORS completo**
```bash
npm run dev:cors
```
- Usa `server.js` com configurações CORS avançadas
- Headers específicos para áudio
- Melhor para resolver problemas de CORS complexos

### **Opção 3: Produção com CORS**
```bash
npm run build
npm run start:cors
```
- Build otimizado com CORS
- Configurações de produção

## 🧪 **Testando o CORS:**

### **1. Teste básico de CORS:**
```bash
npm run cors:test
```

### **2. Teste manual via navegador:**
- Abra o console do navegador
- Execute: `fetch('/api/cors-test')`
- Deve retornar sucesso

### **3. Teste de áudio:**
- Acesse: `http://localhost:3000/api/audio-test`
- Deve retornar um áudio de teste

## 🔧 **Configurações CORS implementadas:**

### **Headers básicos:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, Range, Accept-Ranges, Content-Range
Access-Control-Expose-Headers: Content-Length, Content-Range, Accept-Ranges, Content-Type
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### **Headers específicos para áudio:**
```
Accept-Ranges: bytes
Cache-Control: public, max-age=3600
X-Audio-Proxy: enabled
X-Streaming-Enabled: true
```

## 📱 **Resolução de problemas móveis:**

### **Chrome Android:**
- Headers CORS completos
- Suporte a Range requests
- Headers de streaming otimizados

### **Safari iOS:**
- Headers de cache otimizados
- Suporte a preflight requests
- Headers de áudio específicos

### **Firefox Mobile:**
- Headers CORS padrão
- Suporte a streaming
- Headers de segurança

## 🛠️ **Personalização:**

### **1. Modificar origens permitidas:**
Edite `cors.config.js`:
```javascript
production: {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://seudominio.com',
      'https://app.seudominio.com'
    ];
    // ... resto da configuração
  }
}
```

### **2. Adicionar novos headers:**
Edite `src/middleware.ts`:
```typescript
// Adicionar novo header
response.headers.set('X-Custom-Header', 'value');
```

### **3. Configurar ambiente específico:**
```bash
# Desenvolvimento
NODE_ENV=development npm run dev:cors

# Produção
NODE_ENV=production npm run start:cors
```

## 🔍 **Debugging:**

### **1. Verificar headers no navegador:**
- F12 → Network → Headers
- Procure por headers CORS

### **2. Verificar console do servidor:**
```bash
npm run dev:cors
# Deve mostrar: "🚀 Servidor Express com CORS rodando"
```

### **3. Testar APIs específicas:**
```bash
# Teste CORS
curl -X OPTIONS http://localhost:3000/api/audio-direct

# Teste áudio
curl -H "Range: bytes=0-" http://localhost:3000/api/audio-test
```

## ⚠️ **Considerações de segurança:**

### **Desenvolvimento:**
- `Access-Control-Allow-Origin: *` (permitir todas as origens)
- Headers de debug habilitados
- Logs detalhados

### **Produção:**
- Restringir origens permitidas
- Headers de debug desabilitados
- Logs mínimos
- Validação de entrada

## 📚 **Recursos adicionais:**

- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Next.js Headers API](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#headers)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)

## 🆘 **Suporte:**

Se encontrar problemas:
1. Verifique os logs do servidor
2. Teste com `npm run cors:test`
3. Verifique headers no Network tab do navegador
4. Consulte a documentação do MDN sobre CORS

---

**🎵 Agora seu servidor local deve funcionar perfeitamente com CORS para reprodução de áudio em dispositivos móveis!**
