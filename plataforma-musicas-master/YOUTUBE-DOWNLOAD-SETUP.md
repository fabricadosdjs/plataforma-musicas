# YouTube Download - Configuração sem Proxy

Esta implementação usa `yt-dlp` (ou `youtube-dl` como fallback) para contornar bloqueios do YouTube sem precisar de proxy.

## Instalação

### 1. No servidor de produção (Linux/Ubuntu):
```bash
# Tornar o script executável
chmod +x install-ytdlp.sh

# Executar instalação
./install-ytdlp.sh
```

### 2. Instalação manual:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y python3 python3-pip
pip3 install yt-dlp

# CentOS/RHEL
sudo yum install -y python3 python3-pip
pip3 install yt-dlp

# Verificar instalação
yt-dlp --version
```

### 3. Para Docker/Container:
Adicione ao seu Dockerfile:
```dockerfile
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip3 install yt-dlp
```

### 4. Para Vercel/Netlify:
- No Vercel, adicione um arquivo `vercel.json` com:
```json
{
  "functions": {
    "app/api/youtube-download-robust/route.ts": {
      "runtime": "@vercel/node"
    }
  },
  "buildCommand": "pip3 install yt-dlp && npm run build"
}
```

## Como funciona

1. **Primeira tentativa**: Usa `ytdl-core` (Node.js nativo)
2. **Fallback automático**: Se falhar, usa `yt-dlp` ou `youtube-dl`
3. **Máxima compatibilidade**: yt-dlp é mais resistente a bloqueios do YouTube

## Vantagens desta solução

- ✅ Não precisa de proxy pago
- ✅ Mais resistente a bloqueios
- ✅ Fallback automático
- ✅ Melhor qualidade de download
- ✅ Suporte a mais formatos

## Logs para debug

O sistema agora mostra nos logs qual método está sendo usado:
- `ytdl-core` (primeira tentativa)
- `yt-dlp` ou `youtube-dl` (fallback)

Exemplo de log de sucesso:
```
✅ yt-dlp disponível, tentando obter informações...
✅ Informações obtidas com yt-dlp
🎵 Tentando download com yt-dlp...
✅ Download concluído com yt-dlp
```
