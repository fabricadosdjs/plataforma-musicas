# 🎵 Extrator de Músicas Contabo - Script Local

Script Node.js para baixar e organizar automaticamente músicas do Contabo Storage em pastas por estilo, diretamente no seu PC.

## ✨ Funcionalidades

- 🔐 **Autenticação VIP/Admin**: Apenas usuários VIP ou Admin podem usar o script
- 📁 **Organização Automática**: Cria pastas por estilo automaticamente
- 🎯 **Nomes Limpos**: Pastas com nomes em maiúscula, sem ícones
- ⏭️ **Download Inteligente**: Pula arquivos já baixados automaticamente
- 📦 **Downloads em Lote**: Processa músicas em lotes para melhor performance
- 🎛️ **Pasta Personalizada**: Escolha onde salvar suas músicas
- 💾 **Sessão Persistente**: Login válido por 24 horas
- 🚀 **Executável .exe**: Pode ser convertido para programa standalone

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+ instalado
- Acesso VIP ou Admin na plataforma
- Plataforma web rodando em `http://localhost:3000`

### Opção 1: Instalação Rápida (Recomendada)
```bash
# Navegar para a pasta scripts
cd scripts

# Executar o instalador automático
install-dependencies.bat
```

### Opção 2: Instalação Manual
```bash
# Navegar para a pasta scripts
cd scripts

# Instalar dependências
npm install

# Ou instalar globalmente
npm install -g axios fs-extra
```

## 🎯 Como Usar

### Opção A: Script ES6 (Recomendado)
```bash
node contabo-downloader.js
```

### Opção B: Script CommonJS (Para compatibilidade)
```bash
node contabo-downloader.cjs
```

### Opção C: Executável .exe (Standalone)
```bash
# Primeiro, construir o .exe
build-exe.bat
# ou
.\build-exe.ps1

# Depois executar
dist\contabo-downloader.exe
```

## 📋 Opções Disponíveis

### 1. Baixar Músicas de um Estilo Específico
- Lista todos os estilos disponíveis
- Escolha por número
- Baixa para pasta padrão: `Downloads/MusicasContabo`

### 2. Baixar Todos os Estilos
- **Opção 1**: Pasta padrão (`Downloads/MusicasContabo`)
- **Opção 2**: Pasta personalizada (você escolhe o caminho)

### 3. Sair
- Encerra o script

## 📁 Estrutura de Pastas

```
Downloads/
└── MusicasContabo/
    ├── ROCK/
    │   ├── Musica 1 - Artista 1.mp3
    │   ├── Musica 2 - Artista 2.mp3
    │   └── ...
    ├── POP/
    │   ├── Musica 3 - Artista 3.mp3
    │   └── ...
    └── JAZZ/
        ├── Musica 4 - Artista 4.mp3
        └── ...
```

## ⚙️ Configurações

### Arquivo de Configuração
```json
{
  "apiUrl": "http://localhost:3000/api",
  "downloadDir": "Downloads/MusicasContabo",
  "batchSize": 5,
  "delayBetweenBatches": 2000,
  "timeout": 30000,
  "maxRetries": 3
}
```

### Variáveis de Ambiente
- `USERPROFILE` (Windows) ou `HOME` (Linux/Mac): Pasta do usuário
- Pasta padrão: `{USERPROFILE}/Downloads/MusicasContabo`

## 🔐 Sistema de Autenticação

### Verificação de Sessão
- O script verifica se você já está logado
- Sessão válida por 24 horas
- Arquivo salvo em: `user-session.json`

### Login Manual
Se não houver sessão válida:
1. Digite seu email
2. Digite sua senha
3. O script verifica se você é VIP ou Admin
4. Sessão é salva automaticamente

### Requisitos de Acesso
- ✅ Usuário VIP
- ✅ Usuário Admin
- ❌ Usuário comum (acesso negado)

## 📦 Sistema de Downloads

