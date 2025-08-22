# 🎵 Sistema de Releases - Plataforma de Músicas

## 📋 Visão Geral

O sistema de releases permite gerenciar álbuns e compilações na plataforma, com funcionalidades completas de CRUD (Create, Read, Update, Delete) e uma interface moderna e responsiva.

## 🏗️ Estrutura do Banco de Dados

### Tabela `Release`

```sql
CREATE TABLE "Release" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,           -- Título do álbum
    "artist" TEXT NOT NULL,          -- Nome do artista
    "albumArt" TEXT NOT NULL,        -- URL da capa do álbum
    "description" TEXT,              -- Descrição do álbum
    "genre" TEXT NOT NULL,           -- Gênero musical
    "releaseDate" TIMESTAMP(3) NOT NULL, -- Data de lançamento
    "trackCount" INTEGER NOT NULL DEFAULT 0, -- Número de tracks
    "duration" TEXT,                 -- Duração total
    "label" TEXT,                    -- Label/gravadora
    "producer" TEXT,                 -- Produtor
    "featured" BOOLEAN NOT NULL DEFAULT false, -- Destaque na plataforma
    "exclusive" BOOLEAN NOT NULL DEFAULT false, -- Release exclusivo
    "streaming" JSONB,               -- Links de streaming (Spotify, Deezer, etc.)
    "social" JSONB,                  -- Links sociais (Instagram, Facebook, etc.)
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
```

### Índices Criados

- `Release_title_idx` - Busca por título
- `Release_artist_idx` - Busca por artista
- `Release_genre_idx` - Busca por gênero
- `Release_releaseDate_idx` - Ordenação por data
- `Release_featured_idx` - Filtro de destaque
- `Release_exclusive_idx` - Filtro de exclusivo

## 🚀 Funcionalidades

### 1. **Página Principal (`/releases`)**
- ✅ Grid responsivo com 4 álbuns por linha (desktop)
- ✅ Lista alternativa para visualização compacta
- ✅ Sistema de busca avançada
- ✅ Filtros por gênero, artista, featured, exclusive
- ✅ Ordenação por data, título, artista, popularidade
- ✅ Estatísticas em tempo real
- ✅ Design inspirado em `/record/label`

### 2. **Adicionar Release (`/releases/add`)**
- ✅ Formulário completo com validação
- ✅ Input JSON com validação e preview
- ✅ Suporte a todos os campos do modelo
- ✅ Interface intuitiva com tabs
- ✅ Exemplo de JSON válido

### 3. **Visualizar Release (`/releases/[id]`)**
- ✅ Informações completas do álbum
- ✅ Lista de tracks com player integrado
- ✅ Links de streaming e redes sociais
- ✅ Badges de featured/exclusive
- ✅ Layout responsivo com sidebar

### 4. **Editar Release (`/releases/edit/[id]`)**
- ✅ Formulário pré-preenchido
- ✅ Validação em tempo real
- ✅ Controle de acesso (apenas admins)
- ✅ Feedback visual de salvamento

## 🔌 APIs

### `GET /api/releases`
Lista todos os releases com filtros e paginação.

**Parâmetros:**
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 20)
- `search` - Busca por título, artista ou descrição
- `genre` - Filtro por gênero
- `artist` - Filtro por artista
- `featured` - Apenas releases destacados
- `exclusive` - Apenas releases exclusivos
- `sortBy` - Campo para ordenação
- `sortOrder` - Ordem (asc/desc)

### `POST /api/releases`
Cria um novo release.

**Campos obrigatórios:**
- `title` - Título do álbum
- `artist` - Nome do artista
- `albumArt` - URL da capa
- `genre` - Gênero musical
- `releaseDate` - Data de lançamento
- `trackCount` - Número de tracks

### `GET /api/releases/[id]`
Busca um release específico.

### `PUT /api/releases/[id]`
Atualiza um release existente.

### `DELETE /api/releases/[id]`
Remove um release.

## 🎨 Design e UX

