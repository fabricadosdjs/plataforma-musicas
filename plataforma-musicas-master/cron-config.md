# Configuração do Cron Job para Atualização Automática do Trending

## Configuração do Ambiente

1. **Adicione a variável de ambiente no seu `.env`:**
```env
CRON_SECRET_TOKEN=seu_token_secreto_aqui
```

## Configuração do Cron Job

### Opção 1: Usando crontab (Linux/Mac)

Execute `crontab -e` e adicione:

```bash
# Atualizar trending todo domingo à meia-noite
0 0 * * 0 curl -X POST https://seu-dominio.com/api/cron/update-trending \
  -H "Authorization: Bearer seu_token_secreto_aqui" \
  -H "Content-Type: application/json"
```

### Opção 2: Usando Vercel Cron Jobs

Adicione no seu `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-trending",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

### Opção 3: Usando GitHub Actions

Crie `.github/workflows/update-trending.yml`:

```yaml
name: Update Trending Data

on:
  schedule:
    # Executa todo domingo à meia-noite UTC
    - cron: '0 0 * * 0'
  workflow_dispatch: # Permite execução manual

jobs:
  update-trending:
    runs-on: ubuntu-latest
    
    steps:
    - name: Update Trending Data
      run: |
        curl -X POST ${{ secrets.API_URL }}/api/cron/update-trending \
          -H "Authorization: Bearer ${{ secrets.CRON_SECRET_TOKEN }}" \
          -H "Content-Type: application/json"
```

## Configuração das Secrets (GitHub Actions)

1. `API_URL`: URL da sua API (ex: https://seu-dominio.com)
2. `CRON_SECRET_TOKEN`: O mesmo token definido no `.env`

## Monitoramento

O endpoint retorna informações sobre a atualização:

```json
{
  "success": true,
  "message": "Trending data updated successfully",
  "weekStart": "2024-01-01T00:00:00.000Z",
  "weekEnd": "2024-01-07T23:59:59.999Z",
  "tracksCount": 50,
  "topTracks": [...]
}
```

## Logs

Os logs são exibidos no console do servidor e incluem:
- Confirmação de execução
- Verificação de data/hora
- Contagem de tracks encontradas
- Top 10 tracks com mais downloads

## Segurança

- O endpoint requer autenticação via token
- Só executa aos domingos à meia-noite
- Validação de horário para evitar execuções desnecessárias 