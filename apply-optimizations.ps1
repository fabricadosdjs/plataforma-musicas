# 🚀 Script de Aplicação de Otimizações de Performance
# Plataforma de Músicas - Nexor Records
# Versão PowerShell para Windows

Write-Host "🎵 Aplicando otimizações de performance para a plataforma de músicas..." -ForegroundColor Green
Write-Host ""

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script no diretório raiz do projeto" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Diretório atual: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# 1. Fazer backup da configuração atual do Next.js
Write-Host "🔒 Fazendo backup da configuração atual..." -ForegroundColor Yellow
if (Test-Path "next.config.mjs") {
    Copy-Item "next.config.mjs" "next.config.backup.mjs"
    Write-Host "✅ Backup criado: next.config.backup.mjs" -ForegroundColor Green
}
else {
    Write-Host "⚠️ Arquivo next.config.mjs não encontrado" -ForegroundColor Yellow
}

# 2. Aplicar configuração otimizada
Write-Host ""
Write-Host "⚡ Aplicando configuração otimizada do Next.js..." -ForegroundColor Yellow
if (Test-Path "next.config.optimized.mjs") {
    Copy-Item "next.config.optimized.mjs" "next.config.mjs"
    Write-Host "✅ Configuração otimizada aplicada" -ForegroundColor Green
}
else {
    Write-Host "❌ Arquivo next.config.optimized.mjs não encontrado" -ForegroundColor Red
    exit 1
}

# 3. Instalar dependências necessárias
Write-Host ""
Write-Host "📦 Instalando dependências necessárias..." -ForegroundColor Yellow
try {
    npm install @svgr/webpack webpack-bundle-analyzer --save-dev
    Write-Host "✅ Dependências instaladas com sucesso" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

# 4. Verificar se os hooks otimizados foram criados
Write-Host ""
Write-Host "🔍 Verificando hooks otimizados..." -ForegroundColor Yellow
$hooksDir = "src/hooks"
$requiredHooks = @(
    "useOptimizedTracksFetch.ts",
    "useOptimizedDataFetch.ts",
    "useOptimizedNavigation.ts"
)

$missingHooks = $false
foreach ($hook in $requiredHooks) {
    if (Test-Path "$hooksDir/$hook") {
        Write-Host "✅ $hook encontrado" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $hook não encontrado" -ForegroundColor Red
        $missingHooks = $true
    }
}

# 5. Verificar se os componentes otimizados foram criados
Write-Host ""
Write-Host "🔍 Verificando componentes otimizados..." -ForegroundColor Yellow
$componentsDir = "src/components/music"
$requiredComponents = @(
    "OptimizedStyleCards.tsx",
    "OptimizedFolderCards.tsx",
    "OptimizedCommunityCarousel.tsx"
)

$missingComponents = $false
foreach ($component in $requiredComponents) {
    if (Test-Path "$componentsDir/$component") {
        Write-Host "✅ $component encontrado" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $component não encontrado" -ForegroundColor Red
        $missingComponents = $true
    }
}

# 6. Verificar se a documentação foi criada
Write-Host ""
Write-Host "📚 Verificando documentação..." -ForegroundColor Yellow
if (Test-Path "OTIMIZACOES-PERFORMANCE.md") {
    Write-Host "✅ Documentação criada: OTIMIZACOES-PERFORMANCE.md" -ForegroundColor Green
}
else {
    Write-Host "❌ Documentação não encontrada" -ForegroundColor Red
}

# 7. Resumo final
Write-Host ""
Write-Host "🎉 Resumo da aplicação das otimizações:" -ForegroundColor Green
Write-Host ""

if ($missingHooks -or $missingComponents) {
    Write-Host "⚠️ Alguns arquivos otimizados não foram encontrados" -ForegroundColor Yellow
    Write-Host "   Verifique se todos os arquivos foram criados corretamente" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Arquivos necessários:" -ForegroundColor Cyan
    Write-Host "   - src/hooks/useOptimizedTracksFetch.ts"
    Write-Host "   - src/hooks/useOptimizedDataFetch.ts"
    Write-Host "   - src/hooks/useOptimizedNavigation.ts"
    Write-Host "   - src/components/music/OptimizedStyleCards.tsx"
    Write-Host "   - src/components/music/OptimizedFolderCards.tsx"
    Write-Host "   - src/components/music/OptimizedCommunityCarousel.tsx"
}
else {
    Write-Host "✅ Todos os arquivos otimizados foram encontrados" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Configurações aplicadas:" -ForegroundColor Cyan
Write-Host "   - next.config.mjs otimizado"
Write-Host "   - Dependências instaladas"
Write-Host "   - Backup da configuração anterior criado"

Write-Host ""
Write-Host "📖 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Leia a documentação: OTIMIZACOES-PERFORMANCE.md"
Write-Host "   2. Substitua os hooks antigos pelos otimizados na página /new"
Write-Host "   3. Substitua os componentes antigos pelos otimizados"
Write-Host "   4. Teste a performance da navegação"
Write-Host "   5. Execute 'npm run build' para verificar se não há erros"

Write-Host ""
Write-Host "🚀 Otimizações aplicadas com sucesso!" -ForegroundColor Green
Write-Host "   A performance da navegação deve melhorar significativamente"
Write-Host ""

# 8. Opcional: Limpar arquivos temporários
Write-Host "🧹 Deseja limpar arquivos temporários? (y/n)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "🗑️ Limpando arquivos temporários..." -ForegroundColor Yellow
    if (Test-Path "next.config.optimized.mjs") {
        Remove-Item "next.config.optimized.mjs"
        Write-Host "✅ Arquivos temporários removidos" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎵 Otimizações concluídas! Sua plataforma de músicas agora está mais rápida!" -ForegroundColor Green
