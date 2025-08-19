const { PrismaClient } = require('@prisma/client')

// Prisma do Supabase (destino)
const targetPrisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.viffcgeoqtkovryrbalu:Hu3AhxdGya01q8dX@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
        }
    }
})

async function setupSchema() {
    try {
        console.log('🔧 Configurando schema no Supabase...')
        console.log('⏰ Início:', new Date().toLocaleString())
        
        // 1. Criar tabela User
        console.log('\n📦 Criando tabela User...')
        await targetPrisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "User" (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                "dailyDownloadCount" INTEGER DEFAULT 0,
                "lastDownloadReset" TIMESTAMP,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW(),
                "is_vip" BOOLEAN DEFAULT false,
                status TEXT DEFAULT 'ativo',
                valor DOUBLE PRECISION,
                vencimento TIMESTAMP,
                "customBenefits" JSONB,
                "dataPagamento" TIMESTAMP,
                "lastWeekReset" TIMESTAMP,
                "weeklyPackRequests" INTEGER DEFAULT 0,
                "weeklyPlaylistDownloads" INTEGER DEFAULT 0,
                "weeklyPackRequestsUsed" INTEGER DEFAULT 0,
                "weeklyPlaylistDownloadsUsed" INTEGER DEFAULT 0,
                whatsapp TEXT,
                deemix BOOLEAN DEFAULT false,
                "deezerPremium" BOOLEAN DEFAULT false,
                "deezerEmail" TEXT,
                "deezerPassword" TEXT,
                "isPro" BOOLEAN DEFAULT false,
                "isAdmin" BOOLEAN DEFAULT false,
                password TEXT,
                "isUploader" BOOLEAN DEFAULT false,
                "dataPrimeiroPagamento" TIMESTAMP,
                "planName" TEXT
            )
        `
        console.log('✅ Tabela User criada')
        
        // 2. Criar tabela Track
        console.log('\n🎵 Criando tabela Track...')
        await targetPrisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Track" (
                id SERIAL PRIMARY KEY,
                "songName" TEXT NOT NULL,
                artist TEXT NOT NULL,
                style TEXT NOT NULL,
                version TEXT,
                pool TEXT DEFAULT 'Nexor Records',
                "imageUrl" TEXT NOT NULL,
                "previewUrl" TEXT NOT NULL,
                "downloadUrl" TEXT NOT NULL,
                "releaseDate" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW(),
                "isCommunity" BOOLEAN DEFAULT false,
                "uploadedBy" TEXT,
                "aiMeta" JSONB,
                FOREIGN KEY ("uploadedBy") REFERENCES "User"(id)
            )
        `
        console.log('✅ Tabela Track criada')
        
        // 3. Criar tabela Like
        console.log('\n❤️  Criando tabela Like...')
        await targetPrisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Like" (
                id SERIAL PRIMARY KEY,
                "trackId" INTEGER NOT NULL,
                "userId" TEXT NOT NULL,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                FOREIGN KEY ("trackId") REFERENCES "Track"(id) ON DELETE CASCADE,
                FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
                UNIQUE("userId", "trackId")
            )
        `
        console.log('✅ Tabela Like criada')
        
        // 4. Criar tabela Download
        console.log('\n⬇️  Criando tabela Download...')
        await targetPrisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Download" (
                id SERIAL PRIMARY KEY,
                "trackId" INTEGER NOT NULL,
                "userId" TEXT NOT NULL,
                "downloadedAt" TIMESTAMP DEFAULT NOW(),
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "nextAllowedDownload" TIMESTAMP,
                FOREIGN KEY ("trackId") REFERENCES "Track"(id) ON DELETE CASCADE,
                FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
                UNIQUE("userId", "trackId")
            )
        `
        console.log('✅ Tabela Download criada')
        
        // 5. Criar tabela Play
        console.log('\n▶️  Criando tabela Play...')
        await targetPrisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "Play" (
                id SERIAL PRIMARY KEY,
                "trackId" INTEGER NOT NULL,
                "userId" TEXT NOT NULL,
                duration INTEGER,
                completed BOOLEAN DEFAULT false,
                "deviceInfo" TEXT,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                FOREIGN KEY ("trackId") REFERENCES "Track"(id) ON DELETE CASCADE,
                FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
            )
        `
        console.log('✅ Tabela Play criada')
        
        // 6. Criar tabela AdminMessage
        console.log('\n💬 Criando tabela AdminMessage...')
        await targetPrisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "AdminMessage" (
                id SERIAL PRIMARY KEY,
                "userId" TEXT NOT NULL,
                message TEXT NOT NULL,
                "isRead" BOOLEAN DEFAULT false,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
            )
        `
        console.log('✅ Tabela AdminMessage criada')
        
        // 7. Criar tabela CustomItem
        console.log('\n🎁 Criando tabela CustomItem...')
        await targetPrisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "CustomItem" (
                id SERIAL PRIMARY KEY,
                "userId" TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                type TEXT NOT NULL,
                data JSONB,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
            )
        `
        console.log('✅ Tabela CustomItem criada')
        
        console.log('\n🎉 Schema configurado com sucesso no Supabase!')
        console.log('📝 Agora você pode executar a migração de dados')
        
    } catch (error) {
        console.error('❌ Erro na configuração do schema:', error)
        throw error
    } finally {
        await targetPrisma.$disconnect()
    }
}

// Executar configuração
setupSchema()
    .then(() => {
        console.log('✅ Script de configuração executado com sucesso!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Erro na execução:', error)
        process.exit(1)
    })
