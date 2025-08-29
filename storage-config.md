# 🗂️ Configuração do Storage

## 📁 Estrutura de Pastas

O sistema agora faz upload real para o storage da Contabo com a seguinte estrutura:

```
/var/www/html/storage/
├── community/
│   ├── 1234567890_Artist_Name_Song_Name.mp3
│   ├── 1234567890_Artist_Name_Song_Name2.mp3
│   └── covers/
│       ├── 1234567890_Artist_Name_Song_Name.jpg
│       └── 1234567890_Artist_Name_Song_Name2.jpg
```

## 🔧 Variáveis de Ambiente

Adicione ao seu `.env.local`:

```bash
# Storage Configuration
STORAGE_BASE_PATH=/var/www/html/storage
NEXT_PUBLIC_STORAGE_URL=http://localhost:3000/api/storage

# Para produção (ajustar conforme sua configuração)
STORAGE_BASE_PATH=/home/user/storage
NEXT_PUBLIC_STORAGE_URL=https://seudominio.com/api/storage
```

## 🚀 Como Funciona

1. **Upload de Arquivos**: `/api/storage/upload`
   - Recebe MP3 e capa via FormData
   - Salva em `/community/` e `/community/covers/`
   - Gera nomes únicos com timestamp

2. **Servir Arquivos**: `/api/storage/[...path]`
   - Serve arquivos estáticos do storage
   - Headers de cache e CORS configurados
   - Suporte a MP3, JPG, PNG, etc.

3. **Integração**: `/api/tracks/upload-community`
   - Salva metadados no banco
   - URLs reais do storage

## 📊 URLs Geradas

- **Áudio**: `http://localhost:3000/api/storage/community/1234567890_Artist_Song.mp3`
- **Capa**: `http://localhost:3000/api/storage/community/covers/1234567890_Artist_Song.jpg`

## 🛡️ Segurança

- ✅ Apenas usuários autenticados podem fazer upload
- ✅ Validação de tipos de arquivo (MP3, imagens)
- ✅ Limite de tamanho (50MB para áudio, 5MB para capa)
- ✅ Nomes de arquivo sanitizados
- ✅ Verificação de permissões

## 🔍 Logs

O sistema gera logs detalhados para debug:
- 📤 Início do upload
- 📁 Criação de diretórios
- 💾 Salvamento de arquivos
- ✅ Sucesso ou ❌ erro
