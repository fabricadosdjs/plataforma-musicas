# Script para Aplicar Imagem Genérica em Todas as Tracks

## Scripts Criados

### 1. `set-generic-image-all.js`
**Script simples e rápido para aplicar uma imagem específica em todas as tracks**

```bash
node set-generic-image-all.js
```

- ✅ Atualiza todas as tracks de uma vez (operação em massa)
- ✅ Muito rápido e eficiente
- ✅ Substitui qualquer imagem existente pela URL especificada
- ✅ Relatório completo do resultado

### 2. `set-all-track-images.js` 
**Script avançado com múltiplas opções**

```bash
# Modo teste - ver o que seria feito
node set-all-track-images.js --dry-run

# Atualizar todas as tracks
node set-all-track-images.js

# Atualizar apenas algumas tracks
node set-all-track-images.js --limit=100

# Processamento individual (mais detalhado)
node set-all-track-images.js --no-batch

# Lotes personalizados
node set-all-track-images.js --batch=25

# Ajuda
node set-all-track-images.js --help
```

#### Opções Disponíveis:
- `--dry-run`: Modo teste - mostra o que seria feito sem executar
- `--no-batch`: Processa individualmente ao invés de em lote
- `--batch=N`: Tamanho do lote (padrão: 50)
- `--limit=N`: Processa apenas N tracks
- `--help`: Mostra ajuda completa

## Resultado da Execução

### ✅ Sucesso Total!
- **967 tracks** foram atualizadas com sucesso
- **100% de sucesso** na operação
- **Todas as tracks** agora usam a imagem genérica especificada

### 🖼️ Imagem Aplicada:
```
https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png
```

## Como Usar

### Execução Rápida (Recomendada)
```bash
# Aplica a imagem genérica em todas as tracks
node set-generic-image-all.js
```

### Execução com Teste Primeiro
```bash
# 1. Testar com algumas tracks primeiro
node set-all-track-images.js --dry-run --limit=10

# 2. Se estiver tudo OK, executar para todas
node set-all-track-images.js
```

### Execução Cuidadosa
```bash
# 1. Verificar situação atual
node check-track-images.js

# 2. Teste completo
node set-all-track-images.js --dry-run

# 3. Executar atualização
node set-generic-image-all.js

# 4. Verificar resultado
node check-track-images.js
```

## Diferenças Entre os Scripts

### `set-generic-image-all.js` (Simples)
- ✅ **Mais rápido**: Operação em massa do banco
- ✅ **Mais simples**: Sem opções complexas
- ✅ **Ideal para**: Aplicar a mesma imagem em todas as tracks
- ✅ **Resultado**: Atualização instantânea

### `set-all-track-images.js` (Avançado)
- ✅ **Mais flexível**: Múltiplas opções de configuração
- ✅ **Mais seguro**: Modo dry-run para testar
- ✅ **Mais detalhado**: Relatórios de progresso
- ✅ **Ideal para**: Quando você quer controle total

## Histórico de Execuções

### Última Execução (Agosto 2025)
- **Data**: 09/08/2025
- **Script usado**: `set-generic-image-all.js`
- **Resultado**: 967/967 tracks atualizadas (100% sucesso)
- **Tempo**: < 1 segundo
- **Status**: ✅ Completo

## Segurança

### ⚠️ Importante
- Estes scripts **substituem** todas as imagens existentes
- Não há backup automático das imagens anteriores
- Use `--dry-run` para testar antes de executar

### 🔒 Recomendações
1. **Sempre testar primeiro** com `--dry-run`
2. **Fazer backup** do banco antes de execuções grandes
3. **Verificar o resultado** com `node check-track-images.js`

## Troubleshooting

### Erro "Cannot find module"
```bash
npm install @prisma/client
```

### Erro de conexão com banco
```bash
# Verifique se as variáveis de ambiente estão configuradas
echo $DATABASE_URL
```

### Verificar se funcionou
```bash
node check-track-images.js
```

## Scripts Relacionados

- `check-track-images.js` - Verificar status das imagens
- `update-track-images.js` - Atualizar com imagens baseadas no estilo
- `update-track-images-ai.js` - Atualizar com IA
- `TRACK-IMAGES-README.md` - Documentação dos outros scripts
