# Como instalar yt-dlp no Windows

## 🎯 **Para seu ambiente de desenvolvimento (Windows):**

### Método 1: Script Batch (Mais simples)
1. Abra o **Prompt de Comando** como Administrador
2. Navegue até a pasta do projeto:
   ```cmd
   cd C:\FFOutput\plataforma-musicas
   ```
3. Execute o script:
   ```cmd
   install-ytdlp.bat
   ```

### Método 2: PowerShell
1. Abra o **PowerShell** como Administrador
2. Navegue até a pasta:
   ```powershell
   cd C:\FFOutput\plataforma-musicas
   ```
3. Execute:
   ```powershell
   .\install-ytdlp.ps1
   ```

### Método 3: Manual
1. **Instalar Python** (se não tiver):
   - Acesse: https://www.python.org/downloads/
   - Baixe Python 3.12+
   - **IMPORTANTE**: Marque "Add Python to PATH" durante a instalação

2. **Instalar yt-dlp**:
   ```cmd
   python -m pip install yt-dlp
   ```

3. **Verificar instalação**:
   ```cmd
   yt-dlp --version
   ```

## 🚀 **Para seu servidor de produção (Linux):**

### Se for VPS/Servidor Linux:
```bash
chmod +x install-ytdlp.sh
./install-ytdlp.sh
```

### Se for Vercel/Netlify:
- Não precisa instalar manualmente
- O yt-dlp será instalado automaticamente durante o build

## ✅ **Teste se funcionou:**

Execute no terminal/cmd:
```bash
yt-dlp --version
```

Se mostrar a versão, está funcionando! 

## 🔧 **Solução de problemas:**

### Erro "comando não encontrado":
- **Windows**: Reinstale Python e marque "Add to PATH"
- **Linux**: Execute `export PATH=$PATH:~/.local/bin`

### Erro de permissão:
- **Windows**: Execute como Administrador
- **Linux**: Use `sudo` se necessário

### Python não encontrado:
- **Windows**: Instale de https://www.python.org/downloads/
- **Linux**: `sudo apt install python3 python3-pip`

## 🎯 **Depois da instalação:**

1. Faça o build e deploy da aplicação
2. O sistema tentará ytdl-core primeiro
3. Se falhar, usará yt-dlp automaticamente
4. Verifique os logs para ver qual método foi usado

**Resultado**: YouTube downloads funcionando mesmo com bloqueios! 🎉
