# Deploy no Netlify - Configuração YouTube Download

## ⚠️ **Limitações do Netlify:**

O Netlify **NÃO suporta**:
- ❌ Python/yt-dlp
- ❌ Binários externos
- ❌ Downloads de arquivos grandes
- ❌ Spawn de processos
- ❌ Escrita no sistema de arquivos

## ✅ **O que funciona no Netlify:**

- ✅ Obter informações do vídeo (título, duração, thumbnail)
- ✅ Validação de URLs
- ✅ Verificação de playlists
- ✅ Anti-bloqueio básico com User-Agents

## 🔧 **Configuração para Netlify:**

### 1. Arquivos criados:
- `/api/youtube-download-netlify/route.ts` - API otimizada
- `netlify.json` - Configuração de deploy
- Redirect automático da API original

### 2. Deploy:
```bash
# Build local para testar
npm run build

# Deploy no Netlify
git add .
git commit -m "Configuração para Netlify"
git push
```

### 3. Configuração no painel Netlify:
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Functions directory**: `.netlify/functions`

## 🎯 **Comportamento no Netlify:**

### GET `/api/youtube-download-robust` (informações):
- ✅ Funciona com limitações
- ✅ Retorna título, duração, thumbnail
- ✅ Detecta playlists e vídeos longos
- ⚠️ Pode ser bloqueado pelo YouTube

### POST `/api/youtube-download-robust` (download):
- ❌ Retorna erro 501 (Not Implemented)
- 💡 Sugere uso do Allavsoft
- 📝 Informa sobre limitações do Netlify

## 🚀 **Alternativas recomendadas:**

### Para funcionalidade completa:
1. **Vercel** - Suporte a Python runtime
2. **Railway** - Containers Docker
3. **Render** - Python nativo
4. **VPS** - Controle total

### Para manter no Netlify:
- Use apenas para validar URLs
- Redirecione usuários para Allavsoft
- Considere API externa de terceiros

## 📱 **Experience do usuário no Netlify:**

```javascript
// O que o usuário verá:
{
  "error": "Downloads não estão disponíveis no Netlify devido a limitações de runtime.",
  "suggestion": "Use o Allavsoft para downloads de YouTube",
  "netlifyLimitation": true
}
```

## 🔄 **Migração futura:**

Se quiser migrar do Netlify:
1. Exporte dados do banco
2. Configure novo serviço (Vercel/Railway)
3. Restaure funcionalidade completa
4. Atualize DNS

**Conclusão**: Netlify é ótimo para frontend, mas limitado para YouTube downloads. Recomendo Vercel para funcionalidade completa.
