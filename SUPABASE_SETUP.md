# Configuração do Supabase

Este projeto foi configurado para usar o Supabase como banco de dados. Siga os passos abaixo para configurar:

## 1. Instalação das Dependências

As dependências já foram instaladas:
```bash
npm install @supabase/ssr @supabase/supabase-js
```

## 2. Configuração das Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## 3. Estrutura dos Arquivos

### Utilitários do Supabase
- `src/utils/supabase/server.ts` - Cliente para Server Components
- `src/utils/supabase/client.ts` - Cliente para Client Components
- `src/utils/supabase/middleware.ts` - Cliente para Middleware

### Páginas Configuradas
- `src/app/relatorios.tsx` - Página de relatórios com estatísticas
- `src/app/solicitacoes.tsx` - Página de solicitações de músicas
- `src/app/exemplo-supabase/page.tsx` - Exemplo de uso do Supabase

## 4. Uso nas Páginas

### Server Components (Recomendado)
```tsx
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data } = await supabase.from('tracks').select('*')
  
  return <div>{/* seu JSX */}</div>
}
```

### Client Components
```tsx
import { createClient } from '@/utils/supabase/client'

export default function Component() {
  const supabase = createClient()
  
  // Use em useEffect ou event handlers
}
```

## 5. Tabelas Necessárias

O projeto espera as seguintes tabelas no Supabase:

### Tabela `tracks`
```sql
CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  songName TEXT NOT NULL,
  artist TEXT NOT NULL,
  style TEXT,
  pool TEXT,
  version TEXT,
  releaseDate DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela `requests`
```sql
CREATE TABLE requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  songName TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  requestedBy TEXT NOT NULL,
  requestedAt TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  estimatedCompletion TIMESTAMP
);
```

### Tabela `downloads`
```sql
CREATE TABLE downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trackId INTEGER REFERENCES tracks(id),
  userId TEXT,
  downloadedAt TIMESTAMP DEFAULT NOW(),
  ipAddress TEXT
);
```

## 6. Funcionalidades Implementadas

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

### Exemplo Supabase (`/exemplo-supabase`)
- Demonstração básica de integração
- Listagem de faixas do banco
- Uso de Server Components

## 7. Próximos Passos

1. Configure suas credenciais do Supabase no `.env.local`
2. Crie as tabelas necessárias no seu projeto Supabase
3. Teste as páginas configuradas
4. Personalize conforme suas necessidades

## 8. Suporte

Para dúvidas sobre o Supabase, consulte:
- [Documentação oficial](https://supabase.com/docs)
- [Exemplos de SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Referência da API](https://supabase.com/docs/reference/javascript)

