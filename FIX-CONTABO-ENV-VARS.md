# 🔧 Fix: Erro 500 nas APIs do Contabo

## ❌ **Problema Identificado**

As variáveis de ambiente do Contabo Storage não estão configuradas no Netlify, causando erro 500 nas APIs:
- `/api/contabo/files`
- `/api/contabo/import`

## ✅ **Solução**

### 📋 **Variáveis Necessárias**

Configure as seguintes variáveis no painel do Netlify:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `CONTABO_ENDPOINT` | `https://usc1.contabostorage.com` | Endpoint do Contabo Storage |
| `CONTABO_REGION` | `usc1` | Região do bucket |
| `CONTABO_ACCESS_KEY_ID` | `Sua Access Key ID` | Credencial de acesso |
| `CONTABO_SECRET_ACCESS_KEY` | `Sua Secret Access Key` | Credencial secreta |
| `CONTABO_BUCKET_NAME` | `Nome do seu bucket` | Nome do bucket |

### 🔧 **Como Configurar no Netlify**

1. **Acesse o painel do Netlify**
   - Vá para [netlify.com](https://netlify.com)
   - Faça login na sua conta

2. **Navegue até seu site**
   - Clique no seu site na lista de projetos

3. **Acesse as configurações**
   - Clique em **"Site settings"** no menu superior

4. **Configure as variáveis de ambiente**
   - No menu lateral, clique em **"Environment variables"**
   - Clique em **"Add a variable"** para cada variável

5. **Adicione cada variável**
   ```
   CONTABO_ENDPOINT = https://usc1.contabostorage.com
   CONTABO_REGION = usc1
   CONTABO_ACCESS_KEY_ID = [Sua Access Key ID]
   CONTABO_SECRET_ACCESS_KEY = [Sua Secret Access Key]
   CONTABO_BUCKET_NAME = [Nome do seu bucket]
   ```

6. **Salve as configurações**
   - Clique em **"Save"** após adicionar cada variável

7. **Redeploy o site**
   - Vá em **"Deploys"**
   - Clique em **"Trigger deploy"** > **"Deploy site"**

### 🔍 **Como Obter as Credenciais do Contabo**

1. **Acesse o painel do Contabo**
   - Vá para [contabo.com](https://contabo.com)
   - Faça login na sua conta

2. **Navegue até Object Storage**
   - No menu lateral, clique em **"Object Storage"**

3. **Acesse suas credenciais**
   - Clique no seu bucket
   - Vá para a aba **"Access Keys"**
   - Clique em **"Create new access key"**

4. **Copie as credenciais**
   - **Access Key ID**: Copie o ID gerado
   - **Secret Access Key**: Copie a chave secreta
   - **Bucket Name**: Anote o nome do bucket

### 🧪 **Teste Após Configuração**

Após configurar as variáveis, execute:

```bash
node check-env-vars.cjs
```

Você deve ver:
```
✅ CONTABO_ENDPOINT: https://usc1.contabostorage.com
✅ CONTABO_REGION: usc1
✅ CONTABO_ACCESS_KEY_ID: ***
✅ CONTABO_SECRET_ACCESS_KEY: ***
✅ CONTABO_BUCKET_NAME: [nome-do-bucket]
```

### 🚀 **Verificação Final**

1. **Acesse `/admin/contabo`**
2. **Verifique se não há mais erros 500**
3. **Teste a listagem de arquivos**
4. **Teste a importação automática**

### 📞 **Suporte**

Se ainda houver problemas após configurar as variáveis:

1. **Verifique as credenciais** - Certifique-se de que estão corretas
2. **Verifique o bucket** - Confirme que o bucket existe e está acessível
3. **Verifique a região** - Confirme que a região está correta
4. **Verifique os logs** - Acesse os logs do Netlify para mais detalhes

---

**🎯 Resultado Esperado:**
- APIs do Contabo funcionando sem erro 500
- Listagem de arquivos funcionando
- Importação automática funcionando
- Página `/admin/contabo` totalmente funcional 