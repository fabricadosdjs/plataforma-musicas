@echo off
echo ========================================
echo  Teste do Extrator de Músicas Contabo
echo ========================================
echo.

echo [1/3] Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ ERRO: Node.js não está instalado!
    echo 💡 Instale Node.js 18+ em: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [2/3] Verificando dependências...
if not exist "node_modules" (
    echo ⚠️  Dependências não instaladas. Instalando...
    npm install
) else (
    echo ✅ Dependências já instaladas
)

echo.
echo [3/3] Testando script...
echo 💡 Testando sintaxe do script...
node -c contabo-downloader.js
if %errorlevel% equ 0 (
    echo ✅ Script com sintaxe válida!
    echo.
    echo 🚀 Para executar o script completo:
    echo    node contabo-downloader.js
    echo.
    echo 🎯 Para criar o executável .exe:
    echo    build-exe.bat
) else (
    echo ❌ ERRO: Script com problemas de sintaxe!
)

echo.
echo Pressione qualquer tecla para sair...
pause > nul


