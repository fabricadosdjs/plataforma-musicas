# Deploy na Netlify - Plataforma de Músicas

## Pré-requisitos

1. Conta no GitHub
2. Conta na Netlify
3. Banco de dados PostgreSQL (recomendo Supabase ou Neon)
4. Configurações de ambiente

## Passos para Deploy

### 1. Push para GitHub
```bash
git add .
git commit -m "Preparar para deploy na Netlify"
git push origin master
```

**Nota**: Este repositório usa a branch `master` como padrão.

### 2. Conectar na Netlify

1. Acesse [netlify.com](https://netlify.com)
2. Clique em "New site from Git"
3. Conecte seu repositório GitHub
4. Selecione o repositório `plataforma-musicas`

### 3. Configurações de Build

A Netlify vai detectar automaticamente as configurações do `netlify.toml`:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18

### 4. Variáveis de Ambiente

Configure as seguintes variáveis na Netlify (Site settings > Environment variables):

```env
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://seu-site.netlify.app
NEXTAUTH_SECRET=seu_secret_muito_seguro_aqui
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### 5. Banco de Dados

#### Opção 1: Supabase (Recomendado)
1. Crie conta no [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Execute as migrações do Prisma
4. Configure as variáveis de ambiente

#### Opção 2: Neon
1. Crie conta no [neon.tech](https://neon.tech)
2. Crie novo banco
3. Configure a string de conexão

### 6. Primeira Migração
```bash
# Local (uma vez configurado)
npx prisma migrate deploy
npx prisma db seed
```

### 7. Funcionalidades Específicas para Netlify

- **Edge Functions**: APIs otimizadas
- **CDN Global**: Assets servidos globalmente
- **SSL Automático**: HTTPS configurado automaticamente
- **Deploy Previews**: Preview de branches automaticamente

## Monitoramento

- **Analytics**: Netlify Analytics (opcional, pago)
- **Logs**: Netlify Function logs
- **Performance**: Lighthouse CI integrado

## Troubleshooting

### Problema: Build Timeout
- Solução: Increase build timeout nas configurações

### Problema: Prisma não funciona
- Verificar `serverExternalPackages` no next.config.ts
- Verificar se DATABASE_URL está correto

### Problema: NextAuth não funciona
- Verificar NEXTAUTH_URL
- Verificar NEXTAUTH_SECRET
- Verificar redirects

## Scripts Úteis

```bash
# Build local
npm run build

# Desenvolvimento
npm run dev

# Lint
npm run lint

# Seed database
npm run db:seed
```

## Performance Tips

1. **Imagens**: Use next/image para otimização automática
2. **Cache**: Configure cache headers (já incluído)
3. **Bundle**: Analise com @next/bundle-analyzer
4. **Database**: Use connection pooling

## Segurança

- HTTPS automático
- Headers de segurança configurados
- Variáveis de ambiente seguras
- CORS configurado

## Contato

Para suporte, abra uma issue no repositório.
