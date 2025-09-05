# Script de monitoramento de performance das APIs (Windows)

Write-Host "🚀 Iniciando teste de performance das APIs otimizadas..." -ForegroundColor Green

$apiBase = "http://localhost:4001"

# Função simples para testar API
function Test-SingleAPI($endpoint, $name) {
    Write-Host "📊 Testando $name..." -ForegroundColor Cyan
    
    try {
        # Primeira chamada (cache miss)
        $start1 = Get-Date
        $response1 = Invoke-RestMethod -Uri "$apiBase$endpoint" -Method Get
        $end1 = Get-Date
        $time1 = ($end1 - $start1).TotalMilliseconds
        
        # Segunda chamada (cache hit)
        $start2 = Get-Date
        $response2 = Invoke-RestMethod -Uri "$apiBase$endpoint" -Method Get
        $end2 = Get-Date
        $time2 = ($end2 - $start2).TotalMilliseconds
        
        Write-Host "  ✅ $name - Cache Miss: ${time1}ms" -ForegroundColor Yellow
        Write-Host "  🚀 $name - Cache Hit:  ${time2}ms" -ForegroundColor Green
        
        # Calcular melhoria
        if ($time1 -gt 0) {
            $improvement = [math]::Round((($time1 - $time2) / $time1) * 100, 1)
            if ($improvement -gt 0) {
                Write-Host "  📈 Melhoria: ${improvement}% mais rápido com cache" -ForegroundColor Magenta
            }
        }
        
        Write-Host ""
    }
    catch {
        Write-Host "  ❌ Erro ao testar ${name}: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# Testar APIs principais
Test-SingleAPI "/api/tracks/new?page=1&limit=60" "New Tracks (Page 1)"
Test-SingleAPI "/api/tracks/new?page=2&limit=60" "New Tracks (Page 2)"
Test-SingleAPI "/api/tracks/styles/most-downloaded" "Styles Most Downloaded"
Test-SingleAPI "/api/tracks/folders/recent" "Folders Recent"

Write-Host "🏁 Teste de performance concluído!" -ForegroundColor Green
Write-Host ""

Write-Host "📈 Resumo das otimizações implementadas:" -ForegroundColor Cyan
Write-Host "  • Cache em memória com TTL configurável"
Write-Host "  • Queries otimizadas com agregações SQL"
Write-Host "  • Índices de banco de dados otimizados"
Write-Host "  • Headers de cache HTTP melhorados"
Write-Host "  • Preload de dados para próximas páginas"
Write-Host ""
Write-Host "💡 Para melhores resultados em produção:" -ForegroundColor Yellow
Write-Host "  • Use Redis para cache distribuído"
Write-Host "  • Configure CDN para assets estáticos"
Write-Host "  • Aplique os índices do arquivo performance-indexes.sql"
Write-Host "  • Configure compressão gzip no servidor"
