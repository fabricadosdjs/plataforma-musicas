# Scripts para Gerenciamento de Imagens das Tracks

Este diretório contém scripts para gerenciar imagens de capa das músicas na plataforma.

## Scripts Disponíveis

### 1. `check-track-images.js`
**Verifica quantas tracks não possuem imagem**

```bash
node check-track-images.js
```

- Mostra estatísticas completas
- Lista exemplos de tracks sem imagem
- Não modifica nada no banco

### 2. `update-track-images.js`
**Script básico para adicionar imagens**

```bash
node update-track-images.js
```

- Gera imagens baseadas no estilo da música
- Processa em lotes para melhor performance
- Não usa a API de detecção

### 3. `update-track-images-ai.js`
**Script avançado com IA**

```bash
# Uso básico (usa API de detecção)
node update-track-images-ai.js

# Sem usar a API (mais rápido)
node update-track-images-ai.js --no-api

# Processar apenas 50 tracks
node update-track-images-ai.js --limit=50

# Usar lotes menores (3 por vez)
node update-track-images-ai.js --batch=3

# Combinando opções
node update-track-images-ai.js --limit=20 --batch=2 --no-api
```

#### Opções do script AI:
- `--no-api`: Não usa a API de detecção (mais rápido, menos preciso)
- `--limit=N`: Processa apenas N tracks
- `--batch=N`: Tamanho do lote (padrão: 5)

## Como Usar

### Passo 1: Verificar situação atual
```bash
node check-track-images.js
```

### Passo 2: Escolher estratégia

**Para máxima qualidade (recomendado):**
```bash
# Processa todas as tracks usando IA
node update-track-images-ai.js
```

**Para teste ou processamento rápido:**
```bash
# Testa com apenas 10 tracks
node update-track-images-ai.js --limit=10

# Processa sem usar IA (mais rápido)
node update-track-images.js
```

### Passo 3: Verificar resultado
```bash
node check-track-images.js
```

## Tipos de Imagem

### Script AI (`update-track-images-ai.js`)
1. **Primeira prioridade**: Imagem detectada pela API de IA
2. **Fallback**: Imagem baseada no estilo da música
3. **Último recurso**: Imagem genérica padrão

### Script Básico (`update-track-images.js`)
1. **Baseado no estilo**: Seleciona imagem adequada ao gênero
2. **Fallback**: Imagem genérica padrão

## Imagens por Estilo

- **Progressive House**: Capas com visual progressivo e colorido
- **Tech House**: Visual mais técnico e minimalista
- **Melodic Techno**: Estética melódica e atmosférica
- **Deep House**: Visual profundo e envolvente
- **Techno**: Estética industrial e moderna
- **House**: Visual clássico house

## Requisitos

- Node.js instalado
- Banco de dados configurado
- Para o script AI: servidor de desenvolvimento rodando (`npm run dev`)

## Troubleshooting

### "Cannot find module 'node-fetch'"
```bash
npm install node-fetch
```

### "Database connection error"
Verifique se as variáveis de ambiente estão configuradas:
```bash
# .env.local
DATABASE_URL="sua_url_do_banco"
```

### "API not responding"
Para o script AI, certifique-se que o servidor está rodando:
```bash
npm run dev
```

### Performance

- **Script básico**: ~1000 tracks/minuto
- **Script AI**: ~50-100 tracks/minuto (devido às consultas à API)

Use `--batch=` menor se houver problemas de memória ou rate limiting.

## Exemplos de Uso

### Atualização completa em produção
```bash
# 1. Verificar situação
node check-track-images.js

# 2. Atualizar com IA (processamento em lotes)
node update-track-images-ai.js --batch=3

# 3. Verificar resultado
node check-track-images.js
```

### Teste rápido
```bash
# Testar com 5 tracks sem usar API
node update-track-images-ai.js --limit=5 --no-api
```

### Processamento de emergência
```bash
# Atualizar todas rapidamente sem IA
node update-track-images.js
```
