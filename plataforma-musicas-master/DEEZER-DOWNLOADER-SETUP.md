# 🎵 Deezer Downloader - Configuração Completa

## 📋 Visão Geral

O Deezer Downloader é uma ferramenta que permite aos usuários VIP baixar músicas do Deezer em formato MP3, similar ao Deemix. A ferramenta usa ARL (Access Token) para autenticar e acessar o conteúdo do Deezer.

## 🚀 Funcionalidades

- ✅ **Busca por URL**: Cole URLs do Deezer diretamente
- ✅ **Busca por nome**: Encontre músicas digitando o nome
- ✅ **Qualidade configurável**: 128 kbps (320 kbps temporariamente indisponível)
- ✅ **Histórico de downloads**: Gerencie seus downloads
- ✅ **Expiração automática**: Downloads ficam disponíveis por 5 dias
- ✅ **Verificação VIP**: Apenas usuários VIP podem usar

## 📁 Arquivos Criados

### Backend
- `src/app/api/deezer-downloads/route.ts` - API principal
- `src/app/api/deezer-downloads/history/route.ts` - Histórico de downloads

### Frontend
- `src/components/deezer/DeezerDownloader.tsx` - Componente React

### Banco de Dados
- `prisma/schema.prisma` - Schema atualizado
- `generate-deezer-migration.sql` - SQL da migração

### Scripts de Configuração
- `apply-deezer-migration.cjs` - Aplicar migração no banco
- `setup-deezer-arl.cjs` - Configurar ARL do Deezer
- `test-deezer-download.cjs` - Testar funcionalidade

## 🔧 Configuração

### 1. Aplicar Migração do Banco

```bash
node apply-deezer-migration.cjs
```

Este script irá:
- Adicionar campo `deezerARL` à tabela `User`
- Criar tabela `DeezerDownload`
- Criar índices necessários
- Verificar se tudo foi criado corretamente

### 2. Configurar ARL (Opcional)

O Deezer Downloader usa automaticamente o mesmo ARL configurado no Deemix. Se você já configurou o ARL no Deemix, não precisa fazer nada adicional.

Se quiser configurar o ARL:

1. **Acesse** https://www.deezer.com
2. **Faça login** na sua conta
3. **Abra o DevTools** (F12)
4. **Vá para** Application > Cookies
5. **Copie o valor** do cookie "arl"
6. **Configure no Deemix** usando o painel admin

### 3. Verificar Configuração

```bash
node setup-deezer-arl.cjs
```

Este script irá:
- Verificar se o sistema está configurado
- Informar sobre o uso do ARL do Deemix
- Dar instruções para teste

### 4. Testar Funcionalidade

```bash
node test-deezer-download.cjs
```

Este script irá:
- Testar busca de música
- Testar obtenção de URL de download
- Testar download real
- Verificar se tudo está funcionando

## 🎯 Como Usar

### Para Usuários VIP

1. **Acesse** `/profile` → "Deezer Downloader"
2. **Escolha o modo**: URL ou busca por nome
3. **Insira a URL** ou nome da música
4. **Clique em "Verificar"** para obter informações
5. **Selecione a qualidade** (128 kbps disponível)
6. **Clique em "Baixar MP3"** para iniciar o download

### Para Administradores

1. **Configure o ARL** usando o script de setup
2. **Monitore os logs** para verificar downloads
3. **Verifique o histórico** de downloads dos usuários
4. **Gerencie acessos** através do painel admin

## 🔍 Estrutura do Banco

### Tabela User (Usa campos existentes)
O Deezer Downloader usa os campos `deezerEmail` e `deezerPassword` já existentes na tabela `User`.

### Tabela DeezerDownload (Nova)
```sql
CREATE TABLE "DeezerDownload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "quality" TEXT NOT NULL DEFAULT '320',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DeezerDownload_pkey" PRIMARY KEY ("id")
);
```

## 🔐 Segurança

- **Verificação VIP**: Apenas usuários VIP podem usar
- **ARL Protegido**: ARL é armazenado no banco de dados
- **Expiração**: Downloads expiram automaticamente
- **Logs**: Todas as ações são registradas

## 🐛 Troubleshooting

### Erro: "ARL do Deezer não configurado"
- Configure o ARL no Deemix primeiro
- Verifique se o ARL é válido
- Teste com `node test-deezer-download.cjs`

### Erro: "URL de download não acessível"
- Verifique se o ARL é válido e atualizado
- Teste a conexão com o Deezer
- Verifique os logs do servidor

### Erro: "Usuário não autenticado"
- Verifique se o usuário está logado
- Verifique se o NextAuth está configurado

### Erro: "Acesso
- Verifique se o usuário é VIP
- Verifique se `is_vip` está true no banco

## 📊 Monitoramento

### Logs Importantes
- `Iniciando download: [música] com ARL`
- `Download concluído: [arquivo]`
- `Erro durante download: [erro]`

### Métricas
- Downloads por usuário
- Qualidade mais usada
- Músicas mais baixadas
- Taxa de sucesso

## 🔄 Atualizações

### Para Atualizar ARL
```bash
node setup-deezer-arl.cjs
```

### Para Verificar Status
```bash
node test-deezer-download.cjs
```

### Para Limpar Downloads Expirados
Os downloads são limpos automaticamente pelo sistema.

## 🎉 Status Final

✅ **Backend**: APIs implementadas
✅ **Frontend**: Componente React criado
✅ **Banco de Dados**: Schema atualizado
✅ **Scripts**: Configuração automatizada
✅ **Documentação**: Instruções completas

**Próximo passo**: Configure o ARL e teste a funcionalidade!