### Downloads em Lote
- **Tamanho do lote**: 5 músicas por vez
- **Delay entre lotes**: 2 segundos
- **Delay entre estilos**: 3 segundos

### Verificação de Arquivos
- Verifica se o arquivo já existe
- Pula arquivos maiores que 1KB
- Evita downloads duplicados

### Tratamento de Erros
- Timeout configurável (30 segundos)
- Máximo de 3 tentativas
- Logs detalhados de erros

## 🛠️ Construindo o Executável .exe

### Pré-requisitos
- Node.js instalado
- npm funcionando

### Passo a Passo
1. **Navegar para a pasta scripts**
   ```bash
   cd scripts
   ```

2. **Executar o script de build**
   ```bash
   # Windows (CMD)
   build-exe.bat
   
   # Windows (PowerShell)
   .\build-exe.ps1
   ```

3. **Verificar o resultado**
   - Arquivo criado em: `dist/contabo-downloader.exe`
   - Tamanho: ~50-100MB (dependendo das dependências)

### Scripts de Build Disponíveis
- `build-exe.bat` - Script CMD para Windows
- `build-exe.ps1` - Script PowerShell para Windows
- `package.json` - Configuração do pkg

## 🔧 Solução de Problemas

### Erro: "Cannot find module"
```bash
# Reinstalar dependências
npm install

# Ou instalar globalmente
npm install -g axios fs-extra
```

### Erro: "ECONNREFUSED"
- Verifique se a plataforma web está rodando
- Confirme a URL: `http://localhost:3000`
- Verifique firewall/antivírus

### Erro: "Acesso negado"
- Verifique se você é VIP ou Admin
- Faça login na plataforma web primeiro
- Verifique suas credenciais

### Erro: "Pasta não pode ser criada"
- Verifique permissões da pasta
- Use caminho absoluto
- Execute como administrador se necessário

## 📝 Logs e Debug

### Níveis de Log
- ✅ Sucesso: Downloads completados
- ⏭️ Pulado: Arquivo já existe
- ❌ Erro: Falhas no download
- 🔐 Autenticação: Status de login
- 📁 Sistema: Criação de pastas

### Arquivo de Sessão
```json
{
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "Nome do Usuário",
    "isVip": true,
    "isAdmin": false
  },
  "expiresAt": 1703123456789
}
```

## 🚀 Recursos Avançados

### Personalização
- Tamanho do lote configurável
- Delays personalizáveis
- Timeout ajustável
- Pasta de destino customizável

### Performance
- Downloads paralelos por lote
- Verificação inteligente de arquivos
- Sessão persistente
- Cache de estilos disponíveis

### Segurança
- Verificação de autenticação
- Validação de permissões
- Sessão com expiração
- Logs de auditoria

## 📞 Suporte

### Verificações Comuns
1. **Node.js instalado**: `node --version`
2. **npm funcionando**: `npm --version`
3. **Plataforma rodando**: Acesse `http://localhost:3000`
4. **Permissões**: Execute como administrador se necessário

### Arquivos Importantes
- `contabo-downloader.js` - Script principal (ES6)
- `contabo-downloader.cjs` - Script alternativo (CommonJS)
- `contabo-config.json` - Configurações
- `user-session.json` - Sessão do usuário (criado automaticamente)

## 🎉 Benefícios

- 🎵 **Organização Automática**: Músicas organizadas por estilo
- 🚀 **Downloads Rápidos**: Sistema de lotes otimizado
- 💾 **Sem Duplicatas**: Verifica arquivos existentes
- 🔐 **Seguro**: Apenas usuários autorizados
- 📱 **Portátil**: Funciona em qualquer PC com Node.js
- 🎯 **Executável**: Pode ser convertido para .exe standalone
- 🎨 **Interface Limpa**: Nomes de pasta organizados
- ⚡ **Performance**: Downloads inteligentes e eficientes

---

**Desenvolvido para a Plataforma de Músicas** 🎵
