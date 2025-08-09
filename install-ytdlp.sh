#!/bin/bash

# Script para instalar yt-dlp no ambiente de produção
# Execute este script no seu servidor de produção

echo "🔧 Instalando yt-dlp..."

# Verifica se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Instalando..."
    
    # Para Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip
    # Para CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y python3 python3-pip
    # Para Alpine (Docker)
    elif command -v apk &> /dev/null; then
        apk add --no-cache python3 py3-pip
    else
        echo "❌ Sistema não suportado. Instale Python3 manualmente."
        exit 1
    fi
fi

# Instala yt-dlp
echo "📦 Instalando yt-dlp..."
pip3 install yt-dlp

# Verifica instalação
if command -v yt-dlp &> /dev/null; then
    echo "✅ yt-dlp instalado com sucesso!"
    yt-dlp --version
else
    echo "❌ Falha na instalação do yt-dlp"
    exit 1
fi

echo "🎉 Instalação concluída!"
