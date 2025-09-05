#!/bin/bash

# Script de monitoramento de performance das APIs

echo "🚀 Iniciando teste de performance das APIs otimizadas..."

API_BASE="http://localhost:4001"

# Função para testar uma API e medir tempo
test_api() {
    local endpoint=$1
    local name=$2
    
    echo "📊 Testando $name..."
    
    # Primeira chamada (cache miss)
    start_time=$(date +%s%3N)
    response1=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" "$API_BASE$endpoint")
    end_time=$(date +%s%3N)
    
    http_code1=$(echo $response1 | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    time1=$(echo $response1 | grep -o "TIME:[0-9.]*" | cut -d: -f2)
    
    # Segunda chamada (cache hit)
    start_time2=$(date +%s%3N)
    response2=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" "$API_BASE$endpoint")
    end_time2=$(date +%s%3N)
    
    http_code2=$(echo $response2 | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    time2=$(echo $response2 | grep -o "TIME:[0-9.]*" | cut -d: -f2)
    
    echo "  ✅ $name - Cache Miss: ${time1}s (HTTP $http_code1)"
    echo "  🚀 $name - Cache Hit:  ${time2}s (HTTP $http_code2)"
    
    # Verificar se há header de cache
    cache_header=$(curl -s -I "$API_BASE$endpoint" | grep -i "x-cache" || echo "No cache header")
    echo "  📦 Cache Header: $cache_header"
    echo ""
}

# Testar APIs principais
test_api "/api/tracks/new?page=1&limit=60" "New Tracks (Page 1)"
test_api "/api/tracks/new?page=2&limit=60" "New Tracks (Page 2)"
test_api "/api/tracks/styles/most-downloaded" "Styles Most Downloaded"
test_api "/api/tracks/folders/recent" "Folders Recent"

echo "🏁 Teste de performance concluído!"
echo ""
echo "📈 Resumo das otimizações implementadas:"
echo "  • Cache em memória com TTL configurável"
echo "  • Queries otimizadas com agregações SQL"
echo "  • Índices de banco de dados otimizados"
echo "  • Headers de cache HTTP melhorados"
echo "  • Preload de dados para próximas páginas"
echo ""
echo "💡 Para melhores resultados em produção:"
echo "  • Use Redis para cache distribuído"
echo "  • Configure CDN para assets estáticos"
echo "  • Aplique os índices do arquivo performance-indexes.sql"
