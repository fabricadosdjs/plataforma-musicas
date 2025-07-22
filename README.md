Plataforma de Músicas para DJs (DJ Pool App)
!
Placeholder para um banner ou logo do projeto.

Visão Geral do Projeto
Este é um projeto de uma plataforma de músicas para DJs, inspirado em funcionalidades de "DJ Pools" como o Digital DJ Pool. Ele permite que usuários naveguem, ouçam previews e baixem músicas, com um sistema de autenticação, planos PRO e um painel administrativo para gerenciamento de conteúdo e usuários.

Tecnologias Utilizadas
O projeto é construído com uma stack moderna e robusta:

Framework: Next.js 14+ (App Router)

Estilização: Tailwind CSS

Banco de Dados: Neon (PostgreSQL Serverless)

ORM: Prisma

Autenticação: Clerk

Hospedagem: Vercel

Armazenamento de Músicas: MediaFire (URLs de Play/Download)

Modo de Pagamento: Pix Manual (com verificação administrativa)

Ferramentas Adicionais: classnames, date-fns

Funcionalidades Principais
Páginas de Navegação:

/new: Músicas recém-adicionadas (homepage padrão).

/trending: Músicas mais ouvidas/clicadas.

/featured: Destaques manuais escolhidos por admin.

/charts: Rankings por plays/downloads/mês.

Autenticação de Usuários:

Login/Registro via Clerk.

Download de músicas restrito a usuários logados e com plano PRO.

Plano PRO (Pix Manual):

Página /pro com detalhes do plano e chave Pix.

Formulário para envio de comprovante de pagamento (Pix).

Liberação manual do acesso PRO pelo administrador.

Player de Música:

Botão de play sobreposto na thumbnail da música.

Reprodução direta do preview da música ao clicar.

Não há player fixo no rodapé.

Admin Dashboard (/admin):

Protegido por autenticação (somente admin).

Listagem e gerenciamento de usuários (liberar PRO).

Gerenciamento de músicas (adicionar, editar, deletar).

Visualização de uploads e comprovantes Pix.

Estatísticas de downloads e plays.

Design Responsivo: Interface otimizada para desktop e mobile.

Estilo Limpo: Fundo branco, fontes pretas (Inter/Helvetica Neue) para uma experiência moderna e minimalista.

Como Rodar o Projeto Localmente
Siga estas instruções para configurar e rodar o projeto em sua máquina.

Pré-requisitos
Certifique-se de ter instalado em sua máquina:

Node.js (versão 18.x ou superior)

npm (gerenciador de pacotes)

Git

1. Clonar o Repositório
git clone <URL_DO_SEU_REPOSITORIO>
cd plataforma-musicas

2. Configurar Variáveis de Ambiente
Crie um arquivo .env.local na raiz do projeto e adicione suas chaves do Clerk e a URL do NeonDB:

# Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c2V0LWxlbXVyLTEzLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_KvagqAUjbNyp3j8FF3cJroyV29v2PpcEs8kgUuLELJ

# Neon PostgreSQL URL
DATABASE_URL="postgresql://neondb_owner:npg_vJKkzL4w0jcg@ep-lingering-flower-aepy9luq-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

3. Instalar Dependências
npm install

4. Configurar e Sincronizar o Prisma
Inicialize o Prisma e, em seguida, edite prisma/schema.prisma com os modelos User e Track conforme a estrutura do projeto.

npx prisma init

prisma/schema.prisma:

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  isPro     Boolean  @default(false)
  createdAt DateTime @default(now())
}

model Track {
  id                   String   @id @default(cuid())
  title                String
  artist               String
  genre                String
  mediafirePlayUrl     String
  mediafireDownloadUrl String
  isFeatured           Boolean  @default(false)
  playCount            Int      @default(0)
  downloadCount        Int      @default(0)
  createdAt            DateTime @default(now())
}

Após editar o schema, gere o cliente Prisma e sincronize o banco de dados:

npx dotenv -e .env.local -- npx prisma generate
npx dotenv -e .env.local -- npx prisma db push

5. Rodar o Servidor de Desenvolvimento
npm run dev

O aplicativo estará disponível em http://localhost:3000.

Deploy na Vercel
Este projeto é configurado para um deploy fácil e contínuo na Vercel. Certifique-se de configurar as variáveis de ambiente (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, DATABASE_URL) no dashboard da Vercel para o seu projeto.