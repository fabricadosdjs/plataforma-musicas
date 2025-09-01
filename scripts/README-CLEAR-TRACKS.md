errorro# 🚨 Scripts para Remoção de Músicas do Banco de Dados

⚠️ **ATENÇÃO: ESTES SCRIPTS SÃO DESTRUTIVOS E IRÃO REMOVER TODAS AS MÚSICAS!**

## 📋 Visão Geral

Este diretório contém vários scripts para remover todas as músicas do banco de dados. Use com **EXTREMO CUIDADO** pois a operação é **IRREVERSÍVEL**.

## 🛡️ Medidas de Segurança

Todos os scripts incluem:
- **Confirmação dupla** do usuário
- **Opção de backup** antes da remoção
- **Modo dry-run** para visualizar o que seria removido
- **Logs detalhados** de todas as operações
- **Validações** de dependências e conectividade

## 📁 Scripts Disponíveis

### 1. `clear-all-tracks.cjs` - Script Principal (Node.js CommonJS)

**Uso:**
```bash
# Execução interativa (recomendado)
node scripts/clear-all-tracks.cjs

# Execução com backup automático
node scripts/clear-all-tracks.cjs --backup

# Modo dry-run (apenas visualizar)
node scripts/clear-all-tracks.cjs --dry-run

# Execução sem confirmação (perigoso!)
node scripts/clear-all-tracks.cjs --confirm

# Forçar execução mesmo com erros
node scripts/clear-all-tracks.cjs --force
```

**Recursos:**
- ✅ Confirmação dupla do usuário
- ✅ Criação automática de backup
- ✅ Estatísticas detalhadas antes/depois
- ✅ Modo dry-run para teste
- ✅ Logs estruturados com AudioDebugger
- ✅ Tratamento robusto de erros

### 2. `emergency-clear-tracks.cjs` - Script de Emergência

**Uso:**
```bash
node scripts/emergency-clear-tracks.cjs
```

**Recursos:**
- ✅ Script simplificado para situações críticas
- ✅ Confirmação única com palavra "EMERGENCIA"
- ✅ Execução rápida sem opções extras
- ✅ Ideal para casos de emergência

### 3. `clear-tracks.sql` - Script SQL Direto

**Uso:**
```bash
# Via psql
psql -d SEU_BANCO -f scripts/clear-tracks.sql

# Via pgAdmin ou outro cliente SQL
# Execute o conteúdo do arquivo diretamente
```

**Recursos:**
- ✅ Execução direta no banco PostgreSQL
- ✅ Não requer Node.js ou Prisma
- ✅ Estatísticas SQL nativas
- ✅ Comentado por segurança (DELETE comentado)

### 4. `clear-tracks.ps1` - Script PowerShell (Windows)

**Uso:**
```powershell
# Execução interativa
.\scripts\clear-tracks.ps1

# Com backup automático
.\scripts\clear-tracks.ps1 -Backup

# Modo dry-run
.\scripts\clear-tracks.ps1 -DryRun

# Sem confirmação (perigoso!)
.\scripts\clear-tracks.ps1 -Confirm:$false
```

**Recursos:**
- ✅ Interface nativa do Windows
- ✅ Cores e formatação PowerShell
- ✅ Verificação automática de dependências
- ✅ Integração com Node.js/Prisma

### 5. `restore-tracks-backup.cjs` - Script de Restauração

**Uso:**
```bash
# Restaurar backup interativamente
node scripts/restore-tracks-backup.cjs

# Restaurar backup específico
node scripts/restore-tracks-backup.cjs backups/tracks-backup-2024-01-15T10-30-45-123Z.json
```

**Recursos:**
- ✅ Lista backups disponíveis automaticamente
- ✅ Validação de arquivos de backup
- ✅ Detecção e resolução de conflitos
- ✅ Opções de restauração flexíveis

## 🔧 Pré-requisitos

