const { PrismaClient } = require('@prisma/client')

// Prisma do Neon (origem)
const sourcePrisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_vJKkzL4w0jcg@ep-lingering-flower-aepy9luq-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
        }
    }
})

// Prisma do Supabase (destino) - URL CORRETA!
const targetPrisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.viffcgeoqtkovryrbalu:Hu3AhxdGya01q8dX@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
        }
    }
})

async function migrateAllData() {
    try {
        console.log('🚀 Iniciando migração Neon → Supabase...')
        console.log('⏰ Início:', new Date().toLocaleString())
        
        // 1. Migrar usuários
        console.log('\n📦 Migrando usuários...')
        const users = await sourcePrisma.user.findMany()
        console.log(`   Encontrados: ${users.length} usuários`)
        
        for (let i = 0; i < users.length; i++) {
            const user = users[i]
            await targetPrisma.user.upsert({
                where: { id: user.id },
                update: user,
                create: user
            })
            if ((i + 1) % 10 === 0) {
                console.log(`   Progresso: ${i + 1}/${users.length} usuários`)
            }
        }
        console.log(`✅ ${users.length} usuários migrados com sucesso`)

        // 2. Migrar tracks
        console.log('\n🎵 Migrando tracks...')
        const tracks = await sourcePrisma.track.findMany()
        console.log(`   Encontrados: ${tracks.length} tracks`)
        
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i]
            await targetPrisma.track.upsert({
                where: { id: track.id },
                update: track,
                create: track
            })
            if ((i + 1) % 50 === 0) {
                console.log(`   Progresso: ${i + 1}/${tracks.length} tracks`)
            }
        }
        console.log(`✅ ${tracks.length} tracks migrados com sucesso`)

        // 3. Detectar e migrar outras tabelas automaticamente
        console.log('\n🔍 Detectando outras tabelas...')
        
        const tables = await sourcePrisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('user', 'track', '_prisma_migrations')
      ORDER BY table_name
    `
        
        console.log('📋 Tabelas encontradas:', tables.map(t => t.table_name))
        
        // Migrar cada tabela encontrada
        for (const tableInfo of tables) {
            const tableName = tableInfo.table_name
            console.log(`\n📦 Migrando tabela: ${tableName}`)
            
            try {
                // Contar registros
                const count = await sourcePrisma.$queryRaw`SELECT COUNT(*) as count FROM "${tableName}"`
                const recordCount = parseInt(count[0].count)
                console.log(`   Encontrados: ${recordCount} registros`)
                
                if (recordCount > 0) {
                    // Migrar em lotes para evitar timeout
                    const batchSize = 100
                    for (let offset = 0; offset < recordCount; offset += batchSize) {
                        const records = await sourcePrisma.$queryRaw`SELECT * FROM "${tableName}" LIMIT ${batchSize} OFFSET ${offset}`
                        
                        for (const record of records) {
                            // Usar upsert para evitar duplicatas
                            await targetPrisma.$executeRaw`INSERT INTO "${tableName}" SELECT * FROM (VALUES (${JSON.stringify(record)})) AS v(data) ON CONFLICT DO NOTHING`
                        }
                        
                        if (offset + batchSize < recordCount) {
                            console.log(`   Progresso: ${Math.min(offset + batchSize, recordCount)}/${recordCount} registros`)
                        }
                    }
                }
                
                console.log(`✅ Tabela ${tableName} migrada com sucesso`)
            } catch (error) {
                console.log(`⚠️  Erro ao migrar tabela ${tableName}:`, error.message)
                // Continuar com outras tabelas
            }
        }
        
        console.log('\n🎉 Migração concluída com sucesso!')
        console.log('⏰ Fim:', new Date().toLocaleString())
        
    } catch (error) {
        console.error('❌ Erro na migração:', error)
        throw error
    } finally {
        await sourcePrisma.$disconnect()
        await targetPrisma.$disconnect()
    }
}

// Executar migração
migrateAllData()
    .then(() => {
        console.log('✅ Script executado com sucesso!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Erro na execução:', error)
        process.exit(1)
    })
