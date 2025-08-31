#!/bin/bash

# 🚀 Script de Aplicação de Otimizações de Performance
# Plataforma de Músicas - Nexor Records

echo "🎵 Aplicando otimizações de performance para a plataforma de músicas..."
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

echo "📁 Diretório atual: $(pwd)"
echo ""

# 1. Fazer backup da configuração atual do Next.js
echo "🔒 Fazendo backup da configuração atual..."
if [ -f "next.config.mjs" ]; then
    cp next.config.mjs next.config.backup.mjs
    echo "✅ Backup criado: next.config.backup.mjs"
else
    echo "⚠️ Arquivo next.config.mjs não encontrado"
fi

# 2. Aplicar configuração otimizada
echo ""
echo "⚡ Aplicando configuração otimizada do Next.js..."
if [ -f "next.config.optimized.mjs" ]; then
    cp next.config.optimized.mjs next.config.mjs
    echo "✅ Configuração otimizada aplicada"
else
    echo "❌ Arquivo next.config.optimized.mjs não encontrado"
    exit 1
fi

# 3. Instalar dependências necessárias
echo ""
echo "📦 Instalando dependências necessárias..."
npm install @svgr/webpack webpack-bundle-analyzer --save-dev

if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso"
else
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

# 4. Verificar se os hooks otimizados foram criados
echo ""
echo "🔍 Verificando hooks otimizados..."
hooks_dir="src/hooks"
required_hooks=(
    "useOptimizedTracksFetch.ts"
    "useOptimizedDataFetch.ts"
    "useOptimizedNavigation.ts"
)

for hook in "${required_hooks[@]}"; do
    if [ -f "$hooks_dir/$hook" ]; then
        echo "✅ $hook encontrado"
    else
        echo "❌ $hook não encontrado"
        missing_hooks=true
    fi
done

# 5. Verificar se os componentes otimizados foram criados
echo ""
echo "🔍 Verificando componentes otimizados..."
components_dir="src/components/music"
required_components=(
    "OptimizedStyleCards.tsx"
    "OptimizedFolderCards.tsx"
    "OptimizedCommunityCarousel.tsx"
)

for component in "${required_components[@]}"; do
    if [ -f "$components_dir/$component" ]; then
        echo "✅ $component encontrado"
    else
        echo "❌ $component não encontrado"
        missing_components=true
    fi
done

# 6. Verificar se a documentação foi criada
echo ""
echo "📚 Verificando documentação..."
if [ -f "OTIMIZACOES-PERFORMANCE.md" ]; then
    echo "✅ Documentação criada: OTIMIZACOES-PERFORMANCE.md"
else
    echo "❌ Documentação não encontrada"
fi

# 7. Resumo final
echo ""
echo "🎉 Resumo da aplicação das otimizações:"
echo ""

if [ "$missing_hooks" = true ] || [ "$missing_components" = true ]; then
    echo "⚠️ Alguns arquivos otimizados não foram encontrados"
    echo "   Verifique se todos os arquivos foram criados corretamente"
    echo ""
    echo "📋 Arquivos necessários:"
    echo "   - src/hooks/useOptimizedTracksFetch.ts"
    echo "   - src/hooks/useOptimizedDataFetch.ts"
    echo "   - src/hooks/useOptimizedNavigation.ts"
    echo "   - src/components/music/OptimizedStyleCards.tsx"
    echo "   - src/components/music/OptimizedFolderCards.tsx"
    echo "   - src/components/music/OptimizedCommunityCarousel.tsx"
else
    echo "✅ Todos os arquivos otimizados foram encontrados"
fi

echo ""
echo "🔧 Configurações aplicadas:"
echo "   - next.config.mjs otimizado"
echo "   - Dependências instaladas"
echo "   - Backup da configuração anterior criado"

echo ""
echo "📖 Próximos passos:"
echo "   1. Leia a documentação: OTIMIZACOES-PERFORMANCE.md"
echo "   2. Substitua os hooks antigos pelos otimizados na página /new"
echo "   3. Substitua os componentes antigos pelos otimizados"
echo "   4. Teste a performance da navegação"
echo "   5. Execute 'npm run build' para verificar se não há erros"

echo ""
echo "🚀 Otimizações aplicadas com sucesso!"
echo "   A performance da navegação deve melhorar significativamente"
echo ""

# 8. Opcional: Limpar arquivos temporários
echo "🧹 Deseja limpar arquivos temporários? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "🗑️ Limpando arquivos temporários..."
    rm -f next.config.optimized.mjs
    echo "✅ Arquivos temporários removidos"
fi

echo ""
echo "🎵 Otimizações concluídas! Sua plataforma de músicas agora está mais rápida!"