### Para Scripts Node.js (.cjs):
- Node.js instalado
- Prisma configurado
- Banco de dados acessível
- Variáveis de ambiente configuradas

### Para Script SQL:
- Cliente PostgreSQL (psql, pgAdmin, etc.)
- Acesso ao banco de dados
- Permissões de DELETE na tabela `track`

### Para Script PowerShell:
- Windows PowerShell 5.1+ ou PowerShell Core
- Node.js instalado
- Prisma configurado

## 📊 Estrutura de Backup

Os backups são salvos em:
```
backups/
├── tracks-backup-2024-01-15T10-30-45-123Z.json
├── tracks-backup-2024-01-15T14-22-18-456Z.json
└── ...
```

**Conteúdo do backup:**
- ID da música
- Nome da música
- Artista
- Álbum
- Gênero
- Data de lançamento
- URLs de download/preview
- URL da imagem
- Duração, BPM, Key
- Timestamps de criação/atualização

## 🚨 Cenários de Uso

### ✅ Uso Recomendado:
1. **Desenvolvimento/Teste**: Limpar banco de desenvolvimento
2. **Migração**: Limpar antes de importar novos dados
3. **Manutenção**: Limpeza programada com backup
4. **Debug**: Resolver problemas de dados corrompidos

### ❌ NÃO Use Para:
1. **Produção** sem backup completo
2. **Limpeza parcial** (use filtros específicos)
3. **Operações automatizadas** sem supervisão
4. **Testes** sem ambiente isolado

## 🔍 Modo Dry-Run

Use o modo dry-run para verificar o que seria removido:

```bash
# Node.js
node scripts/clear-all-tracks.cjs --dry-run

# PowerShell
.\scripts\clear-tracks.ps1 -DryRun
```

**O que o dry-run mostra:**
- Total de músicas no banco
- Estatísticas por gênero
- Estatísticas por artista
- Simulação da operação (sem executar)

## 💾 Restauração de Backup

Para restaurar um backup:

```bash
# Restauração interativa
node scripts/restore-tracks-backup.cjs

# Restauração direta
node scripts/restore-tracks-backup.cjs caminho/para/backup.json
```

**Opções de resolução de conflitos:**
- **skip**: Pular músicas que já existem
- **update**: Atualizar músicas existentes
- **abort**: Cancelar a operação

## ⚠️ Avisos Importantes

1. **SEMPRE faça backup** antes de executar
2. **Teste em ambiente de desenvolvimento** primeiro
3. **Verifique as permissões** do banco de dados
4. **Monitore o espaço em disco** para backups grandes
5. **Tenha um plano de recuperação** em caso de problemas

## 🆘 Suporte

Se algo der errado:

1. **NÃO entre em pânico** - os dados podem estar no backup
2. **Verifique os logs** para identificar o problema
3. **Restaure o backup** se necessário
4. **Verifique a conectividade** com o banco
5. **Consulte a documentação** do Prisma/PostgreSQL

## 📝 Logs e Monitoramento

Todos os scripts geram logs detalhados:
- Console com emojis e cores
- Arquivos de log estruturados
- Estatísticas antes/depois
- Informações de erro detalhadas

## 🔒 Segurança

- Scripts requerem confirmação explícita
- Backup automático opcional
- Validação de dependências
- Tratamento robusto de erros
- Logs de auditoria completos

## 🔧 Solução de Problemas

### Erro de Módulo ES6:
Se você encontrar erros relacionados a módulos ES6, certifique-se de usar as extensões `.cjs`:

```bash
# ✅ Correto (CommonJS)
node scripts/clear-all-tracks.cjs

# ❌ Incorreto (ES6)
node scripts/clear-all-tracks.js
```

### Dependências:
Certifique-se de que o Prisma está instalado e configurado:
```bash
npm install @prisma/client
npx prisma generate
```

---

**⚠️ LEMBRE-SE: Esta operação é IRREVERSÍVEL! Use com EXTREMO CUIDADO!**
