# Script PowerShell para instalar yt-dlp no Windows
# Execute este script como Administrador no PowerShell

Write-Host "🔧 Instalando yt-dlp no Windows..." -ForegroundColor Green

# Verifica se Python está instalado
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
    } else {
        throw "Python não encontrado"
    }
} catch {
    Write-Host "❌ Python3 não encontrado. Instalando..." -ForegroundColor Red
    
    # Instalar Python usando winget (Windows 10/11)
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "📦 Instalando Python via winget..." -ForegroundColor Yellow
        winget install Python.Python.3.12
    } else {
        Write-Host "❌ winget não disponível. Por favor, instale Python manualmente:" -ForegroundColor Red
        Write-Host "   1. Acesse: https://www.python.org/downloads/" -ForegroundColor White
        Write-Host "   2. Baixe e instale Python 3.12+" -ForegroundColor White
        Write-Host "   3. Marque 'Add Python to PATH' durante a instalação" -ForegroundColor White
        exit 1
    }
}

# Atualizar pip
Write-Host "📦 Atualizando pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Instalar yt-dlp
Write-Host "📦 Instalando yt-dlp..." -ForegroundColor Yellow
python -m pip install yt-dlp

# Verificar instalação
try {
    $ytdlpVersion = yt-dlp --version 2>$null
    if ($ytdlpVersion) {
        Write-Host "✅ yt-dlp instalado com sucesso!" -ForegroundColor Green
        Write-Host "📋 Versão: $ytdlpVersion" -ForegroundColor White
    } else {
        throw "yt-dlp não foi instalado corretamente"
    }
} catch {
    Write-Host "❌ Falha na instalação do yt-dlp" -ForegroundColor Red
    Write-Host "💡 Tente reinstalar com: python -m pip install --force-reinstall yt-dlp" -ForegroundColor Yellow
    exit 1
}

# Teste rápido
Write-Host "🧪 Testando yt-dlp..." -ForegroundColor Yellow
try {
    $testResult = yt-dlp --help 2>$null
    if ($testResult) {
        Write-Host "✅ yt-dlp está funcionando corretamente!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ yt-dlp instalado, mas houve problema no teste" -ForegroundColor Yellow
}

Write-Host "🎉 Instalação concluída!" -ForegroundColor Green
Write-Host "💡 Agora você pode fazer o deploy da aplicação com suporte ao yt-dlp" -ForegroundColor Cyan
