#!/bin/bash

echo "🔒 CONFIGURAÇÃO DO FIREWALL - VPS"
echo "=================================="
echo ""

echo "📊 PASSO 1: Verificando status atual do firewall..."
echo "--------------------------------------------------"
ufw status
echo ""

echo "📊 PASSO 2: Verificando portas abertas..."
echo "----------------------------------------"
echo "Porta 80 (HTTP):"
netstat -tlnp | grep :80
echo ""

echo "Porta 443 (HTTPS):"
netstat -tlnp | grep :443
echo ""

echo "Porta 3000 (Next.js):"
netstat -tlnp | grep :3000
echo ""

echo "📊 PASSO 3: Configurando firewall..."
echo "-----------------------------------"

# Verificar se UFW está instalado
if ! command -v ufw &> /dev/null; then
    echo "❌ UFW não está instalado. Instalando..."
    apt update
    apt install -y ufw
else
    echo "✅ UFW já está instalado"
fi

echo ""

# Verificar status atual
echo "Status atual do UFW:"
ufw status
echo ""

# Se estiver inativo, ativar
if ufw status | grep -q "inactive"; then
    echo "🔄 Ativando firewall UFW..."
    ufw enable
    echo "✅ Firewall ativado"
else
    echo "✅ Firewall já está ativo"
fi

echo ""

# Liberar portas necessárias
echo "🔓 Liberando portas necessárias..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
echo "✅ Portas liberadas"
echo ""

echo "📊 PASSO 4: Status final do firewall..."
echo "---------------------------------------"
ufw status
echo ""

echo "📊 PASSO 5: Verificando portas após configuração..."
echo "-------------------------------------------------"
echo "Porta 80 (HTTP):"
netstat -tlnp | grep :80
echo ""

echo "Porta 443 (HTTPS):"
netstat -tlnp | grep :443
echo ""

echo "Porta 3000 (Next.js):"
netstat -tlnp | grep :3000
echo ""

echo "📊 PASSO 6: Teste de conectividade local..."
echo "------------------------------------------"
echo "Teste HTTP (porta 80):"
curl -I http://localhost:80 2>/dev/null | head -1 || echo "❌ Erro na porta 80"
echo ""

echo "Teste Next.js (porta 3000):"
curl -I http://localhost:3000 2>/dev/null | head -1 || echo "❌ Erro na porta 3000"
echo ""

echo "Teste com Host header:"
curl -I -H "Host: djpools.nexorrecords.com.br" http://localhost:80 2>/dev/null | head -1 || echo "❌ Erro com Host header"
echo ""

echo "✅ CONFIGURAÇÃO DO FIREWALL CONCLUÍDA!"
echo "======================================"
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "1. Teste o site: http://69.10.53.84"
echo "2. Se funcionar, o problema era o firewall"
echo "3. Se não funcionar, precisamos verificar o provedor"
