# 🚀 Instruções Rápidas - Extrator de Músicas Contabo

## ⚡ Instalação e Uso em 3 Passos

### 1️⃣ Instalar Dependências
```bash
# Duplo clique no arquivo:
install-dependencies.bat
```

### 2️⃣ Executar Script
```bash
# Opção A (Recomendada):
node contabo-downloader.js

# Opção B (Compatibilidade):
node contabo-downloader.cjs
```

### 3️⃣ Criar Executável .exe (Opcional)
```bash
# Duplo clique no arquivo:
build-exe.bat
```

## 🎯 O que o Script Faz

- 🔐 **Verifica se você é VIP/Admin**
- 📁 **Cria pastas automaticamente** (ROCK, POP, JAZZ)
- ⬇️ **Baixa músicas organizadas** por estilo
- ⏭️ **Pula arquivos já baixados**
- 💾 **Mantém login por 24 horas**

## 📁 Estrutura Criada

```
Downloads/
└── MusicasContabo/
    ├── ROCK/
    ├── POP/
    ├── JAZZ/
    └── ... (outros estilos)
```

## ⚠️ Requisitos

- ✅ Usuário VIP ou Admin na plataforma
- ✅ Node.js 18+ instalado
- ✅ Plataforma rodando em localhost:3000
- ✅ Permissões de escrita no PC

## 🔧 Solução de Problemas

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Acesso negado"
- Verifique se você é VIP/Admin
- Faça login na plataforma web primeiro

### Erro: "ECONNREFUSED"
- Verifique se a plataforma está rodando
- Confirme: http://localhost:3000

## 📞 Arquivos Importantes

- `contabo-downloader.js` - Script principal
- `contabo-downloader.cjs` - Script alternativo
- `install-dependencies.bat` - Instalador automático
- `build-exe.bat` - Criar executável
- `test-script.bat` - Testar script
- `README.md` - Documentação completa

---

**🎵 Desenvolvido para a Plataforma de Músicas**




