Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Build do Extrator de Músicas Contabo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Instalando dependencias..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "[2/4] Instalando pkg globalmente..." -ForegroundColor Yellow
npm install -g pkg

Write-Host ""
Write-Host "[3/4] Construindo executavel .exe..." -ForegroundColor Yellow
npm run build-win

Write-Host ""
Write-Host "[4/4] Verificando resultado..." -ForegroundColor Yellow
if (Test-Path "dist\contabo-downloader.exe") {
    Write-Host ""
    Write-Host "✅ SUCESSO! Executavel criado em: dist\contabo-downloader.exe" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Arquivos criados:" -ForegroundColor Cyan
    Get-ChildItem "dist" | Format-Table Name, Length, LastWriteTime
    Write-Host ""
    Write-Host "🚀 Para usar, execute: dist\contabo-downloader.exe" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "❌ ERRO: Executavel nao foi criado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Verifique se todas as dependencias foram instaladas corretamente." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")




