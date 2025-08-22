# 🎵 Scripts de Correção de Artistas Desconhecidos

Este conjunto de scripts corrige automaticamente registros com "Artista Desconhecido" no banco de dados da plataforma de músicas.

## 📋 Arquivos Incluídos

### 1. `backup-before-fix.js`
- **Função**: Cria backup de segurança antes das correções
- **Segurança**: Salva todos os dados que serão modificados
- **Relatório**: Gera estatísticas detalhadas do backup

### 2. `fix-unknown-artists.js`
- **Função**: Executa as correções nos artistas
- **Inteligência**: Extrai nomes de artistas dos nomes das músicas
- **Relatório**: Gera relatório completo das correções

### 3. `run-artist-fix.js`
- **Função**: Script principal com menu interativo
- **Coordenação**: Gerencia todo o processo de correção
- **Interface**: Menu amigável para todas as operações

## 🚀 Como Usar

### Pré-requisitos
```bash
# Certifique-se de que o Prisma está configurado
npm install
npx prisma generate

# Verifique se o banco está acessível
npx prisma db pull
```

### Execução Simples
```bash
# Navegar para a pasta scripts
cd scripts

# Executar script principal (recomendado)
node run-artist-fix.js

# Ou executar scripts individuais
node backup-before-fix.js
node fix-unknown-artists.js
```

## 🎯 Funcionalidades

### 🔍 Detecção Inteligente
O script identifica automaticamente:
- `Artista Desconhecido`
- `Unknown Artist`
- `N/A`
- `NULL` ou campos vazios
- Outros valores inválidos

### 🧠 Extração de Nomes
Usa padrões inteligentes para extrair nomes de artistas:
- `ARTISTA - Nome da Música`
- `ARTISTA ft. FEATURED - Nome da Música`
- `ARTISTA feat. FEATURED - Nome da Música`
- `ARTISTA & FEATURED - Nome da Música`
- `ARTISTA x FEATURED - Nome da Música`
- `ARTISTA vs FEATURED - Nome da Música`
- `ARTISTA (feat. FEATURED) - Nome da Música`
- `ARTISTA [feat. FEATURED] - Nome da Música`

### 💾 Backup Automático
- Cria backup antes de qualquer modificação
- Salva em `scripts/backups/`
- Inclui script de restauração automático
- Timestamp único para cada backup

### 📊 Relatórios Detalhados
- Estatísticas antes e depois
- Lista de todas as correções
- Detalhes de falhas (se houver)
- Arquivo JSON para análise posterior

## 🛡️ Segurança

### ✅ Medidas de Proteção
1. **Backup obrigatório** antes de qualquer modificação
2. **Validação de dados** antes de salvar
3. **Transações seguras** no banco de dados
4. **Script de restauração** automático
5. **Relatórios detalhados** de todas as operações

### ⚠️ Recomendações
- **SEMPRE** faça backup antes de executar
- Teste em ambiente de desenvolvimento primeiro
- Monitore os logs durante a execução
- Mantenha os backups em local seguro

## 📖 Exemplo de Uso

### 1. Executar Script Principal
```bash
node run-artist-fix.js
```

### 2. Escolher Opção
```
🎵 MENU PRINCIPAL - CORREÇÃO DE ARTISTAS
==================================================
1. 💾 Criar backup de segurança
2. 🔧 Executar correção completa
3. 📊 Ver estatísticas do banco
4. 🔄 Restaurar de backup
5. ❌ Sair

Escolha uma opção (1-5): 2
```

### 3. Acompanhar Progresso
```
🚀 EXECUTANDO CORREÇÃO COMPLETA...

📋 PASSO 1: Criando backup de segurança...
💾 CRIANDO BACKUP DE SEGURANÇA...

🔍 Buscando músicas que serão corrigidas...
📊 Encontradas 45 músicas para backup

✅ BACKUP CRIADO COM SUCESSO!
📁 Arquivo: scripts/backups/backup-artists-before-fix-2024-01-15T10-30-00-000Z.json

📋 PASSO 2: Executando correções...
🎵 Iniciando correção de artistas desconhecidos...

🔍 Buscando músicas com artistas inválidos...
📊 Encontradas 45 músicas com artistas inválidos

🔄 Processando músicas...

🎵 Processando: "MC KEVINHO - BAILE DE FAVELA" (ID: 123)
   ✅ Corrigido: "Artista Desconhecido" → "MC KEVINHO"

🎵 Processando: "DJ ALVARO - FUNK DO MOMENTO" (ID: 124)
   ✅ Corrigido: "Unknown Artist" → "DJ ALVARO"

📋 RELATÓRIO DE CORREÇÕES
==================================================
✅ Músicas corrigidas: 45
❌ Falhas: 0
📊 Total processado: 45
```

## 🔧 Personalização

### Adicionar Novos Padrões
Edite `fix-unknown-artists.js` e adicione novos padrões regex:

```javascript
const artistPatterns = [
    // Seus padrões existentes...
    
    // Novo padrão personalizado
    /^([^-]+)\s+com\s+([^-]+)\s*-\s*(.+)$/i,
];
```

### Adicionar Novos Valores Inválidos
```javascript
const invalidArtistValues = [
    // Valores existentes...
    'Seu Valor Inválido',
    'Outro Valor Problemático'
];
```

## 📁 Estrutura de Arquivos

```
scripts/
├── README.md                    # Este arquivo
├── run-artist-fix.js           # Script principal
├── backup-before-fix.js        # Script de backup
├── fix-unknown-artists.js      # Script de correção
└── backups/                    # Pasta de backups
    ├── backup-artists-before-fix-2024-01-15T10-30-00-000Z.json
    ├── restore-2024-01-15T10-30-00-000Z.js
    └── ...
```

## 🚨 Solução de Problemas

### Erro de Conexão com Banco
```bash
# Verificar se o Prisma está configurado
npx prisma generate

# Verificar conexão
npx prisma db pull
```

### Erro de Permissões
```bash
# Dar permissão de execução
chmod +x run-artist-fix.js

# Ou executar com Node
node run-artist-fix.js
```

### Backup Não Encontrado
- Verifique se a pasta `backups/` existe
- Execute primeiro o script de backup
- Verifique permissões de escrita

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de erro
2. Confirme se o banco está acessível
3. Verifique se o Prisma está configurado
4. Execute o backup primeiro
5. Teste com poucos registros

## 🎉 Resultado Esperado

Após a execução bem-sucedida:
- ✅ Todos os "Artista Desconhecido" serão corrigidos
- ✅ Nomes de artistas extraídos automaticamente
- ✅ Backup de segurança criado
- ✅ Relatórios detalhados gerados
- ✅ Script de restauração disponível
- ✅ Banco de dados limpo e consistente

---

**⚠️ IMPORTANTE**: Sempre faça backup antes de executar correções em produção!
