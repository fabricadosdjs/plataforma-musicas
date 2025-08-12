@echo off
echo 🔧 Instalando yt-dlp no Windows...

REM Verifica se Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado!
    echo 💡 Por favor, instale Python primeiro:
    echo    1. Acesse: https://www.python.org/downloads/
    echo    2. Baixe Python 3.12+
    echo    3. Marque "Add Python to PATH" durante a instalação
    echo    4. Execute este script novamente
    pause
    exit /b 1
)

echo ✅ Python encontrado!
python --version

echo 📦 Atualizando pip...
python -m pip install --upgrade pip

echo 📦 Instalando yt-dlp...
python -m pip install yt-dlp

echo 🧪 Testando instalação...
yt-dlp --version
if %errorlevel% neq 0 (
    echo ❌ Falha na instalação do yt-dlp
    pause
    exit /b 1
)

echo ✅ yt-dlp instalado com sucesso!
echo 🎉 Instalação concluída!
echo 💡 Agora você pode fazer o deploy da aplicação
pause