### **Paleta de Cores**
- **Purple** (#8B5CF6) - Elementos principais
- **Blue** (#3B82F6) - Links e ações secundárias
- **Emerald** (#10B981) - Sucesso e exclusivos
- **Yellow** (#F59E0B) - Destaques e featured
- **Red** (#EF4444) - Ações perigosas e pausa

### **Componentes Visuais**
- **Hero Section** - Título grande com estatísticas
- **Cards de Release** - Design moderno com hover effects
- **Badges** - Featured (⭐) e Exclusive (👑)
- **Filtros Avançados** - Interface intuitiva
- **Status Indicators** - Feedback em tempo real

### **Responsividade**
- **Desktop**: Grid de 4 colunas
- **Tablet**: Grid de 2-3 colunas
- **Mobile**: Lista vertical otimizada

## 🔐 Controle de Acesso

### **Usuários Comuns**
- ✅ Visualizar releases
- ✅ Buscar e filtrar
- ✅ Reproduzir tracks
- ✅ Acessar links de streaming

### **Administradores**
- ✅ Todas as funcionalidades de usuários
- ✅ Adicionar novos releases
- ✅ Editar releases existentes
- ✅ Deletar releases
- ✅ Gerenciar configurações

**Verificação de Admin:**
```typescript
if (!session?.user?.email?.includes('admin')) {
  // Acesso negado
}
```

## 📱 Player de Áudio

### **Funcionalidades**
- ✅ Play/Pause integrado
- ✅ Controle de volume
- ✅ Auto-stop ao trocar de track
- ✅ Feedback visual de estado
- ✅ Compatibilidade mobile

### **Integração**
- Usa o contexto global de player
- Suporte a diferentes formatos de áudio
- Tratamento de erros robusto

## 🎯 Filtros e Busca

### **Filtros Disponíveis**
1. **Texto** - Busca em título, artista e descrição
2. **Gênero** - Filtro por estilo musical
3. **Artista** - Filtro por nome do artista
4. **Featured** - Apenas releases destacados
5. **Exclusive** - Apenas releases exclusivos

### **Ordenação**
1. **Data** - Mais recentes primeiro
2. **Título** - Ordem alfabética
3. **Artista** - Ordem alfabética
4. **Popularidade** - Featured + Exclusive

## 📊 Estatísticas

### **Métricas Exibidas**
- Total de releases
- Releases destacados (featured)
- Releases exclusivos
- Número de gêneros únicos

### **Filtros Ativos**
- Indicadores visuais dos filtros aplicados
- Contadores de resultados
- Botão para limpar filtros

## 🚀 Como Usar

### **1. Acessar Releases**
```
/releases
```

### **2. Adicionar Novo Release**
```
/releases/add
```

### **3. Visualizar Release**
```
/releases/[id]
```

### **4. Editar Release**
```
/releases/edit/[id]
```

## 🔧 Configuração

### **1. Banco de Dados**
Execute a migração:
```bash
npx prisma migrate dev --name add_releases_table
```

### **2. Variáveis de Ambiente**
```env
DATABASE_URL="postgresql://..."
```

### **3. Dependências**
```json
{
  "dependencies": {
    "@prisma/client": "latest",
    "next": "latest",
    "react": "latest",
    "lucide-react": "latest"
  }
}
```

## 🐛 Troubleshooting

### **Erro 500 ao carregar releases**
- Verifique a conexão com o banco
- Confirme se a tabela foi criada
- Verifique os logs do servidor

### **Acesso negado ao adicionar/editar**
- Confirme se o usuário é admin
- Verifique se o email contém "admin"
- Confirme se a sessão está ativa

### **Imagens não carregam**
- Verifique se as URLs são válidas
- Confirme se as imagens são acessíveis
- Use URLs HTTPS para produção

## 🎨 Personalização

### **Cores**
Edite as classes CSS no arquivo `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      'release-primary': '#8B5CF6',
      'release-secondary': '#3B82F6',
      // ... outras cores
    }
  }
}
```

### **Layout**
Modifique os componentes em `src/components/releases/` para ajustar o design conforme necessário.

## 📈 Roadmap

### **Versão 1.1**
- [ ] Sistema de playlists
- [ ] Histórico de reprodução
- [ ] Recomendações baseadas em gênero

### **Versão 1.2**
- [ ] Sistema de reviews e ratings
- [ ] Comentários nos releases
- [ ] Compartilhamento social

### **Versão 1.3**
- [ ] Analytics de reprodução
- [ ] Sistema de trending
- [ ] Integração com redes sociais

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ para a Plataforma de Músicas**
