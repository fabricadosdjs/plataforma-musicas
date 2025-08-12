# Configuração do Login Admin

## Credenciais do Admin

Para acessar as funcionalidades administrativas na página `/trending`, use as seguintes credenciais:

### Opção 1: Email
```
Email: admin@djpool.com
Senha: [sua senha configurada no NextAuth]
```

### Opção 2: Nome de Usuário
```
Nome: Admin
Email: [qualquer email válido]
Senha: [sua senha configurada no NextAuth]
```

## Como Configurar

### 1. No NextAuth Configuration

Adicione o admin no seu arquivo de configuração do NextAuth (geralmente em `src/lib/authOptions.ts`):

```typescript
// Exemplo de configuração
export const authOptions: NextAuthOptions = {
  providers: [
    // ... seus providers existentes
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Permitir login do admin
      if (user.email === 'admin@djpool.com' || user.name === 'Admin') {
        return true;
      }
      // ... resto da lógica de login
    },
    async session({ session, token }) {
      // Adicionar informações do admin na sessão
      if (session.user?.email === 'admin@djpool.com' || session.user?.name === 'Admin') {
        session.user.isAdmin = true;
      }
      return session;
    }
  }
};
```

### 2. No Banco de Dados

Certifique-se de que o usuário admin existe no banco de dados:

```sql
-- Exemplo de inserção do admin
INSERT INTO "User" (
  email, 
  name, 
  is_vip, 
  status, 
  dailyDownloadCount,
  dailyDownloadLimit,
  created_at,
  updated_at
) VALUES (
  'admin@djpool.com',
  'Admin',
  true,
  'active',
  0,
  999,
  NOW(),
  NOW()
);
```

## Funcionalidades do Admin

Quando logado como admin na página `/trending`, você terá acesso a:

1. **Botão de Edição de Capa**: Aparece no canto superior direito de cada card
2. **Modal de Edição**: Permite inserir URL da nova imagem
3. **Atualização em Tempo Real**: A capa é atualizada imediatamente após salvar

## Segurança

- Apenas usuários com email `admin@djpool.com` ou nome `Admin` podem acessar as funcionalidades
- Todas as requisições são validadas no servidor
- URLs de imagem são validadas antes de serem salvas

## Exemplo de Uso

1. Faça login com as credenciais do admin
2. Acesse `/trending`
3. Clique no ícone de edição (lápis) em qualquer música
4. Insira a URL da nova imagem
5. Clique em "Salvar"
6. A capa será atualizada imediatamente

## URLs de Imagem Aceitas

- URLs HTTPS válidas
- Formatos: JPG, PNG, GIF, WebP
- Domínios confiáveis (evite URLs suspeitas)
- Tamanho recomendado: 300x300px ou maior 