#!/bin/bash

echo "🔍 DIAGNÓSTICO COMPLETO DA VPS - $(date)"
echo "=========================================="

echo ""
echo "📊 STATUS DOS SERVIÇOS:"
echo "----------------------"
echo "🖥️  Sistema:"
uptime
echo ""

echo "🌐 Nginx:"
systemctl status nginx --no-pager -l
echo ""

echo "🐘 PostgreSQL:"
systemctl status postgresql@17-main --no-pager -l
echo ""

echo "⚡ Next.js:"
netstat -tlnp | grep :3000
echo ""

echo "🔧 CONFIGURAÇÃO NGINX:"
echo "----------------------"
echo "📁 Sites disponíveis:"
ls -la /etc/nginx/sites-available/
echo ""

echo "🔗 Sites ativos:"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "📄 Configuração plataforma-musicas:"
cat /etc/nginx/sites-available/plataforma-musicas
echo ""

echo "🌐 TESTE DE CONECTIVIDADE:"
echo "-------------------------"
echo "📍 Porta 80 (HTTP):"
netstat -tlnp | grep :80
echo ""

echo "📍 Porta 443 (HTTPS):"
netstat -tlnp | grep :443
echo ""

echo "📍 Porta 3000 (Next.js):"
netstat -tlnp | grep :3000
echo ""

echo "🔒 FIREWALL:"
echo "-----------"
echo "UFW Status:"
ufw status
echo ""

echo "📡 TESTE LOCAL:"
echo "--------------"
echo "🌐 Teste HTTP local:"
curl -I http://localhost:80 2>/dev/null | head -1
echo ""

echo "⚡ Teste Next.js local:"
curl -I http://localhost:3000 2>/dev/null | head -1
echo ""

echo "🏠 Teste com Host header:"
curl -I -H "Host: djpools.nexorrecords.com.br" http://localhost:80 2>/dev/null | head -1
echo ""

echo "🌍 INFORMAÇÕES DO SISTEMA:"
echo "-------------------------"
echo "IP Público:"
curl -s ifconfig.me
echo ""

echo "Versão do Nginx:"
nginx -v
echo ""

echo "Versão do PostgreSQL:"
psql --version
echo ""

echo "✅ DIAGNÓSTICO CONCLUÍDO!"
echo "=========================="
