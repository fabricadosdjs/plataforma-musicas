# 🎵 Correção de Thumbnails das Músicas

Este projeto inclui ferramentas para corrigir automaticamente as thumbnails das músicas que não possuem imagem.

## 📸 Imagem Padrão

**URL da imagem padrão:**
```
https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png
```

## 🛠️ Ferramentas Disponíveis

### 1. **Página Web de Administração**
- **URL:** `/admin/fix-thumbnails`
- **Acesso:** Apenas usuários admin
- **Interface:** Visual com progresso em tempo real
- **Funcionalidades:**
  - Processamento em lotes de 10 músicas
  - Barra de progresso
  - Relatório detalhado
  - Preview da imagem padrão

### 2. **Script via Linha de Comando**
- **Arquivo:** `scripts/fix-thumbnails.js`
- **Comandos npm:**
  ```bash
  npm run fix-thumbnails    # Corrigir todas as músicas
  npm run fix-thumbnail     # Alias para o mesmo comando
  ```

## 🚀 Como Usar

### **Opção 1: Interface Web (Recomendado)**

1. Acesse `/admin/fix-thumbnails` como usuário admin
2. Clique em "Iniciar Correção"
3. Acompanhe o progresso em tempo real
4. Veja os resultados detalhados

### **Opção 2: Script via Terminal**

```bash
# Corrigir todas as músicas
npm run fix-thumbnails

# Ou executar diretamente
node scripts/fix-thumbnails.js

# Corrigir música específica (por ID)
node scripts/fix-thumbnails.js 123
```

## 📊 Funcionamento

### **Processo Automático:**
1. **Busca** todas as músicas no sistema
2. **Filtra** músicas sem thumbnail
3. **Processa** em lotes de 10 para não sobrecarregar
4. **Atualiza** com a imagem padrão
5. **Gera** relatório completo

### **Critérios para Correção:**
- `imageUrl` está vazio (`""`)
- `imageUrl` é `null`
- `imageUrl` é `undefined`
- `imageUrl` contém a string `"undefined"`

## 🔧 Configuração

### **API Endpoint:**
```
POST /api/admin/update-track-thumbnail
PUT  /api/admin/update-track-thumbnail
```

### **Variáveis de Ambiente:**
Nenhuma configuração adicional necessária.

## 📋 Estrutura dos Dados

### **Request (POST - Música única):**
```json
{
  "trackId": 123,
  "imageUrl": "https://i.ibb.co/..."
}
```

### **Request (PUT - Múltiplas músicas):**
```json
{
  "trackIds": [123, 124, 125],
  "imageUrl": "https://i.ibb.co/..."
}
```

### **Response:**
```json
{
  "success": true,
  "message": "Thumbnails atualizadas com sucesso",
  "results": [
    {
      "trackId": 123,
      "imageUrl": "https://i.ibb.co/...",
      "status": "updated"
    }
  ]
}
```

## 🚨 Segurança

- **Autenticação:** Requer sessão de usuário admin
- **Rate Limiting:** Processamento em lotes com delays
- **Validação:** Verificação de parâmetros obrigatórios
- **Logs:** Todas as operações são registradas

## 📝 Logs

O sistema registra todas as operações no console:
```
🎵 Atualizando thumbnail da música 123 para: https://i.ibb.co/...
🎵 Atualizando thumbnails de 10 músicas para: https://i.ibb.co/...
✅ Lote 1 atualizado com sucesso
```

## 🔄 Recuperação

### **Em caso de erro:**
1. Verifique os logs do console
2. Confirme se o usuário tem permissões de admin
3. Verifique se a API está funcionando
4. Execute novamente o processo

### **Rollback manual:**
- As operações são seguras e não removem dados existentes
- Apenas adicionam a imagem padrão onde está faltando

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confirme as permissões de usuário
3. Teste a API endpoint diretamente
4. Verifique se a imagem padrão está acessível

## 🎯 Próximos Passos

- [ ] Integração com banco de dados real
- [ ] Suporte a múltiplas imagens padrão
- [ ] Histórico de alterações
- [ ] Backup automático antes das alterações
- [ ] Validação de formato de imagem

