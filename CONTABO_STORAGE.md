# 🎵 Integração com Contabo Object Storage

Esta documentação explica como configurar e usar a integração com o Contabo Object Storage para armazenar e gerenciar suas músicas de forma automática.

## 🛠️ Configuração Inicial

### 1. Obter Credenciais do Contabo

1. **Acesse o painel da Contabo**: https://my.contabo.com/
2. **Vá em Object Storage** no menu lateral
3. **Crie um novo bucket** ou use um existente
4. **Obtenha as credenciais**:
   - Access Key ID
   - Secret Access Key
   - Endpoint da região
   - Nome do bucket

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.contabo.example` e renomeie para `.env.local` (ou adicione ao seu arquivo existente):

```bash
# Configuração do Contabo Object Storage
CONTABO_ENDPOINT=https://eu2.contabostorage.com
CONTABO_REGION=eu-central-1
CONTABO_ACCESS_KEY=sua_access_key_aqui
CONTABO_SECRET_KEY=sua_secret_key_aqui
CONTABO_BUCKET_NAME=nome-do-seu-bucket
```

### 3. Endpoints Disponíveis por Região

```bash
# Europa Central (Frankfurt)
CONTABO_ENDPOINT=https://eu2.contabostorage.com
CONTABO_REGION=eu-central-1

# Estados Unidos Leste
CONTABO_ENDPOINT=https://us-east-1.contabostorage.com
CONTABO_REGION=us-east-1

# Estados Unidos Oeste
CONTABO_ENDPOINT=https://us-west-1.contabostorage.com
CONTABO_REGION=us-west-1
```

## 🎯 Funcionalidades Principais

### 1. Gerenciamento de Arquivos

- **Listar todos os arquivos** do bucket
- **Filtrar apenas arquivos de áudio** (.mp3, .wav, .flac, etc.)
- **Upload de novos arquivos** diretamente pelo painel
- **Deletar arquivos** não utilizados
- **Visualizar informações** (tamanho, data de modificação)

### 2. Importação Automática

- **Análise inteligente** dos nomes dos arquivos
- **Detecção automática** de artista, música e versão
- **Verificação de duplicatas** antes de importar
- **Importação em lote** de múltiplas músicas
- **Geração automática** de placeholders para capas

### 3. Nomenclatura Inteligente

O sistema reconhece automaticamente estes formatos de arquivo:

```
✅ Formatos Suportados:
"Artista - Nome da Música.mp3"
"Artista - Nome da Música (Versão).mp3"
"Artista - Nome da Música [Estilo].mp3"
"Artista - Nome da Música (Versão) [Estilo].mp3"
"Nome da Música.mp3" (sem artista)
```

## 🎵 Como Usar

### Passo 1: Acessar o Painel

1. Faça login como administrador
2. Vá em **Admin** → **Contabo Storage**
3. O sistema irá conectar automaticamente

### Passo 2: Upload de Arquivos

1. Clique em **"Upload Arquivo"**
2. Selecione arquivos de áudio ou imagens
3. Os arquivos serão organizados automaticamente na pasta `music/`

### Passo 3: Importar Músicas

1. Clique na aba **"Importar"**
2. O sistema irá analisar todos os arquivos de áudio
3. Verifique as informações detectadas automaticamente
4. Clique em **"Importar Todas"** para adicionar ao banco

### Passo 4: Gerenciar Arquivos

- **Visualizar**: Veja todos os arquivos com informações detalhadas
- **Reproduzir**: Teste áudios diretamente no navegador
- **Baixar**: Faça download de arquivos individuais
- **Deletar**: Remova arquivos não utilizados

## 🔧 APIs Disponíveis

### Listar Arquivos
```
GET /api/contabo/files
Query Parameters:
- audioOnly=true/false
- prefix=pasta/
- search=termo
```

### Upload de Arquivo
```
POST /api/contabo/upload
FormData:
- file: File
- folder: string (opcional)
```

### Importar Músicas
```
GET /api/contabo/import  # Analisar arquivos
POST /api/contabo/import # Importar selecionados
```

## 📁 Estrutura Recomendada do Bucket

```
seu-bucket/
├── music/                    # Arquivos de áudio
│   ├── 2025-01-23_track1.mp3
│   ├── 2025-01-23_track2.mp3
│   └── ...
├── covers/                   # Capas de álbuns
│   ├── artist1-album.jpg
│   └── ...
└── backup/                   # Backups opcionais
    └── ...
```

## 🎨 Vantagens da Integração

### ✅ Benefícios

- **Armazenamento em nuvem**: Não ocupa espaço no servidor
- **URLs diretas**: Links permanentes para streaming
- **Backup automático**: Segurança dos arquivos
- **Escalabilidade**: Capacidade ilimitada de storage
- **Performance**: CDN global da Contabo
- **Custo-benefício**: Preços competitivos por GB

### 🚀 Performance

- **Streaming direto**: Reprodução sem download completo
- **Cache automático**: Arquivos ficam em cache
- **Múltiplas regiões**: Escolha a mais próxima dos usuários
- **Bandwidth ilimitado**: Sem limites de transferência

## 🔍 Troubleshooting

### Problema: "Erro ao conectar com o Contabo Storage"

**Soluções:**
1. Verifique as credenciais nas variáveis de ambiente
2. Confirme se o endpoint está correto para sua região
3. Teste as credenciais no painel da Contabo
4. Verifique se o bucket existe e está acessível

### Problema: "Arquivo não encontrado"

**Soluções:**
1. Verifique se o arquivo ainda existe no bucket
2. Confirme as permissões de leitura do bucket
3. Teste o link direto no navegador

### Problema: "Upload falhou"

**Soluções:**
1. Verifique o tamanho do arquivo (limite de 100MB)
2. Confirme se o formato é suportado
3. Teste com um arquivo menor primeiro

## 📊 Monitoramento

### Logs Importantes

O sistema registra logs detalhados para:
- Conexões com o storage
- Uploads e downloads
- Importações automáticas
- Erros de conectividade

### Métricas Disponíveis

- Total de arquivos no storage
- Arquivos de áudio vs outros
- Arquivos prontos para importação
- Uso de espaço por tipo

## 🔐 Segurança

### Boas Práticas

1. **Credenciais seguras**: Mantenha as chaves em segredo
2. **Bucket privado**: Configure permissões adequadas
3. **URLs assinadas**: Use para conteúdo privado
4. **Backup regular**: Mantenha cópias de segurança

### Configuração de Permissões

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::seu-bucket/music/*"
    }
  ]
}
```

## 🎵 Exemplos Práticos

### Nomenclatura de Arquivos

```bash
# ✅ Bom
"David Guetta - Titanium (Radio Edit).mp3"
"Calvin Harris - Feel So Close.mp3"
"Tiësto - Adagio For Strings [Trance].mp3"

# ❌ Evitar
"track01.mp3"
"música_sem_nome.mp3"
"ÁcentoÇ@racteres.mp3"
```

### Fluxo de Trabalho Recomendado

1. **Organize os arquivos** com nomenclatura consistente
2. **Faça upload** em lotes para economizar tempo
3. **Revise as informações** detectadas automaticamente
4. **Importe para o banco** após validação
5. **Teste o streaming** no player do site

## 📞 Suporte

Para dúvidas ou problemas:

1. **Consulte esta documentação** primeiro
2. **Verifique os logs** do sistema
3. **Teste a conectividade** com o painel da Contabo
4. **Entre em contato** com o suporte técnico

---

**💡 Dica**: Mantenha sempre um backup local dos arquivos importantes antes de fazer upload para o storage!
