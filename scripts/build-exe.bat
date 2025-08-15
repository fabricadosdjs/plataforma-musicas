@echo off
echo ========================================
echo  Build do Extrator de Músicas Contabo
echo ========================================
echo.

echo [1/4] Instalando dependencias...
npm install

echo.
echo [2/4] Instalando pkg globalmente...
npm install -g pkg

echo.
echo [3/4] Construindo executavel .exe...
npm run build-win

echo.
echo [4/4] Verificando resultado...
if exist "dist\contabo-downloader.exe" (
    echo.
    echo ✅ SUCESSO! Executavel criado em: dist\contabo-downloader.exe
    echo.
    echo 📁 Arquivos criados:
    dir dist
    echo.
    echo 🚀 Para usar, execute: dist\contabo-downloader.exe
) else (
    echo.
    echo ❌ ERRO: Executavel nao foi criado!
    echo.
    echo 💡 Verifique se todas as dependencias foram instaladas corretamente.
)

echo.
echo Pressione qualquer tecla para sair...
pause > nul


