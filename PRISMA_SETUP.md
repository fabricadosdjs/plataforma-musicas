# Configuração do Prisma

Este projeto foi configurado para usar o Prisma como ORM para PostgreSQL. Siga os passos abaixo para configurar:

## 1. Instalação das Dependências

As dependências já foram instaladas:
```bash
npm install @prisma/client
npm install prisma --save-dev
```

## 2. Configuração das Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
DIRECT_URL="postgresql://username:password@localhost:5432/database_name"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## 3. Estrutura dos Arquivos

### Utilitários do Prisma
- `src/utils/prisma.ts` - Cliente Prisma configurado
- `prisma/schema.prisma` - Schema do banco de dados

### Páginas Configuradas
- `src/app/relatorios.tsx` - Página de relatórios com estatísticas
- `src/app/solicitacoes.tsx` - Página de solicitações de músicas
- `src/app/exemplo-supabase/page.tsx` - Exemplo de uso do Prisma

### APIs
- `src/app/api/stats/route.ts` - API de estatísticas
- `src/app/api/requests/route.ts` - API de solicitações
- `src/app/api/requests/[id]/route.ts` - API de solicitações individuais
- `src/app/api/downloads/route.ts` - API de downloads

## 4. Uso nas Páginas

### Server Components (Recomendado)
```tsx
import { prisma } from '@/utils/prisma'

export default async function Page() {
  const tracks = await prisma.track.findMany({
    select: {
      id: true,
      songName: true,
      artist: true
    }
  })
  
  return <div>{/* seu JSX */}</div>
}
```

### Client Components
```tsx
"use client"

export default function Component() {
  const fetchData = async () => {
    const response = await fetch('/api/stats')
    const data = await response.json()
    // Use os dados
  }
  
  // Use em useEffect ou event handlers
}
```

## 5. Schema do Banco de Dados

O projeto usa o seguinte schema Prisma:

### Modelos Principais
- **User** - Usuários da plataforma
- **Track** - Faixas musicais
- **Request** - Solicitações de músicas
- **Download** - Registro de downloads
- **Like** - Registro de likes
- **Play** - Registro de reproduções

### Enums
- **Priority** - LOW, MEDIUM, HIGH
- **Status** - PENDING, APPROVED, REJECTED, COMPLETED

## 6. Comandos do Prisma

### Gerar cliente
```bash
npx prisma generate
```

### Executar migrações
```bash
npx prisma migrate dev
```

### Visualizar banco (Prisma Studio)
```bash
npx prisma studio
```

### Reset do banco (desenvolvimento)
```bash
npx prisma migrate reset
```

## 7. Funcionalidades Implementadas

### Página de Relatórios (`/relatorios`)
- Estatísticas gerais da plataforma
- Contadores de faixas, downloads, plays e likes
- Gráficos de top gêneros e artistas
- Filtros por período e gênero
- Lista de faixas recentes

### Página de Solicitações (`/solicitacoes`)
- Sistema de solicitação de músicas
- Gerenciamento de status (pendente, aprovada, rejeitada, completada)
- Filtros por status e prioridade
- Modal para criar novas solicitações
- Estatísticas em tempo real

### Exemplo Prisma (`/exemplo-supabase`)
- Demonstração básica de integração
- Listagem de faixas do banco
- Uso de Server Components

## 8. Próximos Passos

1. **Configure suas credenciais do banco** no arquivo `.env.local`
2. **Execute as migrações** do Prisma:
   ```bash
   npx prisma migrate dev
   ```
3. **Gere o cliente** Prisma:
   ```bash
   npx prisma generate
   ```
4. **Teste as páginas** configuradas
5. **Personalize** conforme suas necessidades

## 9. Suporte

Para dúvidas sobre o Prisma, consulte:
- [Documentação oficial](https://www.prisma.io/docs)
- [Guia de início rápido](https://www.prisma.io/docs/getting-started)
- [Referência da API](https://www.prisma.io/docs/reference)

## 10. Migração do Supabase

Este projeto foi migrado do Supabase para o Prisma. As principais mudanças incluem:

- **Remoção** das dependências do Supabase
- **Substituição** das chamadas diretas por APIs REST
- **Atualização** do schema para usar Prisma
- **Manutenção** da mesma interface de usuário

